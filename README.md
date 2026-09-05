# Neumorphic Dashboard

Dashboard interattiva con design **Neumorphic** (Soft UI), che combina estetica minimalista con componenti UI accessibili e interattivi: orologio analogico, audio player, playlist locale, ricerca rapida e note persistenti.

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Caratteristiche

- **Design Neumorphic**: interfaccia moderna con effetti 3D soft, adattata anche a finestra trasparente desktop.
- **Tema chiaro/scuro**: salvato nelle preferenze del browser.
- **Orologio analogico**: funzionante in tempo reale con lancette per ore, minuti e secondi.
- **Audio player**: controlli play/pause, volume con riempimento progressivo, playlist con tracce locali e caricamento file audio.
- **VU meter isomorfo**: visualizzazione in tempo reale del segnale audio tramite Web Audio API.
- **App desktop con Tauri**: wrapper nativo per macOS e Windows, finestra widget senza sfondo, controlli finestra nativi, drag & drop e always-on-top.
- **Persistenza SQLite**: note e metadati playlist salvati in un database locale tramite `tauri-plugin-sql`.
- **File audio persistenti**: nelle build desktop i file caricati vengono salvati nel filesystem applicativo (`tauri-plugin-fs`) e ricaricati automaticamente all'avvio.
- **Ricerca rapida**: collegamenti a Google per meteo, notizie, YouTube e Gmail.
- **Accessibilità**: attributi ARIA appropriati, navigazione da tastiera, focus visibili e screen reader friendly.

## Tecnologie utilizzate

- **HTML5** - Struttura semantica.
- **SCSS/CSS3** - Stili modulari con variabili CSS, dark mode e `prefers-reduced-motion`.
- **TypeScript** - Type safety e codice mantenibile.
- **Vite** - Build tool e dev server.
- **Tauri 2** - Wrapper desktop con backend Rust integrato.
- **Rust** - Backend nativo per la finestra e i plugin.
- **SQLite** - Persistenza locale per note e metadati audio.
- **tauri-plugin-sql** / **tauri-plugin-fs** - Accesso a database e filesystem sandboxed.
- **Vitest** - Framework per test unitari.
- **Ionicons** - Libreria di icone vettoriali.
- **Google Fonts (Poppins)** - Tipografia moderna.

## Installazione

### Prerequisiti

- Node.js 18 o superiore.
- npm (o yarn/pnpm).
- Rust e Cargo (solo se vuoi compilare l'app desktop con Tauri).

Per installare Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### Setup rapido

1. **Clona il repository**

   ```bash
   git clone https://github.com/profabiuls/dash.git
   cd dash
   ```

2. **Installa le dipendenze**

   ```bash
   npm install
   ```

3. **Avvia il server di sviluppo web**

   ```bash
   npm run dev
   ```

4. **Apri nel browser**

   ```
   http://localhost:8080
   ```

### Sviluppo app desktop (Tauri)

1. **Assicurati che Cargo sia nel PATH**

   ```bash
   source "$HOME/.cargo/env"
   ```

2. **Avvia la build con Tauri in hot-reload**

   ```bash
   npm run dev:desktop
   ```

3. **Crea i bundle di distribuzione**

   ```bash
   npm run build:desktop
   ```

   I pacchetti saranno generati in `src-tauri/target/release/bundle/`. Su macOS producono `.app` e `.dmg`; su Windows `.exe` e `.msi` tramite CI.

## Scripts disponibili

| Script | Descrizione |
|--------|-------------|
| `npm run dev` | Avvia il server di sviluppo Vite con hot module replacement (HMR). |
| `npm run build` | Esegue il type check di TypeScript e crea la build di produzione in `dist/`. |
| `npm run preview` | Serve la build di produzione localmente. |
| `npm test` | Esegue i test unitari in modalitá watch. |
| `npm run test:run` | Esegue i test unitari una sola volta. |
| `npm run dev:desktop` | Avvia il frontend e l'app Tauri in modalità sviluppo. |
| `npm run build:desktop` | Compila la release ottimizzata e genera i bundle di installazione. |

## Struttura del progetto

```
dash/
├── index.html                  # Entry point HTML
├── package.json                # Configurazione npm e scripts
├── tsconfig.json               # Configurazione TypeScript
├── vite.config.ts              # Configurazione Vite
├── public/                     # Asset statici serviti alla root
│   └── 04 - Boss Theme 3.mp3
├── src/
│   ├── main.ts                 # Punto di ingresso dell'applicazione
│   ├── types.ts                # Tipi condivisi
│   ├── styles/
│   │   └── main.scss           # Stili SCSS unici e modulari
│   ├── utils/
│   │   ├── dom.ts              # Utility per il DOM
│   │   ├── database.ts         # Connessione e query SQLite (Tauri)
│   │   ├── environment.ts      # Rilevamento ambiente web/Tauri
│   │   ├── formatters.ts       # Formattazione date e dimensioni
│   │   └── storage.ts          # Wrapper sicuro per localStorage
│   └── components/
│       ├── theme.ts            # Gestione tema chiaro/scuro
│       ├── clock.ts            # Orologio analogico
│       ├── audioPlayer.ts      # Controller del player audio
│       ├── volumeSlider.ts     # Slider del volume (input nativo + GainNode)
│       ├── playlist.ts         # Gestione playlist
│       ├── tabs.ts             # Tabs accessibili
│       ├── notes.ts            # Note con autosave
│       └── quickSearch.ts      # Pulsanti di ricerca rapida
├── src-tauri/                  # Progetto Tauri (Rust)
│   ├── src/lib.rs              # Migrazioni e setup backend
│   ├── src/main.rs             # Entry point Rust
│   ├── Cargo.toml              # Dipendenze Rust
│   ├── tauri.conf.json         # Configurazione finestra e bundle
│   └── capabilities/default.json # Permessi Tauri
└── tests/
    └── formatters.test.ts      # Test per le utility di formattazione
```

## Funzionalità interattive

### Orologio analogico

L'orologio si aggiorna ogni secondo. La lancetta dei secondi include anche i millisecondi per un movimento fluido.

### Audio player e playlist

- Clicca il pulsante centrale per avviare o mettere in pausa.
- Carica file audio tramite il pulsante "Carica" nella tab Playlist.
- Clicca su una traccia per riprodurla.
- Quando una traccia termina, parte automaticamente la successiva.
- Il volume è controllato da uno slider nativo con riempimento progressivo.
- Il volume reale viene applicato a un `GainNode` nel grafo Web Audio, cosi' funziona correttamente anche dentro la WebView di Tauri.
- Il VU meter mostra l'andamento del segnale audio in tempo reale.
- Nell'app desktop i file caricati vengono salvati in `audio/` sotto la cartella dati dell'app e ricaricati dopo la chiusura.

### Note

Le note vengono salvate automaticamente dopo un secondo di inattività. Il pulsante Salva fornisce un feedback visivo immediato e aggiorna il timestamp. Nell'app desktop le note sono persistite in SQLite; nel browser tornano a usare `localStorage`.

### Ricerca rapida

I pulsanti aprono i risultati in una nuova scheda con `rel="noopener noreferrer"` per sicurezza.

## Accessibilità

- Attributi ARIA appropriati su tab, tema, play/pause e slider.
- Navigazione da tastiera completa per i tab (frecce, Home, End).
- Focus indicator visibili su tutti i controlli interattivi.
- Icone decorative nascoste agli screen reader con `aria-hidden="true"`.
- Riduzione delle animazioni per utenti con `prefers-reduced-motion: reduce`.

## Personalizzazione

### Colori

Modifica le variabili CSS in `src/styles/main.scss`:

```scss
:root {
  --primary-light: #8abdff;
  --primary: #6d5dfc;
  --primary-dark: #5b0eeb;
  --white: #ffffff;
  --greyLight-1: #e4ebf5;
  --greyLight-2: #c8d0e7;
  --greyLight-3: #bec8e4;
  --greyDark: #9baacf;
}

[data-theme="dark"] {
  // varianti scure
}
```

### Font

Per cambiare il font, modifica l'import in `index.html`:

```html
<link href="https://fonts.googleapis.com/css?family=TuoFont:400,600,700&display=swap" rel="stylesheet">
```

## Test

I test sono scritti con Vitest e coprono le utility di formattazione:

```bash
npm run test:run
```

Per aggiungere nuovi test, crea un file `.test.ts` nella cartella `tests/`.

## Risoluzione problemi

### Il CSS non si aggiorna

1. Ferma e riavvia `npm run dev`.
2. Pulisci la cache del browser (`Cmd/Ctrl + Shift + R`).

### L'audio non funziona

- Verifica che il browser supporti i file MP3.
- Alcuni browser richiedono un'interazione utente prima di riprodurre audio.
- Controlla che il file si trovi nella cartella `public/`.
- Nell'app desktop, assicurati di aver caricato la traccia dalla playlist: la traccia di default e' inclusa nel bundle ma gli altri file sono copiati nella directory dati dell'app.

### Errori durante la build

Assicurati di aver installato le dipendenze con `npm install` e di usare Node.js 18+.

### La build desktop fallisce

- Verifica che Rust e Cargo siano installati (`rustc --version`, `cargo --version`).
- Carica l'ambiente Cargo: `source "$HOME/.cargo/env"`.
- Assicurati di non avere un'altra istanza dell'app aperta (il bundler macOS puo' bloccare file in uso).

## TODO

- [x] Aggiungere tema scuro/chiaro.
- [x] Implementare salvataggio preferenze localmente.
- [x] Aggiungere playlist audio.
- [x] Convertire in app desktop con Tauri (macOS/Windows).
- [x] Persistenza note e metadati playlist con SQLite.
- [ ] Creare più varianti di colore.
- [ ] Ottimizzare per PWA (manifest, service worker).
- [ ] Aggiungere micro-interazioni.
- [x] Implementare gestione stato con `localStorage`.

## Licenza

Rilasciato sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## Autore

**Fabio Murtas**

- GitHub: [@profabiuls](https://github.com/profabiuls)

## Ringraziamenti

- Design ispirato dal concetto Neumorphism/Soft UI.
- Icone da Ionicons.
- Font Poppins da Google Fonts.
