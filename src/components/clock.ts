import { getElement } from '../utils/dom.js';

/**
 * Orologio analogico aggiornato ogni secondo.
 *
 * La rotazione viene calcolata in gradi a partire dall'ora corrente
 * e applicata tramite CSS transform, senza alterare il layout.
 */

const HOUR_DEGREES_PER_HOUR = 30; // 360deg / 12 ore
const MINUTE_DEGREES_PER_MINUTE = 6; // 360deg / 60 minuti
const SECOND_DEGREES_PER_SECOND = 6; // 360deg / 60 secondi
const MS_PER_MINUTE = 60_000;

function rotateHand(element: HTMLElement, degrees: number): void {
  element.style.transform = `rotate(${degrees}deg)`;
}

function updateClock(
  hoursHand: HTMLElement,
  minutesHand: HTMLElement,
  secondsHand: HTMLElement
): void {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // Include i millisecondi per un movimento più fluido dei secondi.
  const smoothSeconds = seconds + milliseconds / MS_PER_MINUTE;

  const hoursDegrees = (hours + minutes / 60) * HOUR_DEGREES_PER_HOUR;
  const minutesDegrees = (minutes + smoothSeconds / 60) * MINUTE_DEGREES_PER_MINUTE;
  const secondsDegrees = smoothSeconds * SECOND_DEGREES_PER_SECOND;

  rotateHand(hoursHand, hoursDegrees);
  rotateHand(minutesHand, minutesDegrees);
  rotateHand(secondsHand, secondsDegrees);
}

export function initializeClock(): void {
  const hoursHand = getElement<HTMLElement>('.clock .hand.hours');
  const minutesHand = getElement<HTMLElement>('.clock .hand.minutes');
  const secondsHand = getElement<HTMLElement>('.clock .hand.seconds');

  updateClock(hoursHand, minutesHand, secondsHand);
  window.setInterval(() => updateClock(hoursHand, minutesHand, secondsHand), 1000);
}
