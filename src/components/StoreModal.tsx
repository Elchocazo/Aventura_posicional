import React from 'react';
import { X, Star, CheckCircle } from 'lucide-react';
import { STORE_ACCESSORIES, STORE_MASCOTS } from '../data/constants';
import { StoreItem } from '../types';
import { sound } from '../utils/sound';

interface StoreViewProps {
  points: number;
  equippedMascot: string;
  equippedAccessory: string;
  unlockedItems: string[];
  onEquipItem: (item: StoreItem) => void;
  onUnlockItem: (item: StoreItem) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
  points,
  equippedMascot,
  equippedAccessory,
  unlockedItems,
  onEquipItem,
  onUnlockItem,
}) => {
  const renderGrid = (items: StoreItem[], category: 'mascot' | 'accessory') => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-3">
      {items.map((item) => {
        const isUnlocked = unlockedItems.includes(item.id);
        const isEquipped =
          (category === 'mascot' && equippedMascot === item.id) ||
          (category === 'accessory' && equippedAccessory === item.id);

        return (
          <div
            key={item.id}
            onClick={() => {
              if (isUnlocked) {
                sound.playSelect();
                onEquipItem(item);
              } else if (points >= item.cost) {
                sound.playSuccess();
                onUnlockItem(item);
              } else {
                sound.playError();
              }
            }}
            className={`p-3 rounded-2xl transition-all flex flex-col items-center justify-between text-center cursor-pointer active:scale-95 ${
              isEquipped
                ? 'clay-card-purple border-2 border-purple-400 ring-2 ring-purple-300'
                : isUnlocked
                ? 'clay-card-emerald'
                : 'clay-card bg-slate-50 hover:bg-white border-2 border-slate-200'
            }`}
          >
            <div className="text-4xl my-1.5 drop-shadow-xs transition-transform hover:scale-110">{item.icon}</div>
            <div className="font-extrabold text-xs text-slate-800 line-clamp-1 mb-1">{item.name}</div>

            <div className="mt-1 w-full">
              {isEquipped ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-purple-900 bg-purple-200/80 px-2 py-1 rounded-xl w-full justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-700" /> Equipado
                </span>
              ) : isUnlocked ? (
                <span className="text-[11px] font-black text-emerald-900 bg-emerald-200/80 px-2 py-1 rounded-xl block w-full">
                  Usar
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-1 text-[11px] font-black text-amber-900 bg-amber-200/80 px-2 py-1 rounded-xl w-full">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> {item.cost}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="clay-card p-4 sm:p-6 text-slate-800 space-y-4">
      {/* Store Header */}
      <div className="flex items-center gap-2.5 border-b-2 border-slate-100 pb-3">
        <span className="text-3xl">🛍️</span>
        <div>
          <h2 className="font-black text-lg sm:text-xl text-purple-900 leading-none">
            Tienda de Mascotas
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Usa tus estrellas ⭐ para desbloquear nuevos avatares y accesorios
          </p>
        </div>
      </div>

      {/* Available Stars */}
      <div className="my-3.5 clay-card-amber p-3.5 flex items-center justify-between">
        <span className="text-xs font-black text-amber-900">Tus Estrellas Disponibles:</span>
        <span className="inline-flex items-center gap-1 font-black text-base text-amber-950">
          <Star className="w-5 h-5 fill-amber-500 text-amber-500" /> {points.toLocaleString()}
        </span>
      </div>

      {/* Mascot Section */}
      <h3 className="font-black text-sm text-slate-800 mt-4 flex items-center gap-1.5">
        🐾 Mascotas
      </h3>
      {renderGrid(STORE_MASCOTS, 'mascot')}

      {/* Accessory Section */}
      <h3 className="font-black text-sm text-slate-800 mt-4 flex items-center gap-1.5">
        🎩 Sombreros y Accesorios
      </h3>
      {renderGrid(STORE_ACCESSORIES, 'accessory')}
    </div>
  );
};

interface StoreModalProps extends StoreViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  ...viewProps
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
      <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
        <StoreView {...viewProps} />
      </div>
    </div>
  );
};
