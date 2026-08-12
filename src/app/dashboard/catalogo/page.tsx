import { Metadata } from "next";
import { getActivities } from "./actions";
import { ActivityTable } from "@/components/catalogo/activity-table";

export const metadata: Metadata = {
  title: "Catálogo de Actividades | CALA Multiservices",
};

export default async function CatalogoPage() {
  const activities = await getActivities();

  // Serializar Decimal → string para el cliente
  const serialized = activities.map((a) => ({
    ...a,
    minHours: a.minHours.toString(),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">
          Catálogo de Actividades
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Gestiona el catálogo bilingüe (ES / EN) de servicios disponibles para la cotización de proyectos.
        </p>
      </div>
      <ActivityTable activities={serialized} />
    </div>
  );
}
