import React from 'react';
import { Settings, Flame, Heart, Camera } from 'lucide-react';

interface HeaderProps {
  mascot: string;
  accessory: string;
  lives: number;
  streak: number;
  soundEnabled?: boolean;
  playerName?: string;
  onOpenSettings: () => void;
  onOpenStore?: () => void;
  onOpenQrScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mascot,
  accessory,
  lives,
  streak,
  playerName,
  onOpenSettings,
  onOpenStore,
  onOpenQrScanner,
}) => {
  return (
    <header className="sticky top-0 z-30 clay-card px-3.5 sm:px-5 py-2.5 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Mascot Avatar */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenStore}
            className="relative flex items-center justify-center w-11 h-11 shrink-0 bg-gradient-to-br from-amber-100 via-sky-100 to-indigo-100 border-2 border-white rounded-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_4px_8px_rgba(186,230,253,0.6)] hover:scale-105 active:scale-95 transition-transform"
            title="¡Mascota!"
          >
            <span className="text-2xl animate-float drop-shadow-sm">{mascot}</span>
            {accessory && accessory !== 'Sin accesorio' && (
              <span className="absolute -bottom-1 -right-1 text-[10px] bg-amber-300 text-amber-900 font-black rounded-md px-1 py-0.5 border border-amber-400 shadow-2xs">
                {accessory}
              </span>
            )}
          </button>

          <div className="min-w-0">
            <h1 className="font-black text-sm sm:text-lg bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight tracking-tight truncate">
              Aventura Posicional
            </h1>
            <p className="text-[11px] font-extrabold text-slate-500 hidden sm:block truncate">
              {playerName ? `¡Hola, ${playerName}! 👋` : 'Sumas y Restas • Valor Posicional'}
            </p>
          </div>
        </div>

        {/* Essential Stats (Vidas & Racha) + QR Scan & Settings */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Lives Pill */}
          <div className="clay-card-rose px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-black text-rose-800">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
            <span>{lives}</span>
          </div>

          {/* Streak Pill */}
          <div className="clay-card-orange px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-black text-orange-800">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />
            <span>{streak}</span>
          </div>

          {/* QR Camera Scanner Button */}
          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl clay-btn-purple flex items-center justify-center shrink-0 gap-1.5 text-xs font-black"
              title="📷 Escanear y Calificar Ficha QR"
            >
              <Camera className="w-4 h-4 text-white" />
              <span className="hidden lg:inline">Escanear QR</span>
            </button>
          )}

          {/* Options / Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl clay-btn-sky flex items-center justify-center shrink-0 gap-1.5 text-xs font-black"
            title="Menú de Opciones y Configuración"
          >
            <Settings className="w-4 h-4 text-white" />
            <span className="hidden md:inline">Opciones</span>
          </button>
        </div>
      </div>
    </header>
  );
};





