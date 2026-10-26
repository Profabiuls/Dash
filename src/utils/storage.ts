/**
 * Wrapper sicuro attorno a localStorage.
 *
 * localStorage può fallire in modalità privata, con storage pieno
 * o quando è disabilitato dal browser. Ogni operazione deve essere
 * protetta per non bloccare l'applicazione.
 */

// Il risultato del probe viene calcolato una sola volta: scrivere e rimuovere
// una chiave di test a ogni accesso sarebbe lavoro inutile.
const storageAvailable: boolean = (() => {
  try {
    const key = '__storage_test__';
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
})();

export function getStoredItem(key: string): string | null {
  if (!storageAvailable) return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStoredItem(key: string, value: string): boolean {
  if (!storageAvailable) return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
