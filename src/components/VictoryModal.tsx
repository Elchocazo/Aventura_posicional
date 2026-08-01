import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, Timer, ShoppingBag, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToStore: () => void;
  timerSeconds: number;
  bestTimeSeconds: number | null;
  isNewRecord: boolean;
  earnedStars: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  onGoToStore,
  timerSeconds,
  bestTimeSeconds,
  isNewRecord,
  earnedStars,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playFanfare();
      // Fire confetti burst!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div className="clay-card rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-white text-center relative text-slate-800">
        <div className="text-6xl my-2 animate-bounce">🥇</div>

        <h2 className="font-black text-2xl text-amber-900 tracking-tight">
          ¡MEDALLA DE ORO!
        </h2>

        <div className="flex justify-center items-center gap-1.5 my-2 text-2xl">
          <Star className="fill-amber-400 text-amber-500 w-8 h-8 drop-shadow-sm" />
          <Star className="fill-amber-400 text-amber-500 w-10 h-10 drop-shadow-sm -translate-y-1" />
          <Star className="fill-amber-400 text-amber-500 w-8 h-8 drop-shadow-sm" />
        </div>

        <p className="font-black text-xs text-slate-600">
          ¡Completaste toda la aventura de ejercicios!
        </p>

        {/* Stats Summary */}
        <div className="my-4 clay-card-amber p-3.5 space-y-2 text-xs">
          <div className="flex justify-between font-extrabold text-amber-950">
            <span className="flex items-center gap-1">
              <Timer className="w-4 h-4 text-amber-700" /> Tiempo:
            </span>
            <span className="font-black text-amber-950 text-sm">{formatTime(timerSeconds)}</span>
          </div>

          <div className="flex justify-between font-extrabold text-amber-950">
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-700" /> Mejor Récord:
            </span>
            <span className="font-black text-amber-950 text-sm">
              {bestTimeSeconds ? formatTime(bestTimeSeconds) : formatTime(timerSeconds)}
            </span>
          </div>

          {isNewRecord && (
            <div className="bg-amber-300/80 text-amber-950 font-black p-2 rounded-xl text-center text-xs animate-pulse border border-amber-400">
              🏆 ¡NUEVO RÉCORD PERSONAL DE TIEMPO!
            </div>
          )}

          <div className="font-black text-base text-amber-950 pt-1 border-t border-amber-300/60">
            ⭐ +{earnedStars} Estrellas Ganadas
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 mt-4">
          <button
            onClick={onClose}
            className="w-full py-3.5 clay-btn-sky font-black text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> ¡Jugar de Nuevo!
          </button>

          <button
            onClick={onGoToStore}
            className="w-full py-3 clay-btn-purple font-black text-sm flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Ir a la Tienda de Mascotas
          </button>
        </div>
      </div>
    </div>
  );
};
