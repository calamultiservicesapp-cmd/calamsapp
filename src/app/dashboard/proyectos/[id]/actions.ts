"use server";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { saveWalkthroughItems, getCurrentPricingSnapshot } from "@/lib/db/pricing";
import type { PersonnelType, SystemCondition, SystemUrgency, RecommendedPlan } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function getProjectDetail(id: string) {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { name: true, email: true, phone: true, address: true } },
      appointment: true,
      walkthroughItems: {
        include: { activity: { select: { nameEs: true, nameEn: true } } },
        orderBy: { createdAt: "asc" },
      },
      fieldEvaluation: {
        include: { systemInspections: { orderBy: { systemCode: "asc" } } },
      },
      proposal: true,
      invoice: true,
    },
  });
}

export async function getActivitiesForWalkthrough() {
  return await prisma.activity.findMany({
    where: { deletedAt: null },
    orderBy: { nameEs: "asc" },
    select: { id: true, nameEs: true, nameEn: true, defaultPersonnelType: true, minHours: true },
  });
}

export async function submitWalkthrough(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const projectId = formData.get("projectId") as string;
  const rawItems = formData.get("items") as string;

  if (!rawItems) return { error: "No se enviaron actividades." };

  try {
    const items = JSON.parse(rawItems) as Array<{
      activityId: string;
      personnelType: PersonnelType;
      hours: number;
      notes?: string;
    }>;

    if (items.length === 0) return { error: "Agrega al menos una actividad a la caminata." };

    const result = await saveWalkthroughItems(projectId, items);
    revalidatePath(`/dashboard/proyectos/${projectId}`);
    revalidatePath(`/dashboard/proyectos/${projectId}/caminata`);
    return { success: true, pricing: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al guardar la caminata." };
  }
}

export async function getPricingPreview(items: Array<{ activityId: string; personnelType: PersonnelType; hours: number }>) {
  const snapshot = await getCurrentPricingSnapshot();
  const { calculateProjectPrice } = await import("@/lib/db/pricing");
  return await calculateProjectPrice(items, snapshot);
}

// ─── Field Evaluation ────────────────────────────────────────────────────────

export async function getFieldEvaluation(projectId: string) {
  return await prisma.fieldEvaluation.findUnique({
    where: { projectId },
    include: { systemInspections: { orderBy: { systemCode: "asc" } } },
  });
}

type SystemInspectionInput = {
  systemCode: string;
  systemName: string;
  condition?: SystemCondition | null;
  urgency?: SystemUrgency | null;
  areasInspected?: string;
  observations?: string;
  photoCount?: number;
};

export async function submitFieldEvaluation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const projectId = formData.get("projectId") as string;
  const evaluatorName = formData.get("evaluatorName") as string | null;
  const visitDate = formData.get("visitDate") as string | null;
  const visitDuration = formData.get("visitDuration") as string | null;
  const recommendedPlan = formData.get("recommendedPlan") as RecommendedPlan | null;
  const planJustification = formData.get("planJustification") as string | null;
  const priority01Notes = formData.get("priority01Notes") as string | null;
  const priority02Notes = formData.get("priority02Notes") as string | null;
  const priority03Notes = formData.get("priority03Notes") as string | null;
  const priority04Notes = formData.get("priority04Notes") as string | null;
  const criticalSafetyNotes = formData.get("criticalSafetyNotes") as string | null;
  const refToGlitz = formData.get("refToGlitz") === "true";
  const verbalSummary = formData.get("verbalSummary") === "true";
  const additionalNotes = formData.get("additionalNotes") as string | null;
  const rawSystems = formData.get("systems") as string;

  try {
    const systems: SystemInspectionInput[] = JSON.parse(rawSystems);

    // Upsert the FieldEvaluation header
    const evaluation = await prisma.fieldEvaluation.upsert({
      where: { projectId },
      create: {
        projectId,
        evaluatorName,
        visitDate: visitDate ? new Date(visitDate) : null,
        visitDuration,
        recommendedPlan,
        planJustification,
        priority01Notes,
        priority02Notes,
        priority03Notes,
        priority04Notes,
        criticalSafetyNotes,
        refToGlitz,
        verbalSummary,
        additionalNotes,
      },
      update: {
        evaluatorName,
        visitDate: visitDate ? new Date(visitDate) : null,
        visitDuration,
        recommendedPlan,
        planJustification,
        priority01Notes,
        priority02Notes,
        priority03Notes,
        priority04Notes,
        criticalSafetyNotes,
        refToGlitz,
        verbalSummary,
        additionalNotes,
      },
    });

    // Upsert each system inspection (B1–B8)
    await Promise.all(
      systems.map((s) =>
        prisma.systemInspection.upsert({
          where: {
            fieldEvaluationId_systemCode: {
              fieldEvaluationId: evaluation.id,
              systemCode: s.systemCode,
            },
          },
          create: {
            fieldEvaluationId: evaluation.id,
            systemCode: s.systemCode,
            systemName: s.systemName,
            condition: s.condition ?? null,
            urgency: s.urgency ?? null,
            areasInspected: s.areasInspected ?? null,
            observations: s.observations ?? null,
            photoCount: s.photoCount ?? 0,
          },
          update: {
            condition: s.condition ?? null,
            urgency: s.urgency ?? null,
            areasInspected: s.areasInspected ?? null,
            observations: s.observations ?? null,
            photoCount: s.photoCount ?? 0,
          },
        })
      )
    );

    revalidatePath(`/dashboard/proyectos/${projectId}/caminata`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al guardar la evaluación." };
  }
}
