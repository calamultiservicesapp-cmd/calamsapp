"use client";

import { useState, useTransition, useRef } from "react";
import { submitFieldEvaluation } from "@/app/dashboard/proyectos/[id]/actions";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
  Droplets, Zap, PaintBucket, Toilet, Layers3,
  Wind, Hammer, Leaf, Loader2, Save, ClipboardList,
  Camera, ImagePlus, X, UploadCloud,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SystemCondition = "bueno" | "regular" | "malo" | "critico";
type SystemUrgency = "inmediato" | "treinta_dias" | "preventivo" | "na";
type RecommendedPlan = "essential" | "professional" | "op_partner";

type SystemState = {
  systemCode: string;
  systemName: string;
  condition: SystemCondition | null;
  urgency: SystemUrgency | null;
  areasInspected: string;
  observations: string;
  photoCount: number;
  photoUrls: string[];
};

type EvaluationHeader = {
  evaluatorName: string;
  visitDate: string;
  visitDuration: string;
  recommendedPlan: RecommendedPlan | null;
  planJustification: string;
  priority01Notes: string;
  priority02Notes: string;
  priority03Notes: string;
  priority04Notes: string;
  criticalSafetyNotes: string;
  refToGlitz: boolean;
  verbalSummary: boolean;
  additionalNotes: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEMS: { code: string; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { code: "B1", name: "Plomería y Drenajes", icon: Droplets },
  { code: "B2", name: "Iluminación y Eléctrico", icon: Zap },
  { code: "B3", name: "Pintura, Paredes y Acabados", icon: PaintBucket },
  { code: "B4", name: "Baños (Todos los Niveles)", icon: Toilet },
  { code: "B5", name: "Pisos, Escaleras y Estructuras", icon: Layers3 },
  { code: "B6", name: "Ventilación y Mecánico (HVAC)", icon: Wind },
  { code: "B7", name: "Reparaciones Interiores — Drywall, Molduras y Herrajes", icon: Hammer },
  { code: "B8", name: "Sistemas Especiales — Vegetación, Irrigación, Elementos Únicos", icon: Leaf },
];

const conditionConfig: Record<SystemCondition, { label: string; color: string; dot: string }> = {
  bueno:   { label: "Bueno",   color: "bg-emerald-500 text-white border-emerald-500", dot: "bg-emerald-500" },
  regular: { label: "Regular", color: "bg-amber-400 text-white border-amber-400",     dot: "bg-amber-400" },
  malo:    { label: "Malo",    color: "bg-orange-500 text-white border-orange-500",   dot: "bg-orange-500" },
  critico: { label: "Crítico", color: "bg-red-600 text-white border-red-600",         dot: "bg-red-600" },
};

const urgencyConfig: Record<SystemUrgency, { label: string }> = {
  inmediato:    { label: "⚡ Inmediato" },
  treinta_dias: { label: "📅 Dentro de 30 días" },
  preventivo:   { label: "🔧 Preventivo / Programado" },
  na:           { label: "— N/A" },
};

const planConfig: Record<RecommendedPlan, { label: string; sublabel: string }> = {
  essential:    { label: "ESSENTIAL",    sublabel: "Visitas mensuales · Oficinas / Bajo tráfico" },
  professional: { label: "PROFESSIONAL", sublabel: "Visitas quincenales · Restaurantes / Retail / Bares" },
  op_partner:   { label: "OP. PARTNER",  sublabel: "Visitas semanales · Alto volumen / Multi-nivel / Críticos" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getConditionBorderClass(condition: SystemCondition | null): string {
  if (!condition) return "border-slate-200 dark:border-slate-700";
  return {
    bueno:   "border-emerald-400",
    regular: "border-amber-400",
    malo:    "border-orange-400",
    critico: "border-red-500",
  }[condition];
}

// ─── Sub-component: System Card ───────────────────────────────────────────────

function PhotoUploader({
  projectId,
  systemCode,
  photoUrls,
  onPhotosChange,
}: {
  projectId: string;
  systemCode: string;
  photoUrls: string[];
  onPhotosChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);
    const supabase = createClient();
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const path = `field-photos/${projectId}/${systemCode}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("project-photos").upload(path, file, { upsert: false });
      if (error) {
        setUploadError("Error al subir una imagen. Verifica el bucket en Supabase.");
        continue;
      }
      const { data } = supabase.storage.from("project-photos").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    setUploading(false);
    if (newUrls.length > 0) onPhotosChange([...photoUrls, ...newUrls]);
  }

  async function handleDelete(url: string) {
    const supabase = createClient();
    // Extract path from URL
    const marker = "/project-photos/";
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const path = url.slice(idx + marker.length);
      await supabase.storage.from("project-photos").remove([path]);
    }
    onPhotosChange(photoUrls.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
        <Camera className="h-3.5 w-3.5" /> Evidencia Fotográfica
        {photoUrls.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 text-xs font-bold">{photoUrls.length}</span>
        )}
      </p>

      {/* Thumbnails grid */}
      {photoUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photoUrls.map((url) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Foto de área" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(url)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <div
        className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/30"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
        ) : (
          <UploadCloud className="h-5 w-5 text-slate-400" />
        )}
        <p className="text-xs text-slate-500">
          {uploading ? "Subiendo fotos…" : "Arrastra fotos aquí o haz clic para seleccionar"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploadError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" /> {uploadError}
        </p>
      )}
    </div>
  );
}

function SystemCard({
  sys,
  state,
  projectId,
  onChange,
}: {
  sys: typeof SYSTEMS[number];
  state: SystemState;
  projectId: string;
  onChange: (s: Partial<SystemState>) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = sys.icon;
  const borderClass = getConditionBorderClass(state.condition);
  const hasData = state.condition !== null || state.observations.trim() !== "";

  return (
    <div className={`rounded-xl border-2 transition-colors overflow-hidden ${borderClass}`}>
      {/* Header row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
          <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sys.code}</span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{sys.name}</p>
          </div>
          {state.condition && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-2 h-2 rounded-full ${conditionConfig[state.condition].dot}`} />
              <span className="text-xs text-slate-500">{conditionConfig[state.condition].label}</span>
              {state.urgency && state.urgency !== "na" && (
                <span className="text-xs text-slate-400">· {urgencyConfig[state.urgency].label}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {state.photoUrls.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-medium">
              <Camera className="h-3 w-3" /> {state.photoUrls.length}
            </span>
          )}
          {hasData && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-medium">
              <CheckCircle2 className="h-3 w-3" /> Registrado
            </span>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-5">

          {/* Condition */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Condición</p>
            <div className="flex flex-wrap gap-2">
              {(["bueno", "regular", "malo", "critico"] as SystemCondition[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ condition: state.condition === c ? null : c })}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold border-2 transition-all ${
                    state.condition === c
                      ? conditionConfig[c].color
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {conditionConfig[c].label}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Urgencia</p>
            <div className="flex flex-wrap gap-2">
              {(["inmediato", "treinta_dias", "preventivo", "na"] as SystemUrgency[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => onChange({ urgency: state.urgency === u ? null : u })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border-2 transition-all ${
                    state.urgency === u
                      ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {urgencyConfig[u].label}
                </button>
              ))}
            </div>
          </div>

          {/* Areas inspected */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
              Áreas Inspeccionadas
            </label>
            <input
              type="text"
              value={state.areasInspected}
              onChange={(e) => onChange({ areasInspected: e.target.value })}
              placeholder="Ej: Zona de barra, tomacorrientes, área de sanitarios…"
              className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
              Observaciones de Campo
            </label>
            <textarea
              value={state.observations}
              onChange={(e) => onChange({ observations: e.target.value })}
              placeholder="Describe el estado actual, hallazgos relevantes…"
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Photo uploader */}
          <PhotoUploader
            projectId={projectId}
            systemCode={sys.code}
            photoUrls={state.photoUrls}
            onPhotosChange={(urls) => onChange({ photoUrls: urls, photoCount: urls.length })}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ExistingEvaluation = {
  evaluatorName: string | null;
  visitDate: Date | string | null;
  visitDuration: string | null;
  recommendedPlan: RecommendedPlan | null;
  planJustification: string | null;
  priority01Notes: string | null;
  priority02Notes: string | null;
  priority03Notes: string | null;
  priority04Notes: string | null;
  criticalSafetyNotes: string | null;
  refToGlitz: boolean | null;
  verbalSummary: boolean | null;
  additionalNotes: string | null;
  systemInspections: {
    systemCode: string;
    systemName: string;
    condition: SystemCondition | null;
    urgency: SystemUrgency | null;
    areasInspected: string | null;
    observations: string | null;
    photoCount: number;
  }[];
};

export function FieldEvaluationForm({
  projectId,
  existing,
}: {
  projectId: string;
  existing?: ExistingEvaluation | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPriorities, setShowPriorities] = useState(false);

  const [systems, setSystems] = useState<SystemState[]>(() =>
    SYSTEMS.map((s) => {
      const ex = existing?.systemInspections.find((i) => i.systemCode === s.code);
      return {
        systemCode: s.code,
        systemName: s.name,
        condition: (ex?.condition as SystemCondition | null) ?? null,
        urgency: (ex?.urgency as SystemUrgency | null) ?? null,
        areasInspected: ex?.areasInspected ?? "",
        observations: ex?.observations ?? "",
        photoCount: ex?.photoCount ?? 0,
        photoUrls: (ex as any)?.photoUrls ?? [],
      };
    })
  );

  const [header, setHeader] = useState<EvaluationHeader>({
    evaluatorName: existing?.evaluatorName ?? "",
    visitDate: existing?.visitDate
      ? new Date(existing.visitDate).toISOString().split("T")[0]
      : "",
    visitDuration: existing?.visitDuration ?? "",
    recommendedPlan: (existing?.recommendedPlan as RecommendedPlan | null) ?? null,
    planJustification: existing?.planJustification ?? "",
    priority01Notes: existing?.priority01Notes ?? "",
    priority02Notes: existing?.priority02Notes ?? "",
    priority03Notes: existing?.priority03Notes ?? "",
    priority04Notes: existing?.priority04Notes ?? "",
    criticalSafetyNotes: existing?.criticalSafetyNotes ?? "",
    refToGlitz: existing?.refToGlitz ?? false,
    verbalSummary: existing?.verbalSummary ?? false,
    additionalNotes: existing?.additionalNotes ?? "",
  });

  function updateSystem(index: number, changes: Partial<SystemState>) {
    setSystems((prev) => prev.map((s, i) => (i === index ? { ...s, ...changes } : s)));
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("projectId", projectId);
      fd.set("evaluatorName", header.evaluatorName);
      fd.set("visitDate", header.visitDate);
      fd.set("visitDuration", header.visitDuration);
      if (header.recommendedPlan) fd.set("recommendedPlan", header.recommendedPlan);
      fd.set("planJustification", header.planJustification);
      fd.set("priority01Notes", header.priority01Notes);
      fd.set("priority02Notes", header.priority02Notes);
      fd.set("priority03Notes", header.priority03Notes);
      fd.set("priority04Notes", header.priority04Notes);
      fd.set("criticalSafetyNotes", header.criticalSafetyNotes);
      fd.set("refToGlitz", String(header.refToGlitz));
      fd.set("verbalSummary", String(header.verbalSummary));
      fd.set("additionalNotes", header.additionalNotes);
      fd.set("systems", JSON.stringify(systems));

      const result = await submitFieldEvaluation(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    });
  }

  const criticCount      = systems.filter((s) => s.condition === "critico").length;
  const maloCount        = systems.filter((s) => s.condition === "malo").length;
  const inmediCount      = systems.filter((s) => s.urgency === "inmediato").length;
  const totalPhotoCount  = systems.reduce((sum, s) => sum + s.photoUrls.length, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-700 text-white shrink-0">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-slate-800 dark:text-white tracking-wider">
              Fase 1 — Evaluación de Campo
            </h3>
            <p className="text-xs text-slate-500">Documenta el estado de cada sistema antes de cotizar.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {criticCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-semibold">
              🔴 {criticCount} Crítico{criticCount > 1 ? "s" : ""}
            </span>
          )}
          {maloCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-semibold">
              🟠 {maloCount} Malo{maloCount > 1 ? "s" : ""}
            </span>
          )}
          {inmediCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 font-semibold">
              ⚡ {inmediCount} Inmediato{inmediCount > 1 ? "s" : ""}
            </span>
          )}
          {totalPhotoCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-semibold">
              <Camera className="h-3 w-3" /> {totalPhotoCount} Foto{totalPhotoCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Visit Info ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Datos de la Visita</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Evaluador</label>
            <input
              type="text"
              value={header.evaluatorName}
              onChange={(e) => setHeader((h) => ({ ...h, evaluatorName: e.target.value }))}
              placeholder="Nombre del técnico"
              className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Fecha de Visita</label>
            <input
              type="date"
              value={header.visitDate}
              onChange={(e) => setHeader((h) => ({ ...h, visitDate: e.target.value }))}
              className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Duración de la Visita</label>
            <input
              type="text"
              value={header.visitDuration}
              onChange={(e) => setHeader((h) => ({ ...h, visitDuration: e.target.value }))}
              placeholder="Ej: 1h 30min"
              className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* ── System Cards B1–B8 ── */}
      <div className="space-y-3">
        {SYSTEMS.map((sys, i) => (
          <SystemCard
            key={sys.code}
            sys={sys}
            state={systems[i]}
            projectId={projectId}
            onChange={(changes) => updateSystem(i, changes)}
          />
        ))}
      </div>

      {/* ── Recommended Plan ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan Recomendado</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["essential", "professional", "op_partner"] as RecommendedPlan[]).map((plan) => {
            const cfg = planConfig[plan];
            const isSelected = header.recommendedPlan === plan;
            const selectedStyle =
              plan === "essential"
                ? "bg-slate-700 border-slate-700 text-white"
                : plan === "professional"
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-blue-600 border-blue-600 text-white";
            return (
              <button
                key={plan}
                type="button"
                onClick={() =>
                  setHeader((h) => ({
                    ...h,
                    recommendedPlan: h.recommendedPlan === plan ? null : plan,
                  }))
                }
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? selectedStyle
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                }`}
              >
                {isSelected && <CheckCircle2 className="h-4 w-4 mb-0.5" />}
                <span className="text-xs font-bold tracking-widest">{cfg.label}</span>
                <span className={`text-xs leading-tight ${isSelected ? "opacity-90" : "text-slate-500"}`}>
                  {cfg.sublabel}
                </span>
              </button>
            );
          })}
        </div>
        {header.recommendedPlan && (
          <div>
            <label className="text-xs text-slate-500 block mb-1">Justificación del Plan</label>
            <textarea
              value={header.planJustification}
              onChange={(e) => setHeader((h) => ({ ...h, planJustification: e.target.value }))}
              placeholder="Razón por la que se recomienda este plan…"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        )}
      </div>

      {/* ── Priorities & Closure ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPriorities(!showPriorities)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Resumen de Prioridades y Cierre
          </p>
          {showPriorities ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {showPriorities && (
          <div className="p-4 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-800">
            {[
              { key: "priority01Notes" as const, label: "P01 — Acción Inmediata", placeholder: "Problemas activos: fugas, fallas eléctricas…" },
              { key: "priority02Notes" as const, label: "P02 — Atender en 30 Días", placeholder: "Acabados, pintura y detalles estéticos/funcionales…" },
              { key: "priority03Notes" as const, label: "P03 — Trabajo Preventivo", placeholder: "Mantenimiento regular y preventivo…" },
              { key: "priority04Notes" as const, label: "P04 — Protección a Largo Plazo", placeholder: "Inspección periódica y cuidado de estructuras…" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">{label}</label>
                <textarea
                  value={header[key]}
                  onChange={(e) => setHeader((h) => ({ ...h, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Observaciones Críticas de Seguridad
              </label>
              <textarea
                value={header.criticalSafetyNotes}
                onChange={(e) => setHeader((h) => ({ ...h, criticalSafetyNotes: e.target.value }))}
                placeholder="N/A si no aplica"
                rows={2}
                className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={header.refToGlitz}
                  onChange={(e) => setHeader((h) => ({ ...h, refToGlitz: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 accent-orange-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">¿Referido a Glitz Janitorial?</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={header.verbalSummary}
                  onChange={(e) => setHeader((h) => ({ ...h, verbalSummary: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 accent-orange-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">¿Resumen verbal dado al cliente?</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Notas Adicionales / Contexto de la Conversación
              </label>
              <textarea
                value={header.additionalNotes}
                onChange={(e) => setHeader((h) => ({ ...h, additionalNotes: e.target.value }))}
                placeholder="Todo lo conversado previamente a la firma/acuerdo…"
                rows={2}
                className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Feedback & Save ── */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-md flex items-center gap-2 text-sm border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Evaluación de campo guardada correctamente.
        </div>
      )}

      {/* ── Total photo summary ── */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Camera className="h-4 w-4 text-blue-500" />
          <span className="font-medium">Total de fotos tomadas durante la caminata</span>
        </div>
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">
          {totalPhotoCount}
        </span>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 h-11 px-8 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar Evaluación
        </button>
      </div>
    </div>
  );
}
