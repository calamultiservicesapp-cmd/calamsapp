"use client";

import { useState, useTransition } from "react";
import { generateProposal, approveProposal, rejectProposal, sendProposalEmail } from "@/app/dashboard/proyectos/[id]/propuesta/actions";
import {
  FileText, AlertCircle, CheckCircle2, Loader2,
  Tag, ShieldAlert, Users, MapPin, XCircle, History, Mail
} from "lucide-react";

type ProposalProject = {
  id: string;
  name: string;
  status: string;
  client: { name: string; contactName: string | null; email: string | null; address: string | null };
  walkthroughItems: Array<{
    id: string;
    activity: { nameEs: string; nameEn: string };
    personnelType: string;
    hours: string;
    computedPrice: string;
  }>;
  proposal: {
    id: string;
    listPrice: string;
    floorPrice: string;
    discountApplied: string;
    finalPrice: string;
    status: string;
    approvedAt: string | null;
  } | null;
  proposalRevisions: Array<{
    id: string;
    listPrice: string;
    floorPrice: string;
    discountApplied: string;
    finalPrice: string;
    rejectedAt: string;
  }>;
};

const personnelLabels: Record<string, string> = {
  contratista: "Contratista",
  tecnico_novato: "Técnico Novato",
  tecnico_experto: "Técnico Experto",
};

const fmt = (n: number | string) =>
  parseFloat(n.toString()).toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });

export function ProposalBuilder({ project }: { project: ProposalProject }) {
  const [discount, setDiscount] = useState(
    project.proposal ? parseFloat(project.proposal.discountApplied) : 0
  );
  const [error, setError] = useState<string | null>(null);
  
  // Si la propuesta actual fue rechazada, reseteamos la vista a "modo renegociación"
  const isCurrentlyRejected = project.proposal?.status === "rechazada";
  
  const [result, setResult] = useState<{
    listPrice: number; floorPrice: number; finalPrice: number; discountPercent: number;
  } | null>(
    project.proposal && !isCurrentlyRejected
      ? {
          listPrice: parseFloat(project.proposal.listPrice),
          floorPrice: parseFloat(project.proposal.floorPrice),
          finalPrice: parseFloat(project.proposal.finalPrice),
          discountPercent: parseFloat(project.proposal.discountApplied),
        }
      : null
  );
  const [approved, setApproved] = useState(project.proposal?.status === "aprobada");
  const [isPending, startTransition] = useTransition();
  const [isApproving, startApproving] = useTransition();
  const [isRejecting, startRejecting] = useTransition();

  const laborTotal = project.walkthroughItems.reduce((s, wi) => s + parseFloat(wi.computedPrice), 0);

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("projectId", project.id);
      fd.set("discountPercent", discount.toString());
      const res = await generateProposal(fd);
      if (res.error) {
        setError(res.error);
      } else if (res.listPrice) {
        setResult({
          listPrice: res.listPrice,
          floorPrice: res.floorPrice!,
          finalPrice: res.finalPrice!,
          discountPercent: res.discountPercent!,
        });
      }
    });
  }

  function handleApprove() {
    startApproving(async () => {
      const res = await approveProposal(project.id);
      if (res.success) setApproved(true);
      else setError(res.error ?? "Error");
    });
  }

  function handleReject() {
    startRejecting(async () => {
      const res = await rejectProposal(project.id);
      if (res.success) {
        // Al rechazar, quitamos el resultado para forzar a que renegocie
        setResult(null);
      } else {
        setError(res.error ?? "Error");
      }
    });
  }

  const [isSending, startSending] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  function handleSendEmail(lang: 'es' | 'en') {
    setError(null);
    setEmailSent(false);
    startSending(async () => {
      const res = await sendProposalEmail(project.id, lang);
      if (res.error) setError(res.error);
      else setEmailSent(true);
    });
  }

  const maxDiscount = result
    ? Math.floor(((result.listPrice - result.floorPrice) / result.listPrice) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {approved && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">Propuesta Aprobada</p>
            <p className="text-sm text-green-600 dark:text-green-500">El proyecto avanzará a ejecución una vez asignados los técnicos.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desglose interno */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <h3 className="font-heading tracking-wider text-slate-800 dark:text-white">Desglose de Actividades</h3>
            <p className="text-xs text-slate-500 mt-0.5">Vista interna — no se comparte con el cliente</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {project.walkthroughItems.map((wi) => (
              <div key={wi.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{wi.activity.nameEs}</p>
                  <p className="text-xs text-slate-400">{personnelLabels[wi.personnelType]} · {wi.hours} hrs</p>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                  {fmt(wi.computedPrice)}
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between">
            <span className="text-sm font-medium text-slate-600">Subtotal Mano de Obra</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">{fmt(laborTotal)}</span>
          </div>
        </div>

        {/* Control de precio */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">
            <h3 className="font-heading tracking-wider text-slate-800 dark:text-white">Control de Precio</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Tag className="h-4 w-4 text-orange-500" />
                Descuento a Aplicar
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={0.5}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value))}
                  disabled={approved}
                  className="flex-1 accent-orange-500"
                />
                <span className="text-lg font-bold text-orange-500 w-16 text-right">{discount}%</span>
              </div>
              {result && discount > 0 && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-amber-500" />
                  El piso de rentabilidad no permite más de {maxDiscount}% de descuento.
                </p>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isPending || approved}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-md bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {result ? "Recalcular Propuesta" : "Generar Propuesta"}
            </button>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
          </div>

          {result && (
            <div className="bg-slate-950 rounded-xl p-5 text-white space-y-3">
              <h3 className="font-heading text-orange-400 tracking-wider">Resumen de Precio</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Precio de Lista</span><span>{fmt(result.listPrice)}</span>
                </div>
                {result.discountPercent > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Descuento ({result.discountPercent}%)</span>
                    <span className="text-red-400">- {fmt(result.listPrice - result.finalPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-xl border-t border-slate-700 pt-2">
                  <span>Precio Final</span>
                  <span className="text-orange-400">{fmt(result.finalPrice)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <a href={`/api/pdf/propuesta/${project.id}?lang=en`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors text-slate-200">
                    <FileText className="h-4 w-4 text-orange-400" /> Ver PDF (EN)
                  </a>
                  <a href={`/api/pdf/propuesta/${project.id}?lang=es`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors text-slate-200">
                    <FileText className="h-4 w-4 text-orange-400" /> Ver PDF (ES)
                  </a>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSendEmail('en')}
                    disabled={isSending || emailSent}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {emailSent ? "Enviado" : "Enviar PDF (EN) al Cliente"}
                  </button>
                  <button
                    onClick={() => handleSendEmail('es')}
                    disabled={isSending || emailSent}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {emailSent ? "Enviado" : "Enviar PDF (ES) al Cliente"}
                  </button>
                  {emailSent && (
                    <p className="text-xs text-green-400 text-center">Se ha enviado un enlace al cliente por correo.</p>
                  )}
                </div>
              </div>

              {!approved && (
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting || isSending}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Aprobar (Firma)
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isRejecting || isApproving || isSending}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm font-medium transition-colors border border-red-900/50 disabled:opacity-50"
                  >
                    {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vista previa de lo que verá el cliente (sin costos) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <h3 className="font-heading tracking-wider text-slate-800 dark:text-white">Vista Previa para el Cliente</h3>
          <p className="text-xs text-slate-500 mt-0.5">Esta es la información que el cliente verá en el PDF (sin costos internos)</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Users className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">{project.client.name}</p>
              {project.client.contactName && <p className="text-sm text-slate-500">{project.client.contactName}</p>}
            </div>
          </div>
          {project.client.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600 dark:text-slate-400">{project.client.address}</p>
            </div>
          )}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Alcance del Trabajo:</p>
            <ul className="space-y-1">
              {project.walkthroughItems.map((wi) => (
                <li key={wi.id} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                  {wi.activity.nameEn} {/* ← Vista cliente siempre en inglés */}
                </li>
              ))}
            </ul>
          </div>
          {result && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center">
              <span className="font-medium text-slate-700 dark:text-slate-300">Total del Proyecto</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{fmt(result.finalPrice)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Propuestas Rechazadas */}
      {project.proposalRevisions.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <History className="h-5 w-5 text-slate-400" />
            <h3 className="font-heading tracking-wider text-slate-800 dark:text-slate-200">Historial de Rechazos</h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {project.proposalRevisions.map((rev) => (
              <div key={rev.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Propuesta por {fmt(rev.finalPrice)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Rechazada el {new Date(rev.rejectedAt).toLocaleDateString()} a las {new Date(rev.rejectedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full">
                    Descuento {rev.discountApplied}%
                  </span>
                  <a
                    href={`/api/pdf/propuesta/revision/${rev.id}?lang=en`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FileText className="h-3 w-3 text-orange-500" /> Ver PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

