/**
 * Utility per l'interazione sicura con il DOM.
 *
 * In un'applicazione Vite i selettori devono fallire in modo esplicito
 * se un elemento essenziale manca, evitando errori silenziosi a runtime.
 */

/**
 * Recupera un elemento del DOM e ne verifica il tipo atteso.
 *
 * Lancia un errore se l'elemento non esiste, in modo da individuare
 * subito problemi di markup o refactory.
 */
export function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Elemento richiesto non trovato: ${selector}`);
  }

  return element;
}

/**
 * Recupera un elemento opzionale senza lanciare errori.
 *
 * Utile per componenti che possono essere presenti o meno
 * senza compromettere il funzionamento dell'intera applicazione.
 */
export function getOptionalElement<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}
