// Web Audio API Synthesizer & Speech Reader for Kids

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.15) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio context errors
    }

    // Trigger haptic vibration if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(20);
      } catch {
        // Ignore vibration errors
      }
    }
  }

  public playPop() {
    this.playTone(523.25, 'sine', 0.08); // C5
  }

  public playSelect() {
    this.playTone(659.25, 'triangle', 0.12); // E5
  }

  public playError() {
    this.playTone(220, 'sawtooth', 0.18);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.22), 120);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // ignore
      }
    }
  }

  public playSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 'sine', 0.18), i * 90);
    });
  }

  public playFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 'triangle', 0.25), i * 110);
    });
  }

  public speak(text: string) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.pitch = 1.1; // Slightly child-friendly upbeat pitch
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech errors
    }
  }
}

export const sound = new SoundEngine();
