import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { CalendarDays, Clock, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Citas | CALA Multiservices",
};

export default async function CitasPage() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { scheduledAt: "asc" },
    include: {
      project: {
        include: { client: { select: { name: true } } },
      },
    },
  });

  const upcoming = appointments.filter((a) => new Date(a.scheduledAt) >= new Date());
  const past = appointments.filter((a) => new Date(a.scheduledAt) < new Date());

  function AppointmentCard({ appt }: { appt: (typeof appointments)[0] }) {
    const date = new Date(appt.scheduledAt);
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex gap-4">
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
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">Citas</h1>
        <p className="text-slate-500 mt-1">Calendario de citas iniciales con clientes.</p>
      </div>

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
