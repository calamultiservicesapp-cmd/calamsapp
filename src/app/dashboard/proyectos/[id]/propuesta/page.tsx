import { notFound } from "next/navigation";
import { getProposalData } from "./actions";
import { ProposalBuilder } from "@/components/propuestas/proposal-builder";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function PropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProposalData(id);
  if (!project) notFound();

  if (project.walkthroughItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard/proyectos" className="hover:text-orange-500 transition-colors">Proyectos</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/dashboard/proyectos/${id}`} className="hover:text-orange-500 transition-colors">{project.name}</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Propuesta</span>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">Primero debes completar la Caminata.</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Ve al proyecto y agrega las actividades antes de generar una propuesta.</p>
          <Link href={`/dashboard/proyectos/${id}`} className="mt-4 inline-block text-sm font-medium text-orange-500 hover:underline">
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
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/proyectos" className="hover:text-orange-500 transition-colors">Proyectos</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/dashboard/proyectos/${id}`} className="hover:text-orange-500 transition-colors">{project.name}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-800 dark:text-slate-200">Propuesta</span>
      </div>
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">Propuesta</h1>
        <p className="text-slate-500 mt-1">Aplica descuentos y genera la propuesta para el cliente.</p>
      </div>
      <ProposalBuilder project={serializedProject} />
    </div>
  );
}
