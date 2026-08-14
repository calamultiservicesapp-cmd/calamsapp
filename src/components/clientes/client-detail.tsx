"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Mail, Phone, CalendarDays, FolderKanban, Zap, FileText, CheckCircle2 } from "lucide-react";

type ClientHistoryProps = {
  client: {
    id: string;
    name: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    projects: any[];
    quickJobs: any[];
  };
};

const fmt = (n: number | string) =>
  parseFloat(n.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" });

export function ClientDetail({ client }: ClientHistoryProps) {
  // Combine and sort history
  const history = [
    ...client.projects.map((p) => ({
      ...p,
      type: "project",
      date: p.createdAt,
      amount: p.invoice ? p.invoice.totalAmount : 0,
      link: `/dashboard/proyectos/${p.id}`,
    })),
    ...client.quickJobs.map((q) => ({
      ...q,
      type: "quickJob",
      date: q.serviceDate,
      amount: q.totalAmount,
      link: `/dashboard/servicios-rapidos/${q.id}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalAmount = history.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/clientes"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Clientes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">
              {client.name}
            </h1>
            {client.contactName && (
              <p className="text-slate-500 mt-1 text-lg">{client.contactName}</p>
            )}
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-900">
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5">Total Facturado</p>
            <p className="text-xl font-bold">{fmt(totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {client.email && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Mail className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Email</p>
              <a href={`mailto:${client.email}`} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-orange-500">{client.email}</a>
            </div>
          </div>
        )}
        {client.phone && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Phone className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Teléfono</p>
              <a href={`tel:${client.phone}`} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-orange-500">{client.phone}</a>
            </div>
          </div>
        )}
        {client.address && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <MapPin className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Dirección</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{client.address}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-slate-400" />
          <h3 className="font-heading tracking-wider text-slate-800 dark:text-white">Historial de Trabajos</h3>
        </div>
        
        {history.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No hay proyectos ni servicios registrados para este cliente.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {history.map((item) => (
              <Link 
                key={item.id} 
                href={item.link}
                className="block p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                      item.type === "project" 
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600" 
                        : "bg-orange-50 dark:bg-orange-950/50 text-orange-500"
                    }`}>
                      {item.type === "project" ? <FolderKanban className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-orange-500 transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(item.date).toLocaleDateString("es-CA", { dateStyle: "medium" })}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Monto</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.amount ? fmt(item.amount) : "—"}
                      </p>
                    </div>
                    <FileText className="h-5 w-5 text-slate-300 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
