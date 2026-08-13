"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

const db = prisma as any;

// ─── PersonnelCategory (tipos) ────────────────────────────────────────────────

export async function getPersonnelCategories() {
  try {
    return await db.personnelCategory.findMany({ orderBy: { createdAt: "asc" } }) as any[];
  } catch { return []; }
}

export async function createPersonnelCategory(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const name      = (formData.get("name") as string)?.trim().toLowerCase().replace(/\s+/g, "_");
  const labelEs   = formData.get("labelEs") as string;
  const labelEn   = formData.get("labelEn") as string;
  const hourlyRate = formData.get("hourlyRate") as string;

  if (!name || !labelEs || !labelEn || !hourlyRate) return { error: "Todos los campos son requeridos." };

  try {
    await db.personnelCategory.create({ data: { name, labelEs, labelEn, hourlyRate: parseFloat(hourlyRate) } });
    revalidatePath("/dashboard/personal");
    return { success: true };
  } catch { return { error: "Error al crear la categoría. El nombre puede estar duplicado." }; }
}

export async function updatePersonnelCategory(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const id         = formData.get("id") as string;
  const labelEs    = formData.get("labelEs") as string;
  const labelEn    = formData.get("labelEn") as string;
  const hourlyRate = formData.get("hourlyRate") as string;

  try {
    await db.personnelCategory.update({ where: { id }, data: { labelEs, labelEn, hourlyRate: parseFloat(hourlyRate) } });
    revalidatePath("/dashboard/personal");
    return { success: true };
  } catch { return { error: "Error al actualizar la categoría." }; }
}

export async function togglePersonnelActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };
  await db.personnelCategory.update({ where: { id }, data: { isActive } });
  revalidatePath("/dashboard/personal");
  return { success: true };
}

export async function deletePersonnelCategory(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };
  await db.personnelCategory.delete({ where: { id } });
  revalidatePath("/dashboard/personal");
  return { success: true };
}

// ─── Personnel (personas individuales) ───────────────────────────────────────

export async function getAllPersonnel() {
  try {
    return await db.personnel.findMany({
      include: { category: true },
      orderBy: { fullName: "asc" },
    }) as any[];
  } catch { return []; }
}

export async function createPersonnelMember(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const fullName            = (formData.get("fullName") as string)?.trim();
  const position            = (formData.get("position") as string)?.trim() || null;
  const phone               = (formData.get("phone") as string)?.trim() || null;
  const email               = (formData.get("email") as string)?.trim() || null;
  const specialty           = (formData.get("specialty") as string)?.trim() || null;
  const personnelCategoryId = (formData.get("personnelCategoryId") as string) || null;

  if (!fullName) return { error: "El nombre es requerido." };

  try {
    await db.personnel.create({
      data: { fullName, position, phone, email, specialty, personnelCategoryId },
    });
    revalidatePath("/dashboard/personal");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: "Error al crear el miembro." };
  }
}

export async function updatePersonnelMember(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const id                  = formData.get("id") as string;
  const fullName            = (formData.get("fullName") as string)?.trim();
  const position            = (formData.get("position") as string)?.trim() || null;
  const phone               = (formData.get("phone") as string)?.trim() || null;
  const email               = (formData.get("email") as string)?.trim() || null;
  const specialty           = (formData.get("specialty") as string)?.trim() || null;
  const personnelCategoryId = (formData.get("personnelCategoryId") as string) || null;

  try {
    await db.personnel.update({
      where: { id },
      data: { fullName, position, phone, email, specialty, personnelCategoryId },
    });
    revalidatePath("/dashboard/personal");
    return { success: true };
  } catch { return { error: "Error al actualizar el miembro." }; }
}

export async function togglePersonnelMemberActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };
  await db.personnel.update({ where: { id }, data: { isActive } });
  revalidatePath("/dashboard/personal");
  return { success: true };
}

export async function deletePersonnelMember(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };
  await db.personnel.delete({ where: { id } });
  revalidatePath("/dashboard/personal");
  return { success: true };
}
