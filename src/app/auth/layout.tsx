import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CALA Multiservices - Acceso",
  description: "Plataforma de gestión integral para CALA Multiservices",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Lado izquierdo: Branding (oculto en móviles) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative p-12 text-white overflow-hidden">
        {/* Imagen de fondo generada por IA */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Overlay azul marino oscuro para que el texto resalte */}
        <div className="absolute inset-0 z-0 bg-slate-950/70" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
        
        <div className="relative z-10">
          <h1 className="text-5xl font-heading tracking-wider text-white flex items-center gap-2">
            <span className="text-orange-500">CALA</span> Multiservices
          </h1>
          <p className="mt-4 text-slate-300 max-w-md text-lg">
            Plataforma integral de gestión de proyectos, presupuestos, seguimiento y facturación.
          </p>
        </div>
        
        <div className="relative z-10 space-y-6">
          <blockquote className="border-l-4 border-orange-500 pl-4 bg-slate-950/40 p-4 rounded-r-md backdrop-blur-sm">
            <p className="text-xl font-medium italic text-slate-200">
              "Construyendo calidad, remodelando el futuro con excelencia y dedicación."
            </p>
          </blockquote>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} CALA Multiservices. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Lado derecho: Formulario */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:w-1/2 lg:px-8 bg-white dark:bg-slate-900 shadow-2xl z-10">
        <div className="mx-auto w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
