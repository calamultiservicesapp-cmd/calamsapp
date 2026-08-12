import { Metadata } from "next";
import { getPricingConfig } from "./actions";
import { CostForm } from "@/components/costos/cost-form";

export const metadata: Metadata = {
  title: "Hoja de Costos | CALA Multiservices",
  description: "Configuración global de precios y costos",
};

export default async function CostosPage() {
  const config = await getPricingConfig();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">
          Hoja de Costos
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Administra las tarifas base y márgenes operativos que utilizará el motor de cotizaciones.
        </p>
      </div>

      <CostForm initialData={config} />
    </div>
  );
}
