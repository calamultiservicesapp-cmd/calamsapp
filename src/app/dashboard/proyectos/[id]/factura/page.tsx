import { notFound } from "next/navigation";
import { getInvoiceData } from "./actions";
import { InvoiceView } from "@/components/proyectos/invoice-view";
import Link from "next/link";
import { ChevronRight, FileCheck } from "lucide-react";

export default async function FacturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getInvoiceData(id);
  
  if (!project) notFound();

  const statusHierarchy = [
    "cita",
    "caminata",
    "propuesta",
    "aprobado",
    "asignado",
    "en_ejecucion",
    "informe",
    "facturado",
    "cerrado",
  ];
  
  const currentIdx = statusHierarchy.indexOf(project.status);
  const requiredIdx = statusHierarchy.indexOf("informe");

  if (currentIdx < requiredIdx) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard/proyectos" className="hover:text-orange-500 transition-colors">Proyectos</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/dashboard/proyectos/${id}`} className="hover:text-orange-500 transition-colors">{project.name}</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Facturación</span>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">El proyecto aún no ha llegado a la etapa de facturación.</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Debe completarse el informe de campo antes de generar la factura.</p>
          <Link href={`/dashboard/proyectos/${id}`} className="mt-4 inline-block text-sm font-medium text-orange-500 hover:underline">
            Volver al Proyecto →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/proyectos" className="hover:text-orange-500 transition-colors">Proyectos</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/dashboard/proyectos/${id}`} className="hover:text-orange-500 transition-colors">{project.name}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-800 dark:text-slate-200">Facturación Final</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white flex items-center gap-3">
            <FileCheck className="h-8 w-8 text-orange-500" />
            Facturación Final
          </h1>
          <p className="text-slate-500 mt-1">
            Genera, envía y registra el pago para <strong>{project.name}</strong>.
          </p>
        </div>
      </div>

      <InvoiceView project={project} />
    </div>
  );
}
