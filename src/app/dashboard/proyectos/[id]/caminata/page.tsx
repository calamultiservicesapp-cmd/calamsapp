import { notFound } from "next/navigation";
import { getProjectDetail, getActivitiesForWalkthrough, getFieldEvaluation } from "../queries";
import { getCurrentPricingSnapshot } from "@/lib/db/pricing";
import { WalkthroughCalculator } from "@/components/proyectos/walkthrough-calculator";
import { FieldEvaluationForm } from "@/components/proyectos/field-evaluation-form";
import { Footprints, ClipboardList, Calculator, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function CaminataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, activities, snapshot, fieldEvaluation] = await Promise.all([
    getProjectDetail(id),
    getActivitiesForWalkthrough(),
    getCurrentPricingSnapshot(),
    getFieldEvaluation(id),
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
    <div className="space-y-8">
      {/* ── Page Step Header ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-500 text-white shrink-0">
          <Footprints className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xl font-heading tracking-wider text-slate-800 dark:text-white">
            Paso 2 — Caminata
          </h2>
          <p className="text-sm text-slate-500">
            Evalúa los sistemas del local y luego asigna actividades con horas para cotizar.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           FASE 1 — EVALUACIÓN DE CAMPO
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <FieldEvaluationForm
          projectId={id}
          existing={fieldEvaluation}
        />
      </div>

      {/* ── Visual separator ── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <Calculator className="h-3.5 w-3.5" />
          Fase 2
        </div>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           FASE 2 — ACTIVIDADES Y PRECIOS
      ══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-500 text-white shrink-0">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-slate-800 dark:text-white tracking-wider">
              Fase 2 — Actividades y Precios
            </h3>
            <p className="text-xs text-slate-500">
              Agrega las actividades del proyecto con el personal y horas requeridas.
            </p>
          </div>
        </div>

        <WalkthroughCalculator
          projectId={id}
          activities={serializedActivities}
          snapshot={snapshot}
          existingItems={existingItems}
        />
      </div>

      {/* ── Next step CTA ── */}
      {project.walkthroughItems.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            ✅ {project.walkthroughItems.length} actividad(es) registradas. Continúa con la Cotización.
          </p>
          <Link
            href={`/dashboard/proyectos/${id}/propuesta`}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0"
          >
            Ir a Cotización <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
