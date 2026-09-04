import { getElement } from '../utils/dom.js';

/**
 * Slider del volume basato su <input type="range"> nativo.
 *
 * Preferiamo l'elemento nativo rispetto a un controllo completamente custom
 * perché fornisce accessibilità, supporto tastiera e screen reader di default,
 * riducendo la complessità e gli errori di implementazione ARIA.
 */

const DEFAULT_VOLUME = 0.5;
const PERCENTAGE_FACTOR = 100;

function updateSliderFill(slider: HTMLInputElement, percentage: number): void {
  // Colora la parte sinistra dello slider fino al valore attuale,
  // lasciando il resto con il colore di sfondo della traccia.
  slider.style.background = `linear-gradient(
    to right,
    var(--primary) 0%,
    var(--primary) ${percentage}%,
    var(--slider-track) ${percentage}%,
    var(--slider-track) 100%
  )`;
}

function updateVolume(audio: HTMLAudioElement, value: number, label: HTMLElement, slider: HTMLInputElement): void {
  const percentage = Math.max(0, Math.min(value, PERCENTAGE_FACTOR));
  audio.volume = percentage / PERCENTAGE_FACTOR;
  label.textContent = `${Math.round(percentage)}%`;
  updateSliderFill(slider, percentage);
}

export function initializeVolumeSlider(audio: HTMLAudioElement): void {
  const slider = getElement<HTMLInputElement>('#volume-slider');
  const valueLabel = getElement<HTMLElement>('#volume-value');

  // Inizializza l'audio e lo slider allo stesso valore per coerenza.
  slider.value = String(DEFAULT_VOLUME * PERCENTAGE_FACTOR);
  updateVolume(audio, DEFAULT_VOLUME * PERCENTAGE_FACTOR, valueLabel, slider);

  slider.addEventListener('input', () => {
    updateVolume(audio, Number(slider.value), valueLabel, slider);
  });
}
