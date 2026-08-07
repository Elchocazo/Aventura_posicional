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
import { GradeLevel, GameMode } from '../types';
import { LEVEL_CONFIGS } from '../data/constants';
import { sound } from '../utils/sound';

interface WorksheetShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeLevel: GradeLevel;
  currentMode: GameMode;
  printCounter: number;
  onPrint?: () => void;
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
}) => {
  const [selectedSheetNum, setSelectedSheetNum] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const levelConfig = LEVEL_CONFIGS[gradeLevel];
  const modeLabel = currentMode === 'add' ? 'Sumas ➕' : currentMode === 'sub' ? 'Restas ➖' : 'Mixto 🔀';
  const modeSlug = currentMode === 'add' ? 'suma' : currentMode === 'sub' ? 'resta' : 'mixta';
  const paddedNum = String(selectedSheetNum).padStart(3, '0');
  const pdfFileName = `ficha${gradeLevel}-${paddedNum}.pdf`;
  const relativePdfPath = `./fichas/grado${gradeLevel}${modeSlug}/${pdfFileName}`;

  const shareTitle = `🦉 Ficha de Ejercicios N° ${selectedSheetNum} - ${levelConfig.label}`;
  const shareText = `🦉 *NumiMates - Ficha de Ejercicios N° ${selectedSheetNum}*
Grado: ${levelConfig.label} (${modeLabel})
12 Ejercicios con Código QR para Calificar.`;

  // PROCESO PROFUNDO: Leer PDF local de los assets -> Escribir en Almacenamiento Celular -> Abrir Menú Nativo Android con PDF Adjunto
  const handleShareWorksheetPdf = async () => {
    sound.playSelect();
    setIsLoading(true);
    setStatusMsg('📄 Preparando archivo PDF para el celular...');

    try {
      // 1. Cargar el PDF de la carpeta public/fichas/
      const response = await fetch(relativePdfPath);
      if (!response.ok) {
        throw new Error(`No se encontró el archivo PDF: ${relativePdfPath}`);
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
        dialogTitle: 'Compartir Ficha PDF en WhatsApp / Celular',
      });

      sound.playSuccess();
    } catch (err: any) {
      console.error('Error al compartir archivo PDF nativo:', err);
      // Fallback si se ejecuta en navegador Web en lugar de celular
      try {
        const a = document.createElement('a');
        a.href = relativePdfPath;
        a.download = pdfFileName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (fallbackErr) {
        console.error('Fallback download failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
      setStatusMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print overflow-y-auto animate-fadeIn">
      <div className="relative max-w-md w-full clay-card p-5 sm:p-6 text-slate-800 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        
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
              Descargar y Compartir Ficha PDF
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Grado: {levelConfig.label} • {modeLabel}
            </p>
          </div>
        </div>

        {/* Selección de Ficha N° 1 a 50 */}
        <div className="clay-card-purple p-4 space-y-3">
          <div className="font-black flex items-center gap-1.5 text-xs uppercase tracking-wider text-purple-900">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Selecciona el número de Ficha:</span>
          </div>

          <select
            value={selectedSheetNum}
            onChange={(e) => setSelectedSheetNum(Number(e.target.value))}
            disabled={isLoading}
            className="w-full p-3 bg-white text-slate-800 font-extrabold text-xs sm:text-sm rounded-2xl border-2 border-purple-300 shadow-xs outline-none cursor-pointer"
          >
            {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                📄 Ficha N° {n} (Grado {gradeLevel} - {modeLabel})
              </option>
            ))}
          </select>
        </div>

        {/* Mensaje de estado al procesar el archivo */}
        {statusMsg && (
          <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs font-black flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-600" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* ÚNICO BOTÓN PRINCIPAL SOLICITADO */}
        <div className="pt-2">
          <button
            onClick={handleShareWorksheetPdf}
            disabled={isLoading}
            className="w-full py-4 px-4 clay-btn-emerald font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-transform active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Procesando PDF...</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                <span>Descargar y Compartir Ficha PDF 📲</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] font-semibold text-slate-500 text-center leading-tight">
          Guarda la ficha PDF en la memoria de tu celular y abre el menú de envío para WhatsApp o cualquier app.
        </p>
      </div>
    </div>
  );
};
