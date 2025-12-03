# 🎨 Neumorphic Dashboard

Una dashboard interattiva moderna con design **Neumorphic** (Soft UI), che combina estetica minimalista con componenti UI funzionali e interattivi.

![Dashboard Preview](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Caratteristiche

- 🎯 **Design Neumorphic** - Interfaccia moderna con effetti 3D soft
- ⏰ **Orologio Analogico** - Funzionante in tempo reale con lancette animate
- 🎵 **Audio Player** - Player musicale integrato con controlli volume
- 🔘 **Componenti UI Interattivi**:
  - Switch animati
  - Checkbox personalizzate
  - Radio buttons
  - Pulsanti primary e secondary
  - Slider per controllo volume
  - Input forms e barra di ricerca
  - Tab segmentati
  - Icone di navigazione animate
  - Chip informativi

## 🚀 Tecnologie Utilizzate

- **HTML5** - Struttura semantica con accessibilità ARIA
- **SCSS/CSS3** - Stili avanzati con variabili CSS e animazioni
- **JavaScript ES6+** - Logica interattiva moderna
- **Ionicons** - Libreria icone vettoriali
- **Material Icons** - Icone Google Material Design
- **Font Awesome** - Set aggiuntivo di icone
- **Google Fonts (Poppins)** - Tipografia moderna

## 📦 Installazione

### Prerequisiti

- Un browser web moderno (Chrome, Firefox, Safari, Edge)
- Python 3.x (per il server locale) oppure qualsiasi server HTTP
- (Opzionale) Node.js e npm per compilazione SCSS

### Setup Rapido

1. **Clona il repository**
   ```bash
   git clone https://github.com/profabiuls/dash.git
   cd dash
   ```

2. **Avvia il server locale**
   ```bash
   # Opzione 1: Con Python
   python3 -m http.server 8080
   
   # Opzione 2: Con npm
   npm start
   ```

3. **Apri nel browser**
   ```
   http://localhost:8080
   ```

## 🛠️ Sviluppo

### Compilazione SCSS

Se vuoi modificare gli stili SCSS:

1. **Installa le dipendenze**
   ```bash
   npm install
   ```

2. **Modalità watch (sviluppo)**
   ```bash
   npm run sass:watch
   ```

3. **Build produzione (compresso)**
   ```bash
   npm run sass:build
   ```

### Struttura del Progetto

```
dash/
├── index.html          # Struttura HTML principale
├── index.js            # Logica JavaScript
├── style.scss          # Stili sorgente SCSS
├── style.css           # CSS compilato
├── style.css.map       # Source map per debugging
├── package.json        # Configurazione npm
├── README.md           # Questo file
└── 04 - Boss Theme 3.mp3  # Audio di esempio
```

## 🎮 Funzionalità Interattive

### Orologio Analogico
L'orologio si aggiorna automaticamente ogni secondo, mostrando l'ora corrente con lancette separate per ore, minuti e secondi.

### Audio Player
- **Play/Pause**: Clicca il pulsante centrale
- **Volume**: Usa lo slider in basso per regolare
- **Animazioni**: Onde animate durante la riproduzione
- **Supporto tastiera**: Frecce sinistra/destra per volume

### Componenti Interattivi
Tutti i componenti sono completamente funzionali e possono essere utilizzati come riferimento per altri progetti.

## ♿ Accessibilità

Il progetto implementa le migliori pratiche di accessibilità:

- ✅ Attributi ARIA appropriati
- ✅ Navigazione da tastiera
- ✅ Etichette semantiche
- ✅ Contrasto colori ottimale
- ✅ Focus indicators visibili
- ✅ Screen reader friendly

## 🎨 Personalizzazione

### Colori

Modifica le variabili CSS in `style.scss`:

```scss
:root {
  --primary-light: #8abdff;
  --primary: #6d5dfc;
  --primary-dark: #5b0eeb;
  --white: #FFFFFF;
  --greyLight-1: #E4EBF5;
  --greyLight-2: #c8d0e7;
  --greyLight-3: #bec8e4;
  --greyDark: #9baacf;
}
```

### Font

Per cambiare il font, modifica l'import in `index.html`:

```html
<link href="https://fonts.googleapis.com/css?family=TuoFont:400,600,700&display=swap" rel="stylesheet">
```

## 📱 Responsive Design

Il design è ottimizzato per diverse dimensioni di schermo con breakpoint a 900px.

## 🐛 Risoluzione Problemi

### Il CSS non si aggiorna
Se le modifiche SCSS non vengono applicate:
```bash
# Ricompila il CSS
npm run sass:build
# Pulisci la cache del browser (Cmd/Ctrl + Shift + R)
```

### L'audio non funziona
- Verifica che il browser supporti i file MP3
- Alcuni browser richiedono interazione utente prima di riprodurre audio
- Controlla la console per errori

### Ruby/SASS non necessario
Il progetto include già il CSS compilato. Ruby/SASS sono necessari solo se vuoi modificare gli stili SCSS.

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file LICENSE per i dettagli.

## 👤 Autore

**Fabio Murtas**

- Website: [fabioprofabiuls.com](https://fabioprofabiuls.com) _(esempio)_
- GitHub: [@profabiuls](https://github.com/profabiuls)

## 🙏 Ringraziamenti

- Design ispirato dal concetto Neumorphism/Soft UI
- Icone da Ionicons, Material Icons e Font Awesome
- Font Poppins da Google Fonts

## 📝 TODO Future

- [ ] Aggiungere temi scuro/chiaro
- [ ] Implementare salvare preferenze localmente
- [ ] Aggiungere playlist audio
- [ ] Creare più varianti di colore
- [ ] Ottimizzare per PWA
- [ ] Aggiungere animazioni micro-interazioni
- [ ] Implementare gestione stato con localStorage

---

⭐ Se ti piace questo progetto, lascia una stella su GitHub!
