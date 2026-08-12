import { Metadata } from "next";
import { getClients } from "./actions";
import { ClientTable } from "@/components/clientes/client-table";

export const metadata: Metadata = {
  title: "Clientes | CALA Multiservices",
};

export default async function ClientesPage() {
  const clients = await getClients();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">
          Clientes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Base de datos de clientes activos y su historial de proyectos.
        </p>
      </div>
      <ClientTable clients={clients} />
    </div>
  );
}
