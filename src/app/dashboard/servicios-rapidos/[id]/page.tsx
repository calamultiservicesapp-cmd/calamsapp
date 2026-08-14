import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuickJob } from "../actions";
import { QuickJobDetail } from "@/components/servicios-rapidos/quick-job-detail";

export const metadata: Metadata = {
  title: "Detalle Servicio Rápido | CALA Multiservices",
};

export default async function QuickJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getQuickJob(id);

  if (!job) notFound();

  const serialized = {
    ...job,
    serviceDate: job.serviceDate.toISOString(),
    totalAmount: job.totalAmount.toString(),
    paidAt: job.paidAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    items: job.items.map((i) => ({
      ...i,
      hours: i.hours?.toString() ?? null,
      unitPrice: i.unitPrice.toString(),
      totalPrice: i.totalPrice.toString(),
    })),
    report: job.report
      ? {
          ...job.report,
          completedAt: job.report.completedAt?.toISOString() ?? null,
          createdAt: job.report.createdAt.toISOString(),
          updatedAt: job.report.updatedAt.toISOString(),
        }
      : null,
  };

  return <QuickJobDetail job={serialized} />;
}
