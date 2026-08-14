import { Metadata } from "next";
import Link from "next/link";
import { getQuickJobs } from "./actions";
import { Zap, Plus, CheckCircle2, Clock, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Servicios Rápidos | CALA Multiservices",
};

const statusConfig = {
  activo:    { label: "Activo",    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  informe:   { label: "Informe",   color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  facturado: { label: "Facturado", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
};

const fmt = (n: number | string) =>
  parseFloat(n.toString()).toLocaleString("en-CA", { style: "currency", currency: "CAD" });

export default async function ServiciosRapidosPage() {
  const jobs = await getQuickJobs();

  const totalActivos   = jobs.filter((j) => j.status === "activo").length;
  const totalFacturado = jobs.filter((j) => j.status === "facturado")
    .reduce((s, j) => s + parseFloat(j.totalAmount.toString()), 0);
  const totalPendiente = jobs.filter((j) => j.status !== "facturado" || !j.paidAt)
    .reduce((s, j) => s + parseFloat(j.totalAmount.toString()), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white flex items-center gap-3">
            <Zap className="h-7 w-7 text-orange-500" />
            Servicios Rápidos
          </h1>
          <p className="text-slate-500 mt-1">Atiende clientes sin flujo de proyecto completo.</p>
        </div>
        <Link
          href="/dashboard/servicios-rapidos/nuevo"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors text-sm"
        >
          <Plus className="h-4 w-4" /> Nuevo Servicio
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{totalActivos}</p>
            <p className="text-xs text-slate-500">En Progreso</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(totalPendiente)}</p>
            <p className="text-xs text-slate-500">Por Cobrar</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <div className="p-2.5 bg-green-50 dark:bg-green-950/50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(totalFacturado)}</p>
            <p className="text-xs text-slate-500">Facturado</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Zap className="h-10 w-10 opacity-30" />
            <p className="text-sm">No hay servicios rápidos aún.</p>
            <Link href="/dashboard/servicios-rapidos/nuevo" className="text-orange-500 hover:underline text-sm font-medium">
              Crear el primero →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {jobs.map((job) => {
              const st = statusConfig[job.status];
              return (
                <Link
                  key={job.id}
                  href={`/dashboard/servicios-rapidos/${job.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
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
                  <div className="flex items-center gap-4 ml-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{fmt(job.totalAmount.toString())}</span>
                    <FileText className="h-4 w-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
