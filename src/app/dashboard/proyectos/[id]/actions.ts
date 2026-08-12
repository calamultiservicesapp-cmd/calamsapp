"use server";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { saveWalkthroughItems, getCurrentPricingSnapshot } from "@/lib/db/pricing";
import type { PersonnelType } from "@/generated/prisma/client";
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
      proposal: true,
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
