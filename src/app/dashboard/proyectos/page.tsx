import { Metadata } from "next";
import { getProjects, getClientsForSelect } from "./actions";
import { ProjectList } from "@/components/proyectos/project-list";

export const metadata: Metadata = {
  title: "Proyectos | CALA Multiservices",
};

export default async function ProyectosPage() {
  const [projects, clients] = await Promise.all([getProjects(), getClientsForSelect()]);

  // Serialize dates for client components
  const serializedProjects = projects.map((p) => ({
    ...p,
    createdAt: p.createdAt,
    appointment: p.appointment
      ? { scheduledAt: p.appointment.scheduledAt }
      : null,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">
          Proyectos
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Pipeline completo de proyectos: desde la cita inicial hasta la facturación final.
        </p>
      </div>
      <ProjectList projects={serializedProjects} clients={clients} />
    </div>
  );
}
