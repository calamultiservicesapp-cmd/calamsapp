"use client";

import { useActionState, useEffect, useState } from "react";
import { login } from "@/app/auth/actions";
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

const initialState: any = {
  error: "",
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        {/* Logotipo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="CALA Multiservices Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>
        
        <h2 className="text-3xl font-heading tracking-wider text-slate-700 dark:text-slate-300">
          Bienvenido
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md flex items-center gap-3 text-sm font-medium border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5" />
            <p>{state.error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300"
          >
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              className="flex h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300"
            >
              Contraseña
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="flex h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 pl-10 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-orange-500 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </form>
    </div>
  );
}
