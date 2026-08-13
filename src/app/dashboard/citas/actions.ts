"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateAppointment(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  const scheduledAt = formData.get("scheduledAt") as string;
  const notes = formData.get("notes") as string;

  if (!id || !scheduledAt) return { error: "Datos incompletos." };

  try {
    await prisma.appointment.update({
      where: { id },
      data: {
        scheduledAt: new Date(scheduledAt),
        notes: notes || null,
      },
    });
    revalidatePath("/dashboard/citas");
    return { success: true };
  } catch {
    return { error: "Error al actualizar la cita." };
  }
}
