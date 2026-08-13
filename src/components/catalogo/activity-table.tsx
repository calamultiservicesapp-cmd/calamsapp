"use client";

import { useActionState, useEffect, useState } from "react";
import { createActivity, updateActivity, deleteActivity } from "@/app/dashboard/catalogo/actions";
import {
  Plus, Pencil, Trash2, X, Loader2, CheckCircle2, AlertCircle, BookOpen, DollarSign,
} from "lucide-react";

type SerializedActivity = {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  defaultPersonnelType: string;
  minHours: string;
  minPrice: string | null;
  maxPrice: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PersonnelOption = { value: string; label: string };

const initialState: any = { success: false, error: "" };

function ActivityForm({
  mode,
  activity,
  personnelOptions,
  onClose,
}: {
  mode: "create" | "edit";
  activity?: SerializedActivity;
  personnelOptions: PersonnelOption[];
  onClose: () => void;
}) {
  const action = mode === "create" ? createActivity : updateActivity;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 my-4">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-heading tracking-wider text-slate-800 dark:text-white">
            {mode === "create" ? "Nuevo Servicio" : "Editar Servicio"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-5 space-y-5">
          {activity && <input type="hidden" name="id" value={activity.id} />}

          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}

          {/* Nombres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nombre (Español) <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="nameEs" defaultValue={activity?.nameEs} required
                placeholder="ej. Instalación de Pisos"
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="nameEn" defaultValue={activity?.nameEn} required
                placeholder="e.g. Floor Installation"
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Descripciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Descripción (Español) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descriptionEs" defaultValue={activity?.descriptionEs} required rows={3}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Description (English) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descriptionEn" defaultValue={activity?.descriptionEn} required rows={3}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Personal + Horas mínimas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Personal por Defecto <span className="text-red-500">*</span>
              </label>
              <select
                name="defaultPersonnelType" defaultValue={activity?.defaultPersonnelType} required
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Seleccionar...</option>
                {personnelOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Horas Mínimas <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number" name="minHours" defaultValue={activity?.minHours}
                  required step="0.5" min="0.5"
                  className="w-full h-10 px-3 pr-10 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="absolute right-3 top-2.5 text-sm text-slate-400">hrs</span>
              </div>
            </div>
          </div>

          {/* Rango de Precio */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900">
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Rango de Precio Referencial (Opcional)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Precio Mínimo ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number" name="minPrice"
                    defaultValue={activity?.minPrice ?? ""}
                    step="0.01" min="0" placeholder="0.00"
                    className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Precio Máximo ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number" name="maxPrice"
                    defaultValue={activity?.maxPrice ?? ""}
                    step="0.01" min="0" placeholder="0.00"
                    className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Este rango es informativo y aparece en el catálogo para referencia del equipo.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose}
              className="px-4 h-10 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button type="submit" disabled={isPending}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {mode === "create" ? "Crear Servicio" : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ id, name, onClose }: { id: string; name: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    setLoading(true);
    await deleteActivity(id);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="font-heading text-slate-800 dark:text-white">Eliminar Servicio</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          ¿Estás seguro de que deseas eliminar <strong>"{name}"</strong>? Esta acción no afectará proyectos existentes.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 h-9 rounded-md border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ActivityTable({
  activities,
  personnelOptions,
}: {
  activities: SerializedActivity[];
  personnelOptions: PersonnelOption[];
}) {
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<SerializedActivity | null>(null);
  const [search, setSearch] = useState("");

  const personnelMap = Object.fromEntries(personnelOptions.map((o) => [o.value, o.label]));

  const filtered = activities.filter(
    (a) =>
      a.nameEs.toLowerCase().includes(search.toLowerCase()) ||
      a.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {modal === "create" && (
        <ActivityForm mode="create" personnelOptions={personnelOptions} onClose={() => setModal(null)} />
      )}
      {modal === "edit" && selected && (
        <ActivityForm
          mode="edit" activity={selected} personnelOptions={personnelOptions}
          onClose={() => { setModal(null); setSelected(null); }}
        />
      )}
      {modal === "delete" && selected && (
        <DeleteConfirm id={selected.id} name={selected.nameEs} onClose={() => { setModal(null); setSelected(null); }} />
      )}

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <input
            type="text" placeholder="Buscar servicio..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-72"
          />
          <button
            onClick={() => setModal("create")}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nuevo Servicio
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <BookOpen className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No hay servicios registrados aún.</p>
              <p className="text-xs mt-1">Usa el botón "Nuevo Servicio" para agregar el primero.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicio (ES / EN)</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Personal</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Horas Mín.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Rango Precio</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((activity) => (
                    <tr key={activity.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{activity.nameEs}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{activity.nameEn}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {personnelMap[activity.defaultPersonnelType] ?? activity.defaultPersonnelType}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-slate-600 dark:text-slate-400">
                        {activity.minHours} hrs
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-600 dark:text-slate-400">
                        {activity.minPrice && activity.maxPrice ? (
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">
                            ${parseFloat(activity.minPrice).toLocaleString()} – ${parseFloat(activity.maxPrice).toLocaleString()}
                          </span>
                        ) : activity.minPrice ? (
                          <span className="text-xs text-slate-500">desde ${parseFloat(activity.minPrice).toLocaleString()}</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => { setSelected(activity); setModal("edit"); }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setSelected(activity); setModal("delete"); }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400">{filtered.length} servicio(s) encontrado(s).</p>
      </div>
    </>
  );
}
