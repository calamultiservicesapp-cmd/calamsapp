"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { Prisma } from "@/generated/prisma/client";

export async function getPricingConfig() {
  let config = await prisma.pricingConfig.findFirst();

  // Si no existe, creamos uno por defecto (solo sucederá la primera vez)
  if (!config) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Necesitamos un ID de usuario válido. Si no hay usuario, usamos un placeholder 
    // pero idealmente esto no debería pasar en una ruta protegida.
    const userId = user?.id || "00000000-0000-0000-0000-000000000000";

    config = await prisma.pricingConfig.create({
      data: {
        contractorDayRate: new Prisma.Decimal(500),
        noviceTechDayRate: new Prisma.Decimal(160),
        expertTechDayRate: new Prisma.Decimal(250),
        standardHoursPerDay: new Prisma.Decimal(8),
        overheadPerProject: new Prisma.Decimal(199),
        profitMargin: new Prisma.Decimal(15),
        updatedById: userId,
      },
    });
  }

  // Convertimos los Decimal a strings para pasarlos al cliente
  return {
    id: config.id,
    contractorDayRate: config.contractorDayRate.toString(),
    noviceTechDayRate: config.noviceTechDayRate.toString(),
    expertTechDayRate: config.expertTechDayRate.toString(),
    standardHoursPerDay: config.standardHoursPerDay.toString(),
    overheadPerProject: config.overheadPerProject.toString(),
    profitMargin: config.profitMargin.toString(),
  };
}

export async function savePricingConfig(state: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  const id = formData.get("id") as string;
  
  try {
    const updated = await prisma.pricingConfig.update({
      where: { id },
      data: {
        contractorDayRate: new Prisma.Decimal(formData.get("contractorDayRate") as string),
        noviceTechDayRate: new Prisma.Decimal(formData.get("noviceTechDayRate") as string),
        expertTechDayRate: new Prisma.Decimal(formData.get("expertTechDayRate") as string),
        standardHoursPerDay: new Prisma.Decimal(formData.get("standardHoursPerDay") as string),
        overheadPerProject: new Prisma.Decimal(formData.get("overheadPerProject") as string),
        profitMargin: new Prisma.Decimal(formData.get("profitMargin") as string),
        updatedById: user.id,
      },
    });

    // Registrar en AuditLog (opcional pero recomendado en el blueprint)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entityType: "PricingConfig",
        entityId: updated.id,
        metadata: { message: "Hoja de costos actualizada" }
      }
    });

    revalidatePath("/dashboard/costos");
    return { success: true };
  } catch (error) {
    console.error("Error updating pricing config:", error);
    return { error: "Hubo un error al guardar los cambios." };
  }
}
