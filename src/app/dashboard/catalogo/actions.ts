"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { PersonnelType } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

export async function getActivities() {
  return await prisma.activity.findMany({
    where: { deletedAt: null },
    orderBy: { nameEs: "asc" },
  });
}

export async function createActivity(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const nameEs = formData.get("nameEs") as string;
  const nameEn = formData.get("nameEn") as string;
  const descriptionEs = formData.get("descriptionEs") as string;
  const descriptionEn = formData.get("descriptionEn") as string;
  const defaultPersonnelType = formData.get("defaultPersonnelType") as PersonnelType;
  const minHours = formData.get("minHours") as string;

  if (!nameEs || !nameEn || !descriptionEs || !descriptionEn || !defaultPersonnelType || !minHours) {
    return { error: "Todos los campos son requeridos." };
  }

  try {
    await prisma.activity.create({
      data: {
        nameEs,
        nameEn,
        descriptionEs,
        descriptionEn,
        defaultPersonnelType,
        minHours: new Prisma.Decimal(minHours),
      },
    });
    revalidatePath("/dashboard/catalogo");
    return { success: true };
  } catch {
    return { error: "Error al crear la actividad." };
  }
}

export async function updateActivity(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  const nameEs = formData.get("nameEs") as string;
  const nameEn = formData.get("nameEn") as string;
  const descriptionEs = formData.get("descriptionEs") as string;
  const descriptionEn = formData.get("descriptionEn") as string;
  const defaultPersonnelType = formData.get("defaultPersonnelType") as PersonnelType;
  const minHours = formData.get("minHours") as string;

  try {
    await prisma.activity.update({
      where: { id },
      data: {
        nameEs,
        nameEn,
        descriptionEs,
        descriptionEn,
        defaultPersonnelType,
        minHours: new Prisma.Decimal(minHours),
      },
    });
    revalidatePath("/dashboard/catalogo");
    return { success: true };
  } catch {
    return { error: "Error al actualizar la actividad." };
  }
}

export async function deleteActivity(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    // Soft delete
    await prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/dashboard/catalogo");
    return { success: true };
  } catch {
    return { error: "Error al eliminar la actividad." };
  }
}
