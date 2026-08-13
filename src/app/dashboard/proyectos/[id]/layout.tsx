import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { ProjectStepper } from "@/components/proyectos/project-stepper";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  cita:         { label: "Cita",         color: "bg-slate-200 text-slate-700" },
  caminata:     { label: "Caminata",     color: "bg-blue-100 text-blue-700" },
  propuesta:    { label: "Propuesta",    color: "bg-yellow-100 text-yellow-700" },
  aprobado:     { label: "Aprobado",     color: "bg-green-100 text-green-700" },
  asignado:     { label: "Asignado",     color: "bg-teal-100 text-teal-700" },
  en_ejecucion: { label: "En Ejecución", color: "bg-orange-100 text-orange-700" },
  informe:      { label: "Informe",      color: "bg-purple-100 text-purple-700" },
  facturado:    { label: "Facturado",    color: "bg-violet-100 text-violet-700" },
  cerrado:      { label: "Cerrado",      color: "bg-slate-100 text-slate-500" },
};

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { name: true } },
      appointment: { select: { scheduledAt: true } },
      proposal: { select: { status: true } },
      invoice: { select: { invoiceNumber: true } },
    },
  });

  if (!project) notFound();

  const sc = statusConfig[project.status] ?? { label: project.status, color: "bg-slate-100 text-slate-500" };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/proyectos" className="hover:text-orange-500 transition-colors">
          Proyectos
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-800 dark:text-slate-200 font-medium">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-heading tracking-wider text-slate-900 dark:text-white">
              {project.name}
            </h1>
            <p className="text-slate-500 mt-0.5 flex items-center gap-1.5 text-sm">
              <Users className="h-3.5 w-3.5" />
              {project.client.name}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${sc.color}`}>
            {sc.label}
          </span>
        </div>
      </div>

      {/* Stepper Navigation */}
      <ProjectStepper projectId={id} status={project.status} />

      {/* Page Content */}
      <div>
        {children}
      </div>
    </div>
  );
}
