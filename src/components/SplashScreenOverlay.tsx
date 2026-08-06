import React, { useEffect, useState } from 'react';
import splashImg from '../assets/splash.jpg';
import { sound } from '../utils/sound';

interface SplashScreenOverlayProps {
  onFinish: () => void;
}

const NUMBERS = ['1', '2', '5', '10', '+', '-'];

export const SplashScreenOverlay: React.FC<SplashScreenOverlayProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [chaseNum, setChaseNum] = useState('5');

  // Rotate the number being chased
  useEffect(() => {
    let i = 0;
    const rotator = setInterval(() => {
      i = (i + 1) % NUMBERS.length;
      setChaseNum(NUMBERS[i]);
    }, 600);
    return () => clearInterval(rotator);
  }, []);

  // Progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Auto-finish when done
  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => onFinish(), 350);
      return () => clearTimeout(t);
    }
  }, [progress, onFinish]);

  const handleTap = () => {
    sound.playPop();
    onFinish();
  };

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
        background: '#7dd3fc',
      }}
    >
      {/* Full-screen splash image */}
      <img
        src={splashImg}
        alt="NumiMates"
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
        }}
      />

      {/* Bottom loading panel */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        padding: '0 0 env(safe-area-inset-bottom, 24px) 0',
        background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        paddingTop: '48px',
        paddingBottom: '32px',
      }}>

        {/* Puppy chasing a number animation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0px',
          height: '52px',
          width: '200px',
          position: 'relative',
          overflow: 'visible',
        }}>
          {/* Puppy running - bounces left-right */}
          <span
            key="puppy"
            style={{
              fontSize: '2.4rem',
              display: 'inline-block',
              animation: 'puppyRun 0.6s ease-in-out infinite alternate',
              position: 'absolute',
              left: '10px',
            }}
          >
            🐶
          </span>

          {/* Number block fleeing to the right */}
          <div
            style={{
              position: 'absolute',
              right: '10px',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 900,
              fontSize: chaseNum.length > 1 ? '1rem' : '1.4rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              animation: 'numberBounce 0.6s ease-in-out infinite alternate-reverse',
              border: '2px solid rgba(255,255,255,0.8)',
            }}
          >
            {chaseNum}
          </div>
        </div>

        {/* Loading text */}
        <p style={{
          margin: 0,
          color: 'white',
          fontWeight: 900,
          fontSize: '0.85rem',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.05em',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          🚀 Cargando Aventura...
        </p>

        {/* Progress bar */}
        <div style={{
          width: '80%',
          maxWidth: '300px',
          height: '10px',
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '999px',
          overflow: 'hidden',
          border: '1.5px solid rgba(255,255,255,0.5)',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #fbbf24, #34d399, #38bdf8)',
            borderRadius: '999px',
            transition: 'width 0.08s linear',
          }} />
        </div>

        {/* Tap hint */}
        <p style={{
          margin: 0,
          color: 'rgba(255,255,255,0.75)',
          fontSize: '0.7rem',
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 700,
        }}>
          Toca para iniciar ✨
        </p>
      </div>

      {/* CSS Keyframe animations injected inline */}
      <style>{`
        @keyframes puppyRun {
          0%   { transform: translateX(0px) scaleX(1); }
          100% { transform: translateX(30px) scaleX(1); }
        }
        @keyframes numberBounce {
          0%   { transform: translateX(0px) rotate(-5deg); }
          100% { transform: translateX(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};
