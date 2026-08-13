"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createPersonnelMember,
  updatePersonnelMember,
  deletePersonnelMember,
  togglePersonnelMemberActive,
} from "@/app/dashboard/personal/actions";
import {
  Plus, Pencil, Trash2, X, Loader2, CheckCircle2, AlertCircle,
  User, Briefcase, Phone, Mail, ToggleLeft, ToggleRight,
} from "lucide-react";

type PersonnelMember = {
  id: string;
  fullName: string;
  position: string | null;
  phone: string | null;
  email: string | null;
  specialty: string | null;
  isActive: boolean;
  personnelCategoryId: string | null;
  category: { id: string; labelEs: string; name: string } | null;
};

type Category = {
  id: string;
  labelEs: string;
  name: string;
};

const initialState: any = { success: false, error: "" };

function PersonnelMemberForm({
  mode,
  item,
  categories,
  onClose,
}: {
  mode: "create" | "edit";
  item?: PersonnelMember;
  categories: Category[];
  onClose: () => void;
}) {
  const action = mode === "create" ? createPersonnelMember : updatePersonnelMember;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-heading tracking-wider text-slate-800 dark:text-white">
            {mode === "create" ? "Registrar Personal" : "Editar Personal"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-5 space-y-4">
          {mode === "edit" && <input type="hidden" name="id" value={item?.id} />}

          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              name="fullName"
              defaultValue={item?.fullName}
              required
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cargo / Rol</label>
              <input
                name="position"
                defaultValue={item?.position || ""}
                placeholder="Ej. Electricista"
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Especialidad</label>
              <input
                name="specialty"
                defaultValue={item?.specialty || ""}
                placeholder="Ej. Alta tensión"
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
              <input
                name="phone"
                defaultValue={item?.phone || ""}
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={item?.email || ""}
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoría (Opcional)</label>
            <select
              name="personnelCategoryId"
              defaultValue={item?.personnelCategoryId || ""}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700 dark:text-slate-300"
            >
              <option value="">Ninguna (Libre)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.labelEs}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Asignar una categoría ayuda a calcular los costos en base a tarifas por hora.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-10 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Registrar" : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PersonnelList({
  personnel,
  categories,
}: {
  personnel: PersonnelMember[];
  categories: Category[];
}) {
  const [editingItem, setEditingItem] = useState<PersonnelMember | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que deseas eliminar este miembro? No se podrá deshacer.")) return;
    setDeletingId(id);
    await deletePersonnelMember(id);
    setDeletingId(null);
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    setTogglingId(id);
    await togglePersonnelMemberActive(id, !currentStatus);
    setTogglingId(null);
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/50">
        <div>
          <h3 className="font-heading tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-orange-500" />
            Directorio de Personal
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Personas que pueden ser asignadas a proyectos.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Registrar Personal
        </button>
      </div>

      <div className="p-5">
        {personnel.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aún no hay personal registrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personnel.map(p => (
              <div key={p.id} className={`p-4 rounded-xl border transition-colors ${p.isActive ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 opacity-60'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{p.fullName}</h4>
                    {p.position && <p className="text-sm text-slate-500 line-clamp-1">{p.position}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleToggle(p.id, p.isActive)}
                      disabled={togglingId === p.id}
                      className="p-1.5 text-slate-400 hover:text-orange-500 rounded-md transition-colors"
                      title={p.isActive ? "Desactivar" : "Activar"}
                    >
                      {togglingId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : p.isActive ? (
                        <ToggleRight className="h-5 w-5 text-orange-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingItem(p)}
                      className="p-1.5 text-slate-400 hover:text-blue-500 rounded-md transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                    >
                      {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                   {p.category && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span className="truncate">Categoría: <span className="font-medium">{p.category.labelEs}</span></span>
                    </div>
                  )}
                  {p.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{p.phone}</span>
                    </div>
                  )}
                  {p.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

      {isCreating && (
        <PersonnelMemberForm
          mode="create"
          categories={categories}
          onClose={() => setIsCreating(false)}
        />
      )}
      {editingItem && (
        <PersonnelMemberForm
          mode="edit"
          item={editingItem}
          categories={categories}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}
