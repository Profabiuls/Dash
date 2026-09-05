# Agente Segreteria in Dash

## Obiettivo

Integrare l'assistente AI **Aria** (progetto `AgenteSegretaria`) dentro la dashboard desktop **Dash** come nuova scheda o pannello. Aria deve poter:

- rispondere in chat testuale;
- ricevere comandi vocali (STT) e leggere le risposte ad alta voce (TTS);
- gestire meteo, appuntamenti, calendario e bozze;
- funzionare in locale sfruttando Ollama e, opzionalmente, Faster-Whisper.

Il progetto di riferimento si trova in `/Users/fabiomurtas/Ditta_Out_Of_Bounds/Clienti/FabioMurtas/AgenteSegretaria`.

---

## Architettura di riferimento attuale

### `AgenteSegretaria`

```
Frontend (React + Vite)  →  Backend (Express)  →  AI Service (FastAPI + Ollama)
       porta 5173              porta 3001              porta 8000
```

- **Frontend**: React, TypeScript, Tailwind.
- **Backend**: Express proxy verso `ai-service`.
- **AI Service**: FastAPI con `langchain-ollama`, tool LangChain e Faster-Whisper.
- **Database**: SQLite per appuntamenti locali.
- **Integrazioni**: Open-Meteo (meteo), Google Calendar (cloud).

### `Dash`

```
Frontend (Vite + TypeScript + SCSS)  →  Tauri (Rust)  →  SQLite + filesystem
```

- **Frontend**: Vite, TypeScript, SCSS neumorfico.
- **Desktop**: Tauri con finestra widget, SQLite (`tauri-plugin-sql`) e filesystem (`tauri-plugin-fs`).

> Approccio preferenziale per Dash: **non duplicare lo stack Express + Python** se non necessario. L'app Tauri puo' chiamare Ollama direttamente via HTTP da TypeScript, eseguire i tool in TypeScript o Rust e sfruttare il database SQLite gia' esistente.

---

## Task list

---

### FASE 0 — Decisione architettura

- [ ] **0.1** Scegliere la modalita' di integrazione:
  - **Opzione A** — Sidecar Python: bundlare `ai-service` di Aria come sidecar Tauri, in modo che parta e si fermi con l'app.
  - **Opzione B** — Backend Python esterno: avviare separatamente `ai-service` e far contattare Dash a `localhost:8000`.
  - **Opzione C** — Pure TypeScript/Rust: chiamare Ollama direttamente dal frontend e implementare i tool in TypeScript, usando le API Tauri per filesystem/database.
- [ ] **0.2** Verificare prerequisiti in Dash:
  - Ollama in esecuzione (`localhost:11434`);
  - modello `llama3.2:3b` o `llama3.1:8b` scaricato;
  - (opzionale) Faster-Whisper per STT.
- [ ] **0.3** Decidere se riutilizzare il database SQLite di Dash o crearne uno separato per Aria.
- [ ] **0.4** Definire la porta del sidecar/service se opzione A/B.
- [ ] **0.5** Disegnare il flusso dati: Dash → Ollama → tool → database → risposta.

---

### FASE 1 — UI Chat in Dash

- [ ] **1.1** Aggiungere una nuova tab **"Assistente"** nella dashboard.
- [ ] **1.2** Creare il componente `src/components/assistantChat.ts` (analogo a `ChatWindow.tsx` di Aria) con UI neumorfica.
- [ ] **1.3** Implementare:
  - area messaggi scrollabile;
  - input testuale con invio da tastiera;
  - bubble utente/assistente con timestamp;
  - indicatori di caricamento.
- [ ] **1.4** Aggiungere pulsanti:
  - microfono per registrazione vocale;
  - toggle TTS per attivare/disattivare la lettura.
- [ ] **1.5** Mostrare suggerimenti rapidi iniziali.
- [ ] **1.6** Sanificare il contenuto HTML delle risposte per evitare XSS (DOMPurify o equivalente).

---

### FASE 2 — Connessione Ollama

- [ ] **2.1** Verificare la presenza di Ollama all'avvio, magari con un endpoint `/api/tags`.
- [ ] **2.2** Scegliere se usare l'endpoint di chat di Ollama:
  - `POST /api/generate` per domande singole;
  - `POST /api/chat` per conversazioni con history.
- [ ] **2.3** Costruire il `system prompt` dinamico con:
  - data e giorno corrente;
  - elenco tool disponibili;
  - regole e limiti (nessun internet, nessun'invenzione).
- [ ] **2.4** Gestire la memoria conversazione: salvare history in SQLite e passarla ad Ollama.
- [ ] **2.5** Implementare fallback se Ollama non e' raggiungibile.

---

### FASE 3 — Tool e agente

- [ ] **3.1** Implementare il classificatore d'intento o regole deterministiche per decidere se usare i tool.
- [ ] **3.2** Tool **meteo** (`get_weather`, `get_weather_forecast`) usando Open-Meteo API.
- [ ] **3.3** Tool **appuntamenti locali** (`create/list/delete/update_appointment`) usando la tabella SQLite di Dash.
- [ ] **3.4** Tool **agenda unificata** (`get_agenda`) che legge appuntamenti locali + Google Calendar.
- [ ] **3.5** Tool **Google Calendar** (opzionale) con `get/create/delete` eventi.
- [ ] **3.6** Implementare il parser delle risposte Ollama per estrarre le tool call.
- [ ] **3.7** Loop dell'agente:
  - invia messaggio a Ollama;
  - se la risposta contiene tool call, esegui il tool;
  - reinvia il risultato a Ollama;
  - restituisci la risposta finale.
- [ ] **3.8** Gestire il flusso bozze: appuntamenti creati come bozze locali, poi sincronizzazione opzionale su Google Calendar.

---

### FASE 4 — Audio (STT e TTS)

- [ ] **4.1** Implementare registrazione microfono con `MediaRecorder` (`audio/webm;codecs=opus`).
- [ ] **4.2** TTS con `SpeechSynthesis API` del browser, pulendo markdown ed emoji.
- [ ] **4.3** Scegliere e implementare STT:
  - **Opzione 1** — Ollama non supporta Whisper: servirebbe un sidecar Python con Faster-Whisper;
  - **Opzione 2** — API Web Speech se disponibile e consentita;
  - **Opzione 3** — Whisper via Python sidecar o server esterno.
- [ ] **4.4** Salvare il file audio temporaneo, trascriverlo e inviare il testo come messaggio utente.
- [ ] **4.5** Controllare i permessi microfono in Tauri/macOS.

---

### FASE 5 — Persistenza

- [ ] **5.1** Creare tabella `chat_history` in SQLite con:
  - `id`, `role` (user/assistant), `content`, `model`, `timestamp`.
- [ ] **5.2** Salvare ogni messaggio inviato e ricevuto.
- [ ] **5.3** Caricare la cronologia all'apertura della tab Assistente.
- [ ] **5.4** Aggiungere opzione per cancellare la cronologia.
- [ ] **5.5** Verificare che i tool appuntamenti riutilizzino la tabella SQLite gia' usata dalle note.

---

### FASE 6 — Integrazione Tauri e build

- [ ] **6.1** Se si sceglie la **Opzione A (sidecar)**, configurare `tauri.conf.json` per includere il binario Python e avviarlo in background.
- [ ] **6.2** Se si sceglie la **Opzione C (TypeScript)**, configurare le capability per le chiamate HTTP locali a Ollama.
- [ ] **6.3** Gestire gli errori di rete e timeout con messaggi chiari.
- [ ] **6.4** Testare la build desktop (`npm run build:desktop`) e verificare che Ollama/Whisper siano raggiungibili.

---

### FASE 7 — Documentazione

- [ ] **7.1** Aggiornare `README.md` con la nuova tab Assistente.
- [ ] **7.2** Aggiornare `docs/MIGLIORIE.md` con l'integrazione Aria.
- [ ] **7.3** Scrivere note di installazione per Ollama e Whisper nel README.

---

## Stack consigliato

| Componente | Tecnologia in Dash |
|------------|-------------------|
| Frontend chat | Vite + TypeScript + SCSS (componente nativo, non React) |
| LLM | Ollama via HTTP (`/api/chat`) |
| Tool calling | Parser custom delle risposte Ollama o `langchain-ollama` se sidecar |
| STT | Faster-Whisper (opzionale, sidecar Python) |
| TTS | `SpeechSynthesis` browser |
| Database | SQLite gia' presente via `tauri-plugin-sql` |
| Meteo | Open-Meteo API |
| Calendario | Google Calendar API (opzionale) |

---

## Riferimenti

- `/Users/fabiomurtas/Ditta_Out_Of_Bounds/Clienti/FabioMurtas/AgenteSegretaria/README.md`
- `/Users/fabiomurtas/Ditta_Out_Of_Bounds/Clienti/FabioMurtas/AgenteSegretaria/ROADMAP.md`
- `/Users/fabiomurtas/Ditta_Out_Of_Bounds/Clienti/FabioMurtas/AgenteSegretaria/ai-service/main.py`
- `/Users/fabiomurtas/Ditta_Out_Of_Bounds/Clienti/FabioMurtas/AgenteSegretaria/frontend/src/components/ChatWindow.tsx`
- `/Users/fabiomurtas/Ditta_Out_Of_Bounds/Clienti/FabioMurtas/AgenteSegretaria/backend/src/routes/chat.ts`
