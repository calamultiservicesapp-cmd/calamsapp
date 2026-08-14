import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Clock, CheckCircle2 } from "lucide-react";
import { InvoicesTable } from "@/components/facturacion/invoices-table";

export const metadata: Metadata = {
  title: "Facturación | CALA Multiservices",
};

export default async function FacturacionPage() {
  const [projectInvoices, quickJobs] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        project: {
          include: { client: { select: { name: true } } },
        },
      },
    }),
    prisma.quickJob.findMany({
      where: { status: "facturado" },
      orderBy: { invoiceNumber: "desc" },
      include: { client: { select: { name: true } } },
    }),
  ]);

  // Unified invoice type for display — serialized for client components
  const allInvoices = [
    ...projectInvoices.map((i) => ({
      id: i.projectId, // factura API uses project ID
      invoiceNumber: i.invoiceNumber,
      clientName: i.project.client.name,
      title: i.project.name,
      date: i.issuedAt.toISOString(),
      amount: i.amount.toNumber(),
      status: i.status as "pendiente" | "pagada",
      type: "proyecto" as const,
    })),
    ...quickJobs.map((q) => ({
      id: q.id,
      invoiceNumber: q.invoiceNumber!,
      clientName: q.client.name,
      title: q.name,
      date: q.createdAt.toISOString(),
      amount: parseFloat(q.totalAmount.toString()),
      status: (q.paidAt ? "pagada" : "pendiente") as "pendiente" | "pagada",
      type: "rapido" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPendiente = allInvoices
    .filter((i) => i.status === "pendiente")
    .reduce((s, i) => s + i.amount, 0);

  const totalPagado = allInvoices
    .filter((i) => i.status === "pagada")
    .reduce((s, i) => s + i.amount, 0);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">Facturación</h1>
        <p className="text-slate-500 mt-1">Control de facturas emitidas y estado de pagos.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <p className="text-xs text-slate-500">
            Toca una fila para ver y descargar la factura en español o inglés.
          </p>
        </div>
        <InvoicesTable invoices={allInvoices} />
      </div>
    </div>
  );
}

