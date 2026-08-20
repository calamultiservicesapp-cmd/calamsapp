"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft, Zap, FileText, ClipboardCheck, Receipt,
  CheckCircle2, Loader2, AlertCircle, Clock, User
} from "lucide-react";
import { saveQuickJobReport, generateQuickJobInvoice, markQuickJobPaid } from "@/app/dashboard/servicios-rapidos/actions";

type QuickJobItem = {
  id: string;
  description: string;
  hours: string | null;
  unitPrice: string;
  totalPrice: string;
  activity: { nameEs: string; nameEn: string } | null;
};

type QuickJobReportType = {
  id: string;
  technicianName: string | null;
  workDescription: string;
  observations: string | null;
  completedAt: string | null;
};

type Job = {
  id: string;
  name: string;
  serviceDate: string;
  status: "activo" | "informe" | "facturado" | "cerrado";
  totalAmount: string;
  invoiceNumber: string | null;
  paidAt: string | null;
  client: { name: string; contactName: string | null; email: string | null; address: string | null };
  items: QuickJobItem[];
  report: QuickJobReportType | null;
};

const fmt = (n: string | number) =>
  parseFloat(n.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" });

const tabs = [
  { id: "detalles", label: "Detalles", icon: Zap },
  { id: "informe",  label: "Informe",  icon: ClipboardCheck },
  { id: "factura",  label: "Factura",  icon: Receipt },
] as const;

type Tab = typeof tabs[number]["id"];

export function QuickJobDetail({ job: initialJob }: { job: Job }) {
  const [job, setJob] = useState(initialJob);
  const [activeTab, setActiveTab] = useState<Tab>("detalles");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Report form state
  const [techName, setTechName] = useState(job.report?.technicianName ?? "");
  const [workDesc, setWorkDesc] = useState(job.report?.workDescription ?? "");
  const [obs, setObs] = useState(job.report?.observations ?? "");
  const [isSavingReport, startSavingReport] = useTransition();

  // Invoice state
  const [invoiceNumber, setInvoiceNumber] = useState(job.invoiceNumber);
  const [isGenerating, startGenerating] = useTransition();
  const [isMarkingPaid, startMarkingPaid] = useTransition();

  function handleSaveReport() {
    if (!workDesc.trim()) { setError("La descripción del trabajo es requerida."); return; }
    setError(null);
    const fd = new FormData();
    fd.set("quickJobId", job.id);
    fd.set("technicianName", techName);
    fd.set("workDescription", workDesc);
    fd.set("observations", obs);
    startSavingReport(async () => {
      const res = await saveQuickJobReport(fd);
      if (res.error) setError(res.error);
      else { setSuccess("Informe guardado correctamente."); setJob((j) => ({ ...j, status: "informe" })); }
    });
  }

  function handleGenerateInvoice() {
    setError(null);
    startGenerating(async () => {
      const res = await generateQuickJobInvoice(job.id);
      if (res.error) setError(res.error);
      else {
        setInvoiceNumber(res.invoiceNumber!);
        setJob((j) => ({ ...j, status: "facturado", invoiceNumber: res.invoiceNumber! }));
        setSuccess(`Factura ${res.invoiceNumber} generada.`);
      }
    });
  }

  function handleMarkPaid() {
    startMarkingPaid(async () => {
      const res = await markQuickJobPaid(job.id);
      if (res.error) setError(res.error);
      else { setJob((j) => ({ ...j, paidAt: new Date().toISOString() })); setSuccess("Marcado como cobrado."); }
    });
  }

  const statusColors = {
    activo:    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    informe:   "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    facturado: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    cerrado:   "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };
  const statusLabels = { activo: "Activo", informe: "Informe", facturado: "Facturado", cerrado: "Archivado" };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/servicios-rapidos"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Servicios Rápidos
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="h-6 w-6 text-orange-500 shrink-0" /> <span className="truncate">{job.name}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {job.client.name} · {new Date(job.serviceDate).toLocaleDateString("es-CA", { dateStyle: "long" })}
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-0 rounded-lg sm:bg-transparent">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status]}`}>
              {statusLabels[job.status]}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white">{fmt(job.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-1 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(null); setSuccess(null); }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-3 flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      {/* ── DETALLES ── */}
      {activeTab === "detalles" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <h2 className="font-heading tracking-wider text-slate-700 dark:text-slate-300 text-sm">Servicios Realizados</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {job.items.map((item, i) => (
                <div key={item.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs text-slate-400 w-5 mt-0.5 sm:mt-0">{i + 1}.</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words">{item.description}</p>
                      {item.hours && (
                        <p className="text-xs text-slate-400">{item.hours} hrs · {fmt(item.unitPrice)}/hr</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right sm:text-left ml-8 sm:ml-0">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0">{fmt(item.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between">
              <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">Total</span>
              <span className="font-bold text-slate-900 dark:text-white text-lg">{fmt(job.totalAmount)}</span>
            </div>
          </div>

          {job.status === "activo" && (
            <button
              onClick={() => setActiveTab("informe")}
              className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ClipboardCheck className="h-4 w-4" /> Ir a Llenar Informe →
            </button>
          )}
        </div>
      )}

      {/* ── INFORME ── */}
      {activeTab === "informe" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h2 className="font-heading tracking-wider text-slate-800 dark:text-white">Informe de Trabajo Realizado</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Técnico Responsable
            </label>
            <input
              type="text"
              value={techName}
              onChange={(e) => setTechName(e.target.value)}
              placeholder="Nombre del técnico que realizó el trabajo"
              className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Descripción del Trabajo Realizado *
            </label>
            <textarea
              value={workDesc}
              onChange={(e) => setWorkDesc(e.target.value)}
              rows={5}
              placeholder="Describe detalladamente el trabajo que se realizó: áreas atendidas, materiales usados, proceso seguido..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Observaciones Adicionales
            </label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={3}
              placeholder="Notas sobre el estado del lugar, recomendaciones para el cliente, seguimiento necesario..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 text-sm resize-none"
            />
          </div>

          {job.report?.completedAt && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Informe completado el {new Date(job.report.completedAt).toLocaleDateString("es-CA", { dateStyle: "long" })}
            </div>
          )}

          <button
            onClick={handleSaveReport}
            disabled={isSavingReport}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSavingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
            Guardar Informe y Avanzar a Factura
          </button>

          {job.status !== "activo" && (
            <button
              onClick={() => setActiveTab("factura")}
              className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Receipt className="h-4 w-4" /> Ir a Generar Factura →
            </button>
          )}
        </div>
      )}

      {/* ── FACTURA ── */}
      {activeTab === "factura" && (
        <div className="space-y-4">
          {job.status === "activo" && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
              Primero debes completar el informe de trabajo antes de generar la factura.
            </div>
          )}

          <div className="bg-slate-950 rounded-xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-orange-400 tracking-wider">Factura del Servicio</h3>
              {invoiceNumber && <span className="font-mono text-sm text-slate-400">{invoiceNumber}</span>}
            </div>

            <div className="space-y-2 text-sm border-t border-slate-800 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>Cliente</span><span>{job.client.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fecha del servicio</span>
                <span>{new Date(job.serviceDate).toLocaleDateString("es-CA")}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-xl border-t border-slate-700 pt-3 mt-3">
                <span>Total</span>
                <span className="text-orange-400">{fmt(job.totalAmount)}</span>
              </div>
            </div>

            {!invoiceNumber ? (
              <button
                onClick={handleGenerateInvoice}
                disabled={isGenerating || job.status === "activo"}
                className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                Generar Factura
              </button>
            ) : (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`/api/pdf/servicio-rapido/${job.id}?lang=en`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4 text-orange-400" /> Ver PDF (Inglés)
                  </a>
                  <a
                    href={`/api/pdf/servicio-rapido/${job.id}?lang=es`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4 text-orange-400" /> Ver PDF (Español)
                  </a>
                </div>
                {!job.paidAt ? (
                  <button
                    onClick={handleMarkPaid}
                    disabled={isMarkingPaid}
                    className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isMarkingPaid ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Marcar como Cobrado
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-400 text-sm justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                    Cobrado el {new Date(job.paidAt).toLocaleDateString("es-CA")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
