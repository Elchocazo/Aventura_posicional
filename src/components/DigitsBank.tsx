import React from 'react';
import { GamePhase } from '../types';
import { sound } from '../utils/sound';

interface DigitChip {
  id: string;
  value: string;
  isDistractor?: boolean;
  isCarry?: boolean;
  used?: boolean;
}

interface DigitsBankProps {
  chips: DigitChip[];
  selectedChipId: string | null;
  onSelectChip: (chipId: string) => void;
  gamePhase: GamePhase;
}

export const DigitsBank: React.FC<DigitsBankProps> = ({
  chips,
  selectedChipId,
  onSelectChip,
  gamePhase,
}) => {
  // En la fase de cálculo de resultado, siempre garantizamos los dígitos del 0 al 9 para armar el total
  const activeChips = gamePhase === 'calculating'
    ? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((v, i) => ({
        id: `res_digit_${i}`,
        value: v,
        used: false,
      }))
    : chips;

  return (
    <div className="clay-card p-2.5 sm:p-4 text-center w-full space-y-2">
      <div className="text-xs sm:text-sm font-black text-slate-800 bg-slate-100/90 p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
        {gamePhase === 'placing' ? (
          <div className="flex items-center justify-center gap-1.5 text-center text-xs">
            <span>👇 1. Toca un número</span>
            <span className="text-sky-800">➡️ 2. Toca su casilla en el tablero</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-emerald-900 text-xs font-black">
            <span>🧮 Toca un número de abajo para poner el resultado</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2.5 min-h-[48px] py-0.5">
        {activeChips.map((chip) => {
          if (chip.used && gamePhase !== 'calculating') return null;

          const isSelected = selectedChipId === chip.id;

          return (
            <button
              key={chip.id}
              onClick={() => {
                sound.playSelect();
                onSelectChip(chip.id);
              }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', chip.value);
                onSelectChip(chip.id);
              }}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-black text-lg sm:text-xl flex items-center justify-center border-2 border-white cursor-pointer transition-all active:translate-y-1 ${
                chip.isCarry
                  ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white w-9 h-9 sm:w-10 sm:h-10 text-base shadow-[0_3px_0_#be123c,inset_0_2px_4px_rgba(255,255,255,0.4)]'
                  : chip.isDistractor
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-[0_3px_0_#4338ca,inset_0_2px_4px_rgba(255,255,255,0.4)]'
                  : 'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-[0_3px_0_#1d4ed8,inset_0_2px_4px_rgba(255,255,255,0.4)]'
              } ${
                isSelected
                  ? 'ring-4 ring-amber-400 ring-offset-1 scale-110 -translate-y-1'
                  : 'hover:-translate-y-0.5'
              }`}
            >
              {chip.value}
            </button>
          );
        })}
      </div>
    </div>
  );
};
