"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getClients() {
  return await prisma.client.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { projects: true } },
    },
  });
}

export async function createClientAction(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const name = formData.get("name") as string;
  const contactName = formData.get("contactName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  if (!name) return { error: "El nombre del cliente es requerido." };

  try {
    await prisma.client.create({
      data: { name, contactName: contactName || null, email: email || null, phone: phone || null, address: address || null },
    });
    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch {
    return { error: "Error al crear el cliente." };
  }
}

export async function updateClientAction(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const contactName = formData.get("contactName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  if (!name) return { error: "El nombre del cliente es requerido." };

  try {
    await prisma.client.update({
      where: { id },
      data: { name, contactName: contactName || null, email: email || null, phone: phone || null, address: address || null },
    });
    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el cliente." };
  }
}

export async function deleteClient(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    await prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el cliente." };
  }
}

export async function getClientHistory(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        include: {
          invoice: true,
        },
        orderBy: { createdAt: "desc" },
      },
      quickJobs: {
        orderBy: { serviceDate: "desc" },
      },
    },
  });
  
  if (!client) return null;
  return client;
}
