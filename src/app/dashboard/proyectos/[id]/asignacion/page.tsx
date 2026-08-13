import { notFound } from "next/navigation";
import { getProjectDetail } from "../actions";
import { getPersonnel, getAssignments, startExecution } from "./actions";
import { AssignmentBoard } from "@/components/proyectos/assignment-board";
import { CalendarCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectDetail(id);
  if (!project) notFound();

  const statusHierarchy = [
    "cita", "caminata", "propuesta", "aprobado",
    "asignado", "en_ejecucion", "informe", "facturado", "cerrado",
  ];

  const currentIdx = statusHierarchy.indexOf(project.status);
  const requiredIdx = statusHierarchy.indexOf("aprobado");

  if (currentIdx < requiredIdx) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-500 text-white shrink-0">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white">
              Paso 4 — Plan de Fechas
            </h2>
            <p className="text-sm text-slate-500">Asigna técnicos y define el itinerario de ejecución.</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
          <p className="text-amber-800 dark:text-amber-200 font-medium">
            La propuesta debe estar aprobada primero.
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            El cliente debe confirmar la cotización antes de planificar la ejecución.
          </p>
          <Link
            href={`/dashboard/proyectos/${id}/propuesta`}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors mt-2"
          >
            Ver la Cotización →
          </Link>
        </div>
      </div>
    );
  }

  const [personnel, assignments] = await Promise.all([
    getPersonnel(),
    getAssignments(id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-500 text-white shrink-0">
          <CalendarCheck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white">
            Paso 4 — Plan de Fechas
          </h2>
          <p className="text-sm text-slate-500">
            Asigna personal y define las fechas de ejecución para <strong>{project.name}</strong>.
          </p>
        </div>
      </div>

      <AssignmentBoard
        projectId={id}
        personnel={personnel}
        assignments={assignments}
      />

      {assignments.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 mt-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Técnicos asignados. Puedes avanzar para llenar el informe de campo.
          </p>
          <form action={startExecution}>
            <input type="hidden" name="projectId" value={id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0"
            >
              Guardar y Avanzar al Paso 5 →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
