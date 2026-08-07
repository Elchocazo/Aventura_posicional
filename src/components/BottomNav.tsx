import React from 'react';
import { Gamepad2, Layers, User, ShoppingBag, GraduationCap } from 'lucide-react';

export type TabType = 'game' | 'levels' | 'profile' | 'store' | 'report';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'game' as TabType, label: 'Juego', icon: Gamepad2 },
    { id: 'levels' as TabType, label: 'Niveles', icon: Layers },
    { id: 'profile' as TabType, label: 'Perfil', icon: User },
    { id: 'store' as TabType, label: 'Tienda', icon: ShoppingBag },
    { id: 'report' as TabType, label: 'Progreso', icon: GraduationCap },
  ];

  return (
    <nav className="fixed bottom-2 left-3 right-3 max-w-md mx-auto z-40 clay-card py-1.5 px-3 shadow-xl no-print border-2 border-white/80">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 transition-all active:scale-95 ${
                isActive
                  ? 'text-sky-700 font-black'
                  : 'text-slate-400 hover:text-slate-600 font-bold'
              }`}
            >
              <div
                className={`p-1.5 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_3px_0_#1d4ed8,inset_0_2px_3px_rgba(255,255,255,0.4)] scale-110 -translate-y-1'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[10px] sm:text-[11px] mt-1 tracking-tight ${isActive ? 'font-black text-sky-800' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

