import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { ClipboardList, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Mis Tareas | CALA Multiservices",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  cita:         { label: "Cita Pendiente",  color: "text-slate-500" },
  caminata:     { label: "Caminata",        color: "text-blue-600" },
  propuesta:    { label: "Propuesta",       color: "text-yellow-600" },
  aprobado:     { label: "Aprobado",        color: "text-green-600" },
  asignado:     { label: "Asignado",        color: "text-teal-600" },
  en_ejecucion: { label: "En Ejecución",    color: "text-orange-600" },
  informe:      { label: "Informe",         color: "text-purple-600" },
  facturado:    { label: "Facturado",       color: "text-violet-600" },
  cerrado:      { label: "Cerrado",         color: "text-slate-400" },
};

export default async function MisTareasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const assignments = await prisma.projectAssignment.findMany({
    where: { personnelId: user.id },
    include: {
      project: {
        include: {
          client: { select: { name: true, address: true, phone: true } },
          walkthroughItems: {
            include: { activity: { select: { nameEs: true } } },
          },
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-2">
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">Mis Tareas</h1>
        <p className="text-slate-500 mt-1">Proyectos asignados a ti.</p>
      </div>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <ClipboardList className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">No tienes proyectos asignados actualmente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((asgn) => {
            const sc = statusConfig[asgn.project.status] ?? { label: asgn.project.status, color: "text-slate-500" };
            return (
              <div
                key={asgn.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{asgn.project.name}</h2>
                    <p className="text-sm text-slate-500">{asgn.project.client.name}</p>
                  </div>
                  <span className={`text-sm font-medium ${sc.color}`}>{sc.label}</span>
                </div>

                <div className="flex gap-4 text-sm text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {new Date(asgn.startDate).toLocaleDateString("es-CA")} – {new Date(asgn.endDate).toLocaleDateString("es-CA")}
                  </span>
                  {asgn.project.client.address && (
                    <span className="flex items-center gap-1.5">
                      📍 {asgn.project.client.address}
                    </span>
                  )}
                  {asgn.project.client.phone && (
                    <a href={`tel:${asgn.project.client.phone}`} className="flex items-center gap-1.5 text-blue-500 hover:underline">
                      📞 {asgn.project.client.phone}
                    </a>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">Actividades</p>
                  <ul className="space-y-1.5">
                    {asgn.project.walkthroughItems.map((wi) => (
                      <li key={wi.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="h-4 w-4 text-slate-300 shrink-0" />
                        {wi.activity.nameEs} — {wi.hours.toString()} hrs
                      </li>
                    ))}
                  </ul>
                </div>

                {asgn.notes && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">{asgn.notes}</p>
                  </div>
                )}

                <div className="pt-2">
                  <a 
                    href={`/dashboard/mis-tareas/${asgn.project.id}`}
                    className="flex w-full items-center justify-center gap-2 h-10 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
                  >
                    Reportar Progreso →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
