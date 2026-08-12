"use client";

import { useActionState, useEffect, useState } from "react";
import { savePricingConfig } from "@/app/dashboard/costos/actions";
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";

type ConfigProps = {
  id: string;
  contractorDayRate: string;
  noviceTechDayRate: string;
  expertTechDayRate: string;
  standardHoursPerDay: string;
  overheadPerProject: string;
  profitMargin: string;
};

const initialState: any = {
  success: false,
  error: "",
};

export function CostForm({ initialData }: { initialData: ConfigProps }) {
  const [state, formAction, isPending] = useActionState(savePricingConfig, initialState);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-t-lg">
        <h2 className="text-xl font-heading text-slate-800 dark:text-slate-200">
          Configuración Global de Precios
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Estos valores son la base para el motor de cálculo de presupuestos. Los cambios afectarán solo a los proyectos futuros.
        </p>
      </div>

      <form action={formAction} className="p-6 space-y-8">
        <input type="hidden" name="id" value={initialData.id} />

        {state?.error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-3 text-sm border border-red-200">
            <AlertCircle className="h-5 w-5" />
            <p>{state.error}</p>
          </div>
        )}

        {showSuccess && (
          <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center gap-3 text-sm border border-green-200">
            <CheckCircle2 className="h-5 w-5" />
            <p>Configuración guardada exitosamente.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarifas Diarias */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Tarifas Diarias ($ USD)</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contratista</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  name="contractorDayRate"
                  defaultValue={initialData.contractorDayRate}
                  required
                  className="w-full h-11 pl-8 pr-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Técnico Experto</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  name="expertTechDayRate"
                  defaultValue={initialData.expertTechDayRate}
                  required
                  className="w-full h-11 pl-8 pr-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Técnico Novato</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  name="noviceTechDayRate"
                  defaultValue={initialData.noviceTechDayRate}
                  required
                  className="w-full h-11 pl-8 pr-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Parámetros Generales */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Parámetros del Proyecto</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Horas Estándar por Día</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  name="standardHoursPerDay"
                  defaultValue={initialData.standardHoursPerDay}
                  required
                  className="w-full h-11 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="absolute right-3 top-3 text-slate-400 font-medium text-sm">hrs</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Overhead por Proyecto</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  name="overheadPerProject"
                  defaultValue={initialData.overheadPerProject}
                  required
                  className="w-full h-11 pl-8 pr-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Margen de Ganancia (Piso)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  name="profitMargin"
                  defaultValue={initialData.profitMargin}
                  required
                  className="w-full h-11 px-3 pr-8 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="absolute right-3 top-3 text-slate-400 font-medium">%</span>
              </div>
              <p className="text-xs text-slate-500">Ningún descuento podrá perforar este margen mínimo de ganancia.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 dark:bg-orange-500 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-slate-800 dark:hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50 gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
