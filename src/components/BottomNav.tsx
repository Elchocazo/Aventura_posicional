import React from 'react';
import { Home, BookOpen, TrendingUp, Settings, ShoppingBag } from 'lucide-react';

export type TabType = 'game' | 'worksheets' | 'profile' | 'report' | 'levels' | 'store';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  mascotIcon?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  mascotIcon = '🐶',
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 no-print px-3 pb-2 pt-1">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_-4px_25px_rgba(0,0,0,0.1)] border-2 border-slate-100 px-2 py-1 flex items-center justify-around relative">
        
        {/* 1. Inicio (Home) */}
        <button
          onClick={() => onChangeTab('game')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all active:scale-95 ${
            activeTab === 'game' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${activeTab === 'game' ? 'scale-110' : ''}`} />
          <span className={`text-[10px] sm:text-[11px] mt-0.5 ${activeTab === 'game' ? 'font-black text-sky-700' : 'font-semibold'}`}>
            Inicio
          </span>
        </button>

        {/* 2. Biblioteca de Fichas (Library) */}
        <button
          onClick={() => onChangeTab('worksheets')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all active:scale-95 ${
            activeTab === 'worksheets' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${activeTab === 'worksheets' ? 'scale-110' : ''}`} />
          <span className={`text-[10px] sm:text-[11px] mt-0.5 ${activeTab === 'worksheets' ? 'font-black text-sky-700' : 'font-semibold'}`}>
            Biblioteca
          </span>
        </button>

        {/* 3. Perfil (Botón circular elevado al centro estilo imagen) */}
        <button
          onClick={() => onChangeTab('profile')}
          className="flex flex-col items-center justify-center relative -mt-5 group"
        >
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-3 border-white shadow-md transition-transform active:scale-90 group-hover:scale-105 ${
            activeTab === 'profile'
              ? 'bg-gradient-to-tr from-sky-400 via-sky-500 to-teal-400 ring-4 ring-sky-300 shadow-sky-300/50'
              : 'bg-gradient-to-tr from-amber-200 via-sky-200 to-indigo-200'
          }`}>
            <span className="drop-shadow-xs animate-float">{mascotIcon}</span>
          </div>
          <span className={`text-[10px] sm:text-[11px] mt-0.5 ${activeTab === 'profile' ? 'font-black text-sky-700' : 'font-semibold text-slate-500'}`}>
            Perfil
          </span>
        </button>

        {/* 4. Progreso (Progress / Stats) */}
        <button
          onClick={() => onChangeTab('report')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all active:scale-95 ${
            activeTab === 'report' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${activeTab === 'report' ? 'scale-110' : ''}`} />
          <span className={`text-[10px] sm:text-[11px] mt-0.5 ${activeTab === 'report' ? 'font-black text-sky-700' : 'font-semibold'}`}>
            Progreso
          </span>
        </button>

        {/* 5. Ajustes / Niveles (Settings) */}
        <button
          onClick={() => onChangeTab('levels')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all active:scale-95 ${
            activeTab === 'levels' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${activeTab === 'levels' ? 'scale-110' : ''}`} />
          <span className={`text-[10px] sm:text-[11px] mt-0.5 ${activeTab === 'levels' ? 'font-black text-sky-700' : 'font-semibold'}`}>
            Ajustes
          </span>
        </button>
      </div>
    </nav>
  );
};
