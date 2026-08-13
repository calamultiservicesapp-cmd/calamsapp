"use server";

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
          fieldReportItem: {
            include: {
              photos: { orderBy: { createdAt: "asc" } },
            },
          },
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

export async function uploadActivityPhoto(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const walkthroughItemId = formData.get("walkthroughItemId") as string;
  const caption = formData.get("caption") as string | null;
  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;

  if (!walkthroughItemId || !file || file.size === 0) {
    return { error: "Debes seleccionar una foto." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "La foto no puede pesar más de 5 MB." };
  }

  try {
    // Get or create the FieldReportItem first
    let fieldReportItem = await (prisma.fieldReportItem as any).findUnique({
      where: { walkthroughItemId },
    });

    if (!fieldReportItem) {
      // Need a field report first
      const fieldReport = await prisma.fieldReport.upsert({
        where: { projectId },
        create: { projectId, submittedBy: user.id },
        update: {},
      });
      fieldReportItem = await (prisma.fieldReportItem as any).create({
        data: {
          fieldReportId: fieldReport.id,
          walkthroughItemId,
          status: "completado",
          notes: null,
        },
      });
    }

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `informe-fotos/${fieldReportItem.id}/${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("project-photos")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return { error: `Error al subir la foto: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from("project-photos")
      .getPublicUrl(fileName);

    // Save photo record in DB
    await (prisma.fieldReportPhoto as any).create({
      data: {
        fieldReportItemId: fieldReportItem.id,
        url: publicUrl,
        caption: caption || null,
      },
    });

    revalidatePath(`/dashboard/proyectos/${projectId}/informe`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al guardar la foto." };
  }
}

export async function deleteActivityPhoto(photoId: string, projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    const photo = await (prisma.fieldReportPhoto as any).findUnique({ where: { id: photoId } });
    if (!photo) return { error: "Foto no encontrada." };

    // Delete from storage
    const urlParts = photo.url.split("/project-photos/");
    if (urlParts.length > 1) {
      await supabase.storage.from("project-photos").remove([urlParts[1]]);
    }

    await (prisma.fieldReportPhoto as any).delete({ where: { id: photoId } });
    revalidatePath(`/dashboard/proyectos/${projectId}/informe`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al eliminar la foto." };
  }
}

export async function submitInforme(projectId: string) {
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
