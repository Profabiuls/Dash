import './styles/main.scss';

import { defineCustomElements } from 'ionicons/dist/loader/index.js';
import { initializeTheme } from './components/theme.js';
import { initializeClock } from './components/clock.js';
import { AudioPlayerController } from './components/audioPlayer.js';
import { initializeVolumeSlider } from './components/volumeSlider.js';
import { PlaylistManager } from './components/playlist.js';
import { initializeTabs } from './components/tabs.js';
import { initializeNotes } from './components/notes.js';
import { initializeQuickSearch } from './components/quickSearch.js';
import { isRunningInTauri } from './utils/environment.js';

/**
 * Punto di ingresso dell'applicazione.
 *
 * Ogni componente viene inizializzato in modo indipendente;
 * l'unico punto di coordinazione è la playlist, che delega
 * la riproduzione vera e propria al controller audio.
 */
function initializeApp(): void {
  // Registra i web component <ion-icon> dal bundle npm (niente CDN);
  // resourcesUrl punta agli SVG serviti dal plugin Vite in vite.config.ts.
  defineCustomElements(window, { resourcesUrl: '/ionicons/' });

  if (isRunningInTauri()) {
    document.documentElement.classList.add('is-tauri');
  }

  initializeTheme();
  initializeClock();

  const audioController = new AudioPlayerController();
  initializeVolumeSlider(audioController);

  const playlist = new PlaylistManager('#playlist', (track) => {
    audioController.loadTrack(track);
    audioController.play();
  });
  playlist.initialize();

  audioController.onTrackEnded(() => {
    playlist.playNext();
  });

  initializeTabs('.main-tabs');
  initializeNotes();
  initializeQuickSearch('.search-suggestions');
}

initializeApp();
