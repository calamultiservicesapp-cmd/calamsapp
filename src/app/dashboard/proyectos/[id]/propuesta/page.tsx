import { notFound } from "next/navigation";
import { getProposalData } from "./actions";
import { ProposalBuilder } from "@/components/propuestas/proposal-builder";
import { FileText, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function PropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProposalData(id);
  if (!project) notFound();

  if (project.walkthroughItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-yellow-500 text-white shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white">
              Paso 3 — Cotización
            </h2>
            <p className="text-sm text-slate-500">Genera la propuesta y aplica descuentos.</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
          <p className="text-amber-800 dark:text-amber-200 font-medium">
            Primero debes completar la Caminata.
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Agrega las actividades del proyecto antes de generar una propuesta.
          </p>
          <Link
            href={`/dashboard/proyectos/${id}/caminata`}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors mt-2"
          >
            Ir a la Caminata →
          </Link>
        </div>
      </div>
    );
  }

  const serializedProject = {
    id: project.id,
    name: project.name,
    status: project.status,
    client: {
      name: project.client.name,
      contactName: project.client.contactName,
      email: project.client.email,
      address: project.client.address,
    },
    walkthroughItems: project.walkthroughItems.map((wi) => ({
      id: wi.id,
      activityId: wi.activityId,
      activity: wi.activity,
      personnelType: wi.personnelType,
      hours: wi.hours.toString(),
      computedPrice: wi.computedPrice.toString(),
    })),
    proposal: project.proposal
      ? {
          id: project.proposal.id,
          listPrice: project.proposal.listPrice.toString(),
          floorPrice: project.proposal.floorPrice.toString(),
          discountApplied: project.proposal.discountApplied.toString(),
          finalPrice: project.proposal.finalPrice.toString(),
          status: project.proposal.status,
          approvedAt: project.proposal.approvedAt?.toISOString() ?? null,
        }
      : null,
    proposalRevisions: (project as any).proposalRevisions?.map((rev: any) => ({
      id: rev.id,
      listPrice: rev.listPrice.toString(),
      floorPrice: rev.floorPrice.toString(),
      discountApplied: rev.discountApplied.toString(),
      finalPrice: rev.finalPrice.toString(),
      rejectedAt: rev.rejectedAt.toISOString(),
    })) || [],
  };

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-yellow-500 text-white shrink-0">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white">
            Paso 3 — Cotización
          </h2>
          <p className="text-sm text-slate-500">
            Aplica descuentos y genera la propuesta formal para el cliente.
          </p>
        </div>
      </div>

      <ProposalBuilder project={serializedProject} />
    </div>
  );
}
