import { notFound } from "next/navigation";
import { getProjectDetail, getActivitiesForWalkthrough } from "./actions";
import { getCurrentPricingSnapshot } from "@/lib/db/pricing";
import { WalkthroughCalculator } from "@/components/proyectos/walkthrough-calculator";
import {
  CalendarDays, MapPin, Mail, Phone, Users,
  Clock, CheckCircle2, ChevronRight, FileCheck
} from "lucide-react";
import Link from "next/link";

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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, activities, snapshot] = await Promise.all([
    getProjectDetail(id),
    getActivitiesForWalkthrough(),
    getCurrentPricingSnapshot(),
  ]);

  if (!project) notFound();

  const sc = statusConfig[project.status] ?? { label: project.status, color: "bg-slate-100 text-slate-500" };
  const currentIdx = Object.keys(statusConfig).indexOf(project.status);
  const statusHierarchy = Object.keys(statusConfig);

  const existingItems = project.walkthroughItems.map((wi) => ({
    activityId: wi.activityId,
    personnelType: wi.personnelType as "contratista" | "tecnico_novato" | "tecnico_experto",
    hours: wi.hours.toNumber(),
    notes: wi.notes ?? "",
  }));

  const serializedActivities = activities.map((a) => ({
    ...a,
    minHours: a.minHours.toString(),
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/proyectos" className="hover:text-orange-500 transition-colors">Proyectos</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-800 dark:text-slate-200 font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">{project.name}</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-1"><Users className="h-4 w-4" />{project.client.name}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${sc.color}`}>
          {sc.label}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {project.appointment && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Cita</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {new Date(project.appointment.scheduledAt).toLocaleString("es-CA", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
          </div>
        )}
        {project.client.email && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{project.client.email}</p>
            </div>
          </div>
        )}
        {project.client.phone && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
            <Phone className="h-5 w-5 text-green-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Teléfono</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{project.client.phone}</p>
            </div>
          </div>
        )}
        {project.client.address && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-violet-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Dirección</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{project.client.address}</p>
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-slate-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Creado</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {new Date(project.createdAt).toLocaleDateString("es-CA", { dateStyle: "medium" })}
            </p>
          </div>
        </div>
      </div>

      {project.proposal && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-5 flex items-center gap-4 flex-wrap">
          <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
          <div className="flex-1 min-w-[200px]">
            <p className="font-medium text-green-800 dark:text-green-300">Propuesta generada</p>
            <p className="text-sm text-green-600 dark:text-green-500">
              Precio final: ${project.proposal.finalPrice.toString()} | Estado: {project.proposal.status}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/proyectos/${project.id}/propuesta`} className="text-sm font-medium text-green-700 dark:text-green-400 hover:underline">
              Ver propuesta →
            </Link>
            {project.proposal.status === "aprobada" && (
              <Link href={`/dashboard/proyectos/${project.id}/asignacion`} className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors">
                Asignar Técnicos
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Invoice summary if exists / ready */}
      {currentIdx >= statusHierarchy.indexOf("informe") && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-5 flex items-center gap-4 flex-wrap">
          <FileCheck className="h-6 w-6 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-[200px]">
            <p className="font-medium text-blue-800 dark:text-blue-300">
              {project.invoice ? `Factura ${project.invoice.invoiceNumber}` : "Reporte de Campo Completado"}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-500">
              {project.invoice 
                ? `Monto: $${project.invoice.amount.toString()} | Estado: ${project.invoice.status}`
                : "Listo para generar factura final."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/proyectos/${project.id}/factura`} className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
              {project.invoice ? "Ver Factura" : "Generar Factura"}
            </Link>
          </div>
        </div>
      )}

      {/* Walkthrough */}
      <div>
        <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white mb-4">
          Caminata / Cotización
        </h2>
        <WalkthroughCalculator
          projectId={project.id}
          activities={serializedActivities}
          snapshot={snapshot}
          existingItems={existingItems}
        />
      </div>
    </div>
  );
}
