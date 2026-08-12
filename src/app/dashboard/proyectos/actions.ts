"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getProjects() {
  return await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true } },
      appointment: { select: { scheduledAt: true } },
      _count: { select: { walkthroughItems: true } },
    },
  });
}

export async function getClientsForSelect() {
  return await prisma.client.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createProject(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const name = formData.get("name") as string;
  const clientId = formData.get("clientId") as string;
  const scheduledAt = formData.get("scheduledAt") as string;
  const notes = formData.get("notes") as string;

  if (!name || !clientId) return { error: "Nombre y cliente son requeridos." };

  try {
    const project = await prisma.project.create({
      data: {
        name,
        clientId,
        status: "cita",
        createdById: user.id,
        ...(scheduledAt && {
          appointment: {
            create: {
              scheduledAt: new Date(scheduledAt),
              notes: notes || null,
            },
          },
        }),
      },
    });
    revalidatePath("/dashboard/proyectos");
    return { success: true, projectId: project.id };
  } catch {
    return { error: "Error al crear el proyecto." };
  }
}

export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    await prisma.project.update({
      where: { id: projectId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { status: status as any },
    });
    revalidatePath("/dashboard/proyectos");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el estado." };
  }
}

export async function scheduleAppointment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const projectId = formData.get("projectId") as string;
  const scheduledAt = formData.get("scheduledAt") as string;
  const notes = formData.get("notes") as string;

  try {
    // Upsert appointment
    await prisma.appointment.upsert({
      where: { projectId },
      create: { projectId, scheduledAt: new Date(scheduledAt), notes: notes || null },
      update: { scheduledAt: new Date(scheduledAt), notes: notes || null },
    });
    revalidatePath("/dashboard/proyectos");
    return { success: true };
  } catch {
    return { error: "Error al guardar la cita." };
  }
}
