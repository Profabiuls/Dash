import { getElement } from '../utils/dom.js';
import { AudioPlayerController } from './audioPlayer.js';

/**
 * Slider del volume basato su <input type="range"> nativo.
 *
 * Il volume e' applicato al GainNode del grafo Web Audio, non solo alla
 * proprieta' `HTMLAudioElement.volume`, che su alcuni WebView (incluso quello
 * di Tauri) non influenza l'output quando l'audio e' connesso a un AudioContext.
 *
 * Preferiamo l'elemento nativo rispetto a un controllo completamente custom
 * perche' fornisce accessibilita', supporto tastiera e screen reader di default,
 * riducendo la complessita' e gli errori di implementazione ARIA.
 */

const DEFAULT_VOLUME = 50;
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

function updateVolume(controller: AudioPlayerController, value: number, label: HTMLElement, slider: HTMLInputElement): void {
  const percentage = Math.max(0, Math.min(value, PERCENTAGE_FACTOR));
  controller.setVolume(percentage);
  label.textContent = `${Math.round(percentage)}%`;
  updateSliderFill(slider, percentage);
}

export function initializeVolumeSlider(controller: AudioPlayerController): void {
  const slider = getElement<HTMLInputElement>('#volume-slider');
  const valueLabel = getElement<HTMLElement>('#volume-value');

  // Inizializza il controller, lo slider e l'etichetta allo stesso valore.
  slider.value = String(DEFAULT_VOLUME);
  updateVolume(controller, DEFAULT_VOLUME, valueLabel, slider);

  slider.addEventListener('input', () => {
    updateVolume(controller, Number(slider.value), valueLabel, slider);
  });
}
