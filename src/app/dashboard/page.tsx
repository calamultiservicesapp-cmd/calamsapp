import {
  FolderKanban,
  Users,
  DollarSign,
  CalendarDays,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "./actions";

export default async function DashboardPage() {
  const data = await getDashboardStats();

  const stats = [
    { label: "Proyectos Activos", value: data.stats.proyectosActivos, icon: FolderKanban, href: "/dashboard/proyectos", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50" },
    { label: "Servicios Rápidos", value: data.stats.quickJobsActivos, icon: Zap, href: "/dashboard/servicios-rapidos", color: "text-orange-500 bg-orange-50 dark:bg-orange-950/50" },
    { label: "Clientes", value: data.stats.clientes, icon: Users, href: "/dashboard/clientes", color: "text-violet-600 bg-violet-50 dark:bg-violet-950/50" },
    { label: "Citas Esta Semana", value: data.stats.citasEstaSemana, icon: CalendarDays, href: "/dashboard/citas", color: "text-green-600 bg-green-50 dark:bg-green-950/50" },
  ];

  const pipeline = [
    { status: "Cita", count: data.pipeline.cita, color: "bg-slate-400" },
    { status: "Caminata", count: data.pipeline.caminata, color: "bg-blue-500" },
    { status: "Propuesta", count: data.pipeline.propuesta, color: "bg-yellow-500" },
    { status: "Aprobado", count: data.pipeline.aprobado, color: "bg-green-500" },
    { status: "Asignado", count: data.pipeline.asignado, color: "bg-teal-500" },
    { status: "Ejecución", count: data.pipeline.en_ejecucion, color: "bg-orange-500" },
    { status: "Informe", count: data.pipeline.informe, color: "bg-purple-500" },
    { status: "Facturado", count: data.pipeline.facturado, color: "bg-violet-500" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading tracking-wider text-slate-900 dark:text-white">
          Panel de Control
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Vista general del estado operativo de CALA Multiservices.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
            >
              <div className={`p-3 rounded-lg ${stat.color} transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pipeline */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-heading tracking-wider text-slate-800 dark:text-slate-200">
            Pipeline de Proyectos
          </h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {pipeline.map((stage) => (
            <div key={stage.status} className="flex flex-col items-center gap-2">
              <div className={`w-full h-2 rounded-full ${stage.color} opacity-70`} />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{stage.count}</span>
              <span className="text-xs text-slate-500 text-center">{stage.status}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-6 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Datos actualizados en tiempo real
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/dashboard/costos" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
          <DollarSign className="h-6 w-6 text-orange-500 mb-3" />
          <h3 className="font-heading text-slate-800 dark:text-white">Hoja de Costos</h3>
          <p className="text-sm text-slate-500 mt-1">Configura tarifas y márgenes del sistema.</p>
        </Link>
        <Link href="/dashboard/catalogo" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
          <FolderKanban className="h-6 w-6 text-blue-500 mb-3" />
          <h3 className="font-heading text-slate-800 dark:text-white">Catálogo de Actividades</h3>
          <p className="text-sm text-slate-500 mt-1">Administra el catálogo bilingüe de servicios.</p>
        </Link>
        <Link href="/dashboard/clientes" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
          <Users className="h-6 w-6 text-violet-500 mb-3" />
          <h3 className="font-heading text-slate-800 dark:text-white">Clientes</h3>
          <p className="text-sm text-slate-500 mt-1">Gestiona la base de clientes activos.</p>
        </Link>
      </div>
    </div>
  );
}
