import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  Download,
  Eye,
  FileText,
} from 'lucide-react';
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

export const WorksheetShareModal: React.FC<WorksheetShareModalProps> = ({
  isOpen,
  onClose,
  gradeLevel,
  currentMode,
  printCounter,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedSheetNum, setSelectedSheetNum] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const levelConfig = LEVEL_CONFIGS[gradeLevel];
  const modeLabel = currentMode === 'add' ? 'Sumas ➕' : currentMode === 'sub' ? 'Restas ➖' : 'Mixto 🔀';
  const modeSlug = currentMode === 'add' ? 'suma' : currentMode === 'sub' ? 'resta' : 'mixta';
  const paddedNum = String(selectedSheetNum).padStart(3, '0');
  const pdfFileName = `ficha${gradeLevel}-${paddedNum}.pdf`;
  const pdfPath = `./fichas/grado${gradeLevel}${modeSlug}/${pdfFileName}`;

  const shareTitle = `🦉 Ficha de Ejercicios N° ${selectedSheetNum} - ${levelConfig.label}`;
  const shareText = `🦉 *NumiMates - Ficha de Ejercicios N° ${selectedSheetNum}*
Grado: ${levelConfig.label} (${modeLabel})
12 Ejercicios con Código QR de Autocorrección.

📱 ¡Aprende jugando con NumiMates!`;

  // Descarga directa del archivo PDF como Blob para Android WebView
  const handleDownloadPdf = async () => {
    sound.playSuccess();
    setIsDownloading(true);
    try {
      const response = await fetch(pdfPath);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = pdfFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback a apertura directa
      window.open(pdfPath, '_system');
    } finally {
      setIsDownloading(false);
    }
  };

  // Ver PDF directamente
  const handleViewPdf = () => {
    sound.playSelect();
    const opened = window.open(pdfPath, '_system');
    if (!opened) {
      window.open(pdfPath, '_blank');
    }
  };

  // Compartir archivo PDF directamente en menú nativo del celular (WhatsApp, Drive, etc.)
  const handleNativeShare = async () => {
    sound.playSelect();
    try {
      const response = await fetch(pdfPath);
      const blob = await response.blob();
      const file = new File([blob], pdfFileName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          files: [file],
        });
        return;
      }
    } catch (e) {
      console.log('File share not supported, falling back to text share:', e);
    }

    // Fallback compartir texto + URL
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
        });
      } catch (err) {
        console.log('Share canceled:', err);
      }
    } else {
      handleCopyText();
    }
  };

  // Enviar a WhatsApp abriendo el intent nativo sin errores de esquema URL
  const handleWhatsAppShare = () => {
    sound.playSelect();
    const encoded = encodeURIComponent(shareText);
    const opened = window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_system');
    if (!opened) {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  // Copiar texto al portapapeles
  const handleCopyText = async () => {
    sound.playSelect();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy text:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print overflow-y-auto animate-fadeIn">
      <div className="relative max-w-md w-full clay-card p-5 sm:p-6 text-slate-800 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b-2 border-slate-100 pb-3 pr-8">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg sm:text-xl text-emerald-950 leading-tight">
              Descargar y Compartir Fichas PDF
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Grado: {levelConfig.label} • {modeLabel}
            </p>
          </div>
        </div>

        {/* PDF Selector and Action Buttons */}
        <div className="clay-card-purple p-4 space-y-3">
          <div className="font-black flex items-center gap-1.5 text-xs uppercase tracking-wider text-purple-900">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Selecciona una Ficha de la Biblioteca</span>
          </div>

          <select
            value={selectedSheetNum}
            onChange={(e) => setSelectedSheetNum(Number(e.target.value))}
            className="w-full p-3 bg-white text-slate-800 font-extrabold text-xs sm:text-sm rounded-2xl border-2 border-purple-300 shadow-xs outline-none"
          >
            {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                📄 Ficha N° {n} — {pdfFileName}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Botón Descargar PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="py-3 px-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Guardando...' : 'Descargar PDF 📥'}</span>
            </button>

            {/* Botón Ver PDF */}
            <button
              onClick={handleViewPdf}
              className="py-3 px-3 bg-white text-purple-900 border-2 border-purple-300 hover:bg-purple-50 font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95"
            >
              <Eye className="w-4 h-4 text-purple-700" />
              <span>Ver PDF 👁️</span>
            </button>
          </div>
        </div>

        {/* Options Grid */}
        <div className="space-y-2.5 pt-1">
          {/* Compartir el archivo PDF adjunto mediante el menú del celular */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 clay-btn-amber font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Compartir Ficha PDF (Menú Celular 📱)</span>
          </button>

          {/* WhatsApp Direct */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Send className="w-4 h-4 fill-white shrink-0" />
            <span>Enviar a WhatsApp</span>
          </button>

          {/* Copiar Texto */}
          <button
            onClick={handleCopyText}
            className="w-full py-2.5 clay-btn-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-slate-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700">¡Texto Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Copiar Texto de la Ficha</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
