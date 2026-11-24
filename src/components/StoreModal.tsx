import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle, Sparkles, ShieldCheck, FileText, Gift, Download } from 'lucide-react';
import { STORE_ACCESSORIES, STORE_MASCOTS, STORE_THEMES } from '../data/constants';
import { StoreItem, ToastType, GradeLevel, GameMode } from '../types';
import { sound } from '../utils/sound';
import { showRealRewardedAd } from '../utils/admob';
import {
  addWorkshopCredits,
  getWorkshopQuota,
  SINGLE_WORKSHOP_STAR_COST,
  WEEKLY_FREE_WORKSHOPS,
  WorkshopQuotaState,
} from '../utils/workshops';
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
  onSpendPoints?: (amount: number) => void;
  onOpenWorkshops?: (level: GradeLevel, mode: GameMode) => void;
  onNotify?: (text: string, type?: ToastType) => void;
}

const WORKSHOP_DIFFICULTIES: { level: GradeLevel; icon: string; name: string; digits: string }[] = [
  { level: 2, icon: '🌱', name: 'Básico', digits: '2 cifras' },
  { level: 3, icon: '🏔️', name: 'Intermedio', digits: '3 cifras' },
  { level: 4, icon: '🚀', name: 'Avanzado', digits: '4 cifras' },
  { level: 5, icon: '👑', name: 'Experto', digits: '5 cifras' },
];

const WORKSHOP_MODES: { mode: GameMode; label: string }[] = [
  { mode: 'add', label: '➕ Sumas' },
  { mode: 'sub', label: '➖ Restas' },
  { mode: 'mix', label: '🔀 Mixto' },
];

const STORE_TABS = [
  { id: 'mascots' as const, icon: '🐾', label: 'Mascotas', activeClass: 'bg-purple-600 text-white' },
  { id: 'accessories' as const, icon: '🎓', label: 'Extras', activeClass: 'bg-purple-600 text-white' },
  { id: 'themes' as const, icon: '🎨', label: 'Fondos', activeClass: 'bg-sky-600 text-white' },
  { id: 'workshops' as const, icon: '📄', label: 'Talleres', activeClass: 'bg-emerald-600 text-white' },
  { id: 'stars' as const, icon: '⭐', label: 'Estrellas', activeClass: 'bg-amber-500 text-amber-950' },
];

export const StoreView: React.FC<StoreViewProps> = ({
  points,
  equippedMascot,
  equippedAccessory,
  equippedTheme,
  unlockedItems,
  onEquipItem,
  onUnlockItem,
  onAwardPoints,
  onSpendPoints,
  onOpenWorkshops,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'mascots' | 'accessories' | 'themes' | 'workshops' | 'stars'>('mascots');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null);
  const [workshopQuota, setWorkshopQuota] = useState<WorkshopQuotaState>(() => getWorkshopQuota());
  const [selectedWorkshopLevel, setSelectedWorkshopLevel] = useState<GradeLevel>(2);
  const [selectedWorkshopMode, setSelectedWorkshopMode] = useState<GameMode>('add');

  useEffect(() => {
    if (activeTab === 'workshops') {
      setWorkshopQuota(getWorkshopQuota());
    }
  }, [activeTab]);

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
      `💳 Producto "${name}" (${priceCop}) disponible al instalar desde Google Play.`,
      'info'
    );
  };

  const handleBuyWorkshopPackWithStars = (packCount: number, starCost: number, label: string) => {
    if (points < starCost) {
      sound.playError();
      notify(`⭐ Te faltan ${(starCost - points).toLocaleString()} estrellas para ${label}.`, 'warning');
      return;
    }
    sound.playSuccess();
    onSpendPoints?.(starCost);
    addWorkshopCredits(packCount);
    setWorkshopQuota(getWorkshopQuota());
    notify(`📄 ¡Obtuviste ${label}! (+${packCount} talleres disponibles)`, 'success');
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
    <div className="grid grid-cols-3 gap-2 my-2">
      {items.map((item) => {
        const isUnlocked = unlockedItems.includes(item.id) || item.cost === 0;
        const isEquipped =
          (category === 'mascot' && equippedMascot === item.id) ||
          (category === 'accessory' && equippedAccessory === item.id) ||
          (category === 'theme' && equippedTheme === item.id);

        return (
          <button
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
            className={`p-2 rounded-2xl transition-all flex flex-col items-center justify-between text-center cursor-pointer active:scale-95 ${
              isEquipped
                ? 'clay-card-purple border-2 border-purple-400 ring-2 ring-purple-200'
                : isUnlocked
                ? 'clay-card-emerald border border-emerald-200'
                : 'bg-white hover:bg-slate-50 border-2 border-slate-100 shadow-2xs'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl my-0.5 ${
                item.bgClass ? `${item.bgClass} border-2 border-white shadow-inner` : ''
              }`}
            >
              {item.icon}
            </div>
            <div className="font-extrabold text-[11px] text-slate-800 line-clamp-1 w-full mb-1">
              {item.name}
            </div>

            <div className="w-full">
              {isEquipped ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-purple-900 bg-purple-200/80 px-1.5 py-0.5 rounded-lg w-full justify-center">
                  <CheckCircle className="w-3 h-3 text-purple-700 shrink-0" /> Activo
                </span>
              ) : isUnlocked ? (
                <span className="text-[10px] font-black text-emerald-900 bg-emerald-200/80 px-1.5 py-0.5 rounded-lg block w-full">
                  Usar
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-0.5 text-[10px] font-black text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded-lg w-full">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-600 shrink-0" /> {item.cost}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="clay-card p-3.5 sm:p-5 text-slate-800 space-y-3">
        {/* Compact Header + Balance Pill */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 pr-9">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0">🛍️</span>
            <div className="min-w-0">
              <h2 className="font-black text-base sm:text-lg text-purple-900 leading-tight truncate">
                Tienda NumiMates
              </h2>
              <p className="text-[11px] font-bold text-slate-500 truncate">
                Personaliza y consigue talleres
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 border border-amber-300 rounded-xl shrink-0">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="font-black text-xs sm:text-sm text-amber-950">{points.toLocaleString()}</span>
          </div>
        </div>

        {/* Uniform 5-Tab Bar (Icon on top + 1-word label below) */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {STORE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playSelect();
                  setActiveTab(tab.id);
                }}
                className={`py-1.5 px-0.5 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
                  isActive ? `${tab.activeClass} shadow-sm` : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="text-sm leading-none">{tab.icon}</span>
                <span className="text-[10px] font-black leading-none truncate max-w-full">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'mascots' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="font-black text-[11px] text-slate-500 uppercase tracking-wider">
                Mascotas ({STORE_MASCOTS.length})
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Toca para equipar o comprar</span>
            </div>
            {renderGrid(STORE_MASCOTS, 'mascot')}
          </div>
        )}

        {activeTab === 'accessories' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="font-black text-[11px] text-slate-500 uppercase tracking-wider">
                Sombreros y Extras ({STORE_ACCESSORIES.length})
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Toca para equipar o comprar</span>
            </div>
            {renderGrid(STORE_ACCESSORIES, 'accessory')}
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="font-black text-[11px] text-slate-500 uppercase tracking-wider">
                Fondos del Juego ({STORE_THEMES.length})
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Cambia el color del tablero</span>
            </div>
            {renderGrid(STORE_THEMES, 'theme')}
          </div>
        )}

        {activeTab === 'workshops' && (
          <div className="animate-fadeIn space-y-2.5">
            {/* Cupo Semanal Gratis + Créditos */}
            <div className="clay-card-emerald p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-xs text-emerald-950 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Talleres Imprimibles con QR</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-300 text-[10px] font-black text-emerald-800 whitespace-nowrap">
                  {workshopQuota.unlimited
                    ? '👑 Ilimitados'
                    : `${workshopQuota.freeRemaining}/${WEEKLY_FREE_WORKSHOPS} gratis esta semana`}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 bg-white/80 rounded-xl px-2.5 py-1.5 border border-emerald-200/80">
                <span>Talleres extra guardados:</span>
                <span className="font-black text-emerald-700">
                  {workshopQuota.unlimited ? '∞' : `${workshopQuota.credits} disponibles`}
                </span>
              </div>

              {/* Selector de Dificultad del Taller (sin mencionar grados) */}
              <div className="space-y-1.5 pt-1">
                <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-900">
                  Elige dificultad y operación del taller:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {WORKSHOP_DIFFICULTIES.map((d) => {
                    const active = selectedWorkshopLevel === d.level;
                    return (
                      <button
                        key={d.level}
                        onClick={() => {
                          sound.playSelect();
                          setSelectedWorkshopLevel(d.level);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl border-2 text-left transition-all flex items-center gap-1.5 active:scale-95 ${
                          active
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        <span className="text-sm leading-none">{d.icon}</span>
                        <div className="min-w-0 leading-tight">
                          <div className="font-black text-[11px] truncate">{d.name}</div>
                          <div className={`text-[9px] font-bold ${active ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {d.digits}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {WORKSHOP_MODES.map((m) => {
                    const active = selectedWorkshopMode === m.mode;
                    return (
                      <button
                        key={m.mode}
                        onClick={() => {
                          sound.playSelect();
                          setSelectedWorkshopMode(m.mode);
                        }}
                        className={`py-1.5 rounded-xl border-2 font-black text-[11px] transition-all active:scale-95 ${
                          active
                            ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                            : 'bg-white text-slate-700 border-emerald-200 hover:bg-sky-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {onOpenWorkshops && (
                <button
                  onClick={() => {
                    sound.playSelect();
                    onOpenWorkshops(selectedWorkshopLevel, selectedWorkshopMode);
                  }}
                  className="w-full py-2.5 clay-btn-emerald font-black text-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Descargar Taller ({WORKSHOP_DIFFICULTIES.find((d) => d.level === selectedWorkshopLevel)?.name})
                </button>
              )}
            </div>

            {/* Comprar más talleres con Estrellas */}
            <div className="space-y-1.5">
              <h4 className="font-black text-[11px] text-slate-500 uppercase tracking-wider px-0.5">
                Conseguir más talleres con Estrellas ⭐
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleBuyWorkshopPackWithStars(1, SINGLE_WORKSHOP_STAR_COST, '1 Taller Extra')}
                  className="p-2.5 bg-white hover:bg-sky-50 border-2 border-sky-200 rounded-2xl flex flex-col items-center justify-between text-center active:scale-95 transition-all"
                >
                  <FileText className="w-5 h-5 text-sky-600 mb-1" />
                  <span className="font-black text-xs text-slate-800">1 Taller</span>
                  <span className="mt-1.5 px-2 py-0.5 bg-amber-200 text-amber-950 font-black text-[10px] rounded-lg w-full">
                    ⭐ {SINGLE_WORKSHOP_STAR_COST}
                  </span>
                </button>

                <button
                  onClick={() => handleBuyWorkshopPackWithStars(5, 500, 'Pack 5 Talleres')}
                  className="p-2.5 bg-gradient-to-b from-sky-50 to-indigo-50 border-2 border-indigo-300 rounded-2xl flex flex-col items-center justify-between text-center active:scale-95 transition-all relative"
                >
                  <span className="absolute -top-2 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    -33%
                  </span>
                  <span className="text-lg leading-none mb-0.5 mt-0.5">📦</span>
                  <span className="font-black text-xs text-indigo-950">5 Talleres</span>
                  <span className="mt-1.5 px-2 py-0.5 bg-indigo-600 text-white font-black text-[10px] rounded-lg w-full">
                    ⭐ 500
                  </span>
                </button>

                <button
                  onClick={() => handleBuyWorkshopPackWithStars(15, 1200, 'Pack 15 Talleres')}
                  className="p-2.5 bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl flex flex-col items-center justify-between text-center active:scale-95 transition-all relative"
                >
                  <span className="absolute -top-2 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    -45%
                  </span>
                  <span className="text-lg leading-none mb-0.5 mt-0.5">📚</span>
                  <span className="font-black text-xs text-amber-950">15 Talleres</span>
                  <span className="mt-1.5 px-2 py-0.5 bg-amber-500 text-amber-950 font-black text-[10px] rounded-lg w-full">
                    ⭐ 1.200
                  </span>
                </button>
              </div>
            </div>

            {/* Pase Ilimitado Google Play (Dinero Real + Control Parental) */}
            <button
              onClick={() =>
                handleRequestPurchase('workshops_unlimited', 0, 'Pase Ilimitado de Talleres', '$14.900 COP')
              }
              className="w-full p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md flex items-center justify-between gap-2 active:scale-95 transition-all"
            >
              <div className="text-left">
                <div className="font-black text-xs flex items-center gap-1">
                  <span>👑 Pase Ilimitado de Talleres</span>
                </div>
                <div className="text-[10px] font-bold text-purple-100">
                  Descarga todos los talleres PDF con QR sin límites · Pago único
                </div>
              </div>
              <span className="px-2.5 py-1 bg-white text-purple-900 font-black text-xs rounded-xl shrink-0">
                $14.900 COP
              </span>
            </button>
          </div>
        )}

        {activeTab === 'stars' && (
          <div className="animate-fadeIn space-y-2.5">
            <div className="clay-card-purple p-3.5 space-y-2.5">
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
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <span>{isAdLoading ? '📺 Cargando anuncio...' : '📺 Ver Video Recompensa (+100 ⭐ GRATIS)'}</span>
              </button>

              {/* Paquetes de Estrellas de Google Play (Compras con dinero) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleRequestPurchase('stars_pack_500', 500, 'Bolsa de Estrellas', '$5.000 COP')}
                  className="p-2.5 bg-white hover:bg-purple-50 border-2 border-purple-200 rounded-2xl flex flex-col items-center justify-between text-center transition-all active:scale-95 shadow-2xs"
                >
                  <span className="text-base font-black">⭐ 500</span>
                  <span className="font-black text-[11px] text-purple-950 my-1">Bolsa</span>
                  <span className="px-2 py-1 bg-purple-600 text-white font-black text-[10px] rounded-xl w-full">
                    $5.000
                  </span>
                </button>

                <button
                  onClick={() => handleRequestPurchase('stars_pack_2500', 2500, 'Saco de Estrellas', '$19.900 COP')}
                  className="p-2.5 bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl flex flex-col items-center justify-between text-center transition-all active:scale-95 shadow-xs relative"
                >
                  <span className="absolute -top-2 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    🔥 Popular
                  </span>
                  <span className="text-base font-black mt-0.5">⭐ 2.500</span>
                  <span className="font-black text-[11px] text-amber-950 my-1">Saco</span>
                  <span className="px-2 py-1 bg-amber-500 text-amber-950 font-black text-[10px] rounded-xl w-full">
                    $19.900
                  </span>
                </button>

                <button
                  onClick={() => handleRequestPurchase('stars_pack_6000', 6000, 'Cofre de Estrellas', '$39.900 COP')}
                  className="p-2.5 bg-gradient-to-b from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl flex flex-col items-center justify-between text-center transition-all active:scale-95 shadow-xs relative"
                >
                  <span className="absolute -top-2 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    👑 Mejor
                  </span>
                  <span className="text-base font-black mt-0.5">⭐ 6.000</span>
                  <span className="font-black text-[11px] text-emerald-950 my-1">Cofre</span>
                  <span className="px-2 py-1 bg-emerald-600 text-white font-black text-[10px] rounded-xl w-full">
                    $39.900
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
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center px-3 sm:px-4 overflow-y-auto no-print animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full max-h-[88vh] overflow-y-auto my-auto rounded-[1.75rem]"
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        <StoreView {...viewProps} />
      </div>
    </div>
  );
};
