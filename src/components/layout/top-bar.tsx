"use client";

import { logout } from "@/app/auth/actions";
import { LogOut } from "lucide-react";

export function TopBar({ email }: { email: string }) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative flex items-center px-6 shrink-0">
      {/* Logo centrado absolutamente — solo mobile */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none lg:hidden">
        <img
          src="/logotipo.png"
          alt="CALA Multiservices"
          className="h-9 w-auto object-contain"
        />
      </div>

      {/* Lado derecho: email + salir */}
      <div className="flex items-center gap-4 ml-auto">
        <span className="text-sm text-slate-500 hidden sm:block">{email}</span>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
