import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Use db alias as any to bypass generated-client type gaps
const db = prisma as any;


export async function getInformeData(projectId: string) {
  return await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: { select: { name: true } },
      walkthroughItems: {
        include: {
          activity: { select: { nameEs: true, descriptionEs: true } },
          fieldReportItem: true,
        },
        orderBy: { createdAt: "asc" },
      },
      fieldReport: {
        include: {
          items: { include: { walkthroughItem: { include: { activity: true } } } },
        },
      },
      assignments: {
        include: { technician: { select: { fullName: true } } },
      },
    },
  });
}

export async function saveFieldReport(state: any, formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const projectId = formData.get("projectId") as string;
  const rawItems = formData.get("items") as string;

  if (!projectId || !rawItems) return { error: "Datos incompletos." };

  try {
    const items: Array<{
      walkthroughItemId: string;
      status: "completado" | "con_desviacion" | "no_completado";
      notes: string;
    }> = JSON.parse(rawItems);

    // Upsert the field report
    const fieldReport = await prisma.fieldReport.upsert({
      where: { projectId },
      create: {
        projectId,
        submittedBy: user.id,
      },
      update: {
        submittedBy: user.id,
      },
    });

    // Upsert each item
    for (const item of items) {
      await (prisma.fieldReportItem as any).upsert({
        where: { walkthroughItemId: item.walkthroughItemId },
        create: {
          fieldReportId: fieldReport.id,
          walkthroughItemId: item.walkthroughItemId,
          status: item.status,
          notes: item.notes || null,
        },
        update: {
          status: item.status,
          notes: item.notes || null,
        },
      });
    }

    // Check if all items are completed and advance status if so
    const allDone = items.every((i) => i.status !== "no_completado");
    if (allDone) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "informe" },
      });
    }

    revalidatePath(`/dashboard/proyectos/${projectId}/informe`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al guardar el informe." };
  }
}

export async function submitInforme(projectId: string) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    await prisma.fieldReport.update({
      where: { projectId },
      data: { submittedAt: new Date() },
    });
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "informe" },
    });
    revalidatePath(`/dashboard/proyectos/${projectId}`);
    return { success: true };
  } catch {
    return { error: "Error al enviar el informe." };
  }
}
