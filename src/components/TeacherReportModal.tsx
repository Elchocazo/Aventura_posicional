import React from 'react';
import { X, RotateCcw, Award, CheckCircle, Flame, Star, Camera, Share2, Calendar } from 'lucide-react';
import { DailyStatsEntry, TeacherReportStats } from '../types';
import { sound } from '../utils/sound';
import { getLast7DayKeys } from '../utils/profiles';

interface TeacherReportViewProps {
  stats: TeacherReportStats;
  dailyHistory?: DailyStatsEntry[];
  onResetStats: () => void;
  onPrintWorksheet: () => void;
  onOpenQrScanner?: () => void;
}

export const TeacherReportView: React.FC<TeacherReportViewProps> = ({
  stats,
  dailyHistory = [],
  onResetStats,
  onPrintWorksheet,
  onOpenQrScanner,
}) => {
  const last7Days = getLast7DayKeys().map((day) => {
    const found = dailyHistory.find((h) => h.date === day.key);
    return {
      ...day,
      solved: found?.solved || 0,
      errors: found?.errors || 0,
    };
  });
  const maxDailySolved = Math.max(5, ...last7Days.map((d) => d.solved));
  const weeklyTotalSolved = last7Days.reduce((acc, d) => acc + d.solved, 0);
  const weeklyTotalErrors = last7Days.reduce((acc, d) => acc + d.errors, 0);
  const weeklyAccuracy =
    weeklyTotalSolved + weeklyTotalErrors > 0
      ? Math.round((weeklyTotalSolved / (weeklyTotalSolved + weeklyTotalErrors)) * 100)
      : 0;
  return (
    <div className="clay-card p-5 sm:p-6 text-slate-800 space-y-4">
      <div className="flex items-center gap-2.5 border-b-2 border-slate-100 pb-3 pr-10">
        <span className="text-3xl">🎓</span>
        <div>
          <h2 className="font-black text-lg sm:text-xl text-indigo-900 leading-none">
            Progreso de Aprendizaje
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Resumen de desempeño académico y hoja de trabajo imprimible
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="clay-card-sky p-3.5 text-center flex flex-col items-center justify-center">
          <div className="text-sky-700 mb-1">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="font-black text-2xl text-sky-950">{stats.solvedCount}</div>
          <div className="text-[11px] font-black text-sky-800 uppercase tracking-tight">Resueltos</div>
        </div>

        <div className="clay-card-emerald p-3.5 text-center flex flex-col items-center justify-center">
          <div className="text-emerald-700 mb-1">
            <Award className="w-6 h-6" />
          </div>
          <div className="font-black text-2xl text-emerald-950">{stats.accuracy}%</div>
          <div className="text-[11px] font-black text-emerald-800 uppercase tracking-tight">Precisión</div>
        </div>

        <div className="clay-card-orange p-3.5 text-center flex flex-col items-center justify-center">
          <div className="text-orange-700 mb-1">
            <Flame className="w-6 h-6" />
          </div>
          <div className="font-black text-2xl text-orange-950">{stats.maxStreak}</div>
          <div className="text-[11px] font-black text-orange-800 uppercase tracking-tight">Mejor Racha</div>
        </div>

        <div className="clay-card-purple p-3.5 text-center flex flex-col items-center justify-center">
          <div className="text-purple-700 mb-1">
            <Star className="w-6 h-6 fill-purple-400" />
          </div>
          <div className="font-black text-2xl text-purple-950">{stats.points}</div>
          <div className="text-[11px] font-black text-purple-800 uppercase tracking-tight">Estrellas</div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="clay-card-sky p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-black text-xs text-sky-950 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>Resumen Semanal (7 días)</span>
          </span>
          <span className="text-[11px] font-black text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200">
            {weeklyTotalSolved} resueltos · {weeklyAccuracy}%
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 items-end h-24 pt-2">
          {last7Days.map((day) => {
            const heightPct = day.solved > 0 ? Math.max(18, Math.round((day.solved / maxDailySolved) * 100)) : 8;
            return (
              <div key={day.key} className="flex flex-col items-center justify-end h-full gap-1">
                <span className="text-[10px] font-black text-sky-800">{day.solved > 0 ? day.solved : ''}</span>
                <div className="w-full flex items-end justify-center h-14">
                  <div
                    className={`w-full max-w-[26px] rounded-t-xl transition-all ${
                      day.solved > 0
                        ? 'bg-gradient-to-t from-sky-500 to-indigo-400 shadow-xs'
                        : 'bg-sky-200/60'
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${day.label}: ${day.solved} ejercicios`}
                  />
                </div>
                <span className={`text-[10px] font-bold ${day.label === 'Hoy' ? 'text-indigo-700 font-black' : 'text-slate-500'}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2.5 mt-4">
        {onOpenQrScanner && (
          <button
            onClick={() => {
              sound.playSelect();
              onOpenQrScanner();
            }}
            className="w-full py-3.5 clay-btn-purple font-black text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4 text-white" /> Escanear y Calificar Ficha QR (Cámara)
          </button>
        )}

        <button
          onClick={() => {
            sound.playSelect();
            onPrintWorksheet();
          }}
          className="w-full py-3.5 clay-btn-sky font-black text-xs sm:text-sm flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>Compartir / Imprimir Ficha</span>
        </button>

        <button
          onClick={() => {
            sound.playSelect();
            onResetStats();
          }}
          className="w-full py-3 clay-btn-white font-black text-xs sm:text-sm flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" /> Reiniciar Estadísticas de Sesión
        </button>
      </div>
    </div>
  );
};

interface TeacherReportModalProps extends TeacherReportViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherReportModal: React.FC<TeacherReportModalProps> = ({
  isOpen,
  onClose,
  ...viewProps
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full my-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        <TeacherReportView {...viewProps} />
      </div>
    </div>
  );
};
