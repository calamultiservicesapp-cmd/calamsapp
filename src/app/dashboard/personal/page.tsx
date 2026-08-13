import { Metadata } from "next";
import { getPersonnelCategories } from "./actions";
import { PersonnelTable } from "@/components/personal/personnel-table";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Personal | CALA Multiservices",
};

export default async function PersonalPage() {
  const items = await getPersonnelCategories();

  const serialized = items.map((i) => ({
    ...i,
    hourlyRate: i.hourlyRate.toString(),
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-900">
          <Users className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">
            Tipos de Personal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestiona las categorías de personal y sus tarifas por hora. Los tipos activos aparecen en todos los dropdowns de la app.
          </p>
        </div>
      </div>
      <PersonnelTable items={serialized} />
    </div>
  );
}
