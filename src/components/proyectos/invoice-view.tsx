"use client";

import { useTransition, useState } from "react";
import { generateInvoice, markInvoicePaid } from "@/app/dashboard/proyectos/[id]/factura/actions";
import { Receipt, CheckCircle2, AlertCircle, Loader2, FileText, Banknote } from "lucide-react";

type InvoiceProject = {
  id: string;
  name: string;
  status: string;
  proposal: {
    finalPrice: any;
  } | null;
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: any;
    status: string;
    issuedAt: Date;
  } | null;
  fieldReport: {
    submittedAt: Date | null;
    items: Array<{
      status: string;
      notes: string | null;
      walkthroughItem: {
        activity: { nameEs: string };
      };
    }>;
  } | null;
};

const fmt = (n: any) => parseFloat(n.toString()).toLocaleString("en-CA", { style: "currency", currency: "CAD" });

export function InvoiceView({ project }: { project: InvoiceProject }) {
  const [isGenerating, startGenerating] = useTransition();
  const [isPaying, startPaying] = useTransition();
  const [error, setError] = useState("");

  const handleGenerate = () => {
    startGenerating(async () => {
      const res = await generateInvoice(project.id);
      if (res.error) setError(res.error);
    });
  };

  const handlePay = () => {
    startPaying(async () => {
      const res = await markInvoicePaid(project.id);
      if (res.error) setError(res.error);
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-3 text-sm border border-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!project.invoice ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 text-center">
          <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-heading text-slate-800 dark:text-slate-200 mb-2">Generar Factura Final</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            El proyecto ha finalizado la etapa de ejecución y el informe de campo ha sido enviado. Genera la factura para enviarla al cliente por el monto acordado en la propuesta.
          </p>
          <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg inline-block mb-6 border border-slate-200 dark:border-slate-800">
            <span className="text-sm text-slate-500 block mb-1">Monto a Facturar:</span>
            <span className="text-3xl font-bold text-orange-500">{fmt(project.proposal?.finalPrice || 0)}</span>
          </div>
          <div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
              Crear Factura
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading tracking-wider text-slate-800 dark:text-white text-lg">Factura {project.invoice.invoiceNumber}</h3>
                <p className="text-sm text-slate-500 mt-1">Emitida el {new Date(project.invoice.issuedAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                project.invoice.status === "pagada" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {project.invoice.status}
              </span>
            </div>

            <div className="py-6 border-y border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Monto Total</span>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{fmt(project.invoice.amount)}</span>
            </div>

            {project.invoice.status === "pendiente" && (
              <button
                onClick={handlePay}
                disabled={isPaying}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50"
              >
                {isPaying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Banknote className="h-5 w-5" />}
                Marcar como Pagada
              </button>
            )}
            {project.invoice.status === "pagada" && (
              <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center gap-3 text-sm border border-green-200 justify-center">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="font-medium">El proyecto ha sido pagado y cerrado exitosamente.</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 flex-col sm:flex-row">
              <a
                href={`/api/pdf/factura/${project.id}?lang=en`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-md border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                <FileText className="h-5 w-5 text-orange-500" />
                PDF (English)
              </a>
              <a
                href={`/api/pdf/factura/${project.id}?lang=es`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-md border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                <FileText className="h-5 w-5 text-orange-500" />
                PDF (Español)
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-heading tracking-wider text-slate-800 dark:text-white mb-4">Resumen de Ejecución</h3>
            {project.fieldReport ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Reporte enviado el {new Date(project.fieldReport.submittedAt!).toLocaleDateString()}
                </p>
                <ul className="space-y-3">
                  {project.fieldReport.items.map((item, i) => (
                    <li key={i} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.walkthroughItem.activity.nameEs}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === 'completado' ? 'bg-green-100 text-green-700' :
                          item.status === 'con_desviacion' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                      {item.notes && <p className="text-xs text-slate-500 mt-1 italic">Nota: {item.notes}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No hay reporte de campo disponible.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
