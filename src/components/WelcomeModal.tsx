import React from 'react';
import {
  Sparkles,
  Play,
  Award,
  BookOpen,
  Printer,
  Compass,
  CheckCircle2,
  X,
  Volume2,
} from 'lucide-react';
import { GradeLevel } from '../types';
import { sound } from '../utils/sound';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  equippedMascot: string;
  equippedAccessory: string;
  currentLevel: GradeLevel;
  onSelectLevel: (level: GradeLevel) => void;
  onStartGame: () => void;
  hasSavedGame?: boolean;
}

const GRADE_LABELS: Record<GradeLevel, { label: string; desc: string }> = {
  2: { label: '2° Grado', desc: 'Decenas y Unidades (D, U)' },
  3: { label: '3° Grado', desc: 'Centenas, D y U (C, D, U)' },
  4: { label: '4° Grado', desc: 'Unidades de Mil hasta 9,999' },
  5: { label: '5° Grado', desc: 'Decenas de Mil hasta 99,999' },
};

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  playerName,
  equippedMascot,
  equippedAccessory,
  currentLevel,
  onSelectLevel,
  onStartGame,
  hasSavedGame = false,
}) => {
  if (!isOpen) return null;

  const handleStart = () => {
    sound.playSuccess();
    onStartGame();
    onClose();
  };

  const handleLevelClick = (lvl: GradeLevel) => {
    sound.playSelect();
    onSelectLevel(lvl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 no-print animate-fadeIn">
      <div className="clay-card rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border-4 border-white text-slate-800 relative max-h-[92vh] overflow-y-auto space-y-5 bg-gradient-to-b from-sky-50 via-white to-amber-50">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playSelect();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-all active:scale-90"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Mascot Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="relative inline-block">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-200 via-sky-200 to-indigo-200 border-4 border-white shadow-lg flex items-center justify-center text-4xl sm:text-5xl animate-bounce-slow relative">
              <span>{equippedMascot}</span>
              <span className="absolute -top-3 -right-2 text-2xl sm:text-3xl drop-shadow-md">
                {equippedAccessory}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-xs border-2 border-white">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300">
              👋 ¡Bienvenido de nuevo!
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-sky-950 mt-1 leading-tight">
              Aventura Matemática: Valor Posicional
            </h1>
            <p className="text-xs sm:text-sm font-extrabold text-slate-600">
              ¡Hola, <span className="text-indigo-700">{playerName}</span>! ¿Listo para calcular?
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-white/80 rounded-2xl border border-sky-200 shadow-2xs space-y-1">
            <div className="w-8 h-8 mx-auto rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-black text-slate-800 leading-tight">Historias Dinámicas</p>
          </div>

          <div className="p-2.5 bg-white/80 rounded-2xl border border-amber-200 shadow-2xs space-y-1">
            <div className="w-8 h-8 mx-auto rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-black text-slate-800 leading-tight">Desbloquea Mascotas</p>
          </div>

          <div className="p-2.5 bg-white/80 rounded-2xl border border-purple-200 shadow-2xs space-y-1">
            <div className="w-8 h-8 mx-auto rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-black text-slate-800 leading-tight">Fichas PDF + QR</p>
          </div>
        </div>

        {/* Grade Selector */}
        <div className="space-y-2 bg-white/90 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <label className="block text-xs font-black text-slate-700 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-sky-600" />
            <span>Selecciona tu Nivel / Grado escolar:</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(GRADE_LABELS) as unknown as GradeLevel[]).map((lvl) => {
              const isSelected = currentLevel === Number(lvl);
              const info = GRADE_LABELS[lvl];
              return (
                <button
                  key={`welcome_lvl_${lvl}`}
                  onClick={() => handleLevelClick(Number(lvl) as GradeLevel)}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all text-xs font-black flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-500 text-white border-sky-600 shadow-xs scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                  }`}
                >
                  <div>
                    <div className="font-extrabold">{info.label}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                      {info.desc}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main CTA */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleStart}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-white shrink-0" />
            <span>{hasSavedGame ? '🎮 Continuar Aventura' : '🚀 ¡Iniciar Aventura!'}</span>
          </button>

          <p className="text-[11px] text-center font-extrabold text-slate-500">
            {hasSavedGame
              ? 'Guardado automático activo. Tu progreso está seguro.'
              : 'Completa ejercicios para ganar estrellas y desbloquear medallas.'}
          </p>
        </div>

      </div>
    </div>
  );
};
