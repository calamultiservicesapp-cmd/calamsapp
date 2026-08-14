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
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Panel",                href: "/dashboard",              icon: LayoutDashboard, exact: true },
  { label: "Hoja de Costos",       href: "/dashboard/costos",       icon: DollarSign },
  { label: "Catálogo de Servicios",href: "/dashboard/catalogo",     icon: BookOpen },
  { label: "Clientes",             href: "/dashboard/clientes",     icon: Users },
  { label: "Proyectos",            href: "/dashboard/proyectos",    icon: FolderKanban },
  { label: "Servicios Rápidos",    href: "/dashboard/servicios-rapidos", icon: Zap },
  { label: "Citas",                href: "/dashboard/citas",        icon: CalendarDays },
  { label: "Personal",             href: "/dashboard/personal",     icon: UserCog },
  { label: "Facturación",          href: "/dashboard/facturacion",  icon: Receipt },
  { label: "Mis Tareas",           href: "/dashboard/mis-tareas",   icon: HardHat },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  function handleToggle() {
    setAnimating(true);
    setOpen((prev) => !prev);
    setTimeout(() => setAnimating(false), 300);
  }

  return (
    <>
      {/* Mobile hamburger toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-xl shadow-lg active:scale-90 transition-transform duration-150"
        onClick={handleToggle}
        aria-label="Toggle menu"
      >
        <span
          className="block transition-all duration-300"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          style={{ animation: "overlay-in 0.25s ease forwards" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-950 flex flex-col lg:translate-x-0 lg:static lg:flex`}
        style={{
          transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
          transform: open ? "translateX(0)" : undefined,
        }}
        data-open={open}
      >
        {/* Mobile: slide from left; Desktop: always visible */}
        <style>{`
          @media (max-width: 1023px) {
            aside[data-open="false"] { transform: translateX(-100%); }
            aside[data-open="true"]  { transform: translateX(0); box-shadow: 4px 0 40px rgba(0,0,0,0.5); }
          }
        `}</style>

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
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  animationDelay: open ? `${i * 0.04 + 0.05}s` : "0s",
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 active:scale-95
                  ${active
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
                    active ? "bg-white/20" : "bg-slate-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                </span>
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
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
