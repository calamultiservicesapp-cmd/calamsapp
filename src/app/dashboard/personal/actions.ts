"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getPersonnelCategories() {
  return await prisma.personnelCategory.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createPersonnelCategory(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const name = (formData.get("name") as string)?.trim().toLowerCase().replace(/\s+/g, "_");
  const labelEs = formData.get("labelEs") as string;
  const labelEn = formData.get("labelEn") as string;
  const hourlyRate = formData.get("hourlyRate") as string;

  if (!name || !labelEs || !labelEn || !hourlyRate) {
    return { error: "Todos los campos son requeridos." };
  }

  try {
    await prisma.personnelCategory.create({
      data: { name, labelEs, labelEn, hourlyRate: parseFloat(hourlyRate) },
    });
    revalidatePath("/dashboard/personal");
    return { success: true };
  } catch {
    return { error: "Error al crear la categoría. El nombre puede estar duplicado." };
  }
}

export async function updatePersonnelCategory(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  const labelEs = formData.get("labelEs") as string;
  const labelEn = formData.get("labelEn") as string;
  const hourlyRate = formData.get("hourlyRate") as string;

  try {
    await prisma.personnelCategory.update({
      where: { id },
      data: { labelEs, labelEn, hourlyRate: parseFloat(hourlyRate) },
    });
    revalidatePath("/dashboard/personal");
    return { success: true };
  } catch {
    return { error: "Error al actualizar la categoría." };
  }
}

export async function togglePersonnelActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  await prisma.personnelCategory.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/dashboard/personal");
  return { success: true };
}

export async function deletePersonnelCategory(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  await prisma.personnelCategory.delete({ where: { id } });
  revalidatePath("/dashboard/personal");
  return { success: true };
}
