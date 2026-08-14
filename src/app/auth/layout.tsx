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
    <div className="relative flex min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* Fondo imagen — visible SOLO en mobile como overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center lg:hidden"
        style={{ backgroundImage: "url('/fondologin.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-slate-950/75 lg:hidden" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950/90 to-transparent lg:hidden" />

      {/* Lado izquierdo: Branding (oculto en móviles) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative p-12 text-white overflow-hidden">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/fondologin.png')" }}
        />
        {/* Overlay oscuro para contraste */}
        <div className="absolute inset-0 z-0 bg-slate-950/60" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950/80 to-transparent" />

        {/* Logo blanco centrado */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <img
            src="/logoblanco.png"
            alt="CALA Multiservices"
            className="w-64 h-auto object-contain drop-shadow-2xl"
          />
        </div>
        
        <div className="relative z-10 space-y-6">
          <blockquote className="border-l-4 border-orange-500 pl-4 bg-slate-950/40 p-4 rounded-r-md backdrop-blur-sm">
            <p className="text-xl font-medium italic text-slate-200">
              &quot;Construyendo calidad, remodelando el futuro con excelencia y dedicación.&quot;
            </p>
          </blockquote>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} ObraFlow by{" "}
            <a
              href="https://www.lumaconsultoriadenegocios.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors underline underline-offset-4"
            >
              Luma Consultoria de Negocios
            </a>
          </p>
        </div>
      </div>

      {/* Lado derecho: Formulario */}
      {/* overflow-y-auto + py-8 permiten hacer scroll cuando el teclado mobile aparece */}
      <div className="relative z-10 flex w-full flex-col justify-center overflow-y-auto py-8 px-4 sm:px-6 lg:w-1/2 lg:px-8 lg:bg-white lg:dark:bg-slate-900 lg:shadow-2xl">
        <div className="mx-auto w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
