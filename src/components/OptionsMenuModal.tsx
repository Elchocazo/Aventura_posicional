import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Check,
  ShieldAlert,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { GradeLevel, GameMode } from '../types';
import { sound } from '../utils/sound';

interface OptionsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentLevel: GradeLevel;
  currentMode: GameMode;
  onChangeLevelTab: () => void;
  onResetStats: () => void;
  onOpenWelcome?: () => void;
}

const MODE_LABELS: Record<GameMode, string> = {
  add: 'Suma ➕',
  sub: 'Resta ➖',
  mix: 'Mixto 🔀',
};

export const OptionsMenuModal: React.FC<OptionsMenuModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  currentLevel,
  currentMode,
  onChangeLevelTab,
  onResetStats,
  onOpenWelcome,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print animate-fadeIn">
      <div className="clay-card rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border-4 border-white text-slate-800 relative max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500 text-white rounded-2xl shadow-xs">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-sky-950 leading-tight">
                Opciones
              </h2>
              <p className="text-[11px] font-extrabold text-slate-500">
                Ajustes principales del juego
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playSelect();
              onClose();
            }}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xs transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. AUDIO & SOUND EFFECT */}
        <div className="clay-card-sky p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-sky-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span>Sonido</span>
            </span>

            <button
              onClick={() => {
                onToggleSound();
                if (!soundEnabled) {
                  sound.playSuccess();
                }
              }}
              className={`px-3.5 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? 'clay-btn-emerald text-white'
                  : 'bg-slate-200 text-slate-600 border-2 border-slate-300'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ACTIVADO</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>DESACTIVADO</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. CURRENT GRADE & MODE SUMMARY WITH DIRECT LINK TO NIVELES TAB */}
        <div className="clay-card-purple p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Configuración Actual</span>
            </span>
            <span className="text-xs font-black bg-white/80 px-2.5 py-0.5 rounded-full text-purple-950 border border-purple-200">
              {currentLevel}° Grado • {MODE_LABELS[currentMode]}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playSelect();
              onClose();
              onChangeLevelTab();
            }}
            className="w-full mt-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <span>Cambiar Grado y Operación</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onOpenWelcome && (
            <button
              onClick={() => {
                sound.playSelect();
                onClose();
                onOpenWelcome();
              }}
              className="w-full py-2 px-3 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <span>Ver Pantalla de Bienvenida 👋</span>
            </button>
          )}
        </div>

        {/* 3. RESET SESSION STATS */}
        <div className="pt-1 border-t border-slate-200/80">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-200 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reiniciar Puntos y Racha de Sesión</span>
            </button>
          ) : (
            <div className="bg-rose-100 border-2 border-rose-300 p-3 rounded-2xl space-y-2 text-center animate-fadeIn">
              <p className="font-black text-xs text-rose-950 flex items-center justify-center gap-1">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>¿Reiniciar estrellas y racha acumuladas?</span>
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 bg-white text-slate-700 font-black text-xs rounded-xl border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    sound.playPop();
                    onResetStats();
                    setShowConfirmReset(false);
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white font-black text-xs rounded-xl border border-rose-700 shadow-xs"
                >
                  Sí, Reiniciar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CLOSE BUTTON AT BOTTOM */}
        <button
          onClick={() => {
            sound.playSelect();
            onClose();
          }}
          className="w-full py-3 clay-btn-sky font-black text-xs rounded-2xl"
        >
          Cerrar 🚀
        </button>
      </div>
    </div>
  );
};
