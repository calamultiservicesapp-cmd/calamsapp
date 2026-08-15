"use client";

import { useEffect, useState } from "react";
import { X, Share, PlusSquare } from "lucide-react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register service worker for PWA support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    // Detect any mobile device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobileDevice = /iphone|ipad|ipod|android/.test(userAgent);
    
    // Detect if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone || 
                             document.referrer.includes('android-app://');
    
    setIsIOS(isMobileDevice); // Reuse state
    setIsStandalone(isStandaloneMode);

    // Capture native install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt on iOS if not installed (since iOS doesn't support beforeinstallprompt)
    if (isMobileDevice && !isStandaloneMode && userAgent.includes('iphone')) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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
        Para la mejor experiencia a pantalla completa, instala la aplicación en tu celular.
      </p>
      
      {deferredPrompt ? (
        <button
          onClick={async () => {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
              setDeferredPrompt(null);
              setShowPrompt(false);
            }
          }}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Instalar Ahora
        </button>
      ) : (
        <div className="bg-slate-800 rounded-lg p-3 text-sm flex flex-col gap-2">
          <div>
            1. Toca el botón <strong>Compartir</strong> (en iPhone) o los <strong>3 puntos</strong> (en Android).
          </div>
          <div>
            2. Selecciona <strong>"Agregar a inicio"</strong> o <strong>"Instalar aplicación"</strong>.
          </div>
        </div>
      )}
    </div>
  );
}
