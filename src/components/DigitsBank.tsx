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
  return (
    <div className="clay-card p-3.5 sm:p-5 text-center w-full space-y-2.5">
      <div className="text-xs sm:text-sm font-black text-slate-800 bg-slate-100/90 p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {gamePhase === 'placing' ? (
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span>👇 1. Toca o arrastra un número</span>
            <span className="text-sky-800">➡️ 2. Toca su casilla en el tablero</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-emerald-900">
            <span>🧮 Toca una ficha de resultado y ponla en el total</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3.5 min-h-[56px] py-1">
        {chips.map((chip) => {
          if (chip.used) return null; // Don't show used chips

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
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center border-2 border-white cursor-pointer transition-all active:translate-y-1 ${
                chip.isCarry
                  ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl shadow-[0_4px_0_#be123c,inset_0_2px_4px_rgba(255,255,255,0.4)]'
                  : chip.isDistractor
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-[0_4px_0_#4338ca,inset_0_2px_4px_rgba(255,255,255,0.4)]'
                  : 'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-[0_4px_0_#1d4ed8,inset_0_2px_4px_rgba(255,255,255,0.4)]'
              } ${
                isSelected
                  ? 'ring-4 ring-amber-400 ring-offset-2 scale-110 -translate-y-1'
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
