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
  const [selectedSheetNum, setSelectedSheetNum] = useState<number>(1);

  if (!isOpen) return null;

  const levelConfig = LEVEL_CONFIGS[gradeLevel];
  const modeLabel = currentMode === 'add' ? 'Sumas ➕' : currentMode === 'sub' ? 'Restas ➖' : 'Mixto 🔀';
  const shareTitle = `🦉 Ficha de Ejercicios N° ${printCounter} - Valor Posicional (${levelConfig.label})`;
  const appUrl = window.location.href;

  const shareText = `🦉 *Aventura Posicional - Ficha de Ejercicios N° ${printCounter}*
Grado: ${levelConfig.label} (${modeLabel})
12 Ejercicios con Código QR de Respuesta Automática para Calificar.

📱 Resuelve a mano e imprime o comparte aquí: ${appUrl}`;

  // Native Web Share API (Abre la hoja de compartir nativa del celular: WhatsApp, Instagram, Mensajes, etc.)
  const handleNativeShare = async () => {
    sound.playSelect();
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.origin + pdfUrl.substring(1),
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      handleCopyText();
    }
  };

  // WhatsApp link compatible con Android WebView (evita ERR_UNKNOWN_URL_SCHEME)
  const handleWhatsAppShare = () => {
    sound.playSelect();
    const encoded = encodeURIComponent(shareText);
    window.location.href = `https://wa.me/?text=${encoded}`;
  };

  // Gmail / Email link
  const handleGmailShare = () => {
    sound.playSelect();
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
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

  const modeSlug = currentMode === 'add' ? 'suma' : currentMode === 'sub' ? 'resta' : 'mixta';
  const paddedNum = String(selectedSheetNum).padStart(3, '0');
  const pdfUrl = `./fichas/grado${gradeLevel}${modeSlug}/ficha${gradeLevel}-${paddedNum}.pdf`;

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

        {/* PDF Direct Selection & Download Box */}
        <div className="clay-card-purple p-3.5 space-y-2.5">
          <div className="font-black flex items-center gap-1.5 text-xs uppercase tracking-wider text-purple-900">
            <Download className="w-4 h-4 text-purple-600" />
            <span>Biblioteca de Fichas (Grado {gradeLevel} - {modeLabel})</span>
          </div>

          <div className="space-y-2 pt-1">
            <select
              value={selectedSheetNum}
              onChange={(e) => setSelectedSheetNum(Number(e.target.value))}
              className="w-full p-2.5 bg-white text-slate-800 font-bold text-xs rounded-xl border-2 border-purple-200 shadow-xs"
            >
              {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Ficha N° {n} (ficha{gradeLevel}-{String(n).padStart(3, '0')}.pdf)
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              {/* Botón Descargar PDF al Celular */}
              <a
                href={pdfUrl}
                download={`ficha${gradeLevel}-${paddedNum}.pdf`}
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.playSuccess()}
                className="flex-1 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 text-center no-underline"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PDF 📥</span>
              </a>

              {/* Botón Ver PDF */}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.playSelect()}
                className="py-2.5 px-3 bg-white text-purple-900 border-2 border-purple-300 hover:bg-purple-50 font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-2xs transition-transform active:scale-95 no-underline"
              >
                <span>Ver 👁️</span>
              </a>
            </div>
          </div>
        </div>

        {/* Share Options Grid */}
        <div className="space-y-2.5 pt-1">
          {/* Botón Abrir Hoja Nativa de Compartir en Celular (WhatsApp, Instagram, etc.) */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 clay-btn-amber font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Compartir Ficha (Menú del Celular 📱)</span>
          </button>

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

          {/* Copy Message / Link */}
          <button
            onClick={handleCopyText}
            className="w-full py-2.5 clay-btn-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-slate-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700">¡Texto de Ficha Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


