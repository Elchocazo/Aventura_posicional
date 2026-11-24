import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Check,
  ShieldAlert,
  ShieldCheck,
  Layers,
  Lock,
  Unlock,
} from 'lucide-react';
import { GradeLevel, GameMode } from '../types';
import { PROGRESSIVE_STAGES } from '../data/constants';
import { sound } from '../utils/sound';

interface OptionsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentLevel: GradeLevel;
  currentMode: GameMode;
  solvedCount: number;
  freePracticeMode: boolean;
  onToggleFreePractice: () => void;
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

export const OptionsMenuModal: React.FC<OptionsMenuModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  currentLevel,
  currentMode,
  solvedCount,
  freePracticeMode,
  onToggleFreePractice,
  onChangeLevel,
  onChangeMode,
  onResetStats,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="clay-card rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-4 border-white text-slate-800 relative max-h-[90vh] overflow-y-auto space-y-5 my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500 text-white rounded-2xl shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-sky-950 leading-tight">
                Ruta de Avance y Modos
              </h2>
              <p className="text-[11px] font-extrabold text-slate-500">
                Avanza por etapas progresivas y elige tu operación
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

        {/* 2. RUTA DE AVANCE PROGRESIVO */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Ruta Progresiva</span>
            </span>
            <button
              onClick={() => {
                sound.playSelect();
                onToggleFreePractice();
              }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 border transition-all ${
                freePracticeMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Permite a padres o docentes elegir cualquier etapa libremente"
            >
              {freePracticeMode ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>{freePracticeMode ? 'Modo Libre: ON' : 'Modo Libre'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {PROGRESSIVE_STAGES.map((stage) => {
              const isUnlocked = freePracticeMode || solvedCount >= stage.requiredSolved;
              const isActive = currentLevel === stage.level;
              const remaining = Math.max(0, stage.requiredSolved - solvedCount);

              return (
                <button
                  key={stage.level}
                  onClick={() => {
                    if (!isUnlocked) {
                      sound.playError();
                      return;
                    }
                    sound.playSelect();
                    onChangeLevel(stage.level);
                  }}
                  className={`w-full p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-2.5 ${
                    isActive
                      ? 'clay-card-emerald border-emerald-400 text-emerald-950 shadow-md ring-2 ring-emerald-400'
                      : isUnlocked
                      ? 'bg-white border-slate-200 hover:border-sky-300 text-slate-700 active:scale-98'
                      : 'bg-slate-50 border-slate-200/80 text-slate-400 opacity-75 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        isUnlocked
                          ? `bg-gradient-to-br ${stage.gradient} text-white shadow-xs`
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isUnlocked ? stage.icon : <Lock className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-xs sm:text-sm truncate">{stage.name}</div>
                      <div className="text-[10px] font-bold text-slate-500 truncate">{stage.desc}</div>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="bg-emerald-500 text-white p-1 rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : !isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-600 font-black text-[10px] whitespace-nowrap shrink-0">
                      +{remaining} retos
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-700 font-black text-[10px] shrink-0">
                      Jugar
                    </span>
                  )}
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

        {/* 4.5. POLÍTICA DE PRIVACIDAD Y SEGURIDAD INFANTIL */}
        <div className="pt-1 border-t border-slate-200/80 space-y-2">
          <button
            onClick={() => {
              sound.playSelect();
              setShowPrivacyInfo((v) => !v);
            }}
            className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-2 border-indigo-200 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>{showPrivacyInfo ? 'Ocultar Política de Privacidad' : 'Política de Privacidad y Seguridad'}</span>
          </button>

          {showPrivacyInfo && (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 text-[11px] text-slate-600 space-y-1.5 leading-relaxed animate-fadeIn">
              <p className="font-black text-slate-800">Privacidad en NumiMates:</p>
              <p>• <strong>Datos locales:</strong> Los perfiles, estrellas, rachas y progreso se guardan únicamente en este dispositivo. No recopilamos datos personales identificables de menores.</p>
              <p>• <strong>Cámara (QR):</strong> El permiso de cámara se usa exclusivamente para escanear códigos QR de fichas educativas impresas; no grabamos ni enviamos fotos a servidores externos.</p>
              <p>• <strong>Anuncios y Compras:</strong> Los anuncios recompensados son voluntarios (Google AdMob) y las compras de paquetes en Google Play están protegidas por Control Parental.</p>
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

