import { notFound } from "next/navigation";
import { getProjectDetail, getActivitiesForWalkthrough } from "../actions";
import { getCurrentPricingSnapshot } from "@/lib/db/pricing";
import { WalkthroughCalculator } from "@/components/proyectos/walkthrough-calculator";
import { Footprints, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function CaminataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, activities, snapshot] = await Promise.all([
    getProjectDetail(id),
    getActivitiesForWalkthrough(),
    getCurrentPricingSnapshot(),
  ]);

  if (!project) notFound();

  const existingItems = project.walkthroughItems.map((wi) => ({
    activityId: wi.activityId,
    personnelType: wi.personnelType as "contratista" | "tecnico_novato" | "tecnico_experto",
    hours: wi.hours.toNumber(),
    notes: wi.notes ?? "",
  }));

  const serializedActivities = activities.map((a) => ({
    ...a,
    minHours: a.minHours.toString(),
  }));

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-500 text-white shrink-0">
          <Footprints className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white">
            Paso 2 — Caminata
          </h2>
          <p className="text-sm text-slate-500">
            Agrega las actividades del proyecto con el personal y horas requeridas.
          </p>
        </div>
      </div>

      {/* Walkthrough Calculator */}
      <WalkthroughCalculator
        projectId={id}
        activities={serializedActivities}
        snapshot={snapshot}
        existingItems={existingItems}
      />

      {/* Next step CTA (shown only when items exist) */}
      {project.walkthroughItems.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            ✅ {project.walkthroughItems.length} actividad(es) registradas. Continúa con la Cotización.
          </p>
          <Link
            href={`/dashboard/proyectos/${id}/propuesta`}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0"
          >
            Ir a Cotización →
          </Link>
        </div>
      )}
    </div>
  );
}
