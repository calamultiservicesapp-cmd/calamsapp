import { Metadata } from "next";
import { getActivities, getPersonnelOptions } from "./actions";
import { ActivityTable } from "@/components/catalogo/activity-table";

export const metadata: Metadata = {
  title: "Catálogo de Servicios | CALA Multiservices",
};

export default async function CatalogoPage() {
  const [activities, personnelOptions] = await Promise.all([
    getActivities(),
    getPersonnelOptions(),
  ]);

  const serialized = activities.map((a) => ({
    ...a,
    minHours: a.minHours.toString(),
    minPrice: a.minPrice?.toString() ?? null,
    maxPrice: a.maxPrice?.toString() ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    deletedAt: a.deletedAt?.toISOString() ?? null,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">
          Catálogo de Servicios
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Gestiona el catálogo bilingüe (ES / EN) de servicios disponibles para la cotización de proyectos.
        </p>
      </div>
      <ActivityTable activities={serialized} personnelOptions={personnelOptions} />
    </div>
  );
}
