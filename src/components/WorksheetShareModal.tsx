import React, { useState } from 'react';
import {
  X,
  Share2,
  Printer,
  Copy,
  Check,
  Send,
  Mail,
  Instagram,
  Sparkles,
  FileText,
  Download,
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
  onPrint: () => void;
}

export const WorksheetShareModal: React.FC<WorksheetShareModalProps> = ({
  isOpen,
  onClose,
  gradeLevel,
  currentMode,
  printCounter,
  onPrint,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const levelConfig = LEVEL_CONFIGS[gradeLevel];
  const modeLabel = currentMode === 'add' ? 'Sumas ➕' : currentMode === 'sub' ? 'Restas ➖' : 'Mixto 🔀';
  const shareTitle = `🦉 Ficha de Ejercicios N° ${printCounter} - Valor Posicional (${levelConfig.label})`;
  const appUrl = window.location.href;

  const shareText = `🦉 *Aventura Posicional - Ficha de Ejercicios N° ${printCounter}*
Grado: ${levelConfig.label} (${modeLabel})
12 Ejercicios con Código QR de Respuesta Automática para Calificar.

📱 Resuelve a mano e imprime o comparte aquí: ${appUrl}`;

  // Web Share API (native mobile share sheet: WhatsApp, Gmail, Instagram Direct, Messages, etc.)
  const handleNativeShare = async () => {
    sound.playSelect();
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      handleCopyText();
    }
  };

  // WhatsApp API link
  const handleWhatsAppShare = () => {
    sound.playSelect();
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Gmail / Email link
  const handleGmailShare = () => {
    sound.playSelect();
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  // Copy text to clipboard
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

  const handleTriggerPrint = () => {
    sound.playSelect();
    onPrint();
    onClose();
  };

  const [selectedSheetNum, setSelectedSheetNum] = useState<number>(1);

  const modeSlug = currentMode === 'add' ? 'suma' : currentMode === 'sub' ? 'resta' : 'mixta';
  const paddedNum = String(selectedSheetNum).padStart(3, '0');
  const pdfUrl = `./fichas/grado${gradeLevel}${modeSlug}/ficha${gradeLevel}-${paddedNum}.pdf`;

  const handleOpenPdf = () => {
    sound.playSelect();
    window.open(pdfUrl, '_blank');
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
              Imprimir o Descargar Ficha
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Grado: {levelConfig.label} • {modeLabel}
            </p>
          </div>
        </div>

        {/* PDF Direct Selection Box */}
        <div className="clay-card-purple p-3.5 space-y-2">
          <div className="font-black flex items-center gap-1.5 text-xs uppercase tracking-wider text-purple-900">
            <Download className="w-4 h-4 text-purple-600" />
            <span>Descargar PDF de Biblioteca (Grado {gradeLevel} - {modeLabel})</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <select
              value={selectedSheetNum}
              onChange={(e) => setSelectedSheetNum(Number(e.target.value))}
              className="flex-1 p-2 bg-white text-slate-800 font-bold text-xs rounded-xl border-2 border-purple-200 shadow-xs"
            >
              {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Ficha N° {n} (grado{gradeLevel}{modeSlug}/ficha{gradeLevel}-{String(n).padStart(3, '0')}.pdf)
                </option>
              ))}
            </select>

            <button
              onClick={handleOpenPdf}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Abrir PDF</span>
            </button>
          </div>
        </div>

        {/* Share Options Grid */}
        <div className="space-y-2.5 pt-1">
          {/* Direct Print / Save as PDF */}
          <button
            onClick={handleTriggerPrint}
            className="w-full py-3.5 clay-btn-sky font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
          >
            <Printer className="w-4 h-4 text-white shrink-0" />
            <span>Imprimir Ficha Generada (con QR) 🖨️</span>
          </button>

          {/* WhatsApp Direct */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Send className="w-4 h-4 fill-white shrink-0" />
            <span>Enviar por WhatsApp</span>
          </button>

          {/* Gmail / Mail */}
          <button
            onClick={handleGmailShare}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>Enviar por Correo (Gmail)</span>
          </button>

          {/* Copy Message / Link */}
          <button
            onClick={handleCopyText}
            className="w-full py-2.5 clay-btn-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-slate-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700">¡Enlace Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

