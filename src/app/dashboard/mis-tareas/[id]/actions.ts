"use server";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProjectForReport(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Validate the user is assigned to this project
  const assignment = await prisma.projectAssignment.findFirst({
    where: { projectId, personnelId: user.id }
  });

  if (!assignment) return null;

  return await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      walkthroughItems: {
        include: {
          activity: true
        }
      },
      fieldReport: {
        include: {
          items: true
        }
      }
    }
  });
}

export async function submitFieldReport(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const projectId = formData.get("projectId") as string;
  const walkthroughIds = formData.getAll("walkthroughItemId") as string[];
  
  if (!projectId || walkthroughIds.length === 0) {
    return { error: "Datos incompletos" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Create or update FieldReport
      const report = await tx.fieldReport.upsert({
        where: { projectId },
        create: {
          projectId,
          submittedBy: user.id,
          submittedAt: new Date(),
        },
        update: {
          submittedBy: user.id,
          submittedAt: new Date(),
        }
      });

      // Insert/update items
      for (const wId of walkthroughIds) {
        const status = formData.get(`status_${wId}`) as any;
        const notes = formData.get(`notes_${wId}`) as string;

        await tx.fieldReportItem.upsert({
          where: { walkthroughItemId: wId },
          create: {
            fieldReportId: report.id,
            walkthroughItemId: wId,
            status,
            notes: notes || null
          },
          update: {
            status,
            notes: notes || null
          }
        });
      }

      // Update project status to informe
      await tx.project.update({
        where: { id: projectId },
        data: { status: "informe" }
      });
    });

    revalidatePath(`/dashboard/mis-tareas/${projectId}`);
    revalidatePath(`/dashboard/mis-tareas`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Error al enviar el informe de campo" };
  }
}
