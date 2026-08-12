import { notFound } from "next/navigation";
import { getProjectForReport } from "./actions";
import { FieldReportForm } from "@/components/tecnicos/field-report-form";
import Link from "next/link";
import { ChevronRight, ClipboardCheck, MapPin, Phone } from "lucide-react";

export default async function FieldReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectForReport(id);
  
  if (!project) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500 px-2 sm:px-0">
        <Link href="/dashboard/mis-tareas" className="hover:text-orange-500 transition-colors">Mis Tareas</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-800 dark:text-slate-200 truncate">{project.name}</span>
      </div>

      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-heading tracking-wider text-slate-900 dark:text-white flex items-center gap-3">
          <ClipboardCheck className="h-7 w-7 text-orange-500 shrink-0" />
          Reporte de Campo
        </h1>
        <p className="text-slate-500 mt-1">
          Completa el reporte para finalizar tu asignación en <strong>{project.name}</strong>.
        </p>
      </div>

      {/* Tarjeta de Información del Cliente */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-xl p-4 sm:p-5 mx-2 sm:mx-0">
        <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-3">Información del Cliente</h3>
        <div className="space-y-2">
          <p className="font-medium text-slate-800 dark:text-slate-200">{project.client.name}</p>
          {project.client.contactName && (
            <p className="text-sm text-slate-600 dark:text-slate-400">Contacto: {project.client.contactName}</p>
          )}
          {project.client.address && (
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-orange-500" />
              {project.client.address}
            </p>
          )}
          {project.client.phone && (
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-orange-500" />
              <a href={`tel:${project.client.phone}`} className="hover:underline text-blue-600 dark:text-blue-400">{project.client.phone}</a>
            </p>
          )}
        </div>
      </div>

      {/* Formulario */}
      <div className="px-2 sm:px-0">
        <FieldReportForm project={project} />
      </div>
    </div>
  );
}
