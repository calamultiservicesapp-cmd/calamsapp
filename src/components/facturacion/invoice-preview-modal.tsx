"use client";

import { X, FileText, Languages } from "lucide-react";

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
  const apiPath =
    invoiceType === "proyecto"
      ? `/api/pdf/factura/${invoiceId}`
      : `/api/pdf/servicio-rapido/${invoiceId}`;

  function handleOpen(lang: "es" | "en") {
    const pdfUrl = `${apiPath}?lang=${lang}`;
    window.open(pdfUrl, "_blank");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-950/40 rounded-xl">
              <FileText className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Ver Factura</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-center space-y-4">
          <div className="flex justify-center mb-2 text-slate-300 dark:text-slate-700">
            <Languages className="h-10 w-10" />
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              ¿En qué idioma deseas ver o descargar la factura de <strong>{clientName}</strong>?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOpen("es")}
              className="flex flex-col items-center justify-center py-3 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-slate-700 dark:text-slate-200 font-medium transition-all"
            >
              <span className="text-lg mb-1">🇪🇸</span>
              Español
            </button>
            <button
              onClick={() => handleOpen("en")}
              className="flex flex-col items-center justify-center py-3 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-slate-700 dark:text-slate-200 font-medium transition-all"
            >
              <span className="text-lg mb-1">🇺🇸</span>
              Inglés
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


