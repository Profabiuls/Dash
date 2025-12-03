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


