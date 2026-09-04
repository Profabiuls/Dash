/**
 * Tipologie condivise dell'applicazione.
 *
 * Centralizzare i tipi semplifica la manutenzione e garantisce coerenza
 * tra i vari moduli che manipolano tracce audio e preferenze utente.
 */

export interface Track {
  /** Nome visualizzato della traccia. */
  name: string;
  /** URL della sorgente audio (file locale, blob o remoto). */
  url: string;
  /** Dimensione formattata, mostrata solo per file caricati dall'utente. */
  size?: string;
  /** Indica se la traccia è il brano predefinito incluso nel progetto. */
  isDefault: boolean;
}

export interface NotesState {
  /** Contenuto testuale delle note. */
  content: string;
  /** Timestamp dell'ultimo salvataggio. */
  lastSavedAt?: number;
}
