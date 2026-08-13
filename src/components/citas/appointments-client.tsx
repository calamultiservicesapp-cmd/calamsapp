"use client";

import { useActionState, useEffect, useState } from "react";
import { updateAppointment } from "@/app/dashboard/citas/actions";
import { CalendarDays, Clock, Users, Pencil, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Appointment = {
  id: string;
  scheduledAt: string;
  notes: string | null;
  project: {
    id: string;
    name: string;
    client: { name: string };
  };
};

const initialState: any = { success: false, error: "" };

function EditAppointmentModal({ appt, onClose }: { appt: Appointment; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(updateAppointment, initialState);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state]);

  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const localDateValue = new Date(appt.scheduledAt).toLocaleString("sv-SE", {
    timeZone: "America/New_York",
  }).slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-heading tracking-wider text-slate-800 dark:text-white">
              Editar Cita
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{appt.project.name} — {appt.project.client.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-5 space-y-4">
          <input type="hidden" name="id" value={appt.id} />

          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nueva Fecha y Hora <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="scheduledAt"
              defaultValue={localDateValue}
              required
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Notas (Opcional)
            </label>
            <textarea
              name="notes"
              defaultValue={appt.notes ?? ""}
              rows={3}
              placeholder="Instrucciones especiales, dirección, etc."
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button" onClick={onClose}
              className="px-4 h-10 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={isPending}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AppointmentCard({ appt }: { appt: Appointment }) {
  const [editing, setEditing] = useState(false);
  const date = new Date(appt.scheduledAt);

  return (
    <>
      {editing && <EditAppointmentModal appt={appt} onClose={() => setEditing(false)} />}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex gap-4 group hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3 min-w-[60px] text-center border border-orange-100 dark:border-orange-900">
          <span className="text-2xl font-bold text-orange-500">{date.getDate()}</span>
          <span className="text-xs text-orange-400 uppercase">
            {date.toLocaleString("es-CA", { month: "short" })}
          </span>
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{appt.project.name}</p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />{appt.project.client.name}
          </p>
          <p className="text-sm text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {date.toLocaleTimeString("es-CA", { hour: "2-digit", minute: "2-digit" })}
          </p>
          {appt.notes && <p className="text-xs text-slate-500 italic mt-1">"{appt.notes}"</p>}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="self-start p-1.5 rounded-md text-slate-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors opacity-0 group-hover:opacity-100"
          title="Editar cita"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

export function AppointmentsClient({
  upcoming,
  past,
}: {
  upcoming: Appointment[];
  past: Appointment[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4" /> Próximas Citas
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center">
            No hay citas programadas.
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((a) => <AppointmentCard key={a.id} appt={a} />)}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Citas Pasadas</h2>
          <div className="space-y-3 opacity-60">
            {past.map((a) => <AppointmentCard key={a.id} appt={a} />)}
          </div>
        </div>
      )}
    </div>
  );
}
