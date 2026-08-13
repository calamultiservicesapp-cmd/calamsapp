import { notFound } from "next/navigation";
import { getProjectDetail } from "../actions";
import { getTechnicians, getAssignments } from "./actions";
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

  const [technicians, assignments] = await Promise.all([
    getTechnicians(),
    getAssignments(id),
  ]);

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-500 text-white shrink-0">
          <CalendarCheck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white">
            Paso 4 — Plan de Fechas
          </h2>
          <p className="text-sm text-slate-500">
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
