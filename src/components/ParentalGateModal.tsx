import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { sound } from '../utils/sound';

interface ParentalGateModalProps {
  isOpen: boolean;
  actionLabel?: string;
  onCancel: () => void;
  onVerified: () => void;
}

export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  isOpen,
  actionLabel = 'continuar con la compra',
  onCancel,
  onVerified,
}) => {
  const [a, setA] = useState(7);
  const [b, setB] = useState(8);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setA(Math.floor(Math.random() * 6) + 4); // 4..9
      setB(Math.floor(Math.random() * 5) + 6); // 6..10
      setAnswer('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer.trim(), 10) === a * b) {
      sound.playSuccess();
      onVerified();
    } else {
      sound.playError();
      setError(true);
      setAnswer('');
    }
  };

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm clay-card p-6 text-slate-800 space-y-4"
      >
        <button
          onClick={onCancel}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 pr-6">
          <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-base text-indigo-950 leading-tight">
              Control Parental
            </h3>
            <p className="text-[11px] font-bold text-slate-500">
              Solo un adulto puede {actionLabel}
            </p>
          </div>
        </div>

        <div className="clay-card-sky p-4 text-center">
          <p className="text-xs font-bold text-sky-900 mb-1">
            Resuelve para confirmar que eres un adulto:
          </p>
          <p className="font-black text-2xl text-sky-950 tracking-wide">
            ¿Cuánto es {a} × {b}?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="number"
            inputMode="numeric"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (error) setError(false);
            }}
            placeholder="Escribe el resultado..."
            autoFocus
            className={`w-full px-4 py-3 rounded-2xl border-2 text-center font-black text-lg outline-none transition-colors ${
              error
                ? 'border-rose-400 bg-rose-50 text-rose-900'
                : 'border-slate-200 bg-white focus:border-indigo-400 text-slate-900'
            }`}
          />
          {error && (
            <p className="text-xs font-bold text-rose-600 text-center">
              Respuesta incorrecta. Intenta nuevamente.
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 clay-btn-white font-black text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 clay-btn-purple font-black text-xs"
            >
              Verificar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
