/**
 * Motor de Precios Centralizado — ObraFlow (CALA Multiservices)
 *
 * REGLAS NO NEGOCIABLES (según BLUEPRINT.md):
 * 1. Este es el ÚNICO lugar donde se calculan precios. Ningún componente lo hace de forma independiente.
 * 2. applyDiscount() rechaza cualquier descuento que lleve final_price < floor_price.
 * 3. El PDF del cliente NUNCA expone costos internos, overhead ni margen.
 * 4. Los snapshots de tarifas están atados al proyecto, no al config global.
 */

import { prisma } from "./prisma";
import { Prisma } from "@/generated/prisma/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type PricingSnapshot = {
  contractorDayRate: number;
  noviceTechDayRate: number;
  expertTechDayRate: number;
  standardHoursPerDay: number;
  overheadPerProject: number;
  profitMargin: number; // Porcentaje (ej: 15 = 15%)
};

export type LineItem = {
  activityId: string;
  personnelType: string;
  hours: number;
  rateSnapshot: number;
  computedPrice: number;
};

export type PricingResult = {
  lineItems: LineItem[];
  laborCost: number;
  overheadCost: number;
  totalCost: number;   // costo real (INTERNO, nunca mostrar al cliente)
  listPrice: number;   // totalCost + margen
  floorPrice: number;  // el precio mínimo al que se puede llegar con descuento
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Retorna la tarifa por hora según el tipo de personal
 */
function getRatePerHour(snapshot: PricingSnapshot, personnelType: string): number {
  const { contractorDayRate, noviceTechDayRate, expertTechDayRate, standardHoursPerDay } = snapshot;
  const dailyRate =
    personnelType === "contratista"
      ? contractorDayRate
      : personnelType === "tecnico_experto"
      ? expertTechDayRate
      : noviceTechDayRate;
  return dailyRate / standardHoursPerDay;
}

// ─── API Principal ─────────────────────────────────────────────────────────────

/**
 * Obtiene la configuración de precios actual y la devuelve como un snapshot numérico.
 * Este snapshot se usa para calcular precios Y se guarda junto al proyecto para
 * garantizar que los cambios futuros no afecten proyectos pasados.
 */
export async function getCurrentPricingSnapshot(): Promise<PricingSnapshot> {
  const config = await prisma.pricingConfig.findFirst();
  if (!config) throw new Error("No existe configuración de precios. Ve a /dashboard/costos y configúrala.");

  return {
    contractorDayRate: config.contractorDayRate.toNumber(),
    noviceTechDayRate: config.noviceTechDayRate.toNumber(),
    expertTechDayRate: config.expertTechDayRate.toNumber(),
    standardHoursPerDay: config.standardHoursPerDay.toNumber(),
    overheadPerProject: config.overheadPerProject.toNumber(),
    profitMargin: config.profitMargin.toNumber(),
  };
}

/**
 * Calcula el precio completo de un proyecto dado un conjunto de ítems de caminata.
 *
 * @param items - Array de {activityId, personnelType, hours}
 * @param snapshot - La configuración de precios (se usa el actual si no se provee)
 * @returns PricingResult con todos los valores calculados
 */
export async function calculateProjectPrice(
  items: Array<{ activityId: string; personnelType: string; hours: number }>,
  snapshot?: PricingSnapshot
): Promise<PricingResult> {
  const activeSnapshot = snapshot ?? (await getCurrentPricingSnapshot());

  const lineItems: LineItem[] = items.map((item) => {
    const ratePerHour = getRatePerHour(activeSnapshot, item.personnelType);
    const computedPrice = parseFloat((ratePerHour * item.hours).toFixed(2));
    return {
      activityId: item.activityId,
      personnelType: item.personnelType,
      hours: item.hours,
      rateSnapshot: parseFloat(ratePerHour.toFixed(4)),
      computedPrice,
    };
  });

  const laborCost = lineItems.reduce((sum, li) => sum + li.computedPrice, 0);
  const overheadCost = activeSnapshot.overheadPerProject;
  const totalCost = parseFloat((laborCost + overheadCost).toFixed(2));

  // listPrice = totalCost * (1 + margen/100)
  const listPrice = parseFloat((totalCost * (1 + activeSnapshot.profitMargin / 100)).toFixed(2));

  // floorPrice = mismo que listPrice — no podemos bajar del margen mínimo
  const floorPrice = listPrice;

  return { lineItems, laborCost, overheadCost, totalCost, listPrice, floorPrice };
}

/**
 * Aplica un descuento a un precio, validando que no perfore el floor.
 * Lanza un error si el descuento es inválido.
 *
 * @param listPrice - Precio de lista original
 * @param floorPrice - Precio mínimo permitido
 * @param discountPercent - Porcentaje de descuento a aplicar (ej: 10 = 10%)
 * @returns El precio final después del descuento
 */
export function applyDiscount(
  listPrice: number,
  floorPrice: number,
  discountPercent: number
): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error("El descuento debe ser un valor entre 0 y 100.");
  }

  const finalPrice = parseFloat((listPrice * (1 - discountPercent / 100)).toFixed(2));

  if (finalPrice < floorPrice) {
    throw new Error(
      `El descuento del ${discountPercent}% (precio final: $${finalPrice}) perfora el precio piso ($${floorPrice}). ` +
        `El descuento máximo permitido es ${Math.floor(((listPrice - floorPrice) / listPrice) * 100)}%.`
    );
  }

  return finalPrice;
}

/**
 * Guarda los ítems calculados de una caminata en la base de datos.
 * Reemplaza cualquier ítem previo del proyecto.
 */
export async function saveWalkthroughItems(
  projectId: string,
  items: Array<{ activityId: string; personnelType: string; hours: number; notes?: string }>,
  snapshot?: PricingSnapshot
): Promise<PricingResult> {
  const activeSnapshot = snapshot ?? (await getCurrentPricingSnapshot());
  const result = await calculateProjectPrice(items, activeSnapshot);

  // Transacción: eliminar los viejos e insertar los nuevos
  await prisma.$transaction(async (tx) => {
    await tx.walkthroughItem.deleteMany({ where: { projectId } });

    for (const li of result.lineItems) {
      const item = items.find((i) => i.activityId === li.activityId);
      await tx.walkthroughItem.create({
        data: {
          projectId,
          activityId: li.activityId,
          personnelType: li.personnelType,
          hours: new Prisma.Decimal(li.hours),
          rateSnapshot: new Prisma.Decimal(li.rateSnapshot),
          computedPrice: new Prisma.Decimal(li.computedPrice),
          notes: item?.notes ?? null,
        },
      });
    }

    // Actualizar estado del proyecto a "caminata"
    await tx.project.update({
      where: { id: projectId },
      data: { status: "caminata" },
    });
  });

  return result;
}
