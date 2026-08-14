"use client";

import { useState } from "react";
import { Receipt, CheckCircle2, Clock, Zap } from "lucide-react";
import { InvoicePreviewModal } from "./invoice-preview-modal";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  title: string;
  date: string; // serialized ISO string
  amount: number;
  status: "pendiente" | "pagada";
  type: "proyecto" | "rapido";
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function InvoicesTable({ invoices }: { invoices: InvoiceRow[] }) {
  const [selected, setSelected] = useState<InvoiceRow | null>(null);

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Receipt className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">No hay facturas generadas aún.</p>
      </div>
    );
  }

  return (
    <>
      {selected && (
        <InvoicePreviewModal
          invoiceId={selected.id}
          invoiceNumber={selected.invoiceNumber}
          invoiceType={selected.type}
          clientName={selected.clientName}
          title={selected.title}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3 whitespace-nowrap">Factura #</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Tipo</th>
              <th className="text-left px-4 py-3 min-w-[150px]">Descripción / Proyecto</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Cliente</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Fecha</th>
              <th className="text-right px-4 py-3 whitespace-nowrap">Monto</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => setSelected(inv)}
                className="hover:bg-orange-50/60 dark:hover:bg-orange-950/20 transition-colors cursor-pointer group"
                title="Toca para ver la factura"
              >
                <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap group-hover:text-orange-600 transition-colors">
                  {inv.invoiceNumber}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {inv.type === "rapido" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-orange-500 font-medium">
                      <Zap className="h-3 w-3" /> Rápido
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Proyecto</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                  {inv.title}
                </td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{inv.clientName}</td>
                <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                  {new Date(inv.date).toLocaleDateString("es-CA", { dateStyle: "medium" })}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {fmt(inv.amount)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      inv.status === "pagada"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {inv.status === "pagada" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {inv.status === "pagada" ? "Pagada" : "Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

