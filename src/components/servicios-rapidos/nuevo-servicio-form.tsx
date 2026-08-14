"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuickJob } from "@/app/dashboard/servicios-rapidos/actions";
import { Plus, Trash2, Loader2, AlertCircle, Calculator } from "lucide-react";

type Client = { id: string; name: string };
type Activity = { id: string; nameEs: string; nameEn: string; minHours: string };

type Item = {
  key: string;
  activityId?: string;
  description: string;
  hours: number;
  unitPrice: number;
  totalPrice: number;
};

const fmt = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });

export function NuevoServicioForm({
  clients,
  activities,
}: {
  clients: Client[];
  activities: Activity[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState<Item[]>([
    { key: Date.now().toString(), description: "", hours: 1, unitPrice: 0, totalPrice: 0 },
  ]);
  const [totalOverride, setTotalOverride] = useState("");

  const computedTotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const displayTotal = totalOverride ? parseFloat(totalOverride) || 0 : computedTotal;

  function addItem() {
    setItems((prev) => [
      ...prev,
      { key: Date.now().toString(), description: "", hours: 1, unitPrice: 0, totalPrice: 0 },
    ]);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateItem(key: string, field: keyof Item, value: any) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        const updated = { ...i, [field]: value };
        if (field === "activityId" && value) {
          const act = activities.find((a) => a.id === value);
          if (act) updated.description = act.nameEs;
        }
        if (field === "hours" || field === "unitPrice") {
          updated.totalPrice = updated.hours * updated.unitPrice;
        }
        return updated;
      })
    );
  }

  function handleSubmit() {
    if (!clientId || !name) {
      setError("Cliente y nombre del trabajo son requeridos.");
      return;
    }
    if (items.some((i) => !i.description)) {
      setError("Todos los ítems deben tener descripción.");
      return;
    }
    setError(null);

    const fd = new FormData();
    fd.set("clientId", clientId);
    fd.set("name", name);
    fd.set("serviceDate", serviceDate);
    fd.set("items", JSON.stringify(items.map(({ key: _k, ...rest }) => rest)));
    if (totalOverride) fd.set("totalOverride", totalOverride);

    startTransition(async () => {
      const res = await createQuickJob(fd);
      if (res.error) {
        setError(res.error);
      } else if (res.id) {
        router.push(`/dashboard/servicios-rapidos/${res.id}`);
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Info básica */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <h2 className="font-heading tracking-wider text-slate-800 dark:text-white">Información del Trabajo</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Cliente *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 text-sm"
            >
              <option value="">Seleccionar cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Fecha del Servicio *
            </label>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Nombre del Trabajo *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Pintura cuarto principal"
            className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 text-sm"
          />
        </div>
      </div>

      {/* Ítems */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-heading tracking-wider text-slate-800 dark:text-white">Servicios Prestados</h2>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center justify-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium w-full sm:w-auto p-2 bg-orange-50/50 sm:bg-transparent rounded-lg sm:p-0"
          >
            <Plus className="h-4 w-4" /> Agregar Ítem
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item, idx) => (
            <div key={item.key} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 w-5">{idx + 1}.</span>
                <select
                  value={item.activityId || ""}
                  onChange={(e) => updateItem(item.key, "activityId", e.target.value)}
                  className="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 text-sm"
                >
                  <option value="">Descripción manual...</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>{a.nameEs}</option>
                  ))}
                </select>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {(!item.activityId || item.activityId === "") && (
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.key, "description", e.target.value)}
                  placeholder="Describe el servicio..."
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 text-sm ml-7"
                />
              )}
              {item.activityId && (
                <p className="text-sm text-slate-600 dark:text-slate-400 ml-7">{item.description}</p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 ml-7 mt-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Horas</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={item.hours}
                    onChange={(e) => updateItem(item.key, "hours", parseFloat(e.target.value) || 0)}
                    className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Precio/Hora (CAD)</label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.key, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Subtotal</label>
                  <div className="h-9 flex items-center px-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {fmt(item.totalPrice)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Calculator className="h-4 w-4" /> Total calculado</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{fmt(computedTotal)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">Precio final (opcional):</label>
            <input
              type="number"
              min={0}
              step={10}
              value={totalOverride}
              onChange={(e) => setTotalOverride(e.target.value)}
              placeholder={fmt(computedTotal)}
              className="w-full sm:flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 text-sm"
            />
          </div>
          <div className="flex justify-between items-center font-bold text-lg border-t border-slate-200 dark:border-slate-700 pt-3">
            <span className="text-slate-700 dark:text-slate-200">Total a Facturar</span>
            <span className="text-orange-500">{fmt(displayTotal)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        Crear Servicio Rápido →
      </button>
    </div>
  );
}
