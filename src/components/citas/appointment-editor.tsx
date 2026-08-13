"use client";

import { useActionState, useEffect } from "react";
import { scheduleAppointment } from "@/app/dashboard/proyectos/actions";
import { CalendarDays, Loader2, CheckCircle2, AlertCircle, Save } from "lucide-react";

const initialState: any = { success: false, error: "" };

type Props = {
  projectId: string;
  existing: { scheduledAt: string; notes: string } | null;
};

export function AppointmentEditor({ projectId, existing }: Props) {
  const [state, formAction, isPending] = useActionState(scheduleAppointment, initialState);

  // Format existing date for datetime-local input
  const defaultDate = existing
    ? new Date(existing.scheduledAt)
        .toLocaleString("sv-SE", { timeZone: "America/New_York" })
        .slice(0, 16)
    : "";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />

      {state?.error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-3 rounded-md flex items-center gap-2 text-sm border border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          ¡Cita guardada correctamente!
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
            Fecha y Hora
            <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="scheduledAt"
            required
            defaultValue={defaultDate}
            className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Notas de la Cita
          </label>
          <input
            type="text"
            name="notes"
            defaultValue={existing?.notes ?? ""}
            placeholder="Ej. Traer planos, confirmar acceso…"
            className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 h-9 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {existing ? "Actualizar Cita" : "Guardar Cita"}
        </button>
      </div>
    </form>
  );
}
