import { getElement } from '../utils/dom.js';
import { getStoredItem, setStoredItem } from '../utils/storage.js';
import { formatRelativeDate } from '../utils/formatters.js';
import { isRunningInTauri } from '../utils/environment.js';
import { loadNote, saveNote, type NoteRecord } from '../utils/database.js';

/**
 * Gestione delle note con salvataggio persistente.
 *
 * In ambiente Tauri le note vengono salvate in SQLite; nel browser
 * si ripiega su localStorage, così la funzionalità resta disponibile
 * in entrambi i contesti di esecuzione.
 * L'auto-save avviene dopo un breve periodo di inattività,
 * mentre il pulsante Salva fornisce un feedback immediato all'utente.
 */

const AUTO_SAVE_DELAY_MS = 1000;
const FEEDBACK_DURATION_MS = 300;
const NOTE_STORAGE_KEY = 'dashboard-note';
const NOTE_TIMESTAMP_KEY = 'dashboard-note-updated-at';

function updateStatus(element: HTMLElement, timestamp: number | null): void {
  if (!timestamp) {
    element.textContent = 'Ultima modifica: mai';
    return;
  }

  element.textContent = `Ultima modifica: ${formatRelativeDate(new Date(timestamp))}`;
}

async function readNote(): Promise<NoteRecord | null> {
  if (isRunningInTauri()) {
    return loadNote();
  }

  const content = getStoredItem(NOTE_STORAGE_KEY);
  if (content === null) return null;

  const timestamp = Number(getStoredItem(NOTE_TIMESTAMP_KEY));
  return { content, updatedAt: Number.isFinite(timestamp) ? timestamp : Date.now() };
}

async function writeNote(content: string): Promise<number | null> {
  if (isRunningInTauri()) {
    return saveNote(content);
  }

  const now = Date.now();
  const saved =
    setStoredItem(NOTE_STORAGE_KEY, content) &&
    setStoredItem(NOTE_TIMESTAMP_KEY, String(now));
  return saved ? now : null;
}

export function initializeNotes(): void {
  initializeNotesAsync().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Errore inizializzazione note:', error);
  });
}

async function initializeNotesAsync(): Promise<void> {
  const textarea = getElement<HTMLTextAreaElement>('#notes-textarea');
  const saveButton = getElement<HTMLButtonElement>('#save-notes');
  const statusLabel = getElement<HTMLElement>('#notes-status');

  const savedNote = await readNote();

  if (savedNote) {
    textarea.value = savedNote.content;
    updateStatus(statusLabel, savedNote.updatedAt);
  } else {
    updateStatus(statusLabel, null);
  }

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  async function persistNotes(): Promise<void> {
    const timestamp = await writeNote(textarea.value);
    updateStatus(statusLabel, timestamp);
  }

  textarea.addEventListener('input', () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    autoSaveTimer = setTimeout(() => {
      persistNotes().catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Errore auto-salvataggio note:', error);
      });
    }, AUTO_SAVE_DELAY_MS);
  });

  saveButton.addEventListener('click', () => {
    persistNotes().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Errore salvataggio note:', error);
    });

    // Feedback visivo temporaneo per confermare il salvataggio.
    saveButton.style.backgroundColor = 'var(--primary-light)';
    setTimeout(() => {
      saveButton.style.backgroundColor = '';
    }, FEEDBACK_DURATION_MS);
  });
}
