import { getElement } from '../utils/dom.js';

/**
 * Orologio analogico con lancette a movimento fluido.
 *
 * La rotazione viene calcolata in gradi a partire dall'ora corrente
 * e applicata tramite CSS transform, senza alterare il layout.
 * L'aggiornamento avviene tramite requestAnimationFrame: un setInterval
 * a 1 secondo renderebbe invisibile la componente in millisecondi.
 */

const HOURS_PER_CLOCK_CYCLE = 12;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const FULL_CIRCLE_DEGREES = 360;

export interface ClockAngles {
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Calcola gli angoli delle tre lancette per un dato istante.
 *
 * Funzione pura: l'estrazione dal DOM la rende testabile in isolamento.
 */
export function computeHandAngles(now: Date): ClockAngles {
  const smoothSeconds =
    now.getSeconds() + now.getMilliseconds() / MS_PER_SECOND;
  const smoothMinutes =
    now.getMinutes() + smoothSeconds / SECONDS_PER_MINUTE;
  const smoothHours =
    (now.getHours() % HOURS_PER_CLOCK_CYCLE) + smoothMinutes / MINUTES_PER_HOUR;

  return {
    hours: smoothHours * (FULL_CIRCLE_DEGREES / HOURS_PER_CLOCK_CYCLE),
    minutes: smoothMinutes * (FULL_CIRCLE_DEGREES / MINUTES_PER_HOUR),
    seconds: smoothSeconds * (FULL_CIRCLE_DEGREES / SECONDS_PER_MINUTE),
  };
}

export function initializeClock(): void {
  const hoursHand = getElement<HTMLElement>('.clock .hand.hours');
  const minutesHand = getElement<HTMLElement>('.clock .hand.minutes');
  const secondsHand = getElement<HTMLElement>('.clock .hand.seconds');

  const renderFrame = (): void => {
    const angles = computeHandAngles(new Date());
    hoursHand.style.transform = `rotate(${angles.hours}deg)`;
    minutesHand.style.transform = `rotate(${angles.minutes}deg)`;
    secondsHand.style.transform = `rotate(${angles.seconds}deg)`;
    requestAnimationFrame(renderFrame);
  };

  renderFrame();
}
