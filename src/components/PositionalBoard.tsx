import React from 'react';
import { COLUMN_INFO } from '../data/constants';
import { GamePhase, PositionalCol } from '../types';
import { sound } from '../utils/sound';

interface PositionalBoardProps {
  num1: number;
  num2: number;
  operation: '+' | '-';
  activeCols: PositionalCol[];
  gamePhase: GamePhase;
  placedDigits: Record<string, string>; // key: `${row}_${col}`, value: digit
  selectedDigit: string | null;
  onCellClick: (row: string, col: PositionalCol) => void;
  incorrectResultCols: PositionalCol[];
}

export const PositionalBoard: React.FC<PositionalBoardProps> = ({
  num1,
  num2,
  operation,
  activeCols,
  gamePhase,
  placedDigits,
  selectedDigit,
  onCellClick,
  incorrectResultCols,
}) => {
  // Determine digit length for cell layout
  const maxDigits = activeCols.length;

  const getCellValue = (row: string, col: PositionalCol): string => {
    return placedDigits[`${row}_${col}`] || '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, row: string, col: PositionalCol) => {
    e.preventDefault();
    const digit = e.dataTransfer.getData('text/plain');
    if (digit) {
      sound.playPop();
      onCellClick(row, col);
    }
  };

  // Check if cell is disabled in num1 or num2 based on number length
  const isCellDisabled = (row: string, col: PositionalCol): boolean => {
    const valStr = row === 'num1' ? num1.toString() : row === 'num2' ? num2.toString() : '';
    if (!valStr) return false;
    const len = valStr.length;
    const colIdx = activeCols.indexOf(col);
    const requiredStartIndex = maxDigits - len;
    return colIdx < requiredStartIndex;
  };

  return (
    <div className="clay-card p-3.5 sm:p-5 flex flex-col items-center w-full overflow-hidden">
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <span className="font-black text-xs sm:text-base text-slate-800 flex items-center gap-1.5">
          📋 Tablero Posicional
        </span>
        <span className="text-[11px] sm:text-xs font-black text-sky-800 bg-sky-100/80 border border-sky-200 px-3 py-1 rounded-2xl shadow-2xs">
          {operation === '+' ? 'Suma (+)' : 'Resta (-)'}
        </span>
      </div>

      <div
        className="grid gap-1.5 sm:gap-2 justify-center items-center py-1 w-full max-w-full"
        style={{ gridTemplateColumns: `36px repeat(${activeCols.length}, minmax(0, 1fr))` }}
      >
        {/* Row 1: Header Row with Color Dot Badges */}
        <div className="w-9 text-center"></div>
        {activeCols.map((col) => {
          const info = COLUMN_INFO[col];
          const dotEmoji = col === 'u' ? '🔴' : col === 'd' ? '🔵' : col === 'c' ? '🟢' : col === 'um' ? '🟡' : '🟣';
          return (
            <div
              key={`head_${col}`}
              className={`px-1 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-white font-black text-center text-xs sm:text-sm bg-gradient-to-b ${info.headerGradient} shadow-[0_3px_0_rgba(0,0,0,0.15),inset_0_2px_3px_rgba(255,255,255,0.4)] border-2 border-white/40 flex flex-col items-center justify-center`}
            >
              <div className="flex items-center gap-0.5 font-black">
                <span className="text-[10px]">{dotEmoji}</span>
                <span>{col.toUpperCase()}</span>
              </div>
              <div className="text-[9px] sm:text-[10px] font-extrabold opacity-95 truncate">{info.name.split(' ')[0]}</div>
            </div>
          );
        })}

        {/* Row 2: Carries Row (Llevadas) */}
        <div className="w-9 font-black text-[10px] text-pink-600 text-center leading-tight flex flex-col items-center justify-center">
          <span>💡</span>
          <span>Llev.</span>
        </div>
        {activeCols.map((col) => {
          const val = getCellValue('carry', col);
          const isFilled = Boolean(val);
          const canInteract = gamePhase === 'calculating';

          return (
            <button
              key={`carry_${col}`}
              onClick={() => canInteract && onCellClick('carry', col)}
              onDragOver={handleDragOver}
              onDrop={(e) => canInteract && handleDrop(e, 'carry', col)}
              disabled={!canInteract}
              className={`h-9 sm:h-11 w-full border-2 border-dashed rounded-lg sm:rounded-xl font-black text-xs sm:text-base flex items-center justify-center transition-all shadow-2xs ${
                isFilled
                  ? 'border-pink-500 bg-pink-100 text-pink-800 border-solid scale-100'
                  : canInteract
                  ? 'border-pink-300 bg-pink-50/60 hover:bg-pink-100 text-pink-500 hover:border-pink-400 cursor-pointer'
                  : 'border-slate-200 bg-slate-50 text-transparent cursor-not-allowed'
              }`}
            >
              {val}
            </button>
          );
        })}

        {/* Row 3: Num 1 Row */}
        <div className="w-9 font-extrabold text-slate-400 text-center"></div>
        {activeCols.map((col) => {
          const disabled = isCellDisabled('num1', col);
          const val = getCellValue('num1', col);
          const isFilled = Boolean(val);
          const canInteract = gamePhase === 'placing' && !disabled;

          return (
            <button
              key={`num1_${col}`}
              onClick={() => canInteract && onCellClick('num1', col)}
              onDragOver={handleDragOver}
              onDrop={(e) => canInteract && handleDrop(e, 'num1', col)}
              disabled={!canInteract}
              className={`h-12 sm:h-15 w-full border-2 rounded-xl sm:rounded-2xl font-black text-xl sm:text-3xl flex items-center justify-center transition-all ${
                disabled
                  ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-40'
                  : isFilled
                  ? 'border-sky-400 bg-sky-50/90 text-slate-900 border-solid shadow-2xs'
                  : canInteract
                  ? 'border-dashed border-sky-300 bg-white hover:bg-sky-50 text-sky-600 cursor-pointer active:scale-95'
                  : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              {val}
            </button>
          );
        })}

        {/* Row 4: Num 2 Row with Operator */}
        <div className="w-9 font-black text-xl sm:text-3xl text-sky-600 flex items-center justify-center">
          {operation}
        </div>
        {activeCols.map((col) => {
          const disabled = isCellDisabled('num2', col);
          const val = getCellValue('num2', col);
          const isFilled = Boolean(val);
          const canInteract = gamePhase === 'placing' && !disabled;

          return (
            <button
              key={`num2_${col}`}
              onClick={() => canInteract && onCellClick('num2', col)}
              onDragOver={handleDragOver}
              onDrop={(e) => canInteract && handleDrop(e, 'num2', col)}
              disabled={!canInteract}
              className={`h-12 sm:h-15 w-full border-2 rounded-xl sm:rounded-2xl font-black text-xl sm:text-3xl flex items-center justify-center transition-all ${
                disabled
                  ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-40'
                  : isFilled
                  ? 'border-sky-400 bg-sky-50/90 text-slate-900 border-solid shadow-2xs'
                  : canInteract
                  ? 'border-dashed border-sky-300 bg-white hover:bg-sky-50 text-sky-600 cursor-pointer active:scale-95'
                  : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              {val}
            </button>
          );
        })}

        {/* Equals Divider Line */}
        <div className="col-span-full my-0.5">
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 rounded-full" />
        </div>

        {/* Row 5: Result Row */}
        <div className="w-9 font-black text-xl sm:text-3xl text-emerald-600 flex items-center justify-center">
          =
        </div>
        {activeCols.map((col) => {
          const val = getCellValue('result', col);
          const isFilled = Boolean(val);
          const isIncorrect = incorrectResultCols.includes(col);
          const canInteract = gamePhase === 'calculating';

          return (
            <button
              key={`result_${col}`}
              onClick={() => canInteract && onCellClick('result', col)}
              onDragOver={handleDragOver}
              onDrop={(e) => canInteract && handleDrop(e, 'result', col)}
              disabled={!canInteract}
              className={`h-12 sm:h-15 w-full border-2 rounded-xl sm:rounded-2xl font-black text-xl sm:text-3xl flex items-center justify-center transition-all ${
                isIncorrect
                  ? 'border-rose-500 bg-rose-100 text-rose-700 animate-shake'
                  : isFilled
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 border-solid shadow-2xs'
                  : canInteract
                  ? 'border-dashed border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-600 cursor-pointer active:scale-95'
                  : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );
};
