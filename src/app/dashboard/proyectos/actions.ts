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

export async function scheduleAppointment(state: any, formData: FormData) {
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

export async function archiveProject(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "cerrado" },
    });
    revalidatePath("/dashboard/proyectos");
    return { success: true };
  } catch {
    return { error: "Error al archivar el proyecto." };
  }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Borrar fotos de informe de campo
      const fieldReport = await tx.fieldReport.findUnique({
        where: { projectId },
        include: { items: { include: { photos: true } } },
      });
      if (fieldReport) {
        const itemIds = fieldReport.items.map((i) => i.id);
        if (itemIds.length > 0) {
          await tx.fieldReportPhoto.deleteMany({ where: { fieldReportItemId: { in: itemIds } } });
          await tx.fieldReportItem.deleteMany({ where: { fieldReportId: fieldReport.id } });
        }
        await tx.fieldReport.delete({ where: { id: fieldReport.id } });
      }

      // 2. Borrar factura
      await tx.invoice.deleteMany({ where: { projectId } });

      // 3. Borrar evaluación de campo (y sus inspecciones via Cascade en DB)
      const fieldEval = await tx.fieldEvaluation.findUnique({ where: { projectId } });
      if (fieldEval) {
        await tx.systemInspection.deleteMany({ where: { fieldEvaluationId: fieldEval.id } });
        await tx.fieldEvaluation.delete({ where: { id: fieldEval.id } });
      }

      // 4. Borrar propuesta y revisiones
      await tx.proposalRevision.deleteMany({ where: { projectId } });
      await tx.proposal.deleteMany({ where: { projectId } });

      // 5. Borrar asignaciones de personal
      await tx.projectAssignment.deleteMany({ where: { projectId } });

      // 6. Borrar ítems de caminata
      await tx.walkthroughItem.deleteMany({ where: { projectId } });

      // 7. Borrar cita
      await tx.appointment.deleteMany({ where: { projectId } });

      // 8. Finalmente borrar el proyecto
      await tx.project.delete({ where: { id: projectId } });
    });

    revalidatePath("/dashboard/proyectos");
    return { success: true };
  } catch (err) {
    console.error("Error al eliminar proyecto:", err);
    return { error: "Error al eliminar el proyecto. Intenta de nuevo." };
  }
}
