"use server";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getInvoiceData(projectId: string) {
  return await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      proposal: true,
      invoice: true,
      fieldReport: {
        include: {
          items: {
            include: {
              walkthroughItem: {
                include: {
                  activity: true
                }
              }
            }
          }
        }
      }
    }
  });
}

export async function generateInvoice(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { proposal: true, invoice: true }
    });

    if (!project || !project.proposal) {
      return { error: "No se puede generar factura sin una propuesta aprobada." };
    }

    if (project.invoice) {
      return { error: "La factura ya existe." };
    }

    // Generate unique invoice number: INV-{YYMMDD}-{ID}
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const shortId = projectId.slice(-4).toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${shortId}`;

    await prisma.$transaction(async (tx) => {
      await tx.invoice.create({
        data: {
          projectId,
          invoiceNumber,
          amount: project.proposal!.finalPrice,
          status: "pendiente"
        }
      });

      await tx.project.update({
        where: { id: projectId },
        data: { status: "facturado" }
      });
    });

    revalidatePath(`/dashboard/proyectos/${projectId}/factura`);
    revalidatePath(`/dashboard/proyectos/${projectId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Error al generar factura" };
  }
}

export async function markInvoicePaid(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { projectId },
        data: { status: "pagada" }
      });

      await tx.project.update({
        where: { id: projectId },
        data: { status: "cerrado" }
      });
    });

    revalidatePath(`/dashboard/proyectos/${projectId}/factura`);
    revalidatePath(`/dashboard/proyectos/${projectId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Error al marcar factura como pagada" };
  }
}
