import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTechnicians() {
  return await prisma.profile.findMany({
    where: { role: "tecnico" },
    orderBy: { fullName: "asc" }
  });
}

export async function getAssignments(projectId: string) {
  return await prisma.projectAssignment.findMany({
    where: { projectId },
    include: {
      technician: true
    },
    orderBy: { startDate: "asc" }
  });
}

export async function createAssignment(state: any, formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const projectId = formData.get("projectId") as string;
  const technicianId = formData.get("technicianId") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const notes = formData.get("notes") as string | null;

  if (!projectId || !technicianId || !startDate || !endDate) {
    return { error: "Faltan campos obligatorios" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.projectAssignment.create({
        data: {
          projectId,
          technicianId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          notes
        }
      });

      // Update project status if it's currently 'aprobado'
      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (project?.status === "aprobado") {
        await tx.project.update({
          where: { id: projectId },
          data: { status: "asignado" }
        });
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
  "use server";
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
