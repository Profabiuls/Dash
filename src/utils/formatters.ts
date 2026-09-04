/**
 * Funzioni di formattazione riutilizzabili.
 *
 * Tenerle pure (senza side effect e senza dipendenze dal DOM)
 * le rende facilmente testabili in isolamento.
 */

const FILE_SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB'] as const;
const BYTES_PER_KB = 1024;
const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * Converte una dimensione in byte in una stringa leggibile.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(BYTES_PER_KB)),
    FILE_SIZE_UNITS.length - 1
  );
  const value = bytes / Math.pow(BYTES_PER_KB, index);

  return `${Math.round(value * 100) / 100} ${FILE_SIZE_UNITS[index]}`;
}

/**
 * Restituisce una descrizione relativa del tempo trascorso.
 *
 * La funzione è indipendente dalla libreria di internazionalizzazione,
 * ma usa sempre la lingua italiana coerente con il resto dell'applicazione.
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < MINUTE_MS) {
    return 'pochi secondi fa';
  }

  if (diff < HOUR_MS) {
    const minutes = Math.floor(diff / MINUTE_MS);
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minuti'} fa`;
  }

  if (diff < DAY_MS) {
    const hours = Math.floor(diff / HOUR_MS);
    return `${hours} ${hours === 1 ? 'ora' : 'ore'} fa`;
  }

  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
