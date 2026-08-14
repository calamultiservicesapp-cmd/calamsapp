"use client";

import { useState } from "react";
import { X, FileText, Globe, Printer, ExternalLink } from "lucide-react";

type InvoiceType = "proyecto" | "rapido";

interface InvoicePreviewModalProps {
  invoiceId: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  clientName: string;
  title: string;
  onClose: () => void;
}

export function InvoicePreviewModal({
  invoiceId,
  invoiceNumber,
  invoiceType,
  clientName,
  title,
  onClose,
}: InvoicePreviewModalProps) {
  const [lang, setLang] = useState<"es" | "en">("es");

  const apiPath =
    invoiceType === "proyecto"
      ? `/api/pdf/factura/${invoiceId}`
      : `/api/pdf/servicio-rapido/${invoiceId}`;

  const pdfUrl = `${apiPath}?lang=${lang}`;

  function handlePrint() {
    const win = window.open(pdfUrl, "_blank");
    if (win) {
      win.addEventListener("load", () => {
        win.focus();
        win.print();
      });
    }
  }

  function handleOpenTab() {
    window.open(pdfUrl, "_blank");
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 bg-orange-50 dark:bg-orange-950/40 rounded-lg shrink-0">
              <FileText className="h-4 w-4 text-orange-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-tight truncate">
                {invoiceNumber}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {clientName} · {title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Toggle */}
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <Globe className="h-3 w-3 text-slate-400 ml-1 hidden sm:block" />
              <button
                onClick={() => setLang("es")}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  lang === "es"
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  lang === "en"
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                EN
              </button>
            </div>

            {/* Open in tab */}
            <button
              onClick={handleOpenTab}
              title="Abrir en nueva pestaña"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </button>

            {/* Print - desktop only */}
            <button
              onClick={handlePrint}
              title="Imprimir / Guardar PDF"
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile action bar */}
        <div className="flex sm:hidden items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir / Guardar PDF
          </button>
          <button
            onClick={handleOpenTab}
            className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir
          </button>
        </div>

        {/* iFrame preview */}
        <div className="flex-1 overflow-hidden rounded-b-2xl bg-slate-100 dark:bg-slate-950 min-h-0">
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            className="w-full h-full border-0"
            style={{ minHeight: "400px" }}
            title={`Factura ${invoiceNumber}`}
          />
        </div>
      </div>
    </div>
  );
}

