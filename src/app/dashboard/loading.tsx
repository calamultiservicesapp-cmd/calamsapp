import Image from "next/image";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[80vh] bg-transparent">
      {/* Container for logo and animation */}
      <div className="relative flex flex-col items-center gap-6 p-8">
        
        {/* Pulsing glow behind the logo */}
        <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Logo itself with bounce/pulse */}
        <div className="relative w-48 h-auto sm:w-64 animate-pulse duration-1000">
          <img 
            src="/logo.png" 
            alt="Cargando..." 
            className="w-full h-auto object-contain bg-white p-2 rounded-xl shadow-2xl"
          />
        </div>
        
        {/* Loading text or spinner */}
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium tracking-wide">Cargando...</span>
        </div>
        
      </div>
    </div>
  );
}
