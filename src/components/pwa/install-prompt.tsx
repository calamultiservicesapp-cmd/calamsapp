"use client";

import { useEffect, useState } from "react";
import { X, Share, PlusSquare } from "lucide-react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register service worker for PWA support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Detect if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone || 
                             document.referrer.includes('android-app://');
    
    setIsIOS(isIOSDevice);
    setIsStandalone(isStandaloneMode);

    // Show prompt on iOS if not installed
    if (isIOSDevice && !isStandaloneMode) {
      const hasSeenPrompt = localStorage.getItem("ios_install_prompt");
      if (!hasSeenPrompt) {
        setShowPrompt(true);
      }
    }
  }, []);

  if (!showPrompt || !isIOS || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-slate-900 border border-slate-700 text-white p-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-orange-500">Instalar Aplicación</h3>
        <button 
          onClick={() => {
            setShowPrompt(false);
            localStorage.setItem("ios_install_prompt", "true");
          }} 
          className="text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="text-sm text-slate-300 mb-3">
        Instala esta aplicación en tu iPhone para una experiencia rápida y a pantalla completa.
      </p>
      <div className="bg-slate-800 rounded-lg p-3 text-sm flex flex-col gap-2">
        <div>
          1. Toca el botón de compartir <Share className="h-4 w-4 inline mx-1" /> en la barra de Safari.
        </div>
        <div>
          2. Selecciona <strong>"Agregar a inicio"</strong> <PlusSquare className="h-4 w-4 inline mx-1" />.
        </div>
      </div>
    </div>
  );
}
