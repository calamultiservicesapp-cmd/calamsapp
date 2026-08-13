"use server";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { applyDiscount, calculateProjectPrice } from "@/lib/db/pricing";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

export async function getProposalData(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      walkthroughItems: {
        include: { activity: { select: { nameEs: true, nameEn: true } } },
      },
      proposal: true,
      proposalRevisions: {
        orderBy: { rejectedAt: "desc" },
      },
    },
  });
  return project;
}

export async function generateProposal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const projectId = formData.get("projectId") as string;
  const discountPercent = parseFloat(formData.get("discountPercent") as string) || 0;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        walkthroughItems: true,
      },
    });

    if (!project) return { error: "Proyecto no encontrado." };
    if (project.walkthroughItems.length === 0) {
      return { error: "Este proyecto no tiene actividades en la caminata." };
    }

    const items = project.walkthroughItems.map((wi) => ({
      activityId: wi.activityId,
      personnelType: wi.personnelType,
      hours: wi.hours.toNumber(),
    }));

    const laborCost = project.walkthroughItems.reduce(
      (sum, wi) => sum + wi.computedPrice.toNumber(),
      0
    );

    const config = await prisma.pricingConfig.findFirst();
    if (!config) return { error: "No hay configuración de precios." };

    const overheadCost = config.overheadPerProject.toNumber();
    const totalCost = laborCost + overheadCost;
    const listPrice = parseFloat((totalCost * (1 + config.profitMargin.toNumber() / 100)).toFixed(2));
    const floorPrice = listPrice; // El floor es el precio de lista (0% descuento = margen mínimo)

    const finalPrice = applyDiscount(listPrice, floorPrice, discountPercent);

    await prisma.proposal.upsert({
      where: { projectId },
      create: {
        projectId,
        listPrice: new Prisma.Decimal(listPrice),
        floorPrice: new Prisma.Decimal(floorPrice),
        discountApplied: new Prisma.Decimal(discountPercent),
        finalPrice: new Prisma.Decimal(finalPrice),
        status: "borrador",
      },
      update: {
        listPrice: new Prisma.Decimal(listPrice),
        floorPrice: new Prisma.Decimal(floorPrice),
        discountApplied: new Prisma.Decimal(discountPercent),
        finalPrice: new Prisma.Decimal(finalPrice),
        status: "borrador",
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "propuesta" },
    });

    revalidatePath(`/dashboard/proyectos/${projectId}`);
    revalidatePath(`/dashboard/proyectos/${projectId}/propuesta`);
    return { success: true, listPrice, floorPrice, finalPrice, discountPercent };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al generar la propuesta." };
  }
}

export async function approveProposal(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    await prisma.$transaction([
      prisma.proposal.update({
        where: { projectId },
        data: { status: "aprobada", approvedAt: new Date() },
      }),
      prisma.project.update({
        where: { id: projectId },
        data: { status: "aprobado" },
      }),
    ]);

    revalidatePath(`/dashboard/proyectos/${projectId}/propuesta`);
    return { success: true };
  } catch {
    return { error: "Error al aprobar la propuesta." };
  }
}

export async function rejectProposal(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    const proposal = await prisma.proposal.findUnique({ where: { projectId } });
    if (!proposal) return { error: "Cotización no encontrada." };

    await prisma.$transaction(async (tx) => {
      // 1. Guardar la versión en el historial (ProposalRevision)
      await (tx as any).proposalRevision.create({
        data: {
          projectId: proposal.projectId,
          listPrice: proposal.listPrice,
          floorPrice: proposal.floorPrice,
          discountApplied: proposal.discountApplied,
          finalPrice: proposal.finalPrice,
        }
      });

      // 2. Marcar el proposal actual como borrador de nuevo para permitir edición
      await tx.proposal.update({
        where: { projectId },
        data: { status: "borrador" }, // Se reinicia
      });
    });

    revalidatePath(`/dashboard/proyectos/${projectId}/propuesta`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Error al rechazar la propuesta." };
  }
}

export async function sendProposalEmail(projectId: string, lang: 'es' | 'en' = 'en') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project || !project.client.email) {
      return { error: "El cliente no tiene un correo electrónico configurado." };
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/pdf/propuesta/${projectId}?lang=${lang}`;

    const isSpanish = lang === 'es';
    const subject = isSpanish 
      ? `Propuesta de Servicios - ${project.name}` 
      : `Service Proposal - ${project.name}`;
      
    const html = isSpanish ? `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>Hola ${project.client.contactName || project.client.name},</h2>
        <p>Adjunto a este correo encontrarás la propuesta detallada para el proyecto <strong>${project.name}</strong>.</p>
        <p>
          <a href="${pdfUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
            Ver Propuesta en PDF
          </a>
        </p>
        <p style="margin-top: 24px; font-size: 14px; color: #666;">
          Si tienes alguna duda o deseas negociar los términos, no dudes en responder a este correo.
        </p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">CALA Multiservices</p>
      </div>
    ` : `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>Hello ${project.client.contactName || project.client.name},</h2>
        <p>Attached you will find the detailed proposal for the project <strong>${project.name}</strong>.</p>
        <p>
          <a href="${pdfUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
            View Proposal PDF
          </a>
        </p>
        <p style="margin-top: 24px; font-size: 14px; color: #666;">
          If you have any questions or wish to negotiate the terms, please feel free to reply to this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">CALA Multiservices</p>
      </div>
    `;

    // Resend requires a verified domain to send from anything other than onboarding@resend.dev
    // In production, we need the user's verified domain. For now, we will use a fallback or the provided email.
    // If they haven't verified a domain in Resend, it will only send to their own email (the one registered in Resend).
    await resend.emails.send({
      from: "CALA Multiservices <onboarding@resend.dev>",
      to: project.client.email,
      subject,
      html,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error sending email:", err);
    return { error: err.message || "Error al enviar el correo." };
  }
}

