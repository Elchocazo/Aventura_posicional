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
    <div className="clay-card p-4 sm:p-5 text-slate-800 space-y-3">
      {/* Encabezado centrado y subtítulo justificado */}
      <div className="flex flex-col items-center text-center border-b border-slate-100 pb-3 pt-1 px-6">
        <span className="text-2xl mb-1">🎓</span>
        <h2 className="font-black text-base sm:text-lg text-indigo-900 leading-tight text-center">
          Progreso de Aprendizaje
        </h2>
        <p className="text-[11px] font-semibold text-slate-500 mt-1.5 leading-snug text-justify max-w-xs">
          Resumen de tu desempeño académico diario, estadísticas de la semana y acceso rápido a talleres imprimibles con código QR.
        </p>
      </div>

      {/* Stats Grid compacto y proporcionado */}
      <div className="grid grid-cols-2 gap-2">
        <div className="clay-card-sky px-3 py-2 flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-white/80 text-sky-600 shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-lg text-sky-950 leading-none">{stats.solvedCount}</div>
            <div className="text-[10px] font-extrabold text-sky-800 uppercase tracking-tight mt-0.5">
              Resueltos
            </div>
          </div>
        </div>

        <div className="clay-card-emerald px-3 py-2 flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-white/80 text-emerald-600 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-lg text-emerald-950 leading-none">{stats.accuracy}%</div>
            <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-tight mt-0.5">
              Precisión
            </div>
          </div>
        </div>

        <div className="clay-card-orange px-3 py-2 flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-white/80 text-orange-600 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-lg text-orange-950 leading-none">{stats.maxStreak}</div>
            <div className="text-[10px] font-extrabold text-orange-800 uppercase tracking-tight mt-0.5">
              Mejor Racha
            </div>
          </div>
        </div>

        <div className="clay-card-purple px-3 py-2 flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-white/80 text-purple-600 shrink-0">
            <Star className="w-4 h-4 fill-purple-400" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-lg text-purple-950 leading-none">{stats.points}</div>
            <div className="text-[10px] font-extrabold text-purple-800 uppercase tracking-tight mt-0.5">
              Estrellas
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart compacto */}
      <div className="clay-card-sky p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-black text-xs text-sky-950 flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Resumen Semanal (7 días)</span>
          </span>
          <span className="text-[10px] font-black text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200 whitespace-nowrap shrink-0">
            {weeklyTotalSolved} resueltos · {weeklyAccuracy}%
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 items-end h-20 pt-1">
          {last7Days.map((day) => {
            const heightPct = day.solved > 0 ? Math.max(20, Math.round((day.solved / maxDailySolved) * 100)) : 10;
            return (
              <div key={day.key} className="flex flex-col items-center justify-end h-full gap-0.5">
                <span className="text-[10px] font-black text-sky-800 leading-none">
                  {day.solved > 0 ? day.solved : ''}
                </span>
                <div className="w-full flex items-end justify-center h-11">
                  <div
                    className={`w-full max-w-[22px] rounded-t-lg transition-all ${
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

      {/* Actions compactas */}
      <div className="space-y-2 pt-0.5">
        {onOpenQrScanner && (
          <button
            onClick={() => {
              sound.playSelect();
              onOpenQrScanner();
            }}
            className="w-full py-2.5 clay-btn-purple font-black text-xs flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4 text-white" /> Escanear y Calificar Taller QR
          </button>
        )}

        <button
          onClick={() => {
            sound.playSelect();
            onPrintWorksheet();
          }}
          className="w-full py-2.5 clay-btn-sky font-black text-xs flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>Compartir / Imprimir Taller</span>
        </button>

        <button
          onClick={() => {
            sound.playSelect();
            onResetStats();
          }}
          className="w-full py-2 clay-btn-white font-black text-xs flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reiniciar Estadísticas de Sesión
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
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center px-3 sm:px-4 no-print overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full max-h-[88vh] overflow-y-auto my-auto rounded-[1.75rem]"
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        <TeacherReportView {...viewProps} />
      </div>
    </div>
  );
};
