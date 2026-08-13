import { notFound } from "next/navigation";
import { getInformeData } from "./actions";
import { FieldReportForm } from "@/components/proyectos/field-report-form";
import { ClipboardCheck, AlertCircle, CheckCircle2, Users2, CalendarRange } from "lucide-react";
import Link from "next/link";

export default async function InformePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getInformeData(id);
  if (!project) notFound();

  const statusHierarchy = [
    "cita", "caminata", "propuesta", "aprobado",
    "asignado", "en_ejecucion", "informe", "facturado", "cerrado",
  ];

  const currentIdx = statusHierarchy.indexOf(project.status);
  const requiredIdx = statusHierarchy.indexOf("en_ejecucion");

  if (currentIdx < requiredIdx) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-500 text-white shrink-0">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white">
              Paso 5 — Informe Técnico
            </h2>
            <p className="text-sm text-slate-500">Reporte de campo por actividad.</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
          <p className="text-amber-800 dark:text-amber-200 font-medium">
            El proyecto aún no está en ejecución.
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Asigna los técnicos y confirma las fechas de inicio antes de registrar el informe.
          </p>
          <Link
            href={`/dashboard/proyectos/${id}/asignacion`}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors mt-2"
          >
            Ver Plan de Fechas →
          </Link>
        </div>
      </div>
    );
  }

  const serializedItems = project.walkthroughItems.map((wi) => ({
    id: wi.id,
    activityId: wi.activityId,
    activity: { nameEs: wi.activity.nameEs, descriptionEs: wi.activity.descriptionEs ?? "" },
    personnelType: wi.personnelType,
    hours: (wi as any).hours.toString(),
    fieldReportItem: wi.fieldReportItem
      ? {
          status: wi.fieldReportItem.status,
          notes: wi.fieldReportItem.notes,
        }
      : null,
  }));

  const isSubmitted = !!project.fieldReport?.submittedAt;

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-500 text-white shrink-0">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white">
              Paso 5 — Informe Técnico
            </h2>
            <p className="text-sm text-slate-500">
              Registra el resultado de cada actividad realizada en campo.
            </p>
          </div>
        </div>

        {isSubmitted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Informe Enviado
          </span>
        )}
      </div>

      {/* Assignments summary */}
      {project.assignments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Users2 className="h-4 w-4 text-teal-500" />
            <strong className="text-slate-800 dark:text-slate-200">Técnicos:</strong>
            {project.assignments.map((a) => a.technician.fullName).join(", ")}
          </div>
          {project.assignments[0] && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CalendarRange className="h-4 w-4 text-blue-500" />
              <strong className="text-slate-800 dark:text-slate-200">Período:</strong>
              {new Date(project.assignments[0].startDate).toLocaleDateString("es-CA", { dateStyle: "medium" })}
              {" → "}
              {new Date(project.assignments[project.assignments.length - 1].endDate).toLocaleDateString("es-CA", { dateStyle: "medium" })}
            </div>
          )}
        </div>
      )}

      {/* If no walkthrough items */}
      {serializedItems.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 text-center text-slate-500">
          No hay actividades registradas para este proyecto.
        </div>
      ) : (
        <FieldReportForm projectId={id} items={serializedItems} />
      )}

      {/* Next step CTA */}
      {(project.status === "informe" || project.status === "facturado" || project.status === "cerrado") && (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            ✅ Informe completado. Procede a generar la factura final.
          </p>
          <Link
            href={`/dashboard/proyectos/${id}/factura`}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0"
          >
            Ir a Factura →
          </Link>
        </div>
      )}
    </div>
  );
}
