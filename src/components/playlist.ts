import { formatFileSize } from '../utils/formatters.js';
import { getElement } from '../utils/dom.js';
import { isRunningInTauri } from '../utils/environment.js';
import { loadTracks, saveTrack, type TrackRecord } from '../utils/database.js';
import { mkdir, writeFile, readFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import type { Track } from '../types.js';

/**
 * Gestione della playlist audio.
 *
 * Questo modulo si occupa solo della logica e della UI della lista tracce:
 * non gestisce direttamente l'audio, ma notifica al chiamante quando
 * l'utente seleziona una traccia diversa.
 */

const DEFAULT_TRACK: Track = {
  name: '04 - Boss Theme 3.mp3',
  url: '04 - Boss Theme 3.mp3',
  isDefault: true,
};

const DEFAULT_SIZE_LABEL = '3.4 MB';
const LOCAL_FILE_LABEL = 'File locale';
const AUDIO_DIR = 'audio';

function generateUniqueFilename(originalName: string): string {
  const extension = originalName.split('.').pop() ?? 'audio';
  return `${crypto.randomUUID()}.${extension}`;
}

type TrackSelectHandler = (track: Track, index: number) => void;

export class PlaylistManager {
  private tracks: Track[] = [DEFAULT_TRACK];
  private currentTrackIndex = 0;
  private container: HTMLElement;
  private onSelectTrack: TrackSelectHandler;

  constructor(containerSelector: string, onSelectTrack: TrackSelectHandler) {
    this.container = getElement<HTMLElement>(containerSelector);
    this.onSelectTrack = onSelectTrack;
  }

  initialize(): void {
    this.renderEmptyState();
    this.addTrackToUi(this.tracks[0], 0);
    this.loadPersistedTracks().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Errore caricamento playlist persistita:', error);
    });
    this.bindUpload();
  }

  private async loadPersistedTracks(): Promise<void> {
    if (!isRunningInTauri()) return;

    const records: TrackRecord[] = await loadTracks();
    if (records.length === 0) return;

    for (const record of records) {
      try {
        const bytes = await readFile(`${AUDIO_DIR}/${record.filename}`, {
          baseDir: BaseDirectory.AppLocalData,
        });
        const blob = new Blob([bytes]);
        const url = URL.createObjectURL(blob);

        this.tracks.push({
          id: record.id,
          name: record.name,
          url,
          size: record.sizeLabel ?? undefined,
          isDefault: false,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Errore lettura traccia ${record.filename}:`, error);
      }
    }

    this.renderTracks();
  }

  private bindUpload(): void {
    const uploadInput = getElement<HTMLInputElement>('#audio-upload');

    uploadInput.addEventListener('change', (event) => {
      const files = Array.from((event.target as HTMLInputElement).files ?? []);
      if (files.length === 0) return;

      files.forEach((file) => {
        if (!file.type.startsWith('audio/')) return;

        this.addTrack(file).catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Errore aggiunta traccia:', error);
        });
      });

      // Reset per consentire il caricamento dello stesso file più volte.
      uploadInput.value = '';
    });
  }

  private async addTrack(file: File): Promise<void> {
    const sizeLabel = formatFileSize(file.size);

    if (isRunningInTauri()) {
      await mkdir(AUDIO_DIR, { baseDir: BaseDirectory.AppLocalData, recursive: true });

      const filename = generateUniqueFilename(file.name);
      const arrayBuffer = await file.arrayBuffer();
      await writeFile(`${AUDIO_DIR}/${filename}`, new Uint8Array(arrayBuffer), {
        baseDir: BaseDirectory.AppLocalData,
      });

      const id = await saveTrack(filename, file.name, sizeLabel);
      if (id === null) {
        throw new Error('Salvataggio metadati traccia fallito');
      }

      const bytes = await readFile(`${AUDIO_DIR}/${filename}`, {
        baseDir: BaseDirectory.AppLocalData,
      });
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);

      this.tracks.push({
        id,
        name: file.name,
        url,
        size: sizeLabel,
        isDefault: false,
      });
    } else {
      this.tracks.push({
        name: file.name,
        url: URL.createObjectURL(file),
        size: sizeLabel,
        isDefault: false,
      });
    }

    this.addTrackToUi(this.tracks[this.tracks.length - 1], this.tracks.length - 1);
  }

  private renderTracks(): void {
    this.container.innerHTML = '';
    this.renderEmptyState();
    this.tracks.forEach((track, index) => this.addTrackToUi(track, index));
  }

  private removeEmptyState(): void {
    const emptyMessage = this.container.querySelector('.playlist-empty');
    emptyMessage?.remove();
  }

  private renderEmptyState(): void {
    this.removeEmptyState();

    const empty = document.createElement('div');
    empty.className = 'playlist-empty';
    empty.innerHTML = `
      <ion-icon name="musical-notes-outline" aria-hidden="true"></ion-icon>
      <p>Nessuna traccia caricata</p>
    `;
    this.container.appendChild(empty);
  }

  /**
   * Crea un elemento traccia usando esclusivamente DOM API.
   *
   * Evitiamo innerHTML con dati provenienti dall'utente per prevenire
   * potenziali vulnerabilità XSS sul nome del file audio caricato.
   */
  private addTrackToUi(track: Track, index: number): void {
    this.removeEmptyState();

    const isCurrent = index === this.currentTrackIndex;

    const item = document.createElement('div');
    item.className = `playlist-item${isCurrent ? ' active' : ''}`;
    item.dataset.index = String(index);
    item.setAttribute('role', 'listitem');

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'track-icon';
    const icon = document.createElement('ion-icon');
    icon.setAttribute('name', isCurrent ? 'volume-high' : 'musical-note');
    icon.setAttribute('aria-hidden', 'true');
    iconWrapper.appendChild(icon);

    const info = document.createElement('div');
    info.className = 'track-info';
    const name = document.createElement('div');
    name.className = 'track-name';
    name.textContent = track.name;
    const size = document.createElement('div');
    size.className = 'track-size';
    size.textContent = track.size ?? (track.isDefault ? DEFAULT_SIZE_LABEL : LOCAL_FILE_LABEL);
    info.appendChild(name);
    info.appendChild(size);

    const playButton = document.createElement('button');
    playButton.className = 'track-play';
    playButton.setAttribute('aria-label', `Riproduci ${track.name}`);
    playButton.setAttribute('type', 'button');
    const playIcon = document.createElement('ion-icon');
    playIcon.setAttribute('name', 'play-circle');
    playIcon.setAttribute('aria-hidden', 'true');
    playButton.appendChild(playIcon);

    item.appendChild(iconWrapper);
    item.appendChild(info);
    item.appendChild(playButton);

    item.addEventListener('click', (event) => {
      // Se si clicca sul pulsante play, evitiamo il doppio trigger.
      event.stopPropagation();
      this.selectTrack(index);
    });

    playButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.selectTrack(index);
    });

    this.container.appendChild(item);
  }

  selectTrack(index: number): void {
    if (index < 0 || index >= this.tracks.length) return;

    this.currentTrackIndex = index;
    this.updateActiveTrack();
    this.onSelectTrack(this.tracks[index], index);
  }

  playNext(): void {
    const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.selectTrack(nextIndex);
  }

  private updateActiveTrack(): void {
    const items = this.container.querySelectorAll<HTMLElement>('.playlist-item');

    items.forEach((item) => {
      const itemIndex = Number(item.dataset.index);
      const isCurrent = itemIndex === this.currentTrackIndex;
      const icon = item.querySelector('ion-icon');

      item.classList.toggle('active', isCurrent);
      icon?.setAttribute('name', isCurrent ? 'volume-high' : 'musical-note');
    });
  }
}
