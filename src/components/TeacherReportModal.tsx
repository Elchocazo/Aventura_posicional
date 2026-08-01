import React from 'react';
import { X, Printer, RotateCcw, Award, CheckCircle, Flame, Star, Camera, Share2 } from 'lucide-react';
import { TeacherReportStats } from '../types';
import { sound } from '../utils/sound';

interface TeacherReportViewProps {
  stats: TeacherReportStats;
  onResetStats: () => void;
  onPrintWorksheet: () => void;
  onOpenQrScanner?: () => void;
}

export const TeacherReportView: React.FC<TeacherReportViewProps> = ({
  stats,
  onResetStats,
  onPrintWorksheet,
  onOpenQrScanner,
}) => {
  return (
    <div className="clay-card p-5 sm:p-6 text-slate-800 space-y-4">
      <div className="flex items-center gap-2.5 border-b-2 border-slate-100 pb-3">
        <span className="text-3xl">🎓</span>
        <div>
          <h2 className="font-black text-lg sm:text-xl text-indigo-900 leading-none">
            Reporte Docentes y Padres
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
          <div className="text-[11px] font-black text-purple-800 uppercase tracking-tight">Puntos Totales</div>
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="relative max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
        <TeacherReportView {...viewProps} />
      </div>
    </div>
  );
};
