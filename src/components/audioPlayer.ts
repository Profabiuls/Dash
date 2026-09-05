import { getElement } from '../utils/dom.js';
import type { Track } from '../types.js';

/**
 * Gestione del player audio, dei controlli di riproduzione e del VU meter.
 *
 * Lo stato di riproduzione e l'aggiornamento UI sono centralizzati in questo modulo
 * per evitare duplicazione logica tra pulsante play e selezione traccia dalla playlist.
 * Il VU meter utilizza Web Audio API per analizzare il segnale in tempo reale.
 */

type StateChangeListener = (isPlaying: boolean) => void;
type TrackEndedListener = () => void;

const WAVES_PAUSED_CLASS = 'paused';
const VISIBILITY_CLASS = 'visibility';
const SHADOW_CLASS = 'shadow';
const VU_BAR_COUNT = 12;
const DEFAULT_VOLUME = 0.5;
const VOLUME_PERCENTAGE_FACTOR = 100;
const VU_METER_BASE_FACTOR = 6.0;

export class AudioPlayerController {
  readonly audio: HTMLAudioElement;
  private isPlaying = false;
  private stateListeners: StateChangeListener[] = [];
  private endedListeners: TrackEndedListener[] = [];

  private readonly playIcon: HTMLElement;
  private readonly pauseIcon: HTMLElement;
  private readonly playButton: HTMLButtonElement;
  private readonly wave1: HTMLElement;
  private readonly wave2: HTMLElement;
  private readonly currentTrackName: HTMLElement;
  private readonly vuBars: HTMLElement[];

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private animationFrameId: number | null = null;
  private volume = DEFAULT_VOLUME;

  constructor() {
    this.audio = getElement<HTMLAudioElement>('#audio-player');
    this.playIcon = getElement<HTMLElement>('.circle__btn .play');
    this.pauseIcon = getElement<HTMLElement>('.circle__btn .pause');
    this.playButton = getElement<HTMLButtonElement>('.circle__btn');
    this.wave1 = getElement<HTMLElement>('.circle__back-1');
    this.wave2 = getElement<HTMLElement>('.circle__back-2');
    this.currentTrackName = getElement<HTMLElement>('#current-track-name');
    this.vuBars = Array.from(document.querySelectorAll<HTMLElement>('.vu-bar'));

    this.audio.addEventListener('ended', () => this.notifyEnded());
    this.playButton.addEventListener('click', () => this.togglePlayback());
    this.audio.volume = DEFAULT_VOLUME;
  }

  /**
   * Carica una traccia senza avviare automaticamente la riproduzione.
   */
  loadTrack(track: Track): void {
    this.audio.src = track.url;
    this.audio.load();
    this.currentTrackName.textContent = track.name;
  }

  /**
   * Avvia la riproduzione se attualmente in pausa, altrimenti mette in pausa.
   */
  togglePlayback(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play(): void {
    this.initializeAudioContext();

    const startPlayback = (): void => {
      this.audio.play().catch((error) => {
        // L'utente potrebbe aver bloccato l'autoplay o il file è corrotto.
        this.pause();
        // eslint-disable-next-line no-console
        console.error('Errore riproduzione audio:', error);
      });

      this.isPlaying = true;
      this.updateUiState(true);
      this.startVuMeter();
      this.notifyStateChange();
    };

    // Il browser potrebbe sospendere l'AudioContext fino a un'interazione utente.
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume().then(startPlayback);
    } else {
      startPlayback();
    }
  }

  pause(): void {
    this.audio.pause();
    this.audioContext?.suspend();
    this.isPlaying = false;
    this.updateUiState(false);
    this.stopVuMeter();
    this.notifyStateChange();
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  onStateChange(listener: StateChangeListener): void {
    this.stateListeners.push(listener);
  }

  onTrackEnded(listener: TrackEndedListener): void {
    this.endedListeners.push(listener);
  }

  private initializeAudioContext(): void {
    if (this.audioContext) return;

    const ContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!ContextClass) return;

    this.audioContext = new ContextClass();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.volume;

    const source = this.audioContext.createMediaElementSource(this.audio);
    source.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  /**
   * Imposta il volume di riproduzione (0-100).
   *
   * Poiche' l'audio passa attraverso un AudioContext, `HTMLAudioElement.volume`
   * non e' sufficiente su tutti i motori (es. WebKit in Tauri). Il volume reale
   * viene controllato tramite un GainNode nel grafo Web Audio.
   */
  setVolume(percentage: number): void {
    const normalized = Math.max(0, Math.min(percentage, VOLUME_PERCENTAGE_FACTOR)) / VOLUME_PERCENTAGE_FACTOR;
    this.volume = normalized;
    this.audio.volume = normalized;
    if (this.gainNode) {
      this.gainNode.gain.value = normalized;
    }
  }

  private startVuMeter(): void {
    if (!this.analyser || this.vuBars.length !== VU_BAR_COUNT) return;

    const bufferLength = this.analyser.fftSize;
    const samplesPerBar = Math.floor(bufferLength / VU_BAR_COUNT);
    const timeData = new Float32Array(bufferLength);

    const updateBars = () => {
      // Usiamo i campioni nel dominio del tempo e calcoliamo il valore RMS
      // per ogni segmento, che e' molto piu' fedele al volume percepito rispetto
      // ai dati di frequenza grezzi.
      this.analyser!.getFloatTimeDomainData(timeData);

      const volumeFactor = VU_METER_BASE_FACTOR;

      this.vuBars.forEach((bar, index) => {
        const start = index * samplesPerBar;
        const end = start + samplesPerBar;
        let sumSquares = 0;

        for (let i = start; i < end; i++) {
          sumSquares += timeData[i] * timeData[i];
        }

        const rms = Math.sqrt(sumSquares / samplesPerBar);
        const percentage = Math.min(100, rms * 100 * volumeFactor);
        bar.style.height = `${Math.max(5, percentage)}%`;
      });

      this.animationFrameId = requestAnimationFrame(updateBars);
    };

    updateBars();
  }

  private stopVuMeter(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.vuBars.forEach((bar) => {
      bar.style.height = '5%';
    });
  }

  private updateUiState(playing: boolean): void {
    this.playButton.setAttribute('aria-pressed', String(playing));
    this.wave1.classList.toggle(WAVES_PAUSED_CLASS, !playing);
    this.wave2.classList.toggle(WAVES_PAUSED_CLASS, !playing);

    if (playing) {
      this.playIcon.classList.add(VISIBILITY_CLASS);
      this.pauseIcon.classList.add(VISIBILITY_CLASS);
      this.playButton.classList.add(SHADOW_CLASS);
    } else {
      this.playIcon.classList.remove(VISIBILITY_CLASS);
      this.pauseIcon.classList.remove(VISIBILITY_CLASS);
      this.playButton.classList.remove(SHADOW_CLASS);
    }
  }

  private notifyStateChange(): void {
    this.stateListeners.forEach((listener) => listener(this.isPlaying));
  }

  private notifyEnded(): void {
    this.endedListeners.forEach((listener) => listener());
  }
}
