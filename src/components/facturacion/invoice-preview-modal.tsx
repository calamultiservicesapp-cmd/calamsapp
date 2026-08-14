"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Download, Globe, ExternalLink } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<"es" | "en">("es");

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const apiPath =
    invoiceType === "proyecto"
      ? `/api/pdf/factura/${invoiceId}`
      : `/api/pdf/servicio-rapido/${invoiceId}`;

  const pdfUrl = `${apiPath}?lang=${lang}`;
  const downloadUrl = `${apiPath}?lang=${lang}&download=true`;

  function handleDownload() {
    window.open(downloadUrl, "_blank");
  }

  function handleOpenTab() {
    window.open(pdfUrl, "_blank");
  }

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl flex flex-col h-[95vh] sm:h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Options */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3 bg-slate-50 dark:bg-slate-900 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/50 rounded-xl shrink-0">
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight truncate">
                {invoiceNumber}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {clientName} · {title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Language Selection */}
            <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl mr-2">
              <Globe className="h-4 w-4 text-slate-500 ml-2 hidden sm:block" />
              <button
                onClick={() => setLang("es")}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  lang === "es"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                🇪🇸 Español
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  lang === "en"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                🇺🇸 Inglés
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenTab}
                className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                title="Abrir en nueva pestaña"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Abrir</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shadow-sm"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 ml-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Preview iFrame */}
        <div className="flex-1 overflow-hidden rounded-b-2xl bg-slate-200 dark:bg-slate-950 min-h-[400px]">
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            className="w-full h-full border-0"
            title={`Factura ${invoiceNumber}`}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}


