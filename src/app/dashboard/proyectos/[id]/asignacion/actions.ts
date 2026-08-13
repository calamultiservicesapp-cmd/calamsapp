"use server";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getPersonnel() {
  return await prisma.personnel.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { fullName: "asc" },
  });
}

export async function getAssignments(projectId: string) {
  return await prisma.projectAssignment.findMany({
    where: { projectId },
    include: {
      technician: {
        include: { category: true }
      }
    },
    orderBy: { startDate: "asc" },
  });
}

export async function createAssignment(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const projectId     = formData.get("projectId") as string;
  const technicianIds = formData.getAll("technicianIds") as string[];
  const startDate     = formData.get("startDate") as string;
  const endDate       = formData.get("endDate") as string;
  const notes         = formData.get("notes") as string | null;

  if (!projectId || technicianIds.length === 0 || !startDate || !endDate) {
    return { error: "Faltan campos obligatorios o no has seleccionado personal" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Create assignments for all selected technicians
      await tx.projectAssignment.createMany({
        data: technicianIds.map((id) => ({
          projectId,
          technicianId: id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          notes,
        })),
      });

      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (project?.status === "aprobado") {
        await tx.project.update({ where: { id: projectId }, data: { status: "asignado" } });
      }
    });

    revalidatePath(`/dashboard/proyectos/${projectId}/asignacion`);
    revalidatePath(`/dashboard/proyectos/${projectId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Error al asignar técnico" };
  }
}

export async function removeAssignment(id: string, projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    await prisma.projectAssignment.delete({ where: { id } });
    revalidatePath(`/dashboard/proyectos/${projectId}/asignacion`);
    return { success: true };
  } catch (error: any) {
    return { error: "Error al eliminar asignación" };
  }
}

export async function startExecution(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const projectId = formData.get("projectId") as string;
  if (!projectId) throw new Error("Faltan campos obligatorios");

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "en_ejecucion" },
  });

  redirect(`/dashboard/proyectos/${projectId}/informe`);
}
