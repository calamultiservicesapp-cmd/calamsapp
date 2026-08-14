"use client";

import { useState, useTransition } from "react";
import { submitWalkthrough } from "@/app/dashboard/proyectos/[id]/actions";
import {
  Plus, Trash2, Loader2, AlertCircle, CheckCircle2,
  Calculator, ChevronDown
} from "lucide-react";

type Activity = {
  id: string;
  nameEs: string;
  nameEn: string;
  defaultPersonnelType: string;
  minHours: string;
};

type WalkthroughItem = {
  activityId: string;
  personnelType: "contratista" | "tecnico_novato" | "tecnico_experto";
  hours: number;
  notes: string;
};

const personnelLabels: Record<string, string> = {
  contratista: "Contratista",
  tecnico_novato: "Técnico Novato",
  tecnico_experto: "Técnico Experto",
};

const personnelOptions = ["contratista", "tecnico_novato", "tecnico_experto"] as const;

// Tarifas para preview en tiempo real (se refrescan desde snapshot al guardar)
type SnapshotRates = {
  contractorDayRate: number;
  noviceTechDayRate: number;
  expertTechDayRate: number;
  standardHoursPerDay: number;
  overheadPerProject: number;
  profitMargin: number;
};

function getRatePerHour(snapshot: SnapshotRates, type: string): number {
  const daily =
    type === "contratista"
      ? snapshot.contractorDayRate
      : type === "tecnico_experto"
      ? snapshot.expertTechDayRate
      : snapshot.noviceTechDayRate;
  return daily / snapshot.standardHoursPerDay;
}

export function WalkthroughCalculator({
  projectId,
  activities,
  snapshot,
  existingItems,
}: {
  projectId: string;
  activities: Activity[];
  snapshot: SnapshotRates;
  existingItems?: WalkthroughItem[];
}) {
  const [items, setItems] = useState<WalkthroughItem[]>(
    existingItems ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Preview en tiempo real
  const lineItems = items.map((item) => {
    const rate = getRatePerHour(snapshot, item.personnelType);
    const price = rate * item.hours;
    return { ...item, rate, price };
  });

  const laborCost = lineItems.reduce((sum, li) => sum + li.price, 0);
  const overhead = snapshot.overheadPerProject;
  const totalCost = laborCost + overhead;
  const listPrice = totalCost * (1 + snapshot.profitMargin / 100);

  function addItem() {
    const first = activities[0];
    if (!first) return;
    setItems((prev) => [
      ...prev,
      {
        activityId: first.id,
        personnelType: first.defaultPersonnelType as WalkthroughItem["personnelType"],
        hours: parseFloat(first.minHours),
        notes: "",
      },
    ]);
  }

  function updateItem(index: number, changes: Partial<WalkthroughItem>) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...changes };
        // Si cambia la actividad, actualizar el tipo de personal por defecto y horas mínimas
        if (changes.activityId) {
          const act = activities.find((a) => a.id === changes.activityId);
          if (act) {
            updated.personnelType = act.defaultPersonnelType as WalkthroughItem["personnelType"];
            updated.hours = parseFloat(act.minHours);
          }
        }
        return updated;
      })
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("projectId", projectId);
      fd.set("items", JSON.stringify(items));
      const result = await submitWalkthrough(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* Activities table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-heading text-slate-800 dark:text-white tracking-wider">
            Actividades de la Caminata
          </h3>
          <button
            onClick={addItem}
            disabled={activities.length === 0}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Calculator className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">Agrega actividades para comenzar la cotización.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Actividad</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Personal</th>
                  <th className="text-left px-4 py-3 w-28">Horas</th>
                  <th className="text-right px-4 py-3 w-28">Precio</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lineItems.map((li, i) => {
                  const act = activities.find((a) => a.id === li.activityId);
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-2">
                        <div className="relative">
                          <select
                            value={li.activityId}
                            onChange={(e) => updateItem(i, { activityId: e.target.value })}
                            className="w-full appearance-none pr-6 h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 pl-2"
                          >
                            {activities.map((a) => (
                              <option key={a.id} value={a.id}>{a.nameEs}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                        {act?.nameEn && (
                          <p className="text-xs text-slate-400 mt-0.5 pl-2">{act.nameEn}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        <div className="relative">
                          <select
                            value={li.personnelType}
                            onChange={(e) => updateItem(i, { personnelType: e.target.value as WalkthroughItem["personnelType"] })}
                            className="w-full appearance-none pr-6 h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 pl-2"
                          >
                            {personnelOptions.map((p) => (
                              <option key={p} value={p}>{personnelLabels[p]}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 pl-2">
                          {fmt(li.rate)}/hr
                        </p>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={li.hours}
                          onChange={(e) => updateItem(i, { hours: parseFloat(e.target.value) || 0 })}
                          className="w-full h-9 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {fmt(li.price)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeItem(i)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen de precios — solo visible si hay items */}
      {items.length > 0 && (
        <div className="bg-slate-950 rounded-xl p-6 text-white space-y-4">
          <h3 className="font-heading tracking-wider text-orange-400">Resumen de Cotización (Vista Interna)</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Costo de Mano de Obra</span>
              <span>{fmt(laborCost)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Overhead Operativo</span>
              <span>{fmt(overhead)}</span>
            </div>
            <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2">
              <span>Costo Total (Interno)</span>
              <span>{fmt(totalCost)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-slate-700 pt-2">
              <span>Precio de Lista</span>
              <span className="text-orange-400">{fmt(listPrice)}</span>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              * Margen: {snapshot.profitMargin}% | El precio piso coincide con el precio de lista (sin descuento aplicado aún).
            </p>
          </div>
        </div>
      )}

      {/* Feedback y botón guardar */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2 text-sm border border-green-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />Caminata guardada. El proyecto ha avanzado al estado "Caminata".
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending || items.length === 0}
          className="inline-flex items-center gap-2 h-11 px-8 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Guardar Caminata
        </button>
      </div>
    </div>
  );
}
