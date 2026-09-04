import { getElement } from '../utils/dom.js';

/**
 * Pulsanti di ricerca rapida.
 *
 * Apre i risultati in una nuova scheda, aggiungendo sempre
 * rel="noopener noreferrer" per sicurezza e performance.
 */

const SEARCH_BASE_URL = 'https://www.google.com/search';

export function initializeQuickSearch(containerSelector: string): void {
  const container = getElement<HTMLElement>(containerSelector);
  const buttons = container.querySelectorAll<HTMLButtonElement>('[data-query]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const query = button.dataset.query ?? '';
      const url = `${SEARCH_BASE_URL}?q=${encodeURIComponent(query)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });
}
