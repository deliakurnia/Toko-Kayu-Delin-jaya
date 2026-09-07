/**
 * Web Audio API Acoustic Wood Chime
 * Synthesizes a warm, organic resonant marimba tone
 * Zero external audio assets required.
 */
class SoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play an organic wooden marimba chime
   */
  public playWoodChime(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Fundamental tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft wooden strike harmonic
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();

      const baseFreq = 523.25 * pitchMultiplier; // C5
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);

      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(baseFreq * 2.76, now); // Typical marimba 1st overtone

      // Gain envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      harmonicGain.gain.setValueAtTime(0, now);
      harmonicGain.gain.linearRampToValueAtTime(0.08, now + 0.003);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      harmonic.connect(harmonicGain);
      gain.connect(ctx.destination);
      harmonicGain.connect(ctx.destination);

      osc.start(now);
      harmonic.start(now);

      osc.stop(now + 0.6);
      harmonic.stop(now + 0.2);
    } catch {
      // AudioContext might be blocked until user gesture, safely ignore
    }
  }

  /**
   * Play a double chime for repeat customer detection
   */
  public playLoyaltyChime() {
    this.playWoodChime(1.0);
    setTimeout(() => {
      this.playWoodChime(1.25); // E5
    }, 120);
    setTimeout(() => {
      this.playWoodChime(1.5); // G5
    }, 240);
  }
}

export const soundService = new SoundService();
