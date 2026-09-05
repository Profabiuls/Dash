import { getElement } from '../utils/dom.js';
import { formatRelativeDate } from '../utils/formatters.js';
import { loadNote, saveNote } from '../utils/database.js';

/**
 * Gestione delle note con salvataggio in SQLite.
 *
 * L'auto-save avviene dopo un breve periodo di inattività,
 * mentre il pulsante Salva fornisce un feedback immediato all'utente.
 */

const AUTO_SAVE_DELAY_MS = 1000;
const FEEDBACK_DURATION_MS = 300;

function updateStatus(element: HTMLElement, timestamp: number | null): void {
  if (!timestamp) {
    element.textContent = 'Ultima modifica: mai';
    return;
  }

  element.textContent = `Ultima modifica: ${formatRelativeDate(new Date(timestamp))}`;
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

  const savedNote = await loadNote();

  if (savedNote) {
    textarea.value = savedNote.content;
    updateStatus(statusLabel, savedNote.updatedAt);
  } else {
    updateStatus(statusLabel, null);
  }

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  async function persistNotes(): Promise<void> {
    const timestamp = await saveNote(textarea.value);
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
