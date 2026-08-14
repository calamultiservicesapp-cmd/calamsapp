"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  createPersonnelCategory,
  updatePersonnelCategory,
  deletePersonnelCategory,
  togglePersonnelActive,
} from "@/app/dashboard/personal/actions";
import {
  Plus, Pencil, Trash2, X, Loader2, CheckCircle2, AlertCircle,
  Users, DollarSign, ToggleLeft, ToggleRight,
} from "lucide-react";

type PersonnelCategory = {
  id: string;
  name: string;
  labelEs: string;
  labelEn: string;
  hourlyRate: any;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
};

type SerializedPersonnel = Omit<PersonnelCategory, "hourlyRate" | "createdAt" | "updatedAt"> & {
  hourlyRate: string;
  createdAt: string;
  updatedAt: string;
};

const initialState: any = { success: false, error: "" };

function PersonnelForm({
  mode,
  item,
  onClose,
}: {
  mode: "create" | "edit";
  item?: SerializedPersonnel;
  onClose: () => void;
}) {
  const action = mode === "create" ? createPersonnelCategory : updatePersonnelCategory;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-heading tracking-wider text-slate-800 dark:text-white">
            {mode === "create" ? "Nuevo Tipo de Personal" : "Editar Tipo de Personal"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-5 space-y-4">
          {item && <input type="hidden" name="id" value={item.id} />}

          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}

          {mode === "create" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nombre Clave (slug) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="ej. tecnico_especialista"
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-slate-400">Solo letras, números y guiones bajos. Este valor no se puede cambiar.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Etiqueta (Español) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="labelEs"
                defaultValue={item?.labelEs}
                required
                placeholder="ej. Técnico Especialista"
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Label (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="labelEn"
                defaultValue={item?.labelEn}
                required
                placeholder="e.g. Specialist Technician"
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tarifa por Hora ($) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="number"
                name="hourlyRate"
                defaultValue={item?.hourlyRate}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {mode === "create" ? "Crear" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PersonnelTable({ items }: { items: SerializedPersonnel[] }) {
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<SerializedPersonnel | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Solo en mobile: scrollea al top para que el modal sea visible
  function openModal(type: "create" | "edit" | "delete") {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setModal(type);
  }

  async function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await togglePersonnelActive(id, !current);
    });
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deletePersonnelCategory(id);
    setDeletingId(null);
    setModal(null);
    setSelected(null);
  }

  return (
    <>
      {modal === "create" && <PersonnelForm mode="create" onClose={() => setModal(null)} />}
      {modal === "edit" && selected && (
        <PersonnelForm mode="edit" item={selected} onClose={() => { setModal(null); setSelected(null); }} />
      )}
      {modal === "delete" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="font-heading text-slate-800 dark:text-white">Eliminar Tipo de Personal</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿Eliminar <strong>"{selected.labelEs}"</strong>? Solo es posible si no está asignado a ningún proyecto.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setModal(null); setSelected(null); }} className="px-4 h-9 rounded-md border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                disabled={!!deletingId}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <p className="text-sm text-slate-500">
            Los tipos activos aparecen en todos los dropdowns de personal al asignar servicios y proyectos.
          </p>
          <button
            onClick={() => openModal("create")}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nuevo Tipo
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Users className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No hay tipos de personal registrados.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tipo de Personal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Nombre Clave</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tarifa / Hora</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!item.isActive ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{item.labelEs}</p>
                      <p className="text-xs text-slate-400">{item.labelEn}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{item.name}</code>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      ${parseFloat(item.hourlyRate).toFixed(2)}/hr
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(item.id, item.isActive)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                          item.isActive
                            ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {item.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                        {item.isActive ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setSelected(item); openModal("edit"); }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setSelected(item); openModal("delete"); }}
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
      </div>
    </>
  );
}
