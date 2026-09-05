import Database from '@tauri-apps/plugin-sql';

const DB_PATH = 'sqlite:app.db';

let databaseInstance: Database | null = null;

interface NoteRow {
  content: string;
  updated_at: number;
}

interface TrackRow {
  id: number;
  filename: string;
  name: string;
  size_label: string | null;
  created_at: number;
}

async function getDatabase(): Promise<Database> {
  if (databaseInstance) return databaseInstance;

  const db = await Database.load(DB_PATH);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY,
      content TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      name TEXT NOT NULL,
      size_label TEXT,
      created_at INTEGER NOT NULL
    )
  `);
  databaseInstance = db;
  return databaseInstance;
}

export interface NoteRecord {
  content: string;
  updatedAt: number;
}

export async function loadNote(): Promise<NoteRecord | null> {
  try {
    const db = await getDatabase();
    const rows = await db.select<Array<NoteRow>>(
      'SELECT content, updated_at FROM notes ORDER BY updated_at DESC LIMIT 1'
    );

    if (rows.length === 0) return null;

    return { content: rows[0].content, updatedAt: rows[0].updated_at };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Errore caricamento note dal database:', error);
    return null;
  }
}

export async function saveNote(content: string): Promise<number | null> {
  try {
    const db = await getDatabase();
    const now = Date.now();

    await db.execute('DELETE FROM notes');
    await db.execute('INSERT INTO notes (id, content, updated_at) VALUES (1, ?, ?)', [
      content,
      now,
    ]);

    return now;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Errore salvataggio note nel database:', error);
    return null;
  }
}

export interface TrackRecord {
  id: number;
  filename: string;
  name: string;
  sizeLabel: string | null;
  createdAt: number;
}

export async function loadTracks(): Promise<TrackRecord[]> {
  try {
    const db = await getDatabase();
    const rows = await db.select<Array<TrackRow>>(
      'SELECT id, filename, name, size_label, created_at FROM tracks ORDER BY created_at ASC'
    );

    return rows.map((row) => ({
      id: row.id,
      filename: row.filename,
      name: row.name,
      sizeLabel: row.size_label,
      createdAt: row.created_at,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Errore caricamento tracce dal database:', error);
    return [];
  }
}

export async function saveTrack(
  filename: string,
  name: string,
  sizeLabel: string | null
): Promise<number | null> {
  try {
    const db = await getDatabase();
    const now = Date.now();

    await db.execute(
      'INSERT INTO tracks (filename, name, size_label, created_at) VALUES (?, ?, ?, ?)',
      [filename, name, sizeLabel, now]
    );

    const rows = await db.select<Array<{ id: number }>>(
      'SELECT id FROM tracks WHERE filename = ? ORDER BY created_at DESC LIMIT 1',
      [filename]
    );

    return rows.length > 0 ? rows[0].id : null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Errore salvataggio traccia nel database:', error);
    return null;
  }
}

export async function deleteTrack(id: number): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.execute('DELETE FROM tracks WHERE id = ?', [id]);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Errore eliminazione traccia dal database:', error);
    return false;
  }
}
