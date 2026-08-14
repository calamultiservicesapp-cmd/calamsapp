"use client";

import { useActionState, useEffect, useState } from "react";
import { createClientAction, updateClientAction, deleteClient } from "@/app/dashboard/clientes/actions";
import { Plus, Pencil, Trash2, X, Loader2, CheckCircle2, AlertCircle, Users, Mail, Phone, MapPin, FolderKanban } from "lucide-react";
import Link from "next/link";

type ClientWithCount = {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  _count: { projects: number };
};

const initialState: any = { success: false, error: "" };

function ClientForm({
  mode,
  client,
  onClose,
}: {
  mode: "create" | "edit";
  client?: ClientWithCount;
  onClose: () => void;
}) {
  const action = mode === "create" ? createClientAction : updateClientAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-heading tracking-wider text-slate-800 dark:text-white">
            {mode === "create" ? "Nuevo Cliente" : "Editar Cliente"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <form action={formAction} className="p-5 space-y-4">
          {client && <input type="hidden" name="id" value={client.id} />}

          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />{state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre / Empresa <span className="text-red-500">*</span></label>
            <input type="text" name="name" defaultValue={client?.name} required placeholder="ej. Smith Family" className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Persona de Contacto</label>
            <input type="text" name="contactName" defaultValue={client?.contactName ?? ""} placeholder="ej. John Smith" className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input type="email" name="email" defaultValue={client?.email ?? ""} placeholder="john@email.com" className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
              <input type="tel" name="phone" defaultValue={client?.phone ?? ""} placeholder="+1 (555) 000-0000" className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dirección</label>
            <input type="text" name="address" defaultValue={client?.address ?? ""} placeholder="ej. 123 Main St, Toronto, ON" className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-4 h-10 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {mode === "create" ? "Crear Cliente" : "Guardar"}
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
    await deleteClient(id);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full"><Trash2 className="h-5 w-5 text-red-600" /></div>
          <h3 className="font-heading text-slate-800 dark:text-white">Eliminar Cliente</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">¿Eliminar <strong>"{name}"</strong>? Los proyectos existentes no se verán afectados.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 h-9 rounded-md border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleDelete} disabled={loading} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClientTable({ clients }: { clients: ClientWithCount[] }) {
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<ClientWithCount | null>(null);
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contactName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {modal === "create" && <ClientForm mode="create" onClose={() => setModal(null)} />}
      {modal === "edit" && selected && <ClientForm mode="edit" client={selected} onClose={() => { setModal(null); setSelected(null); }} />}
      {modal === "delete" && selected && <DeleteConfirm id={selected.id} name={selected.name} onClose={() => { setModal(null); setSelected(null); }} />}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-72" />
          <button onClick={() => setModal("create")} className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0">
            <Plus className="h-4 w-4" />Nuevo Cliente
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Users className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No hay clientes registrados aún.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Dirección</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Proyectos</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{client.name}</p>
                        {client.email && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-400">
                        <p>{client.contactName ?? "—"}</p>
                        {client.phone && <p className="text-xs text-slate-400 flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</p>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {client.address ? (
                          <span className="flex items-center gap-1 text-slate-500 text-xs"><MapPin className="h-3 w-3 shrink-0" />{client.address}</span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                          <FolderKanban className="h-3 w-3" />{client._count.projects}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link href={`/dashboard/clientes/${client.id}`} className="p-1.5 rounded-md text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50 transition-colors" title="Ver Historial">
                            <FolderKanban className="h-4 w-4" />
                          </Link>
                          <button onClick={() => { setSelected(client); setModal("edit"); }} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => { setSelected(client); setModal("delete"); }} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400">{filtered.length} cliente(s).</p>
      </div>
    </>
  );
}
