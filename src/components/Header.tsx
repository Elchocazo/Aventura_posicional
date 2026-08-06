import React from 'react';
import { Settings, Flame, Heart, Camera } from 'lucide-react';

interface HeaderProps {
  mascot: string;
  accessory: string;
  lives: number;
  streak: number;
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
    <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3 shadow-sm border-b border-slate-100 pt-[env(safe-area-inset-top,24px)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Mascot */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenStore}
            className="relative flex items-center justify-center w-11 h-11 shrink-0 bg-gradient-to-br from-amber-100 to-indigo-100 border-2 border-white rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="text-2xl animate-float">{mascot}</span>
            {accessory && accessory !== 'Sin accesorio' && (
              <span className="absolute -bottom-1 -right-1 text-[10px] bg-amber-300 text-amber-900 font-black rounded-md px-1 py-0.5 border border-white shadow-2xs">
                {accessory}
              </span>
            )}
          </button>

          <div className="min-w-0">
            <h1 className="font-black text-sm sm:text-lg bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent leading-none truncate">
              NumiMates
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">
              {playerName || 'Explorador'}
            </p>
          </div>
        </div>

        {/* Stats & Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-800 font-black text-xs">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{lives}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 rounded-xl border border-orange-100 text-orange-800 font-black text-xs">
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span>{streak}</span>
          </div>

          <button onClick={onOpenQrScanner} className="p-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 active:scale-90 transition-all">
            <Camera className="w-4.5 h-4.5" />
          </button>

          <button onClick={onOpenSettings} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 active:scale-90 transition-all">
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
