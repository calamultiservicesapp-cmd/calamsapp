"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

// Use raw prisma to avoid TypeScript issues with new fields until schema sync
const db = prisma as any;

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
  const defaultPersonnelType = formData.get("defaultPersonnelType") as string;
  const minHours = formData.get("minHours") as string;
  const minPrice = formData.get("minPrice") as string;
  const maxPrice = formData.get("maxPrice") as string;

  if (!nameEs || !nameEn || !descriptionEs || !descriptionEn || !defaultPersonnelType || !minHours) {
    return { error: "Los campos de nombre, descripción, personal y horas mínimas son requeridos." };
  }

  try {
    await db.activity.create({
      data: {
        nameEs,
        nameEn,
        descriptionEs,
        descriptionEn,
        defaultPersonnelType,
        minHours: parseFloat(minHours),
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      },
    });
    revalidatePath("/dashboard/catalogo");
    return { success: true };
  } catch (err: any) {
    console.error("createActivity error:", err);
    return { error: err?.message ?? "Error al crear el servicio." };
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
  const defaultPersonnelType = formData.get("defaultPersonnelType") as string;
  const minHours = formData.get("minHours") as string;
  const minPrice = formData.get("minPrice") as string;
  const maxPrice = formData.get("maxPrice") as string;

  try {
    await db.activity.update({
      where: { id },
      data: {
        nameEs,
        nameEn,
        descriptionEs,
        descriptionEn,
        defaultPersonnelType,
        minHours: parseFloat(minHours),
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      },
    });
    revalidatePath("/dashboard/catalogo");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el servicio." };
  }
}

export async function deleteActivity(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    await prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/dashboard/catalogo");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el servicio." };
  }
}

// Fetch personnel categories from DB for dropdowns
export async function getPersonnelOptions() {
  try {
    const cats = await db.personnelCategory.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return (cats as any[]).map((c: any) => ({ value: c.name, label: c.labelEs }));
  } catch {
    // Fallback if table doesn't exist yet
    return [
      { value: "contratista", label: "Contratista" },
      { value: "tecnico_novato", label: "Técnico Novato" },
      { value: "tecnico_experto", label: "Técnico Experto" },
    ];
  }
}
