import React, { useEffect, useState } from 'react';
import { Sparkles, Play } from 'lucide-react';
import { sound } from '../utils/sound';

interface SplashScreenOverlayProps {
  onFinish: () => void;
}

export const SplashScreenOverlay: React.FC<SplashScreenOverlayProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onFinish();
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onFinish]);

  const handleTap = () => {
    sound.playSuccess();
    onFinish();
  };

  return (
    <div
      onClick={handleTap}
      className="fixed inset-0 z-50 bg-sky-400 flex flex-col items-center justify-between p-4 cursor-pointer select-none no-print overflow-hidden animate-fadeIn"
    >
      {/* Background Graphic Image */}
      <img
        src="/splash.jpg"
        alt="NumiMates Splash Screen"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
        onError={(e) => {
          // Fallback if image fails to load
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Decorative Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-sky-900/30 z-10 pointer-events-none" />

      {/* Top Banner Tag */}
      <div className="relative z-20 mt-6 pt-[env(safe-area-inset-top,24px)] flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border-2 border-white/80 animate-bounce-slow">
        <span className="text-xl">🐶</span>
        <span className="font-black text-xs sm:text-sm bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
          ¡Aprende Jugando! • NumiMates
        </span>
        <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
      </div>

      {/* Bottom Loading Bar and CTA */}
      <div className="relative z-20 w-full max-w-sm mb-8 space-y-3 px-4 text-center">
        {/* Progress Bar */}
        <div className="w-full bg-black/40 backdrop-blur-md p-1.5 rounded-full border-2 border-white/60 shadow-xl">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 transition-all duration-150 shadow-inner"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white font-black text-xs px-2 drop-shadow-md">
          <span>🚀 Cargando Aventura...</span>
          <span>{progress}%</span>
        </div>

        {/* Tap to Start CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTap();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl border-2 border-white/80 animate-pulse active:scale-95 transition-all"
        >
          <Play className="w-5 h-5 fill-white shrink-0" />
          <span>¡Toca para Iniciar! 🎮</span>
        </button>
      </div>
    </div>
  );
};
