import { notFound } from "next/navigation";
import { getProjectDetail } from "../actions";
import { getTechnicians, getAssignments } from "./actions";
import { AssignmentBoard } from "@/components/proyectos/assignment-board";
import Link from "next/link";
import { ChevronRight, CalendarCheck } from "lucide-react";

export default async function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectDetail(id);
  if (!project) notFound();

  const statusHierarchy = [
    "cita",
    "caminata",
    "propuesta",
    "aprobado",
    "asignado",
    "en_ejecucion",
    "informe",
    "facturado",
    "cerrado",
  ];
  
  const currentIdx = statusHierarchy.indexOf(project.status);
  const requiredIdx = statusHierarchy.indexOf("aprobado");

  if (currentIdx < requiredIdx) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard/proyectos" className="hover:text-orange-500 transition-colors">Proyectos</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/dashboard/proyectos/${id}`} className="hover:text-orange-500 transition-colors">{project.name}</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Asignación</span>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">La propuesta no ha sido aprobada aún.</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">El proyecto debe estar en estado 'Aprobado' para poder asignar técnicos.</p>
          <Link href={`/dashboard/proyectos/${id}/propuesta`} className="mt-4 inline-block text-sm font-medium text-orange-500 hover:underline">
            Ir a la Propuesta →
          </Link>
        </div>
      </div>
    );
  }

  const [technicians, assignments] = await Promise.all([
    getTechnicians(),
    getAssignments(id)
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/proyectos" className="hover:text-orange-500 transition-colors">Proyectos</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/dashboard/proyectos/${id}`} className="hover:text-orange-500 transition-colors">{project.name}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-800 dark:text-slate-200">Asignación de Técnicos</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white flex items-center gap-3">
            <CalendarCheck className="h-8 w-8 text-orange-500" />
            Asignación e Itinerario
          </h1>
          <p className="text-slate-500 mt-1">
            Asigna técnicos y define las fechas de ejecución para <strong>{project.name}</strong>.
          </p>
        </div>
      </div>

      <AssignmentBoard 
        projectId={id}
        technicians={technicians}
        assignments={assignments}
      />
    </div>
  );
}
