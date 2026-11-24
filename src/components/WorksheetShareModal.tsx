import React, { useState } from 'react';
import {
  X,
  Share2,
  Download,
  FileText,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { GradeLevel, GameMode, ToastType } from '../types';
import { LEVEL_CONFIGS } from '../data/constants';
import { sound } from '../utils/sound';
import { showRealRewardedAd } from '../utils/admob';
import {
  consumeWorkshopAccess,
  getWorkshopQuota,
  SINGLE_WORKSHOP_STAR_COST,
  WEEKLY_FREE_WORKSHOPS,
} from '../utils/workshops';

interface WorksheetShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeLevel: GradeLevel;
  currentMode: GameMode;
  printCounter: number;
  onIncrementPrintCounter: () => void;
  points: number;
  onSpendPoints: (amount: number) => void;
  onAwardPoints: (amount: number) => void;
  onNotify?: (text: string, type?: ToastType) => void;
}

// Convertidor de ArrayBuffer a Base64 para escribir el archivo nativo en Android
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const WorksheetShareModal: React.FC<WorksheetShareModalProps> = ({
  isOpen,
  onClose,
  gradeLevel,
  currentMode,
  printCounter,
  onIncrementPrintCounter,
  points,
  onSpendPoints,
  onAwardPoints,
  onNotify,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [quota, setQuota] = useState(() => getWorkshopQuota());

  if (!isOpen) return null;

  const EXTRA_COST = SINGLE_WORKSHOP_STAR_COST;
  const hasFreeOrCredit = quota.unlimited || quota.freeRemaining > 0 || quota.credits > 0;
  const isFreeAvailable = quota.freeRemaining > 0;

  const levelConfig = LEVEL_CONFIGS[gradeLevel];
  const difficultyName =
    gradeLevel === 2
      ? 'Básico (2 cifras)'
      : gradeLevel === 3
      ? 'Intermedio (3 cifras)'
      : gradeLevel === 4
      ? 'Avanzado (4 cifras)'
      : 'Experto (5 cifras)';
  const modeLabel = currentMode === 'add' ? 'Sumas ➕' : currentMode === 'sub' ? 'Restas ➖' : 'Mixto 🔀';
  const modeSlug = currentMode === 'add' ? 'suma' : currentMode === 'sub' ? 'resta' : 'mixta';
  
  const sheetNum = ((printCounter - 1) % 50) + 1;
  const paddedNum = String(sheetNum).padStart(3, '0');
  const pdfFileName = `ficha${gradeLevel}-${paddedNum}.pdf`;
  const rawPdfUrl = `https://raw.githubusercontent.com/Elchocazo/Aventura_posicional/main/public/fichas/grado${gradeLevel}${modeSlug}/${pdfFileName}`;
  const relativePdfPath = `./fichas/grado${gradeLevel}${modeSlug}/${pdfFileName}`;

  const shareTitle = `🦉 Taller ${difficultyName} N° ${sheetNum}`;
  const shareText = `🦉 *NumiMates - Taller ${difficultyName} N° ${sheetNum}*
Dificultad: ${difficultyName} (${modeLabel})
12 Ejercicios con Código QR para Calificar.`;

  // PROCESO PROFUNDO: Leer PDF -> Escribir en Almacenamiento Celular -> Abrir Menú Nativo Android con PDF Adjunto
  const handleShareWorksheetPdf = async () => {
    if (!hasFreeOrCredit && points < EXTRA_COST) {
      sound.playError();
      onNotify?.(
        `⚠️ Necesitas ${EXTRA_COST} ⭐ (tienes ${points} ⭐) para el Taller N° ${sheetNum}. ¡Consigue paquetes en la Tienda o ve un video!`,
        'warning'
      );
      return;
    }

    sound.playSelect();
    setIsLoading(true);
    setStatusMsg(`📄 Descargando Ficha N° ${sheetNum}...`);

    try {
      // 1. Cargar el PDF (primero desde el servidor en la nube para mantener la app súper liviana)
      let response: Response | null = null;
      try {
        response = await fetch(rawPdfUrl);
      } catch (e) {
        console.log('Online fetch failed, trying local fallback');
      }

      if (!response || !response.ok) {
        response = await fetch(relativePdfPath);
      }

      if (!response || !response.ok) {
        throw new Error(`No se pudo descargar la ficha PDF N° ${sheetNum}`);
      }

      const buffer = await response.arrayBuffer();
      const base64Data = arrayBufferToBase64(buffer);

      setStatusMsg('💾 Guardando en almacenamiento local...');

      // 2. Guardar archivo PDF en la memoria del celular usando Capacitor Filesystem
      const savedFile = await Filesystem.writeFile({
        path: `fichas_numimates/${pdfFileName}`,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      setStatusMsg('📱 Abriendo menú de enviar en celular...');

      // 3. Abrir la hoja nativa de compartir de Android (WhatsApp, Drive, Gmail, etc.) con el archivo PDF real adjunto
      await Share.share({
        title: shareTitle,
        text: shareText,
        url: savedFile.uri,
        dialogTitle: `Compartir Ficha N° ${sheetNum} en WhatsApp / Celular`,
      });

      sound.playSuccess();

      // Avanzar secuencialmente a la siguiente ficha para la próxima vez
      onIncrementPrintCounter();

      // Descontar uso gratis, crédito de paquete o estrellas
      const { usedType } = consumeWorkshopAccess();
      if (usedType === 'stars') {
        onSpendPoints(EXTRA_COST);
      }
      setQuota(getWorkshopQuota());
    } catch (err: any) {
      console.error('Error al compartir archivo PDF nativo:', err);
      try {
        const a = document.createElement('a');
        a.href = relativePdfPath;
        a.download = pdfFileName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        onIncrementPrintCounter();
      } catch (fallbackErr) {
        console.error('Fallback download failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
      setStatusMsg(null);
    }
  };

  // Ver video por recompensa con Google AdMob (+100 ⭐)
  const handleWatchAdReward = async () => {
    sound.playSelect();
    setIsLoading(true);
    setStatusMsg('📺 Cargando anuncio de Google AdMob...');
    try {
      const result = await showRealRewardedAd();
      if (result.rewarded) {
        onAwardPoints(100);
        sound.playSuccess();
        onNotify?.('🎉 ¡Felicidades! Ganaste +100 ⭐ por ver el video completo.', 'success');
      } else if (result.reason === 'offline') {
        sound.playError();
        onNotify?.('📡 Sin conexión a internet para cargar el video.', 'warning');
      } else if (result.reason === 'dismissed') {
        sound.playError();
        onNotify?.('📺 Debes terminar de ver el video para recibir +100 ⭐.', 'warning');
      } else {
        sound.playError();
        onNotify?.('📺 Anuncio no disponible ahora. Intenta de nuevo en unos segundos.', 'error');
      }
    } finally {
      setIsLoading(false);
      setStatusMsg(null);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full clay-card p-5 sm:p-6 text-slate-800 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
      >
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-2.5 border-b-2 border-slate-100 pb-3 pr-8">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg sm:text-xl text-emerald-950 leading-tight">
              Descargar y Compartir Taller PDF
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Dificultad: {difficultyName} • {modeLabel}
            </p>
          </div>
        </div>

        {/* Freemium Limit Status Badge */}
        <div className={`p-3.5 rounded-2xl border-2 space-y-1 ${
          hasFreeOrCredit
            ? 'clay-card-emerald border-emerald-300 text-emerald-950'
            : 'clay-card-amber border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center justify-between text-xs font-black">
            <span>
              {quota.unlimited
                ? '👑 Pase Ilimitado Activo:'
                : isFreeAvailable
                ? '🎁 Talleres Gratis esta semana:'
                : quota.credits > 0
                ? '📦 Créditos de Talleres:'
                : '⭐ Cupo semanal gratis agotado:'}
            </span>
            <span className="bg-white/80 px-2 py-0.5 rounded-full border border-current">
              {quota.unlimited
                ? 'Ilimitados'
                : isFreeAvailable
                ? `${quota.freeRemaining} de ${WEEKLY_FREE_WORKSHOPS}`
                : quota.credits > 0
                ? `${quota.credits} disponibles`
                : `0 de ${WEEKLY_FREE_WORKSHOPS}`}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-slate-700 leading-tight">
            {quota.unlimited
              ? 'Puedes descargar y compartir todos los talleres que necesites.'
              : isFreeAvailable
              ? `Tienes ${WEEKLY_FREE_WORKSHOPS} talleres gratis cada semana. Además puedes comprar packs en la Tienda.`
              : quota.credits > 0
              ? 'Usarás 1 crédito de tu paquete de talleres comprados.'
              : `Puedes desbloquear este taller por ${EXTRA_COST} ⭐ (Tienes: ${points} ⭐) o comprar paquetes con descuento en la Tienda.`}
          </p>
        </div>

        {/* Ficha Secuencial Actual (Fichas seguidas automáticamente) */}
        <div className="clay-card-purple p-4 space-y-2">
          <div className="font-black flex items-center justify-between text-xs uppercase tracking-wider text-purple-900">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Siguiente Ficha en Secuencia:</span>
            </span>
            <span className="bg-purple-200 text-purple-950 font-black px-2.5 py-0.5 rounded-full text-xs">
              N° {sheetNum} de 50
            </span>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border-2 border-purple-200 flex items-center justify-between gap-2">
            <div className="font-extrabold text-xs text-purple-950 truncate">
              📄 Taller {difficultyName} #{sheetNum}
            </div>
            <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-xl shrink-0">
              {modeLabel}
            </span>
          </div>
        </div>

        {/* Mensaje de estado al procesar el archivo */}
        {statusMsg && (
          <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs font-black flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-600" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* BOTÓN PRINCIPAL */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleShareWorksheetPdf}
            disabled={isLoading}
            className={`w-full py-4 px-4 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-transform active:scale-95 rounded-2xl ${
              hasFreeOrCredit
                ? 'clay-btn-emerald text-white'
                : 'clay-btn-amber text-amber-950'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Procesando PDF...</span>
              </>
            ) : quota.unlimited ? (
              <>
                <Share2 className="w-5 h-5" />
                <span>Descargar Taller (Pase Ilimitado) 📲</span>
              </>
            ) : isFreeAvailable ? (
              <>
                <Share2 className="w-5 h-5" />
                <span>Descargar y Compartir Taller (GRATIS) 📲</span>
              </>
            ) : quota.credits > 0 ? (
              <>
                <Share2 className="w-5 h-5" />
                <span>Usar 1 Crédito de Taller ({quota.credits} disp.) 📲</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                <span>Desbloquear Taller por {EXTRA_COST} ⭐ 📲</span>
              </>
            )}
          </button>

          {/* Botón para Ganar Estrellas por Video Recompensa */}
          <button
            onClick={handleWatchAdReward}
            disabled={isLoading}
            className="w-full py-3 px-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span>📺 Ver Video Recompensa (+100 ⭐)</span>
          </button>
        </div>

        <p className="text-[11px] font-semibold text-slate-500 text-center leading-tight">
          Guarda la ficha PDF en la memoria de tu celular y abre el menú de envío para WhatsApp o cualquier app.
        </p>
      </div>
    </div>
  );
};
