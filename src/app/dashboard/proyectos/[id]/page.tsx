import { notFound } from "next/navigation";
import { getProjectDetail } from "./actions";
import {
  CalendarDays, MapPin, Mail, Phone, FileText,
  Clock, AlertCircle, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { AppointmentEditor } from "@/components/citas/appointment-editor";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectDetail(id);
  if (!project) notFound();

  const hasAppointment = !!project.appointment;
  const hasWalkthrough = project.walkthroughItems.length > 0;

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-500 text-white shrink-0">
          <CalendarDays className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white">
            Paso 1 — Propuesta Inicial
          </h2>
          <p className="text-sm text-slate-500">
            Registra los datos de la cita inicial con el cliente potencial.
          </p>
        </div>
      </div>

      {/* Client info card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Información del Cliente
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {project.client.email && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Mail className="h-4 w-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{project.client.email}</p>
              </div>
            </div>
          )}
          {project.client.phone && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Phone className="h-4 w-4 text-green-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Teléfono</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{project.client.phone}</p>
              </div>
            </div>
          )}
          {project.client.address && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg sm:col-span-2">
              <MapPin className="h-4 w-4 text-violet-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Dirección</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{project.client.address}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Proyecto creado</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {new Date(project.createdAt).toLocaleDateString("es-CA", { dateStyle: "medium" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Cita Inicial
          </h3>
          {hasAppointment && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Programada
            </span>
          )}
        </div>

        {hasAppointment ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
            <CalendarDays className="h-5 w-5 text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {new Date(project.appointment!.scheduledAt).toLocaleString("es-CA", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              {project.appointment!.notes && (
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                  {project.appointment!.notes}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              No hay cita programada aún. Usa el formulario de abajo para registrarla.
            </p>
          </div>
        )}

        <AppointmentEditor
          projectId={id}
          existing={
            project.appointment
              ? {
                  scheduledAt: project.appointment.scheduledAt.toISOString(),
                  notes: project.appointment.notes ?? "",
                }
              : null
          }
        />
      </div>

      {/* Next step CTA */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
          <FileText className="h-4 w-4" />
          <span>¿Ya tienes la cita agendada? Continúa con la Caminata.</span>
        </div>
        <Link
          href={`/dashboard/proyectos/${id}/caminata`}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0"
        >
          Ir a Caminata →
        </Link>
      </div>
    </div>
  );
}
