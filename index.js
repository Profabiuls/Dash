/*  clock */
const hours = document.querySelector('.hours');
const minutes = document.querySelector('.minutes');
const seconds = document.querySelector('.seconds');

/*  play button */
const play = document.querySelector('.play');
const pause = document.querySelector('.pause');
const playBtn = document.querySelector('.circle__btn');
const wave1 = document.querySelector('.circle__back-1');
const wave2 = document.querySelector('.circle__back-2');

/*  rate slider */
const container = document.querySelector('.slider__box');
const btn = document.querySelector('.slider__btn');
const color = document.querySelector('.slider__color');
const tooltip = document.querySelector('.slider__tooltip');
let clock;
let rotation;
clock = () => {
  let today = new Date();
  let h = (today.getHours() % 12) + today.getMinutes() / 59; // 22 % 12 = 10pm
  let m = today.getMinutes(); // 0 - 59
  let s = today.getSeconds(); // 0 - 59

  h *= 30; // 12 * 30 = 360deg
  m *= 6;
  s *= 6; // 60 * 6 = 360deg

  rotation(hours, h);
  rotation(minutes, m);
  rotation(seconds, s);

  // call every second
  setTimeout(clock, 500);
}

rotation = (target, val) => {
  target.style.transform = `rotate(${val}deg)`;
}

window.onload = clock();
let dragElement;
dragElement = (target, btn) => {
  target.addEventListener('mousedown', (e) => {
    onMouseMove(e);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
  let onMouseMove;
  onMouseMove = (e) => {
    e.preventDefault();
    let targetRect = target.getBoundingClientRect();
    let x = e.pageX - targetRect.left + 10;
    if (x > targetRect.width) {
      x = targetRect.width
    };
    if (x < 0) {
      x = 0
    };
    btn.x = x - 10;
    btn.style.left = btn.x + 'px';

    // get the position of the button inside the container (%)
    let percentPosition = (btn.x + 10) / targetRect.width * 100;

    // color width = position of button (%)
    color.style.width = percentPosition + "%";

    // move the tooltip when button moves, and show the tooltip
    tooltip.style.left = btn.x - 5 + 'px';
    tooltip.style.opacity = 1;

    // show the percentage in the tooltip
    tooltip.textContent = Math.round(percentPosition) + '%';
  };
  let onMouseUp;
  onMouseUp = (e) => {
    window.removeEventListener('mousemove', onMouseMove);
    tooltip.style.opacity = 0;

    btn.addEventListener('mouseover', function () {
      tooltip.style.opacity = 1;
    });

    btn.addEventListener('mouseout', function () {
      tooltip.style.opacity = 0;
    });
  };
};

dragElement(container, btn);

/*  play button  */
let onPlay = false;
playBtn.addEventListener('click', function (e) {
  e.preventDefault();
  pause.classList.toggle('visibility');
  play.classList.toggle('visibility');
  playBtn.classList.toggle('shadow');
  wave1.classList.toggle('paused');
  wave2.classList.toggle('paused');
  if (!onPlay){
    onPlay = true;
   // console.log(onPlay)
 }else{
   onPlay = false;
  // console.log(onPlay)
 }
 if (!onPlay){
  playAudio();
  console.log(onPlay)
 }else{
  stopAudio();
  console.log(onPlay)
 }
});



function playAudio() {
  var x = document.getElementById("myAudio");
  x.play();
}

function stopAudio() {
  var x = document.getElementById("myAudio");
  x.pause();
}

//controllo volume

let slider = document.getElementById('find2');
let valore = slider.innerHTML;
console.log(valore);
//sistemare l'evento perchè+ ancora un po impreciso al rilascio del mouse
let cursore = document.getElementById('find');
cursore.addEventListener('mouseup', function() {
  valore = slider.innerHTML.replace('%', '');
  console.log(valore); // Output: "50" (senza il simbolo %)
  var x = document.getElementById("myAudio");
  x.volume = valore/100;
});

const button = document.getElementById("icon-home");

button.addEventListener("click", () => {
  window.location.href = "https://www.google.com"; // Sostituisci con l'URL desiderato
});
