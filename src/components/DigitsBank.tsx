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
  // No mostrar tarjeta vacía cuando el problema ya está completado
  if (gamePhase === 'complete') return null;

  // En la fase de cálculo de resultado, siempre garantizamos los dígitos del 0 al 9 para armar el total
  const activeChips =
    gamePhase === 'calculating'
      ? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((v, i) => ({
          id: `res_digit_${i}`,
          value: v,
          used: false,
        }))
      : chips;

  const remainingPlacingChips =
    gamePhase === 'placing' ? activeChips.filter((c) => !c.used) : activeChips;

  return (
    <div className="clay-card p-2.5 sm:p-3.5 text-center w-full space-y-2">
      <div className="text-[11px] sm:text-xs font-black text-slate-700 bg-slate-100/90 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
        {gamePhase === 'placing' ? (
          remainingPlacingChips.length === 0 ? (
            <span className="text-emerald-700">
              ✅ ¡Números listos! Ahora toca «¡Acomodado! 🚀»
            </span>
          ) : (
            <span>
              👇 Toca un número y luego su casilla en el tablero
            </span>
          )
        ) : (
          <span className="text-emerald-800">
            🧮 Toca un dígito para escribir el resultado o lo que llevas
          </span>
        )}
      </div>

      {remainingPlacingChips.length > 0 && (
        <div
          className={
            gamePhase === 'calculating'
              ? 'grid grid-cols-5 gap-1.5 sm:gap-2 max-w-xs mx-auto pt-0.5'
              : 'flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 pt-0.5'
          }
        >
          {remainingPlacingChips.map((chip) => {
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
                className={`${
                  gamePhase === 'calculating' ? 'w-full h-10 sm:h-11' : 'w-10 h-10 sm:w-11 sm:h-11'
                } rounded-xl font-black text-lg sm:text-xl flex items-center justify-center border-2 border-white cursor-pointer transition-all active:translate-y-0.5 ${
                  chip.isCarry
                    ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-[0_3px_0_#be123c,inset_0_2px_4px_rgba(255,255,255,0.4)]'
                    : chip.isDistractor
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-[0_3px_0_#4338ca,inset_0_2px_4px_rgba(255,255,255,0.4)]'
                    : 'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-[0_3px_0_#1d4ed8,inset_0_2px_4px_rgba(255,255,255,0.4)]'
                } ${
                  isSelected
                    ? 'ring-4 ring-amber-400 ring-offset-1 scale-105 -translate-y-0.5'
                    : 'hover:-translate-y-0.5'
                }`}
              >
                {chip.value}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
