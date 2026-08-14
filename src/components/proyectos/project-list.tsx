"use client";

import { useActionState, useEffect, useState } from "react";
import { createProject, scheduleAppointment } from "@/app/dashboard/proyectos/actions";
import {
  Plus, X, Loader2, CheckCircle2, AlertCircle, FolderKanban,
  CalendarDays, Clock, ChevronRight, Users,
  CalendarCheck, Footprints, FileText, ClipboardCheck, Receipt,
  MoreVertical, Archive, Trash2
} from "lucide-react";
import Link from "next/link";
import { archiveProject, deleteProject } from "@/app/dashboard/proyectos/actions";

type ClientOption = { id: string; name: string };

type Project = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  client: { name: string };
  appointment: { scheduledAt: Date } | null;
  _count: { walkthroughItems: number };
};

const statusConfig: Record<string, { label: string; color: string }> = {
  cita:         { label: "Cita",         color: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" },
  caminata:     { label: "Caminata",     color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  propuesta:    { label: "Propuesta",    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
  aprobado:     { label: "Aprobado",     color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
  asignado:     { label: "Asignado",     color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300" },
  en_ejecucion: { label: "En Ejecución", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
  informe:      { label: "Informe",      color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  facturado:    { label: "Facturado",    color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
  cerrado:      { label: "Cerrado",      color: "bg-slate-100 text-slate-500" },
};

// The 6-step pipeline definition for each project card
const PIPELINE_STEPS = [
  { id: 1, label: "Propuesta", icon: CalendarDays,    subpath: "",           statuses: ["cita"] },
  { id: 2, label: "Caminata",  icon: Footprints,      subpath: "/caminata",  statuses: ["caminata"] },
  { id: 3, label: "Cotización",icon: FileText,        subpath: "/propuesta", statuses: ["propuesta", "aprobado"] },
  { id: 4, label: "Fechas",    icon: CalendarCheck,   subpath: "/asignacion",statuses: ["asignado", "en_ejecucion"] },
  { id: 5, label: "Informe",   icon: ClipboardCheck,  subpath: "/informe",   statuses: ["informe"] },
  { id: 6, label: "Factura",   icon: Receipt,         subpath: "/factura",   statuses: ["facturado", "cerrado"] },
];

const STATUS_ORDER = [
  "cita", "caminata", "propuesta", "aprobado",
  "asignado", "en_ejecucion", "informe", "facturado", "cerrado",
];

function MiniPipeline({ projectId, status }: { projectId: string; status: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  // Map each step to a state: "done" | "active" | "pending"
  const getStepState = (step: typeof PIPELINE_STEPS[0]) => {
    const stepStatuses = step.statuses;
    const stepMinIdx = Math.min(...stepStatuses.map((s) => STATUS_ORDER.indexOf(s)));
    if (currentIdx > stepStatuses.map((s) => STATUS_ORDER.indexOf(s)).at(-1)!) return "done";
    if (stepStatuses.includes(status)) return "active";
    return "pending";
  };

  return (
    <div className="flex items-center gap-0.5 w-full pt-1">
      {PIPELINE_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const state = getStepState(step);
        const isLast = idx === PIPELINE_STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1 min-w-0">
            {/* Step node */}
            <Link
              href={`/dashboard/proyectos/${projectId}${step.subpath}`}
              onClick={(e) => e.stopPropagation()}
              title={step.label}
              className={`relative flex items-center justify-center w-7 h-7 rounded-full border-2 shrink-0 transition-all
                ${state === "done"
                  ? "bg-orange-500 border-orange-500 text-white"
                  : state === "active"
                  ? "bg-white dark:bg-slate-900 border-orange-500 text-orange-500 shadow-md shadow-orange-100 dark:shadow-orange-950/50 scale-110"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-300 dark:text-slate-600"
                }`}
            >
              {state === "done" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3 w-3" />
              )}
              {/* Active pulse ring */}
              {state === "active" && (
                <span className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping opacity-30" />
              )}
            </Link>

            {/* Connector line */}
            {!isLast && (
              <div className={`h-0.5 flex-1 mx-0.5 rounded-full transition-colors
                ${state === "done" ? "bg-orange-400" : "bg-slate-200 dark:bg-slate-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const initialState: any = { success: false, error: "" };

function NewProjectModal({ clients, onClose }: { clients: ClientOption[]; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createProject, initialState);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-heading tracking-wider text-slate-800 dark:text-white">Nuevo Proyecto</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>

        <form action={formAction} className="p-5 space-y-4">
          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />{state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Proyecto <span className="text-red-500">*</span></label>
            <input type="text" name="name" required placeholder="ej. Remodelación Cocina" className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cliente <span className="text-red-500">*</span></label>
            <select name="clientId" required className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Seleccionar cliente...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Cita Inicial (Opcional)</p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha y Hora</label>
              <input type="datetime-local" name="scheduledAt" className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notas</label>
              <textarea name="notes" rows={2} placeholder="Detalles de la cita..." className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-4 h-10 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Crear Proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ArchiveConfirm({ id, name, onClose }: { id: string; name: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  async function handleArchive() {
    setLoading(true);
    await archiveProject(id);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-full"><Archive className="h-5 w-5 text-slate-600" /></div>
          <h3 className="font-heading text-slate-800 dark:text-white">Archivar Proyecto</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">¿Estás seguro de archivar <strong>"{name}"</strong>? Pasará a estado cerrado y no aparecerá en la lista activa.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 h-9 rounded-md border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleArchive} disabled={loading} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Archivar
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteProjectConfirm({ id, name, onClose }: { id: string; name: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    setLoading(true);
    await deleteProject(id);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full"><Trash2 className="h-5 w-5 text-red-600" /></div>
          <h3 className="font-heading text-slate-800 dark:text-white">Eliminar Proyecto</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">¿Estás seguro de eliminar el proyecto <strong>"{name}"</strong>? Esta acción borrará permanentemente todos sus datos asociados y no se puede deshacer.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 h-9 rounded-md border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleDelete} disabled={loading} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Eliminar Permanentemente
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectList({
  projects,
  clients,
}: {
  projects: Project[];
  clients: ClientOption[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [actionModal, setActionModal] = useState<"archive" | "delete" | null>(null);
  const [selectedProject, setSelectedProject] = useState<{id: string; name: string} | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdown(null);
    if (openDropdown) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [openDropdown]);

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <>
      {showModal && <NewProjectModal clients={clients} onClose={() => setShowModal(false)} />}
      {actionModal === "archive" && selectedProject && <ArchiveConfirm id={selectedProject.id} name={selectedProject.name} onClose={() => { setActionModal(null); setSelectedProject(null); }} />}
      {actionModal === "delete" && selectedProject && <DeleteProjectConfirm id={selectedProject.id} name={selectedProject.name} onClose={() => { setActionModal(null); setSelectedProject(null); }} />}

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-60"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(statusConfig).map(([val, cfg]) => (
                <option key={val} value={val}>{cfg.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />Nuevo Proyecto
          </button>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center py-16 text-slate-400">
            <FolderKanban className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">No hay proyectos que coincidan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((project) => {
              const sc = statusConfig[project.status] ?? { label: project.status, color: "bg-slate-100 text-slate-500" };
              return (
                <Link
                  key={project.id}
                  href={`/dashboard/proyectos/${project.id}`}
                  className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 transition-all group flex flex-col gap-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-orange-500 transition-colors leading-tight truncate pr-8">
                      {project.name}
                    </h3>
                    
                    {/* Action Menu (relative positioned to the top right of the card) */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === project.id ? null : project.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {openDropdown === project.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedProject({ id: project.id, name: project.name });
                              setActionModal("archive");
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                          >
                            <Archive className="h-4 w-4" /> Archivar
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedProject({ id: project.id, name: project.name });
                              setActionModal("delete");
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 uppercase tracking-wider ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>

                  {/* Client */}
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    {project.client.name}
                  </div>

                  {/* Appointment */}
                  {project.appointment && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {new Date(project.appointment.scheduledAt).toLocaleString("es-CA", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  )}

                  {/* ── Mini Pipeline ── */}
                  <div className="pt-1 pb-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Progreso del proyecto
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Paso {PIPELINE_STEPS.findIndex((s) => s.statuses.includes(project.status)) + 1 || PIPELINE_STEPS.length} / {PIPELINE_STEPS.length}
                      </span>
                    </div>
                    <MiniPipeline projectId={project.id} status={project.status} />
                    {/* Step labels row */}
                    <div className="flex mt-1.5">
                      {PIPELINE_STEPS.map((step) => {
                        const state =
                          step.statuses.includes(project.status)
                            ? "active"
                            : STATUS_ORDER.indexOf(project.status) >
                              Math.max(...step.statuses.map((s) => STATUS_ORDER.indexOf(s)))
                            ? "done"
                            : "pending";
                        return (
                          <div key={step.id} className="flex-1 text-center">
                            <span
                              className={`text-[9px] leading-tight block truncate px-0.5 ${
                                state === "active"
                                  ? "text-orange-500 font-bold"
                                  : state === "done"
                                  ? "text-slate-500 dark:text-slate-400"
                                  : "text-slate-300 dark:text-slate-600"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {project._count.walkthroughItems} actividades
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <p className="text-xs text-slate-400">{filtered.length} proyecto(s).</p>
      </div>
    </>
  );
}
