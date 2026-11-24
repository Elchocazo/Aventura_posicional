import React from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import { ProblemData, GamePhase, GradeLevel } from '../types';
import { getNextStage, getStageByLevel } from '../data/constants';

interface StoryCardProps {
  problem: ProblemData;
  currentProblemIndex: number;
  currentLevel: GradeLevel;
  solvedCount: number;
  gamePhase: GamePhase;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  problem,
  currentProblemIndex,
  currentLevel,
  solvedCount,
  gamePhase,
}) => {
  const stage = getStageByLevel(currentLevel);
  const nextStage = getNextStage(currentLevel);
  const progressToNext = nextStage
    ? Math.min(100, Math.round((solvedCount / nextStage.requiredSolved) * 100))
    : 100;

  return (
    <div className="clay-card p-3 sm:p-4 transition-all relative space-y-2 border-2 border-amber-200/90">
      {/* Row 1: Stage & Challenge Info balanced left-to-right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-[11px] font-black bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-2xs whitespace-nowrap">
            Reto #{currentProblemIndex}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[11px] font-black bg-gradient-to-r ${stage.gradient} text-white shadow-2xs whitespace-nowrap`}
          >
            {stage.icon} {stage.shortName}
          </span>
        </div>

        {nextStage && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap shrink-0">
            {Math.min(solvedCount, nextStage.requiredSolved)}/{nextStage.requiredSolved} → {nextStage.shortName}
          </span>
        )}
      </div>

      {/* Mini Progressive Bar toward Next Stage */}
      {nextStage && (
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${stage.gradient} rounded-full transition-all duration-300`}
            style={{ width: `${Math.max(6, progressToNext)}%` }}
          />
        </div>
      )}

      {/* Problem Story + Question + Keyword Clue */}
      <div className="bg-amber-50/70 px-3 py-2.5 rounded-2xl border border-amber-200/80 space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="text-xl leading-none shrink-0 mt-0.5">{problem.story.icon}</span>
          <p className="text-slate-900 font-bold text-xs sm:text-sm leading-snug">
            {problem.story.text}
          </p>
        </div>

        <div className="flex items-start gap-1.5 pt-1.5 border-t border-amber-200/70 text-amber-950 font-black text-xs sm:text-[13px]">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-snug">{problem.story.question}</span>
        </div>

        {problem.story.keyword && (
          <div className="flex items-center justify-end pt-0.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border ${
                problem.operation === '+'
                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              🔑 Palabra clave ({problem.operation === '+' ? 'Suma +' : 'Resta -'}): «{problem.story.keyword}»
            </span>
          </div>
        )}
      </div>

      {/* Compact Completion Banner (shown only when complete) */}
      {gamePhase === 'complete' && (
        <div className="px-3 py-2 rounded-2xl text-center text-xs font-black bg-emerald-50 text-emerald-900 border-2 border-emerald-300 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Excelente! Toca «Siguiente» para continuar.</span>
        </div>
      )}
    </div>
  );
};
