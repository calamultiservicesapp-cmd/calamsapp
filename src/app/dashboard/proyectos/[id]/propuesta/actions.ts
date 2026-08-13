"use server";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { applyDiscount, calculateProjectPrice } from "@/lib/db/pricing";
import { revalidatePath } from "next/cache";
import type { PersonnelType } from "@/generated/prisma/client";
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

    // Recalcular con los snapshots guardados de la caminata
    const items = project.walkthroughItems.map((wi) => ({
      activityId: wi.activityId,
      personnelType: wi.personnelType as PersonnelType,
      hours: wi.hours.toNumber(),
    }));

    // Usamos una snapshot virtual basada en los datos guardados
    // (cada ítem guardó su rateSnapshot, así que no modificamos nada)
    const laborCost = project.walkthroughItems.reduce(
      (sum, wi) => sum + wi.computedPrice.toNumber(),
      0
    );

    // Obtener overhead y margen actual (para nuevas propuestas)
    const config = await prisma.pricingConfig.findFirst();
    if (!config) return { error: "No hay configuración de precios." };

    const overheadCost = config.overheadPerProject.toNumber();
    const totalCost = laborCost + overheadCost;
    const listPrice = parseFloat((totalCost * (1 + config.profitMargin.toNumber() / 100)).toFixed(2));
    const floorPrice = listPrice; // El floor es el precio de lista (0% descuento = margen mínimo)

    // Aplicar descuento (lanza error si perfora el floor)
    const finalPrice = applyDiscount(listPrice, floorPrice, discountPercent);

    // Upsert propuesta
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

    // Avanzar estado del proyecto
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
