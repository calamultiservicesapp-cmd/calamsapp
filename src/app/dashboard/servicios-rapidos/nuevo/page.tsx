import { Metadata } from "next";
import { Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getClientsForQuickJob, getActivitiesForQuickJob } from "../actions";
import { NuevoServicioForm } from "@/components/servicios-rapidos/nuevo-servicio-form";

export const metadata: Metadata = {
  title: "Nuevo Servicio Rápido | CALA Multiservices",
};

export default async function NuevoServicioPage() {
  const [clients, activities] = await Promise.all([
    getClientsForQuickJob(),
    getActivitiesForQuickJob(),
  ]);

  const serializedActivities = activities.map((a) => ({
    ...a,
    minHours: a.minHours.toString(),
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/servicios-rapidos"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Servicios Rápidos
        </Link>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white flex items-center gap-3">
          <Zap className="h-7 w-7 text-orange-500" />
          Nuevo Servicio Rápido
        </h1>
        <p className="text-slate-500 mt-1">Registra un trabajo sin pasar por el flujo de proyecto.</p>
      </div>

      <NuevoServicioForm clients={clients} activities={serializedActivities} />
    </div>
  );
}
