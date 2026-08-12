"use client";

import { useActionState, useEffect, useState } from "react";
import { createProject, scheduleAppointment } from "@/app/dashboard/proyectos/actions";
import {
  Plus, X, Loader2, CheckCircle2, AlertCircle, FolderKanban,
  CalendarDays, Clock, ChevronRight, Users
} from "lucide-react";
import Link from "next/link";

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

export function ProjectList({
  projects,
  clients,
}: {
  projects: Project[];
  clients: ClientOption[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow group flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-orange-500 transition-colors leading-tight">
                      {project.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    {project.client.name}
                  </div>

                  {project.appointment && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {new Date(project.appointment.scheduledAt).toLocaleString("es-CA", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  )}

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
