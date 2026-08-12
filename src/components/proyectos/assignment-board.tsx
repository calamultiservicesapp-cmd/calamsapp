"use client";

import { useActionState, useState } from "react";
import { createAssignment, removeAssignment } from "@/app/dashboard/proyectos/[id]/asignacion/actions";
import { Plus, Trash2, Calendar, User, Loader2, AlertCircle, Clock } from "lucide-react";

type Technician = {
  id: string;
  fullName: string;
};

type Assignment = {
  id: string;
  startDate: Date;
  endDate: Date;
  notes: string | null;
  technician: {
    id: string;
    fullName: string;
  };
};

const initialState: any = { error: "" };

export function AssignmentBoard({
  projectId,
  technicians,
  assignments
}: {
  projectId: string;
  technicians: Technician[];
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Técnico</label>
              <select name="technicianId" required className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700 dark:text-slate-300">
                <option value="">Selecciona un técnico...</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notas Adicionales (Opcional)</label>
              <textarea name="notes" rows={3} placeholder="Instrucciones específicas para el técnico..." className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
            </div>

            <button type="submit" disabled={isPending} className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Asignar Técnico
            </button>
          </form>
        </div>
      </div>

      {/* Lista de Asignaciones */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <h3 className="font-heading tracking-wider text-slate-800 dark:text-white">Itinerario y Técnicos Asignados</h3>
          </div>
          
          <div className="p-5">
            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                <Clock className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Sin asignaciones</p>
                <p className="text-xs mt-1 max-w-sm">No hay técnicos asignados a este proyecto todavía. Usa el formulario para asignar el trabajo.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map(a => (
                  <div key={a.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{a.technician.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(a.startDate).toLocaleDateString()} — {new Date(a.endDate).toLocaleDateString()}</span>
                      </div>
                      {a.notes && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 italic">"{a.notes}"</p>
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
