"use client";

import { logout } from "@/app/auth/actions";
import { LogOut, X, AlertTriangle } from "lucide-react";
import { useState, useTransition } from "react";

export function TopBar({ email }: { email: string }) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirmLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <>
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
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </header>

      {/* Modal de confirmación */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ animation: "fadeIn 0.18s ease forwards" }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Card */}
          <div
            className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-5"
            style={{ animation: "slideUp 0.22s cubic-bezier(0.22,1,0.36,1) forwards" }}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Ícono */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-orange-500" />
              </div>
            </div>

            {/* Texto */}
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                ¿Cerrar sesión?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Serás redirigido a la pantalla de inicio de sesión.
              </p>
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {isPending ? "Saliendo..." : "Cerrar sesión"}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
          `}</style>
        </div>
      )}
    </>
  );
}
