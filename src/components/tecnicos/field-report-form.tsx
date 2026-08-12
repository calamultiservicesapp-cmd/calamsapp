"use client";

import { useActionState, useEffect, useState } from "react";
import { submitFieldReport } from "@/app/dashboard/mis-tareas/[id]/actions";
import { Loader2, CheckCircle2, AlertCircle, Save, Camera, X } from "lucide-react";

type ProjectForReport = {
  id: string;
  name: string;
  walkthroughItems: Array<{
    id: string;
    activity: { nameEs: string };
    hours: any;
    notes: string | null;
  }>;
  fieldReport: {
    items: Array<{
      walkthroughItemId: string;
      status: string;
      notes: string | null;
    }>;
  } | null;
};

const initialState: any = { error: "" };

export function FieldReportForm({ project }: { project: ProjectForReport }) {
  const [state, formAction, isPending] = useActionState(submitFieldReport, initialState);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  function getItemData(wiId: string) {
    if (!project.fieldReport) return { status: "completado", notes: "" };
    const item = project.fieldReport.items.find(i => i.walkthroughItemId === wiId);
    return item ? { status: item.status, notes: item.notes || "" } : { status: "completado", notes: "" };
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
        <h3 className="font-heading tracking-wider text-slate-800 dark:text-white">Lista de Verificación de Actividades</h3>
        <p className="text-sm text-slate-500 mt-1">Marca las actividades que has completado. Si hubo algún problema, añade una nota.</p>
      </div>

      <form action={formAction} className="p-4 sm:p-6 space-y-6">
        <input type="hidden" name="projectId" value={project.id} />

        {state?.error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-3 text-sm border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{state.error}</p>
          </div>
        )}

        {showSuccess && (
          <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center gap-3 text-sm border border-green-200">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p>Informe guardado y enviado exitosamente.</p>
          </div>
        )}

        <div className="space-y-6">
          {project.walkthroughItems.map((wi) => {
            const data = getItemData(wi.id);
            return (
              <div key={wi.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/30">
                <input type="hidden" name="walkthroughItemId" value={wi.id} />
                
                <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-4">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{wi.activity.nameEs}</p>
                    <p className="text-sm text-slate-500">Estimado: {wi.hours.toString()} hrs</p>
                  </div>
                  
                  <select 
                    name={`status_${wi.id}`} 
                    defaultValue={data.status}
                    className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
                  >
                    <option value="completado">Completado sin problemas</option>
                    <option value="con_desviacion">Completado con desviación</option>
                    <option value="no_completado">No completado</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notas u Observaciones</label>
                  <textarea 
                    name={`notes_${wi.id}`} 
                    defaultValue={data.notes}
                    placeholder="Detalla cualquier material extra usado, problemas encontrados..."
                    rows={2}
                    className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enviar Informe de Campo
          </button>
        </div>
      </form>
    </div>
  );
}
