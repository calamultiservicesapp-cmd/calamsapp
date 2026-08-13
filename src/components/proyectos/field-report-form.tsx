"use client";

import { useActionState, useState, useTransition, useRef } from "react";
import { saveFieldReport, uploadActivityPhoto, deleteActivityPhoto } from "@/app/dashboard/proyectos/[id]/informe/actions";
import {
  CheckCircle2, AlertTriangle, XCircle, ClipboardCheck,
  Loader2, AlertCircle, ChevronDown, ChevronUp, Camera, Trash2, Plus, X,
} from "lucide-react";
import Image from "next/image";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

type WalkthroughItem = {
  id: string;
  activityId: string;
  activity: { nameEs: string; descriptionEs: string };
  personnelType: string;
  hours: string;
  fieldReportItem: {
    status: "completado" | "con_desviacion" | "no_completado";
    notes: string | null;
    photos?: Photo[];
  } | null;
};

type Props = {
  projectId: string;
  items: WalkthroughItem[];
};

type ItemState = {
  walkthroughItemId: string;
  status: "completado" | "con_desviacion" | "no_completado";
  notes: string;
};

const statusConfig = {
  completado: {
    label: "Completado",
    icon: CheckCircle2,
    color: "bg-green-500 text-white",
    border: "border-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  con_desviacion: {
    label: "Con Desviación",
    icon: AlertTriangle,
    color: "bg-amber-500 text-white",
    border: "border-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  no_completado: {
    label: "No Completado",
    icon: XCircle,
    color: "bg-red-500 text-white",
    border: "border-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
};

const initialState: any = { success: false, error: "" };

function PhotoUploader({
  item,
  projectId,
}: {
  item: WalkthroughItem;
  projectId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const photos = item.fieldReportItem?.photos ?? [];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreviewUrl(URL.createObjectURL(f));
  }

  function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Selecciona una foto primero."); return; }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("caption", caption);
    fd.append("walkthroughItemId", item.id);
    fd.append("projectId", projectId);

    startTransition(async () => {
      const result = await uploadActivityPhoto(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowForm(false);
        setCaption("");
        setPreviewUrl(null);
        setError("");
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  function handleDelete(photoId: string) {
    setDeletingId(photoId);
    startTransition(async () => {
      await deleteActivityPhoto(photoId, projectId);
      setDeletingId(null);
    });
  }

  return (
    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700 mt-3">
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
        Fotos de la actividad:
      </p>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="aspect-square relative">
                <Image
                  src={photo.url}
                  alt={photo.caption ?? "Foto de actividad"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              {photo.caption && (
                <div className="p-1.5 bg-white dark:bg-slate-900">
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{photo.caption}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
                className="absolute top-1 right-1 p-1 rounded-md bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar foto"
              >
                {deletingId === photo.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload form */}
      {showForm ? (
        <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 space-y-2">
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{error}
            </p>
          )}
          {previewUrl && (
            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-100">
              <Image src={previewUrl} alt="Vista previa" fill className="object-contain" sizes="100vw" />
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-xs w-full text-slate-600 dark:text-slate-400 file:mr-2 file:px-3 file:py-1 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
          />
          <input
            type="text"
            placeholder="Nota o explicación de la foto..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Subir Foto
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setPreviewUrl(null); setError(""); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <X className="h-3 w-3" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-500 hover:text-orange-500 hover:border-orange-400 transition-colors"
        >
          <Camera className="h-3.5 w-3.5" />
          Agregar Foto
        </button>
      )}
    </div>
  );
}

function FieldReportItemRow({
  item,
  value,
  onChange,
  projectId,
}: {
  item: WalkthroughItem;
  value: ItemState;
  onChange: (v: ItemState) => void;
  projectId: string;
}) {
  const [open, setOpen] = useState(false);
  const sc = statusConfig[value.status];
  const Icon = sc.icon;

  return (
    <div className={`rounded-xl border-2 ${sc.border} overflow-hidden transition-colors`}>
      <div
        className={`flex items-center gap-3 p-4 cursor-pointer ${sc.bg}`}
        onClick={() => setOpen(!open)}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 dark:text-slate-200 text-sm leading-tight">
            {item.activity.nameEs}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {item.personnelType.replace("_", " ")} · {item.hours}h
            {(item.fieldReportItem?.photos?.length ?? 0) > 0 && (
              <span className="ml-2 inline-flex items-center gap-0.5 text-orange-500">
                <Camera className="h-3 w-3" />
                {item.fieldReportItem!.photos!.length} foto{item.fieldReportItem!.photos!.length > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>
            {sc.label}
          </span>
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </div>

      {open && (
        <div className="p-4 bg-white dark:bg-slate-900 space-y-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 italic">{item.activity.descriptionEs}</p>

          {/* Status buttons */}
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Estado de la actividad:</p>
            <div className="flex gap-2 flex-wrap">
              {(["completado", "con_desviacion", "no_completado"] as const).map((s) => {
                const cfg = statusConfig[s];
                const SIcon = cfg.icon;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ ...value, status: s })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border-2 transition-colors ${
                      value.status === s
                        ? cfg.color + " border-transparent"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <SIcon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
              Notas / Observaciones:
            </label>
            <textarea
              value={value.notes}
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
              placeholder="Describe brevemente lo que ocurrió…"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Photos */}
          <PhotoUploader item={item} projectId={projectId} />
        </div>
      )}
    </div>
  );
}

export function FieldReportForm({ projectId, items }: Props) {
  const [state, formAction, isPending] = useActionState(saveFieldReport, initialState);
  const [itemStates, setItemStates] = useState<ItemState[]>(
    items.map((item) => ({
      walkthroughItemId: item.id,
      status: item.fieldReportItem?.status ?? "no_completado",
      notes: item.fieldReportItem?.notes ?? "",
    }))
  );

  const completedCount = itemStates.filter((i) => i.status === "completado").length;
  const desvCount = itemStates.filter((i) => i.status === "con_desviacion").length;
  const noCount = itemStates.filter((i) => i.status === "no_completado").length;

  return (
    <form
      action={async (fd: FormData) => {
        fd.append("projectId", projectId);
        fd.append("items", JSON.stringify(itemStates));
        await formAction(fd);
      }}
      className="space-y-4"
    >
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2 text-sm border border-green-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          ¡Informe guardado correctamente!
        </div>
      )}

      {/* Summary bar */}
      <div className="flex gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" /> {completedCount} Completadas
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
          <AlertTriangle className="h-3.5 w-3.5" /> {desvCount} Con Desviación
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
          <XCircle className="h-3.5 w-3.5" /> {noCount} No Completadas
        </span>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <FieldReportItemRow
            key={item.id}
            item={item}
            value={itemStates[idx]}
            projectId={projectId}
            onChange={(v) => {
              const next = [...itemStates];
              next[idx] = v;
              setItemStates(next);
            }}
          />
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
          Guardar Informe
        </button>
      </div>
    </form>
  );
}
