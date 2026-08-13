"use client";

import { useActionState, useState } from "react";
import { createAssignment, removeAssignment } from "@/app/dashboard/proyectos/[id]/asignacion/actions";
import { Plus, Trash2, Calendar, User, Loader2, AlertCircle, Clock, Briefcase, Phone } from "lucide-react";

type PersonnelMember = {
  id: string;
  fullName: string;
  position: string | null;
  phone: string | null;
  category?: { labelEs: string } | null;
};

type Assignment = {
  id: string;
  startDate: Date;
  endDate: Date;
  notes: string | null;
  technician: {
    id: string;
    fullName: string;
    position: string | null;
    category?: { labelEs: string } | null;
  };
};

const initialState: any = { error: "" };

export function AssignmentBoard({
  projectId,
  personnel,
  assignments,
}: {
  projectId: string;
  personnel: PersonnelMember[];
  assignments: Assignment[];
}) {
  const [state, formAction, isPending] = useActionState(createAssignment, initialState);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await removeAssignment(id, projectId);
    setDeletingId(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulario de Asignación */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <h3 className="font-heading tracking-wider text-slate-800 dark:text-white">Nueva Asignación</h3>
          </div>
          <form action={formAction} className="p-5 space-y-4">
            <input type="hidden" name="projectId" value={projectId} />

            {state?.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />{state.error}
              </div>
            )}

            {personnel.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm space-y-2">
                <User className="h-8 w-8 mx-auto opacity-20" />
                <p>No hay personal registrado.</p>
                <a href="/dashboard/personal" className="text-orange-500 underline text-xs">
                  Ir a Personal →
                </a>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Técnico / Personal (Puedes seleccionar varios)
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-700 rounded-md p-2 bg-white dark:bg-slate-950 space-y-1">
                    {personnel.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer">
                        <input type="checkbox" name="technicianIds" value={p.id} className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{p.fullName}</span>
                        <span className="text-xs text-slate-500">{p.position || p.category?.labelEs || "Personal"}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Inicio</label>
                  <input type="date" name="startDate" required className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Fin Estimada</label>
                  <input type="date" name="endDate" required className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notas (Opcional)</label>
                  <textarea name="notes" rows={3} placeholder="Instrucciones específicas..." className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                </div>

                <button type="submit" disabled={isPending} className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Asignar
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Lista de Asignaciones */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
            <h3 className="font-heading tracking-wider text-slate-800 dark:text-white">Itinerario y Personal Asignado</h3>
            {assignments.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                {assignments.length} asignación{assignments.length > 1 ? "es" : ""}
              </span>
            )}
          </div>

          <div className="p-5">
            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                <Clock className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Sin asignaciones</p>
                <p className="text-xs mt-1 max-w-sm">No hay personal asignado a este proyecto todavía.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{a.technician.fullName}</p>
                          <p className="text-xs text-slate-500">
                            {a.technician.position || a.technician.category?.labelEs || "Personal"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 pl-10">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(a.startDate).toLocaleDateString()} — {new Date(a.endDate).toLocaleDateString()}</span>
                      </div>
                      {a.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 pl-10 italic">"{a.notes}"</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deletingId === a.id}
                      className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shrink-0"
                      title="Eliminar asignación"
                    >
                      {deletingId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
