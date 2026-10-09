/**
 * Web Audio API Synth & Ambient Manager for Ekspedisi Eksponen
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private isMuted: boolean = false;
  private volume: number = 0.7;
  private hasUserInteracted: boolean = false;

  private activeMusicOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private activeAmbienceOscillators: { osc: OscillatorNode; gain: GainNode; filter?: BiquadFilterNode }[] = [];
  private musicLoopInterval: number | null = null;
  private currentTrack: string | null = null;
  private currentAmbience: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('audio_muted');
      this.isMuted = savedMute === 'true';

      const savedVol = localStorage.getItem('audio_volume');
      if (savedVol) {
        this.volume = parseFloat(savedVol);
      }
    }
  }

  /**
   * Initializes audio context on first user interaction
   */
  public initContext(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.ambienceGain.connect(this.masterGain);

      this.hasUserInteracted = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public unlockAudio(): void {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(newVolume: number): void {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio_volume', this.volume.toString());
    }
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio_muted', this.isMuted.toString());
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Plays Sound Effects
   */
  public playSfx(
    effectName:
      | 'click'
      | 'hint'
      | 'correct'
      | 'wrong'
      | 'generator_active'
      | 'episode_complete'
      | 'level_select'
  ): void {
    if (!this.hasUserInteracted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    switch (effectName) {
      case 'click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }

      case 'hint': {
        // Magical bell chime
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + idx * 0.08);
          gain.gain.setValueAtTime(0.25, t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t + idx * 0.08);
          osc.stop(t + idx * 0.08 + 0.4);
        });
        break;
      }

      case 'correct': {
        // Ascending triumphant major triad
        const freqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        freqs.forEach((freq, idx) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.1);
          gain.gain.setValueAtTime(0.35, t + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t + idx * 0.1);
          osc.stop(t + idx * 0.1 + 0.35);
        });
        break;
      }

      case 'wrong': {
        // Gentle dual downward tone
        const freqs = [330, 261.63]; // E4, C4
        freqs.forEach((freq, idx) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t + idx * 0.14);
          gain.gain.setValueAtTime(0.2, t + idx * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.14 + 0.25);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t + idx * 0.14);
          osc.stop(t + idx * 0.14 + 0.25);
        });
        break;
      }

      case 'generator_active': {
        // Rising power-up pitch with low-pass resonance
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.exponentialRampToValueAtTime(3000, t + 1.2);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 1.2);

        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 1.4);
        break;
      }

      case 'episode_complete': {
        // Grand victory chord arpeggio
        const victoryNotes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
        victoryNotes.forEach((freq, idx) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          const startTime = t + idx * 0.12;
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.3, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(startTime);
          osc.stop(startTime + 0.8);
        });
        break;
      }

      case 'level_select': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }
    }
  }

  /**
   * Plays Ambience (Cyber Data City / Generator Room)
   */
  public playAmbience(sceneName: string): void {
    if (!this.hasUserInteracted) return;
    this.initContext();
    if (!this.ctx || !this.ambienceGain) return;
    if (this.currentAmbience === sceneName) return;

    this.stopAmbience();
    this.currentAmbience = sceneName;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, t);

    // Warm ambient pad drone (F2 + C3)
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(87.31, t);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(130.81, t);

    gain1.gain.setValueAtTime(0.01, t);
    gain1.gain.linearRampToValueAtTime(0.12, t + 2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain1);
    gain1.connect(this.ambienceGain);

    osc1.start(t);
    osc2.start(t);

    this.activeAmbienceOscillators.push({ osc: osc1, gain: gain1, filter });
    this.activeAmbienceOscillators.push({ osc: osc2, gain: gain1, filter });
  }

  public stopAmbience(): void {
    this.activeAmbienceOscillators.forEach(({ osc, gain }) => {
      try {
        if (this.ctx) {
          gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
          setTimeout(() => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {
              // ignore
            }
          }, 500);
        }
      } catch {
        // ignore
      }
    });
    this.activeAmbienceOscillators = [];
    this.currentAmbience = null;
  }

  /**
   * Plays soft background melody/chords
   */
  public playMusic(trackName: string): void {
    if (!this.hasUserInteracted) return;
    this.initContext();
    if (!this.ctx || !this.musicGain) return;
    if (this.currentTrack === trackName) return;

    this.stopMusic();
    this.currentTrack = trackName;

    // Peaceful futuristic cyber arpeggio loop (Pentatonic: C - D - E - G - A)
    const melody = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 392.0, 329.63];
    let step = 0;

    this.musicLoopInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;
      const t = this.ctx.currentTime;
      const freq = melody[step % melody.length];
      step++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.6);
    }, 600);
  }

  public stopMusic(): void {
    if (this.musicLoopInterval !== null) {
      clearInterval(this.musicLoopInterval);
      this.musicLoopInterval = null;
    }
    this.currentTrack = null;
  }

  public stopAll(): void {
    this.stopMusic();
    this.stopAmbience();
  }
}

export const audioManager = new AudioManager();
