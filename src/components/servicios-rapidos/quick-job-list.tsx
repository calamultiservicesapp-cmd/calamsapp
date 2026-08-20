"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, FileText, MoreVertical, Archive, Trash2, Loader2 } from "lucide-react";
import { archiveQuickJob, deleteQuickJob } from "@/app/dashboard/servicios-rapidos/actions";

const statusConfig: Record<string, { label: string; color: string }> = {
  activo:    { label: "Activo",    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  informe:   { label: "Informe",   color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  facturado: { label: "Facturado", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
  cerrado:   { label: "Archivado", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
};

const fmt = (n: number | string) =>
  parseFloat(n.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" });

function ArchiveConfirm({ id, name, onClose }: { id: string; name: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleArchive() {
    setLoading(true);
    setErrorMsg(null);
    const res = await archiveQuickJob(id);
    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><Archive className="h-5 w-5 text-slate-600 dark:text-slate-400" /></div>
          <h3 className="font-heading text-slate-800 dark:text-white">Archivar Servicio</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          ¿Archivar el servicio <strong>"{name}"</strong>? Ya no aparecerá en la lista activa, pero se conservará en el historial del cliente.
        </p>
        {errorMsg && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">{errorMsg}</p>}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 h-9 rounded-md border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleArchive} disabled={loading} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Archivar
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ id, name, onClose }: { id: string; name: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setErrorMsg(null);
    const res = await deleteQuickJob(id);
    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full"><Trash2 className="h-5 w-5 text-red-600" /></div>
          <h3 className="font-heading text-slate-800 dark:text-white">Eliminar Servicio</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          ¿Eliminar el servicio <strong>"{name}"</strong>? Esta acción borrará permanentemente el registro y <strong>no se guardará en el historial del cliente</strong>.
        </p>
        {errorMsg && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">{errorMsg}</p>}
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

export function QuickJobList({ jobs }: { jobs: any[] }) {
  const [actionModal, setActionModal] = useState<"archive" | "delete" | null>(null);
  const [selectedJob, setSelectedJob] = useState<{id: string; name: string} | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdown(null);
    if (openDropdown) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [openDropdown]);

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Zap className="h-10 w-10 opacity-30" />
        <p className="text-sm">No hay servicios rápidos activos aún.</p>
        <Link href="/dashboard/servicios-rapidos/nuevo" className="text-orange-500 hover:underline text-sm font-medium">
          Crear el primero →
        </Link>
      </div>
    );
  }

  return (
    <>
      {actionModal === "archive" && selectedJob && (
        <ArchiveConfirm id={selectedJob.id} name={selectedJob.name} onClose={() => { setActionModal(null); setSelectedJob(null); }} />
      )}
      {actionModal === "delete" && selectedJob && (
        <DeleteConfirm id={selectedJob.id} name={selectedJob.name} onClose={() => { setActionModal(null); setSelectedJob(null); }} />
      )}

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {jobs.map((job) => {
          const st = statusConfig[job.status] || statusConfig.activo;
          return (
            <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group gap-3 relative">
              <Link href={`/dashboard/servicios-rapidos/${job.id}`} className="flex-1 min-w-0 absolute inset-0 z-0"></Link>
              
              <div className="flex-1 min-w-0 z-10 pointer-events-none">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-orange-500 transition-colors">
                    {job.name}
                  </p>
                  {job.invoiceNumber && (
                    <span className="text-xs font-mono text-slate-400">{job.invoiceNumber}</span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{job.client.name} · {new Date(job.serviceDate).toLocaleDateString("es-CA")}</p>
              </div>
              
              <div className="flex items-center gap-4 sm:ml-4 justify-between sm:justify-end w-full sm:w-auto z-10">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{fmt(job.totalAmount?.toString() || "0")}</span>
                <FileText className="h-4 w-4 text-slate-300 group-hover:text-orange-400 transition-colors pointer-events-none" />
                
                {/* Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === job.id ? null : job.id);
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {openDropdown === job.id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedJob({ id: job.id, name: job.name });
                          setActionModal("archive");
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Archive className="h-4 w-4" />
                        Archivar
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedJob({ id: job.id, name: job.name });
                          setActionModal("delete");
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
