// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

const getStoredTheme = () => localStorage.getItem('dashboard-theme') || 'light';
const setStoredTheme = (theme) => localStorage.setItem('dashboard-theme', theme);

const setTheme = (theme) => {
  htmlElement.setAttribute('data-theme', theme);
  setStoredTheme(theme);
  console.log(`🎨 Tema cambiato: ${theme}`);
};

const toggleTheme = () => {
  const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
};

themeToggle.addEventListener('click', toggleTheme);

const initTheme = () => {
  const storedTheme = getStoredTheme();
  setTheme(storedTheme);
};

initTheme();

// ===== CLOCK FUNCTIONALITY =====
const hours = document.querySelector('.hours');
const minutes = document.querySelector('.minutes');
const seconds = document.querySelector('.seconds');

// ===== PLAY BUTTON =====
const play = document.querySelector('.play');
const pause = document.querySelector('.pause');
const playBtn = document.querySelector('.circle__btn');
const wave1 = document.querySelector('.circle__back-1');
const wave2 = document.querySelector('.circle__back-2');
const audio = document.getElementById('myAudio');

// ===== RATE SLIDER =====
const container = document.querySelector('.slider__box');
const btn = document.querySelector('.slider__btn');
const color = document.querySelector('.slider__color');
const tooltip = document.querySelector('.slider__tooltip');

// Clock update function
const updateClock = () => {
  const today = new Date();
  let h = (today.getHours() % 12) + today.getMinutes() / 59;
  let m = today.getMinutes();
  let s = today.getSeconds();

  // Convert to degrees
  h *= 30; // 12 hours * 30 = 360deg
  m *= 6;  // 60 minutes * 6 = 360deg
  s *= 6;  // 60 seconds * 6 = 360deg

  rotateHand(hours, h);
  rotateHand(minutes, m);
  rotateHand(seconds, s);
};

// Rotate clock hand
const rotateHand = (target, degrees) => {
  target.style.transform = `rotate(${degrees}deg)`;
};

// ===== INITIALIZATION ON PAGE LOAD =====
window.addEventListener('DOMContentLoaded', () => {
  // Initialize clock
  updateClock();
  setInterval(updateClock, 1000);
  
  // Set initial audio player state (CSS già gestisce lo stato iniziale corretto)
  // play è già visibile (opacity: 1), pause già invisibile (opacity: 0)
  wave1.classList.add('paused'); // Waves paused initially
  wave2.classList.add('paused');
  
  // Set initial volume to 50% and verify audio element
  if (audio) {
    audio.volume = 0.5;
    console.log('🎵 Audio element trovato:', audio);
    console.log('📁 Sorgente audio:', audio.src);
    console.log('🔊 Volume iniziale:', audio.volume);
    
    // Debug events
    audio.addEventListener('loadeddata', () => {
      console.log('✅ Audio caricato e pronto');
    });
    
    audio.addEventListener('error', (e) => {
      console.error('❌ Errore caricamento audio:', e);
      console.error('Dettagli errore:', audio.error);
    });
  } else {
    console.error('❌ Elemento audio NON trovato!');
  }
  
  // Initialize slider position at 50%
  const sliderRect = container.getBoundingClientRect();
  const initialPosition = (sliderRect.width * 0.5) - 10;
  btn.style.left = `${initialPosition}px`;
  btn.x = initialPosition;
  color.style.width = '50%';
});
// ===== DRAG SLIDER FUNCTIONALITY =====
const dragElement = (target, sliderBtn) => {
  const onMouseMove = (e) => {
    e.preventDefault();
    const targetRect = target.getBoundingClientRect();
    let x = e.pageX - targetRect.left + 10;
    
    // Clamp x value
    x = Math.max(0, Math.min(x, targetRect.width));
    
    sliderBtn.x = x - 10;
    sliderBtn.style.left = `${sliderBtn.x}px`;

    // Calculate position percentage
    const percentPosition = ((sliderBtn.x + 10) / targetRect.width) * 100;

    // Update color bar width
    color.style.width = `${percentPosition}%`;

    // Update tooltip position and show it
    tooltip.style.left = `${sliderBtn.x - 5}px`;
    tooltip.style.opacity = '1';
    tooltip.textContent = `${Math.round(percentPosition)}%`;
    
    // Update audio volume
    if (audio) {
      audio.volume = percentPosition / 100;
    }
  };
  
  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    tooltip.style.opacity = '0';

    sliderBtn.addEventListener('mouseover', () => {
      tooltip.style.opacity = '1';
    });

    sliderBtn.addEventListener('mouseout', () => {
      tooltip.style.opacity = '0';
    });
  };
  
  target.addEventListener('mousedown', (e) => {
    onMouseMove(e);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
};

// Initialize slider
dragElement(container, btn);

// ===== AUDIO PLAYER FUNCTIONALITY =====
let isPlaying = false;

playBtn.addEventListener('click', (e) => {
  e.preventDefault();
  
  console.log('🎮 Click sul play button!');
  console.log('📊 Stato prima del click - isPlaying:', isPlaying);
  
  // Toggle play state
  isPlaying = !isPlaying;
  
  console.log('📊 Stato dopo il toggle - isPlaying:', isPlaying);
  
  // Update UI elements based on state
  if (isPlaying) {
    // Playing: hide play (add visibility), show pause (add visibility)
    console.log('▶️ Tentativo di riproduzione audio...');
    console.log('🔊 Volume corrente:', audio.volume);
    console.log('🎵 Audio pronto:', audio.readyState >= 2);
    
    play.classList.add('visibility');    // Nascondi play (opacity: 0)
    pause.classList.add('visibility');   // Mostra pause (opacity: 1)
    playBtn.classList.add('shadow');
    wave1.classList.remove('paused');
    wave2.classList.remove('paused');
    
    audio.play()
      .then(() => {
        console.log('✅ Audio in riproduzione!');
      })
      .catch(err => {
        console.error('❌ Errore riproduzione:', err);
        console.error('Dettagli:', err.message);
      });
  } else {
    // Paused: show play (remove visibility), hide pause (remove visibility)
    console.log('⏸️ Pausa audio');
    play.classList.remove('visibility'); // Mostra play (opacity: 1)
    pause.classList.remove('visibility'); // Nascondi pause (opacity: 0)
    playBtn.classList.remove('shadow');
    wave1.classList.add('paused');
    wave2.classList.add('paused');
    audio.pause();
    console.log('✅ Audio in pausa');
  }
});
// ===== ACCESSIBILITY IMPROVEMENTS =====
// Add keyboard support for slider
container.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    const currentValue = parseInt(tooltip.textContent);
    const step = 5;
    let newValue = currentValue;
    
    if (e.key === 'ArrowLeft') {
      newValue = Math.max(0, currentValue - step);
    } else if (e.key === 'ArrowRight') {
      newValue = Math.min(100, currentValue + step);
    }
    
    const targetRect = container.getBoundingClientRect();
    const newX = (newValue / 100) * targetRect.width - 10;
    
    btn.x = newX;
    btn.style.left = `${newX}px`;
    color.style.width = `${newValue}%`;
    tooltip.textContent = `${newValue}%`;
    
    if (audio) {
      audio.volume = newValue / 100;
    }
  }
});

// ===== PLAYLIST MANAGEMENT =====
const audioUpload = document.getElementById('audio-upload');
const playlistContainer = document.getElementById('playlist');
const currentTrackName = document.getElementById('current-track-name');
const nowPlaying = document.getElementById('now-playing');

// Array per memorizzare le tracce
let playlist = [];
let currentTrackIndex = 0;

// Aggiungi traccia di default
playlist.push({
  name: '04 - Boss Theme 3.mp3',
  url: '04 - Boss Theme 3.mp3',
  isDefault: true
});

// Gestione upload file
audioUpload.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  
  if (files.length === 0) return;
  
  console.log(`📁 Caricamento di ${files.length} file audio...`);
  
  // Rimuovi messaggio vuoto se presente
  const emptyMessage = playlistContainer.querySelector('.playlist-empty');
  if (emptyMessage) {
    emptyMessage.remove();
  }
  
  // Aggiungi ogni file alla playlist
  files.forEach(file => {
    if (file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      playlist.push({
        name: file.name,
        url: url,
        size: formatFileSize(file.size),
        isDefault: false
      });
      
      addTrackToUI(file.name, playlist.length - 1, formatFileSize(file.size));
      console.log(`✅ Aggiunto: ${file.name}`);
    } else {
      console.warn(`⚠️ File ignorato (non audio): ${file.name}`);
    }
  });
  
  // Reset input per permettere ricaricamento stesso file
  e.target.value = '';
});

// Aggiungi traccia alla UI
function addTrackToUI(name, index, size) {
  const trackElement = document.createElement('div');
  trackElement.className = 'playlist-item';
  trackElement.dataset.index = index;
  trackElement.setAttribute('role', 'listitem');
  
  const isCurrentTrack = index === currentTrackIndex;
  if (isCurrentTrack) {
    trackElement.classList.add('active');
  }
  
  trackElement.innerHTML = `
    <div class="track-icon">
      <ion-icon name="${isCurrentTrack ? 'volume-high' : 'musical-note'}"></ion-icon>
    </div>
    <div class="track-info">
      <div class="track-name">${name}</div>
      <div class="track-size">${size || 'File locale'}</div>
    </div>
    <button class="track-play" aria-label="Riproduci ${name}">
      <ion-icon name="play-circle"></ion-icon>
    </button>
  `;
  
  // Click sulla traccia per riprodurre
  trackElement.addEventListener('click', () => {
    loadTrack(index);
  });
  
  playlistContainer.appendChild(trackElement);
}

// Carica e riproduci una traccia
function loadTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  
  const track = playlist[index];
  console.log(`🎵 Caricamento traccia: ${track.name}`);
  
  // Aggiorna sorgente audio
  audio.src = track.url;
  audio.load();
  
  // Aggiorna indice corrente
  currentTrackIndex = index;
  
  // Aggiorna nome traccia corrente
  currentTrackName.textContent = track.name;
  
  // Aggiorna UI playlist
  updatePlaylistUI();
  
  // Se era in riproduzione, continua con la nuova traccia
  if (isPlaying) {
    audio.play()
      .then(() => console.log(`✅ Riproduzione: ${track.name}`))
      .catch(err => console.error('❌ Errore riproduzione:', err));
  } else {
    // Altrimenti, avvia automaticamente la riproduzione
    isPlaying = true;
    play.classList.add('visibility');
    pause.classList.add('visibility');
    playBtn.classList.add('shadow');
    wave1.classList.remove('paused');
    wave2.classList.remove('paused');
    
    audio.play()
      .then(() => console.log(`✅ Riproduzione: ${track.name}`))
      .catch(err => console.error('❌ Errore riproduzione:', err));
  }
}

// Aggiorna UI della playlist (evidenzia traccia corrente)
function updatePlaylistUI() {
  const items = playlistContainer.querySelectorAll('.playlist-item');
  items.forEach((item, idx) => {
    const trackIndex = parseInt(item.dataset.index);
    const icon = item.querySelector('.track-icon ion-icon');
    
    if (trackIndex === currentTrackIndex) {
      item.classList.add('active');
      icon.setAttribute('name', 'volume-high');
    } else {
      item.classList.remove('active');
      icon.setAttribute('name', 'musical-note');
    }
  });
}

// Formatta dimensione file
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Auto-next track quando finisce
audio.addEventListener('ended', () => {
  console.log('🔄 Traccia terminata, prossima...');
  const nextIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(nextIndex);
});

// Inizializza playlist con traccia di default all'avvio
window.addEventListener('DOMContentLoaded', () => {
  // Rimuovi messaggio vuoto se c'è la traccia di default
  const emptyMessage = playlistContainer.querySelector('.playlist-empty');
  if (emptyMessage && playlist.length > 0) {
    emptyMessage.remove();
  }
  
  // Aggiungi traccia di default alla UI
  if (playlist.length > 0) {
    addTrackToUI(playlist[0].name, 0, '3.4 MB');
  }
});

// ===== TABS MANAGEMENT =====
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    // Remove active class from all buttons and contents
    tabButtons.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    console.log(`📑 Tab cambiato: ${tabName}`);
  });
});

// ===== NOTES MANAGEMENT =====
const notesTextarea = document.getElementById('notes-textarea');
const saveNotesBtn = document.getElementById('save-notes');
const notesStatus = document.getElementById('notes-status');

// Load notes from localStorage
function loadNotes() {
  const savedNotes = localStorage.getItem('dashboard-notes');
  const lastSaved = localStorage.getItem('dashboard-notes-timestamp');
  
  if (savedNotes) {
    notesTextarea.value = savedNotes;
    console.log('📝 Note caricate da localStorage');
  }
  
  if (lastSaved) {
    const date = new Date(parseInt(lastSaved));
    notesStatus.textContent = `Ultima modifica: ${formatDate(date)}`;
  }
}

// Save notes to localStorage
function saveNotes() {
  const notes = notesTextarea.value;
  const timestamp = Date.now();
  
  localStorage.setItem('dashboard-notes', notes);
  localStorage.setItem('dashboard-notes-timestamp', timestamp.toString());
  
  const date = new Date(timestamp);
  notesStatus.textContent = `Ultima modifica: ${formatDate(date)}`;
  
  console.log('✅ Note salvate');
  
  // Visual feedback
  saveNotesBtn.style.background = 'var(--primary-light)';
  setTimeout(() => {
    saveNotesBtn.style.background = '';
  }, 300);
}

// Auto-save notes every 30 seconds
let autoSaveTimer;
notesTextarea.addEventListener('input', () => {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    saveNotes();
  }, 30000); // 30 seconds
});

// Manual save button
saveNotesBtn.addEventListener('click', () => {
  saveNotes();
});

// Format date helper
function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'pochi secondi fa';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minuto${minutes > 1 ? 'i' : ''} fa`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} ora${hours > 1 ? 'e' : ''} fa`;
  }
  
  // More than 1 day
  return date.toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Load notes on startup
window.addEventListener('DOMContentLoaded', () => {
  loadNotes();
});

// ===== QUICK SEARCH BUTTONS =====
const quickSearchButtons = document.querySelectorAll('.quick-search-btn');

quickSearchButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const query = btn.dataset.query;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
    console.log(`🔍 Ricerca rapida: ${query}`);
  });
});


