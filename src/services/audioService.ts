/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioPreferences, AudioRegionId } from '../types';

const STORAGE_KEY_AUDIO_PREFS = 'eduquest_audio_prefs_v1';

const DEFAULT_PREFS: AudioPreferences = {
  masterVolume: 0.8,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  musicEnabled: false, // Default off to strictly follow browser autoplay policy and user choice
  sfxEnabled: true,
  ambienceEnabled: true,
  currentRegion: 'reef',
  muted: false,
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isSpeechActive: boolean = false;
  private prefs: AudioPreferences;

  // Web Audio Node graph
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;

  // Background ambience & music loop references
  private musicTimer: NodeJS.Timeout | null = null;
  private ambienceNoiseNode: AudioNode | null = null;
  private isMusicRunning: boolean = false;
  private isAmbienceRunning: boolean = false;

  // User gesture unlocked state
  private isContextUnlocked: boolean = false;

  // Listeners for preference changes
  private changeListeners: Set<(prefs: AudioPreferences) => void> = new Set();

  constructor() {
    this.prefs = this.loadPreferences();
    if (typeof window !== 'undefined') {
      // Auto-unlock upon first user interaction anywhere in window
      const unlockHandler = () => {
        this.unlockAudioContext();
        window.removeEventListener('pointerdown', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
      };
      window.addEventListener('pointerdown', unlockHandler, { once: true });
      window.addEventListener('keydown', unlockHandler, { once: true });
    }
  }

  private loadPreferences(): AudioPreferences {
    if (typeof window === 'undefined') return { ...DEFAULT_PREFS };
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUDIO_PREFS);
      if (stored) {
        return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return { ...DEFAULT_PREFS };
  }

  private savePreferences() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_AUDIO_PREFS, JSON.stringify(this.prefs));
      this.changeListeners.forEach((fn) => fn({ ...this.prefs }));
    } catch {
      // ignore
    }
  }

  public subscribe(listener: (prefs: AudioPreferences) => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  public getPreferences(): AudioPreferences {
    return {
      ...this.prefs,
      muted: this.prefs.muted ?? (this.prefs.masterVolume === 0),
    };
  }

  public applyPreferences(newPrefs: Partial<AudioPreferences>) {
    if (newPrefs.masterVolume !== undefined) this.prefs.masterVolume = newPrefs.masterVolume;
    if (newPrefs.musicVolume !== undefined) this.prefs.musicVolume = newPrefs.musicVolume;
    if (newPrefs.sfxVolume !== undefined) this.prefs.sfxVolume = newPrefs.sfxVolume;
    if (newPrefs.musicEnabled !== undefined) this.prefs.musicEnabled = newPrefs.musicEnabled;
    if (newPrefs.sfxEnabled !== undefined) this.prefs.sfxEnabled = newPrefs.sfxEnabled;
    if (newPrefs.ambienceEnabled !== undefined) this.prefs.ambienceEnabled = newPrefs.ambienceEnabled;
    if (newPrefs.currentRegion !== undefined) this.prefs.currentRegion = newPrefs.currentRegion;
    if (newPrefs.muted !== undefined) {
      this.prefs.muted = newPrefs.muted;
      if (newPrefs.muted) {
        this.prefs.masterVolume = 0;
      }
    }
    this.savePreferences();
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.prefs.masterVolume, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(
        this.prefs.sfxEnabled ? this.prefs.sfxVolume : 0,
        this.ctx.currentTime
      );
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(
        this.prefs.musicEnabled ? this.prefs.musicVolume : 0,
        this.ctx.currentTime
      );
    }
  }

  // Ensure AudioContext and gain node graph are properly initialized
  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Build Gain Tree: SFX / Music / Ambience -> Master -> Destination
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.prefs.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(
          this.prefs.sfxEnabled ? this.prefs.sfxVolume : 0,
          this.ctx.currentTime
        );
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(
          this.prefs.musicEnabled ? this.prefs.musicVolume : 0,
          this.ctx.currentTime
        );
        this.musicGain.connect(this.masterGain);

        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.gain.setValueAtTime(
          this.prefs.ambienceEnabled ? this.prefs.musicVolume * 0.4 : 0,
          this.ctx.currentTime
        );
        this.ambienceGain.connect(this.masterGain);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended' && this.isContextUnlocked) {
      this.ctx.resume().catch(() => {});
    }
  }

  // Safe gesture unlock that satisfies browser autoplay policy
  public unlockAudioContext() {
    this.isContextUnlocked = true;
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Start background audio if enabled
    if (this.prefs.musicEnabled && !this.isMusicRunning) {
      this.startMusic();
    }
    if (this.prefs.ambienceEnabled && !this.isAmbienceRunning) {
      this.startAmbience();
    }
  }

  // ==========================================
  // CONTROLS: VOLUME, MUTE & TOGGLES
  // ==========================================

  public setMasterVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.prefs.masterVolume = clamped;
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
    this.savePreferences();
  }

  public setMusicVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.prefs.musicVolume = clamped;
    this.initContext();
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(
        this.prefs.musicEnabled ? clamped : 0,
        this.ctx.currentTime,
        0.05
      );
    }
    if (this.ambienceGain && this.ctx) {
      this.ambienceGain.gain.setTargetAtTime(
        this.prefs.ambienceEnabled ? clamped * 0.4 : 0,
        this.ctx.currentTime,
        0.05
      );
    }
    this.savePreferences();
  }

  public setSfxVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.prefs.sfxVolume = clamped;
    this.initContext();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(
        this.prefs.sfxEnabled ? clamped : 0,
        this.ctx.currentTime,
        0.05
      );
    }
    this.savePreferences();
  }

  public setMusicEnabled(enabled: boolean) {
    this.prefs.musicEnabled = enabled;
    this.initContext();
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(
        enabled ? this.prefs.musicVolume : 0,
        this.ctx.currentTime,
        0.1
      );
    }

    if (enabled) {
      this.unlockAudioContext();
      this.startMusic();
    } else {
      this.stopMusic();
    }
    this.savePreferences();
  }

  public setSfxEnabled(enabled: boolean) {
    this.prefs.sfxEnabled = enabled;
    this.initContext();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(
        enabled ? this.prefs.sfxVolume : 0,
        this.ctx.currentTime,
        0.05
      );
    }
    this.savePreferences();
  }

  public setAmbienceEnabled(enabled: boolean) {
    this.prefs.ambienceEnabled = enabled;
    this.initContext();
    if (this.ambienceGain && this.ctx) {
      this.ambienceGain.gain.setTargetAtTime(
        enabled ? this.prefs.musicVolume * 0.4 : 0,
        this.ctx.currentTime,
        0.1
      );
    }

    if (enabled) {
      this.unlockAudioContext();
      this.startAmbience();
    } else {
      this.stopAmbience();
    }
    this.savePreferences();
  }

  public setRegion(regionId: AudioRegionId) {
    if (this.prefs.currentRegion === regionId) return;
    this.prefs.currentRegion = regionId;
    this.savePreferences();

    // Trigger region explore cue
    this.playRegionExplore();

    // If music is running, smoothly crossfade by resetting loop pattern
    if (this.isMusicRunning) {
      this.stopMusic();
      this.startMusic();
    }
  }

  // Master mute toggle (backward compatibility)
  public setMuted(muted: boolean) {
    this.prefs.muted = muted;
    this.setMasterVolume(muted ? 0 : 0.8);
    if (muted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.prefs.muted === true || this.prefs.masterVolume === 0 || (!this.prefs.sfxEnabled && !this.prefs.musicEnabled);
  }

  // ==========================================
  // REQUIRED SOUND EFFECTS (SFX)
  // ==========================================

  // 1. COMPLETAR ACTIVIDADES: Armónico radiante mayor con destello ascendente
  public playActivityComplete() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const chords = [
      { freq: 523.25, time: 0, dur: 0.28 },    // C5
      { freq: 659.25, time: 0.08, dur: 0.32 },  // E5
      { freq: 783.99, time: 0.16, dur: 0.38 },  // G5
      { freq: 1046.5, time: 0.26, dur: 0.65 },  // C6
    ];

    chords.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + note.time;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + note.dur);
    });
  }

  // 2. OBTENER RECOMPENSAS: Cascada metálica cristalina de monedas doradas
  public playRewardClaim() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const coins = [1318.51, 1567.98, 2093.0, 2637.02]; // E6, G6, C7, E7
    coins.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  // 3. SUBIR DE NIVEL: Fanfarria triunfal épica con barrido ascendente
  public playLevelUp() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const arpeggio = [
      { freq: 392.0, time: 0, dur: 0.12 },     // G4
      { freq: 523.25, time: 0.1, dur: 0.14 },  // C5
      { freq: 659.25, time: 0.2, dur: 0.16 },  // E5
      { freq: 783.99, time: 0.3, dur: 0.18 },  // G5
      { freq: 1046.5, time: 0.42, dur: 0.75 }, // C6
    ];

    arpeggio.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + note.time;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.freq, now);

      // Low pass filter for warm brass texture
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + note.dur);
    });
  }

  // 4. RECIBIR NOTIFICACIONES: Doble campanada suave y cristalina
  public playNotification() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const pings = [880, 1318.51]; // A5 -> E6
    pings.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  // 5. INTERACTUAR CON PERSONAJES: Gorjeo vocal de sintetizador simpático (estilo compañero animado)
  public playCharacterInteract() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.16);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // 6. EXPLORAR REGIONES: Oleaje submarino misterioso con campana de resonancia profunda
  public playRegionExplore() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.85);
  }

  // ==========================================
  // PROCEDURAL REGIONAL AMBIENT MUSIC ENGINE
  // Zero mp3 assets, zero lag, 100% lightweight Web Audio synthesizer
  // ==========================================

  private startMusic() {
    if (this.isMusicRunning || !this.prefs.musicEnabled) return;
    this.isMusicRunning = true;

    // Pattern sequencer loop (repeats every 3.2 seconds)
    const playMeasure = () => {
      if (!this.isMusicRunning || !this.prefs.musicEnabled) return;
      this.playRegionMelodicPhrase(this.prefs.currentRegion);
      this.musicTimer = setTimeout(playMeasure, 3200);
    };

    playMeasure();
  }

  private stopMusic() {
    this.isMusicRunning = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  // Melodic motifs tailored to each EduQuest oceanic region
  private playRegionMelodicPhrase(region: AudioRegionId) {
    if (!this.ctx || !this.musicGain || !this.prefs.musicEnabled) return;

    let notes: { freq: number; delay: number; dur: number; type: OscillatorType }[] = [];

    switch (region) {
      case 'reef':
        // Arrecife de Coral: Melodía pentatónica alegre, cálida y luminosa
        notes = [
          { freq: 523.25, delay: 0.0, dur: 0.5, type: 'sine' },    // C5
          { freq: 659.25, delay: 0.4, dur: 0.5, type: 'sine' },    // E5
          { freq: 783.99, delay: 0.8, dur: 0.6, type: 'sine' },    // G5
          { freq: 880.0,  delay: 1.4, dur: 0.7, type: 'triangle' },// A5
          { freq: 1046.5, delay: 2.1, dur: 0.9, type: 'sine' },    // C6
        ];
        break;

      case 'kelp':
        // Bosque de Kelp: Acordes etéreos y flotantes con misterio vegetal
        notes = [
          { freq: 293.66, delay: 0.0, dur: 1.2, type: 'triangle' },// D4
          { freq: 440.0,  delay: 0.5, dur: 1.1, type: 'sine' },    // A4
          { freq: 587.33, delay: 1.1, dur: 1.0, type: 'sine' },    // D5
          { freq: 659.25, delay: 1.8, dur: 1.2, type: 'triangle' },// E5
        ];
        break;

      case 'abyss':
        // Fosa Abisal: Pulso subgrave profundo con chimes bioluminiscentes lejanos
        notes = [
          { freq: 110.0,  delay: 0.0, dur: 2.2, type: 'triangle' },// A2 (sub-bass drone)
          { freq: 220.0,  delay: 0.3, dur: 1.8, type: 'sine' },    // A3
          { freq: 1318.5, delay: 1.6, dur: 0.6, type: 'sine' },    // E6 sparkle
        ];
        break;

      case 'ruins':
        // Templo Submarino: Campanas de cristal místicas modo dórico
        notes = [
          { freq: 440.0,  delay: 0.0, dur: 0.9, type: 'sine' },    // A4
          { freq: 523.25, delay: 0.6, dur: 0.8, type: 'sine' },    // C5
          { freq: 659.25, delay: 1.2, dur: 0.9, type: 'triangle' },// E5
          { freq: 987.77, delay: 1.9, dur: 1.2, type: 'sine' },    // B5
        ];
        break;

      case 'lab':
        // Laboratorio Nautilus: Arpegio electrónico sintetizado y rítmico
        notes = [
          { freq: 261.63, delay: 0.0, dur: 0.3, type: 'sawtooth' },// C4
          { freq: 392.0,  delay: 0.3, dur: 0.3, type: 'sine' },    // G4
          { freq: 523.25, delay: 0.6, dur: 0.3, type: 'sawtooth' },// C5
          { freq: 783.99, delay: 0.9, dur: 0.4, type: 'sine' },    // G5
          { freq: 1046.5, delay: 1.4, dur: 0.6, type: 'triangle' },// C6
        ];
        break;
    }

    notes.forEach((n) => {
      if (!this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime + n.delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = n.type;
      osc.frequency.setValueAtTime(n.freq, now);

      // Soft envelope for background unobtrusiveness
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.dur);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + n.dur);
    });
  }

  // Gentle pink-noise underwater wash ambience
  private startAmbience() {
    if (this.isAmbienceRunning || !this.prefs.ambienceEnabled) return;
    this.initContext();
    if (!this.ctx || !this.ambienceGain) return;

    this.isAmbienceRunning = true;
    try {
      // Create a 2-second looped noise buffer for soft marine current
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.05;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Low pass filter for deep muffled ocean feeling
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.ambienceGain);

      noise.start();
      this.ambienceNoiseNode = noise;
    } catch {
      // In case buffer creation is restricted
    }
  }

  private stopAmbience() {
    this.isAmbienceRunning = false;
    if (this.ambienceNoiseNode) {
      try {
        (this.ambienceNoiseNode as AudioBufferSourceNode).stop();
        this.ambienceNoiseNode.disconnect();
      } catch {
        // ignore
      }
      this.ambienceNoiseNode = null;
    }
  }

  // ==========================================
  // LEGACY SOUNDS (PRESERVED FOR COMPATIBILITY)
  // ==========================================

  public playPop() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playPieceDrop() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playBalanceSuccess() {
    this.playActivityComplete();
  }

  public playTrophyFanfare() {
    this.playLevelUp();
  }

  public playVictoryFanfare() {
    this.playLevelUp();
  }

  public playMismatch() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playBuzzer() {
    this.playMismatch();
  }

  public playRobotStep() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playRobotTurn() {
    if (!this.prefs.sfxEnabled) return;
    this.unlockAudioContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playGemSparkle() {
    this.playRewardClaim();
  }

  // High fidelity Natural Text-to-Speech
  public speakText(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onBoundary?: (charIndex: number) => void
  ) {
    if (this.getIsMuted() || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.pitch = 1.08;

    const voices = window.speechSynthesis.getVoices();
    const esVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('es') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Helena') ||
            v.name.includes('Sabina'))
      ) || voices.find((v) => v.lang.startsWith('es'));

    if (esVoice) {
      utterance.voice = esVoice;
    }

    utterance.onstart = () => {
      this.isSpeechActive = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeechActive = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeechActive = false;
      if (onEnd) onEnd();
    };

    if (onBoundary) {
      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          onBoundary(e.charIndex);
        }
      };
    }

    window.speechSynthesis.speak(utterance);
  }

  public speak(text: string) {
    this.speakText(text);
  }

  public stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeechActive = false;
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeechActive;
  }
}

export const audio = new AudioEngine();
