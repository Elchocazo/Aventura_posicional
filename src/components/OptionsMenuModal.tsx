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
  Sparkles,
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
  onChangeLevel: (level: GradeLevel) => void;
  onChangeMode: (mode: GameMode) => void;
  onResetStats: () => void;
  onOpenWelcome?: () => void;
}

const MODES: { id: GameMode; label: string; icon: string; desc: string }[] = [
  { id: 'add', label: 'Suma', icon: '➕', desc: 'Añadir y agrupar' },
  { id: 'sub', label: 'Resta', icon: '➖', desc: 'Quitar y desagrupar' },
  { id: 'mix', label: 'Mixto', icon: '🔀', desc: 'Sumas y Restas' },
];

const GRADES: { level: GradeLevel; label: string; desc: string }[] = [
  { level: 2, label: '2° Grado', desc: 'Decenas y Unidades (10 a 99)' },
  { level: 3, label: '3° Grado', desc: 'Centenas, D y U (100 a 999)' },
  { level: 4, label: '4° Grado', desc: 'Unidades de Mil (1,000 a 9,999)' },
  { level: 5, label: '5° Grado', desc: 'Decenas de Mil (10,000 a 99,999)' },
];

export const OptionsMenuModal: React.FC<OptionsMenuModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  currentLevel,
  currentMode,
  onChangeLevel,
  onChangeMode,
  onResetStats,
  onOpenWelcome,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print animate-fadeIn">
      <div className="clay-card rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-4 border-white text-slate-800 relative max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500 text-white rounded-2xl shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-sky-950 leading-tight">
                Niveles y Modos de Juego
              </h2>
              <p className="text-[11px] font-extrabold text-slate-500">
                Selecciona tu grado y tipo de operación
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

        {/* 1. SELECCIÓN DE MODO DE OPERACIÓN */}
        <div className="space-y-2">
          <span className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>⚡ Modo de Operación</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => {
              const isActive = currentMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    sound.playSelect();
                    onChangeMode(m.id);
                  }}
                  className={`p-3 rounded-2xl border-2 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                    isActive
                      ? 'clay-btn-sky text-white border-sky-400 shadow-md scale-105'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-black text-xs">{m.label}</span>
                  <span className="text-[9px] opacity-80 font-normal">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SELECCIÓN DE GRADO / DIFICULTAD */}
        <div className="space-y-2">
          <span className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Selecciona tu Grado</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GRADES.map((g) => {
              const isActive = currentLevel === g.level;
              return (
                <button
                  key={g.level}
                  onClick={() => {
                    sound.playSelect();
                    onChangeLevel(g.level);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between ${
                    isActive
                      ? 'clay-card-emerald border-emerald-400 text-emerald-950 shadow-md ring-2 ring-emerald-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm">{g.label}</span>
                    {isActive && (
                      <span className="bg-emerald-500 text-white p-1 rounded-full text-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 mt-1">
                    {g.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. AUDIO & SOUND EFFECT */}
        <div className="clay-card-sky p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-sky-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span>Efectos de Sonido</span>
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

        {/* 4. REINICIAR ESTADÍSTICAS */}
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

        {/* BOTÓN CERRAR */}
        <button
          onClick={() => {
            sound.playSelect();
            onClose();
          }}
          className="w-full py-3 clay-btn-sky font-black text-xs rounded-2xl"
        >
          ¡A Jugar! 🚀
        </button>
      </div>
    </div>
  );
};

