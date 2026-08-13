import { Metadata } from "next";
import { getPersonnelCategories, getAllPersonnel } from "./actions";
import { PersonnelTable } from "@/components/personal/personnel-table";
import { PersonnelList } from "@/components/personal/personnel-list";
import { Users, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Personal | CALA Multiservices",
};

export default async function PersonalPage() {
  const [categories, personnel] = await Promise.all([
    getPersonnelCategories(),
    getAllPersonnel(),
  ]);

  const serializedCategories = categories.map((i: any) => ({
    ...i,
    hourlyRate: i.hourlyRate.toString(),
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }));

  const serializedPersonnel = personnel.map((p: any) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Directorio de Personal (Personas) */}
      <section className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-900">
            <Users className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">
              Directorio de Personal
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Registra y gestiona a las personas de tu equipo. Ellos estarán disponibles para ser asignados a los proyectos.
            </p>
          </div>
        </div>
        <PersonnelList personnel={serializedPersonnel} categories={serializedCategories} />
      </section>

      {/* Categorías (Tipos) */}
      <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
            <Briefcase className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-heading tracking-wider text-slate-900 dark:text-white">
              Categorías y Tarifas
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Gestiona los tipos de roles (ej. Contratista, Técnico Experto) y sus tarifas por hora. Esto se usa para calcular costos.
            </p>
          </div>
        </div>
        <PersonnelTable items={serializedCategories} />
      </section>
    </div>
  );
}
