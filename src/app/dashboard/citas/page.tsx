import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { AppointmentsClient } from "@/components/citas/appointments-client";

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

  const serialized = appointments.map((a) => ({
    id: a.id,
    scheduledAt: a.scheduledAt.toISOString(),
    notes: a.notes,
    project: {
      id: a.project.id,
      name: a.project.name,
      client: { name: a.project.client.name },
    },
  }));

  const now = new Date().toISOString();
  const upcoming = serialized.filter((a) => a.scheduledAt >= now);
  const past = serialized.filter((a) => a.scheduledAt < now);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">Citas</h1>
        <p className="text-slate-500 mt-1">Calendario de citas iniciales con clientes. Pasa el cursor sobre una cita para editarla.</p>
      </div>
      <AppointmentsClient upcoming={upcoming} past={past} />
    </div>
  );
}
