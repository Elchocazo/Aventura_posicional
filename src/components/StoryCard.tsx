import React from 'react';
import { HelpCircle, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProblemData, GamePhase } from '../types';

interface StoryCardProps {
  problem: ProblemData;
  currentProblemIndex: number;
  gradeLabel: string;
  gamePhase: GamePhase;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  problem,
  currentProblemIndex,
  gradeLabel,
  gamePhase,
}) => {
  // Format short grade label
  const shortGrade = gradeLabel.split(' ')[0] || gradeLabel;

  return (
    <div className="clay-card p-4 sm:p-5 transition-all relative space-y-3 border-3 border-amber-200">
      {/* Header Badges Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-2xl text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-[0_3px_0_#0369a1,inset_0_2px_3px_rgba(255,255,255,0.4)]">
            📖 Problema #{currentProblemIndex}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            {shortGrade}
          </span>
        </div>
      </div>

      {/* Story Card Content */}
      <div className="flex items-start gap-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-200 to-sky-200 border-2 border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_8px_rgba(186,230,253,0.5)] flex items-center justify-center text-3xl sm:text-4xl shrink-0 mt-0.5">
          {problem.story.icon}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-slate-900 font-black text-xs sm:text-sm leading-relaxed">
            {problem.story.text}
          </p>

          <div className="clay-card-amber p-2.5 flex items-start gap-2 text-amber-950 font-black text-xs border-2 border-amber-300">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{problem.story.question}</span>
          </div>
        </div>
      </div>

      {/* Completion Banner (shown only when complete) */}
      {gamePhase === 'complete' && (
        <div className="p-3 rounded-2xl text-center text-xs font-black transition-all shadow-2xs bg-emerald-50 text-emerald-900 border-2 border-emerald-300">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>¡Excelente! Respuesta correcta. Toca "Siguiente" para continuar.</span>
          </div>
        </div>
      )}
    </div>
  );
};


