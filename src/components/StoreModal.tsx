import React, { useState } from 'react';
import { X, Star, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { STORE_ACCESSORIES, STORE_MASCOTS, STORE_THEMES } from '../data/constants';
import { StoreItem, ToastType } from '../types';
import { sound } from '../utils/sound';
import { showRealRewardedAd } from '../utils/admob';
import { ParentalGateModal } from './ParentalGateModal';

interface PendingPurchase {
  productId: string;
  stars: number;
  name: string;
  priceCop: string;
}

interface StoreViewProps {
  points: number;
  equippedMascot: string;
  equippedAccessory: string;
  equippedTheme: string;
  unlockedItems: string[];
  onEquipItem: (item: StoreItem) => void;
  onUnlockItem: (item: StoreItem) => void;
  onAwardPoints?: (amount: number) => void;
  onNotify?: (text: string, type?: ToastType) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
  points,
  equippedMascot,
  equippedAccessory,
  equippedTheme,
  unlockedItems,
  onEquipItem,
  onUnlockItem,
  onAwardPoints,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'mascots' | 'accessories' | 'themes' | 'stars'>('mascots');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null);

  const notify = (text: string, type: ToastType = 'info') => {
    if (onNotify) onNotify(text, type);
  };

  const handleRequestPurchase = (productId: string, stars: number, name: string, priceCop: string) => {
    sound.playSelect();
    setPendingPurchase({ productId, stars, name, priceCop });
  };

  const handleVerifiedPurchase = () => {
    if (!pendingPurchase) return;
    const { productId, name, priceCop } = pendingPurchase;
    setPendingPurchase(null);

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      sound.playError();
      notify('📡 Conéctate a internet para completar compras en Google Play.', 'warning');
      return;
    }

    // Hook para Google Play Billing nativo (cuando se instala desde Google Play Store)
    const win = window as unknown as {
      CdvPurchase?: { store?: { get?: (id: string) => { getOffer?: () => { order?: () => void } } } };
    };
    const offer = win.CdvPurchase?.store?.get?.(productId)?.getOffer?.();
    if (offer?.order) {
      offer.order();
      notify(`💳 Abriendo Google Play para ${name} (${priceCop})...`, 'info');
      return;
    }

    notify(
      `💳 Producto "${name}" (${priceCop}) disponible exclusivamente al instalar desde Google Play.`,
      'info'
    );
  };

  const handleWatchVideoAd = async () => {
    sound.playSelect();
    setIsAdLoading(true);
    try {
      const result = await showRealRewardedAd();
      if (result.rewarded && onAwardPoints) {
        onAwardPoints(100);
        sound.playSuccess();
        notify('🎉 ¡Ganaste +100 ⭐ por ver el video completo!', 'success');
      } else if (result.reason === 'offline') {
        sound.playError();
        notify('📡 Sin conexión a internet. Conéctate para ver el video.', 'warning');
      } else if (result.reason === 'dismissed') {
        sound.playError();
        notify('📺 Debes ver el video completo para recibir +100 ⭐.', 'warning');
      } else {
        sound.playError();
        notify('📺 Anuncio no disponible en este momento. Intenta en unos segundos.', 'error');
      }
    } finally {
      setIsAdLoading(false);
    }
  };

  const renderGrid = (items: StoreItem[], category: 'mascot' | 'accessory' | 'theme') => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-3">
      {items.map((item) => {
        const isUnlocked = unlockedItems.includes(item.id) || item.cost === 0;
        const isEquipped =
          (category === 'mascot' && equippedMascot === item.id) ||
          (category === 'accessory' && equippedAccessory === item.id) ||
          (category === 'theme' && equippedTheme === item.id);

        return (
          <div
            key={item.id}
            onClick={() => {
              if (isUnlocked) {
                sound.playSelect();
                onEquipItem(item);
                notify(`✨ ¡${item.name} equipado!`, 'success');
              } else if (points >= item.cost) {
                sound.playSuccess();
                onUnlockItem(item);
                notify(`🎉 ¡Desbloqueaste ${item.name}!`, 'success');
              } else {
                sound.playError();
                notify(`⭐ Te faltan ${(item.cost - points).toLocaleString()} estrellas para ${item.name}.`, 'warning');
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
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-3xl my-1 drop-shadow-xs transition-transform hover:scale-110 ${
                item.bgClass ? `${item.bgClass} border-2 border-white shadow-inner` : ''
              }`}
            >
              {item.icon}
            </div>
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
    <>
      <div className="clay-card p-4 sm:p-6 text-slate-800 space-y-4">
        {/* Store Header */}
        <div className="flex items-center gap-2.5 border-b-2 border-slate-100 pb-3 pr-10">
          <span className="text-3xl">🛍️</span>
          <div>
            <h2 className="font-black text-lg sm:text-xl text-purple-900 leading-none">
              Tienda y Accesorios
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Desbloquea mascotas, sombreros, fondos o consigue estrellas
            </p>
          </div>
        </div>

        {/* Available Stars */}
        <div className="my-2 clay-card-amber p-3 flex items-center justify-between">
          <span className="text-xs font-black text-amber-900">Tus Estrellas Disponibles:</span>
          <span className="inline-flex items-center gap-1 font-black text-base text-amber-950">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" /> {points.toLocaleString()}
          </span>
        </div>

        {/* STORE TABS BAR */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => { sound.playSelect(); setActiveTab('mascots'); }}
            className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'mascots'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🐾 Mascotas</span>
          </button>
          <button
            onClick={() => { sound.playSelect(); setActiveTab('accessories'); }}
            className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'accessories'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎓 Extras</span>
          </button>
          <button
            onClick={() => { sound.playSelect(); setActiveTab('themes'); }}
            className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'themes'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎨 Fondos</span>
          </button>
          <button
            onClick={() => { sound.playSelect(); setActiveTab('stars'); }}
            className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'stars'
                ? 'bg-amber-500 text-amber-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⭐ Estrellas</span>
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'mascots' && (
          <div className="animate-fadeIn">
            <h3 className="font-black text-xs text-slate-500 uppercase tracking-wider mb-1">
              Mascotas Disponibles
            </h3>
            {renderGrid(STORE_MASCOTS, 'mascot')}
          </div>
        )}

        {activeTab === 'accessories' && (
          <div className="animate-fadeIn">
            <h3 className="font-black text-xs text-slate-500 uppercase tracking-wider mb-1">
              Sombreros y Accesorios
            </h3>
            {renderGrid(STORE_ACCESSORIES, 'accessory')}
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="animate-fadeIn">
            <h3 className="font-black text-xs text-slate-500 uppercase tracking-wider mb-1">
              Temas y Fondos del Juego
            </h3>
            {renderGrid(STORE_THEMES, 'theme')}
          </div>
        )}

        {activeTab === 'stars' && (
          <div className="animate-fadeIn space-y-3">
            <div className="clay-card-purple p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Obtener Estrellas ⭐</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Control Parental
                </span>
              </div>

              {/* Video Recompensa Gratis */}
              <button
                onClick={handleWatchVideoAd}
                disabled={isAdLoading}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <span>{isAdLoading ? '📺 Cargando anuncio...' : '📺 Ver Video Recompensa (+100 ⭐ GRATIS)'}</span>
              </button>

              {/* Paquetes de Estrellas de Google Play (Compras con dinero) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  onClick={() => handleRequestPurchase('stars_pack_500', 500, 'Bolsa de Estrellas', '$5.000 COP')}
                  className="p-3 bg-white hover:bg-purple-50 border-2 border-purple-200 rounded-2xl flex flex-col items-center justify-between text-center transition-all active:scale-95 shadow-2xs"
                >
                  <span className="text-xl">⭐ 500</span>
                  <span className="font-black text-xs text-purple-950 my-1">Bolsa de Estrellas</span>
                  <span className="px-3 py-1 bg-purple-600 text-white font-black text-xs rounded-xl w-full">
                    $5.000 COP
                  </span>
                </button>

                <button
                  onClick={() => handleRequestPurchase('stars_pack_2500', 2500, 'Saco de Estrellas', '$19.900 COP')}
                  className="p-3 bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl flex flex-col items-center justify-between text-center transition-all active:scale-95 shadow-xs relative"
                >
                  <span className="absolute -top-2.5 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-2xs">
                    🔥 ¡Popular!
                  </span>
                  <span className="text-xl mt-1">⭐ 2.500</span>
                  <span className="font-black text-xs text-amber-950 my-1">Saco de Estrellas</span>
                  <span className="px-3 py-1 bg-amber-500 text-amber-950 font-black text-xs rounded-xl w-full">
                    $19.900 COP
                  </span>
                </button>

                <button
                  onClick={() => handleRequestPurchase('stars_pack_6000', 6000, 'Cofre de Estrellas', '$39.900 COP')}
                  className="p-3 bg-gradient-to-b from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl flex flex-col items-center justify-between text-center transition-all active:scale-95 shadow-xs relative"
                >
                  <span className="absolute -top-2.5 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-2xs">
                    👑 Mejor Valor
                  </span>
                  <span className="text-xl mt-1">⭐ 6.000</span>
                  <span className="font-black text-xs text-emerald-950 my-1">Cofre de Estrellas</span>
                  <span className="px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-xl w-full">
                    $39.900 COP
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ParentalGateModal
        isOpen={pendingPurchase !== null}
        actionLabel={pendingPurchase ? `comprar ${pendingPurchase.name} (${pendingPurchase.priceCop})` : 'continuar'}
        onCancel={() => setPendingPurchase(null)}
        onVerified={handleVerifiedPurchase}
      />
    </>
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto my-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        <StoreView {...viewProps} />
      </div>
    </div>
  );
};
