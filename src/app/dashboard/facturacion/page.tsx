import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Receipt, CheckCircle2, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Facturación | CALA Multiservices",
};

export default async function FacturacionPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      project: {
        include: { client: { select: { name: true } } },
      },
    },
  });

  const totalPendiente = invoices
    .filter((i) => i.status === "pendiente")
    .reduce((s, i) => s + i.amount.toNumber(), 0);

  const totalPagado = invoices
    .filter((i) => i.status === "pagada")
    .reduce((s, i) => s + i.amount.toNumber(), 0);

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">Facturación</h1>
        <p className="text-slate-500 mt-1">Control de facturas emitidas y estado de pagos.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{fmt(totalPendiente)}</p>
            <p className="text-sm text-slate-500">Por Cobrar</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{fmt(totalPagado)}</p>
            <p className="text-sm text-slate-500">Cobrado</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Receipt className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">No hay facturas generadas aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Factura #</th>
                  <th className="text-left px-4 py-3">Proyecto</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Cliente</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Fecha</th>
                  <th className="text-right px-4 py-3">Monto</th>
                  <th className="text-left px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{inv.project.name}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{inv.project.client.name}</td>
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                      {new Date(inv.issuedAt).toLocaleDateString("es-CA", { dateStyle: "medium" })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                      {fmt(inv.amount.toNumber())}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        inv.status === "pagada"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        {inv.status === "pagada" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {inv.status === "pagada" ? "Pagada" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
