"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  BookOpen,
  Users,
  FolderKanban,
  CalendarDays,
  Receipt,
  Menu,
  X,
  HardHat,
  UserCog,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    label: "Panel",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Hoja de Costos",
    href: "/dashboard/costos",
    icon: DollarSign,
  },
  {
    label: "Catálogo de Servicios",
    href: "/dashboard/catalogo",
    icon: BookOpen,
  },
  {
    label: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
  },
  {
    label: "Proyectos",
    href: "/dashboard/proyectos",
    icon: FolderKanban,
  },
  {
    label: "Citas",
    href: "/dashboard/citas",
    icon: CalendarDays,
  },
  {
    label: "Personal",
    href: "/dashboard/personal",
    icon: UserCog,
  },

  {
    label: "Facturación",
    href: "/dashboard/facturacion",
    icon: Receipt,
  },
  {
    label: "Mis Tareas",
    href: "/dashboard/mis-tareas",
    icon: HardHat,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-md"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-950 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800 shrink-0">
          <img
            src="/logo.png"
            alt="CALA Multiservices"
            className="h-9 w-auto object-contain bg-white rounded px-1"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-orange-500 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 px-3 py-4 shrink-0">
          <p className="text-xs text-slate-600 text-center leading-relaxed">
            © {new Date().getFullYear()} ObraFlow by <br />
            <a 
              href="https://www.lumaconsultoriadenegocios.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-orange-500 transition-colors"
            >
              Luma Consultoria de Negocios
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}
