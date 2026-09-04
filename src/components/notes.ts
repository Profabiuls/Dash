import { getStoredItem, setStoredItem } from '../utils/storage.js';
import { getElement } from '../utils/dom.js';
import { formatRelativeDate } from '../utils/formatters.js';

/**
 * Gestione delle note con salvataggio in localStorage.
 *
 * L'auto-save avviene dopo un breve periodo di inattività,
 * mentre il pulsante Salva fornisce un feedback immediato all'utente.
 */

const NOTES_KEY = 'dashboard-notes';
const TIMESTAMP_KEY = 'dashboard-notes-timestamp';
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
  const textarea = getElement<HTMLTextAreaElement>('#notes-textarea');
  const saveButton = getElement<HTMLButtonElement>('#save-notes');
  const statusLabel = getElement<HTMLElement>('#notes-status');

  const savedContent = getStoredItem(NOTES_KEY);
  const savedTimestamp = getStoredItem(TIMESTAMP_KEY);

  if (savedContent) {
    textarea.value = savedContent;
  }

  updateStatus(statusLabel, savedTimestamp ? Number(savedTimestamp) : null);

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  function persistNotes(): void {
    const now = Date.now();

    if (setStoredItem(NOTES_KEY, textarea.value)) {
      setStoredItem(TIMESTAMP_KEY, String(now));
      updateStatus(statusLabel, now);
    }
  }

  textarea.addEventListener('input', () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    autoSaveTimer = setTimeout(persistNotes, AUTO_SAVE_DELAY_MS);
  });

  saveButton.addEventListener('click', () => {
    persistNotes();

    // Feedback visivo temporaneo per confermare il salvataggio.
    saveButton.style.backgroundColor = 'var(--primary-light)';
    setTimeout(() => {
      saveButton.style.backgroundColor = '';
    }, FEEDBACK_DURATION_MS);
  });
}
