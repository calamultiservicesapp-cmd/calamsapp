"use server";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getNextInvoiceNumber(): Promise<string> {
  const [lastProjectInv, lastQuickInv] = await Promise.all([
    prisma.invoice.findFirst({
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true },
    }),
    prisma.quickJob.findFirst({
      where: { invoiceNumber: { not: null } },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true },
    }),
  ]);

  const extractNum = (s: string | null | undefined) => {
    if (!s) return 0;
    const match = s.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const max = Math.max(
    extractNum(lastProjectInv?.invoiceNumber),
    extractNum(lastQuickInv?.invoiceNumber)
  );
  return `INV-${String(max + 1).padStart(3, "0")}`;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getQuickJobs() {
  return await prisma.quickJob.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true } },
      items: true,
      report: { select: { id: true, completedAt: true } },
    },
  });
}

export async function getQuickJob(id: string) {
  return await prisma.quickJob.findUnique({
    where: { id },
    include: {
      client: true,
      items: {
        include: { activity: { select: { nameEs: true, nameEn: true } } },
      },
      report: true,
    },
  });
}

export async function getActivitiesForQuickJob() {
  return await prisma.activity.findMany({
    where: { deletedAt: null },
    orderBy: { nameEs: "asc" },
    select: { id: true, nameEs: true, nameEn: true, minHours: true },
  });
}

export async function getClientsForQuickJob() {
  return await prisma.client.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createQuickJob(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const clientId = formData.get("clientId") as string;
  const name = formData.get("name") as string;
  const serviceDate = formData.get("serviceDate") as string;
  const rawItems = formData.get("items") as string;
  const totalOverride = formData.get("totalOverride") as string;

  if (!clientId || !name || !serviceDate || !rawItems) {
    return { error: "Faltan campos requeridos." };
  }

  try {
    const items = JSON.parse(rawItems) as Array<{
      activityId?: string;
      description: string;
      hours?: number;
      unitPrice: number;
      totalPrice: number;
    }>;

    if (items.length === 0) return { error: "Agrega al menos un servicio." };

    const computedTotal = items.reduce((s, i) => s + i.totalPrice, 0);
    const totalAmount = totalOverride ? parseFloat(totalOverride) : computedTotal;

    const qj = await prisma.quickJob.create({
      data: {
        clientId,
        name,
        serviceDate: new Date(serviceDate),
        totalAmount: new Prisma.Decimal(totalAmount),
        createdById: user.id,
        items: {
          create: items.map((i) => ({
            activityId: i.activityId || null,
            description: i.description,
            hours: i.hours ? new Prisma.Decimal(i.hours) : null,
            unitPrice: new Prisma.Decimal(i.unitPrice),
            totalPrice: new Prisma.Decimal(i.totalPrice),
          })),
        },
      },
    });

    revalidatePath("/dashboard/servicios-rapidos");
    return { success: true, id: qj.id };
  } catch (err: any) {
    console.error(err);
    return { error: "Error al crear el servicio rápido." };
  }
}

// ─── Report ───────────────────────────────────────────────────────────────────

export async function saveQuickJobReport(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const quickJobId = formData.get("quickJobId") as string;
  const technicianName = formData.get("technicianName") as string;
  const workDescription = formData.get("workDescription") as string;
  const observations = formData.get("observations") as string;

  if (!workDescription) return { error: "La descripción del trabajo es requerida." };

  try {
    await prisma.quickJobReport.upsert({
      where: { quickJobId },
      create: {
        quickJobId,
        technicianName: technicianName || null,
        workDescription,
        observations: observations || null,
        completedAt: new Date(),
      },
      update: {
        technicianName: technicianName || null,
        workDescription,
        observations: observations || null,
        completedAt: new Date(),
      },
    });

    await prisma.quickJob.update({
      where: { id: quickJobId },
      data: { status: "informe" },
    });

    revalidatePath(`/dashboard/servicios-rapidos/${quickJobId}`);
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: "Error al guardar el informe." };
  }
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export async function generateQuickJobInvoice(quickJobId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    const qj = await prisma.quickJob.findUnique({ where: { id: quickJobId } });
    if (!qj) return { error: "Servicio no encontrado." };
    if (qj.invoiceNumber) return { success: true, invoiceNumber: qj.invoiceNumber };

    const invoiceNumber = await getNextInvoiceNumber();

    await prisma.quickJob.update({
      where: { id: quickJobId },
      data: { invoiceNumber, status: "facturado" },
    });

    revalidatePath(`/dashboard/servicios-rapidos/${quickJobId}`);
    revalidatePath("/dashboard/facturacion");
    return { success: true, invoiceNumber };
  } catch (err: any) {
    console.error(err);
    return { error: "Error al generar la factura." };
  }
}

export async function markQuickJobPaid(quickJobId: string) {
  try {
    await prisma.quickJob.update({
      where: { id: quickJobId },
      data: { paidAt: new Date() },
    });
    revalidatePath(`/dashboard/servicios-rapidos/${quickJobId}`);
    revalidatePath("/dashboard/facturacion");
    return { success: true };
  } catch {
    return { error: "Error al marcar como cobrado." };
  }
}
