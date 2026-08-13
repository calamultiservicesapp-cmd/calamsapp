"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Footprints,
  FileText,
  CalendarCheck,
  ClipboardCheck,
  Receipt,
  CheckCircle2,
  Lock,
} from "lucide-react";

type Step = {
  id: number;
  label: string;
  sublabel: string;
  href: string;
  icon: React.ElementType;
  // Which DB statuses count this step as "unlocked"
  unlockedAt: string[];
  // Which DB statuses count this step as "completed"
  completedAt: string[];
};

const STATUS_ORDER = [
  "cita",
  "caminata",
  "propuesta",
  "aprobado",
  "asignado",
  "en_ejecucion",
  "informe",
  "facturado",
  "cerrado",
];

function statusIndex(s: string) {
  return STATUS_ORDER.indexOf(s);
}

export function ProjectStepper({
  projectId,
  status,
}: {
  projectId: string;
  status: string;
}) {
  const pathname = usePathname();
  const base = `/dashboard/proyectos/${projectId}`;
  const currentIdx = statusIndex(status);

  const steps: Step[] = [
    {
      id: 1,
      label: "Propuesta Inicial",
      sublabel: "Cita con el cliente",
      href: base,
      icon: CalendarDays,
      unlockedAt: STATUS_ORDER, // always accessible
      completedAt: ["caminata", "propuesta", "aprobado", "asignado", "en_ejecucion", "informe", "facturado", "cerrado"],
    },
    {
      id: 2,
      label: "Caminata",
      sublabel: "Catálogo de actividades",
      href: `${base}/caminata`,
      icon: Footprints,
      unlockedAt: STATUS_ORDER, // always accessible to add items
      completedAt: ["propuesta", "aprobado", "asignado", "en_ejecucion", "informe", "facturado", "cerrado"],
    },
    {
      id: 3,
      label: "Cotización",
      sublabel: "Propuesta y descuentos",
      href: `${base}/propuesta`,
      icon: FileText,
      unlockedAt: ["caminata", "propuesta", "aprobado", "asignado", "en_ejecucion", "informe", "facturado", "cerrado"],
      completedAt: ["aprobado", "asignado", "en_ejecucion", "informe", "facturado", "cerrado"],
    },
    {
      id: 4,
      label: "Plan de Fechas",
      sublabel: "Asignación de técnicos",
      href: `${base}/asignacion`,
      icon: CalendarCheck,
      unlockedAt: ["aprobado", "asignado", "en_ejecucion", "informe", "facturado", "cerrado"],
      completedAt: ["en_ejecucion", "informe", "facturado", "cerrado"],
    },
    {
      id: 5,
      label: "Informe Técnico",
      sublabel: "Control de campo",
      href: `${base}/informe`,
      icon: ClipboardCheck,
      unlockedAt: ["en_ejecucion", "informe", "facturado", "cerrado"],
      completedAt: ["facturado", "cerrado"],
    },
    {
      id: 6,
      label: "Factura",
      sublabel: "Cobro final",
      href: `${base}/factura`,
      icon: Receipt,
      unlockedAt: ["informe", "facturado", "cerrado"],
      completedAt: ["facturado", "cerrado"],
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Desktop stepper */}
      <div className="hidden md:flex">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isUnlocked = step.unlockedAt.includes(status);
          const isCompleted = step.completedAt.includes(status);
          const isActive =
            pathname === step.href ||
            (step.href !== base && pathname.startsWith(step.href));
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="flex-1 relative">
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute top-1/2 right-0 w-px h-8 -translate-y-1/2 z-10 ${
                    isCompleted ? "bg-orange-300" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}

              {isUnlocked ? (
                <Link
                  href={step.href}
                  className={`flex flex-col items-center gap-2 px-3 py-4 transition-colors group relative ${
                    isActive
                      ? "bg-orange-50 dark:bg-orange-950/30"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}

                  {/* Icon */}
                  <div
                    className={`relative flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "bg-orange-500 border-orange-500 text-white"
                        : isActive
                        ? "bg-white dark:bg-slate-900 border-orange-500 text-orange-500"
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400 group-hover:border-orange-300 group-hover:text-orange-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    {/* Step number badge */}
                    <span
                      className={`absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${
                        isCompleted
                          ? "bg-orange-600 text-white"
                          : isActive
                          ? "bg-orange-500 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {step.id}
                    </span>
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        isActive
                          ? "text-orange-600 dark:text-orange-400"
                          : isCompleted
                          ? "text-slate-700 dark:text-slate-200"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {step.sublabel}
                    </p>
                  </div>
                </Link>
              ) : (
                // Locked step
                <div className="flex flex-col items-center gap-2 px-3 py-4 opacity-40 cursor-not-allowed">
                  <div className="relative flex items-center justify-center w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-300">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-500">
                      {step.id}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-400 leading-tight">{step.label}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">{step.sublabel}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper — horizontal scroll */}
      <div className="md:hidden flex overflow-x-auto scrollbar-hide">
        {steps.map((step) => {
          const Icon = step.icon;
          const isUnlocked = step.unlockedAt.includes(status);
          const isCompleted = step.completedAt.includes(status);
          const isActive =
            pathname === step.href ||
            (step.href !== base && pathname.startsWith(step.href));

          return isUnlocked ? (
            <Link
              key={step.id}
              href={step.href}
              className={`relative flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 border-b-2 transition-colors ${
                isActive
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                  : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full ${
                  isCompleted
                    ? "bg-orange-500 text-white"
                    : isActive
                    ? "text-orange-500"
                    : "text-slate-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  isActive ? "text-orange-600" : "text-slate-500"
                }`}
              >
                {step.id}. {step.label}
              </span>
            </Link>
          ) : (
            <div
              key={step.id}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 opacity-40 cursor-not-allowed border-b-2 border-transparent"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full text-slate-300">
                <Lock className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold whitespace-nowrap text-slate-400">
                {step.id}. {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
