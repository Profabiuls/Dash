import { describe, it, expect } from 'vitest';
import { computeHandAngles } from '../src/components/clock.js';

describe('computeHandAngles', () => {
  it('restituisce angoli zero a mezzanotte esatta', () => {
    const midnight = new Date(2024, 0, 1, 0, 0, 0, 0);
    const angles = computeHandAngles(midnight);

    expect(angles.hours).toBe(0);
    expect(angles.minutes).toBe(0);
    expect(angles.seconds).toBe(0);
  });

  it('posiziona la lancetta dei secondi in modo fluido con i millisecondi', () => {
    const halfSecond = new Date(2024, 0, 1, 12, 0, 30, 500);
    const angles = computeHandAngles(halfSecond);

    // 30.5 secondi * 6 gradi = 183 gradi: il contributo dei ms deve essere visibile.
    expect(angles.seconds).toBeCloseTo(183, 5);
  });

  it('include il contributo dei secondi nel calcolo dei minuti', () => {
    const date = new Date(2024, 0, 1, 12, 30, 30, 0);
    const angles = computeHandAngles(date);

    // 30.5 minuti * 6 gradi = 183 gradi.
    expect(angles.minutes).toBeCloseTo(183, 5);
  });

  it('riporta le ore sul ciclo di 12 ore', () => {
    const date = new Date(2024, 0, 1, 15, 0, 0, 0);
    const angles = computeHandAngles(date);

    // Le 15 equivalgono alle 3 sull'orologio analogico: 90 gradi.
    expect(angles.hours).toBeCloseTo(90, 5);
  });

  it('avanza la lancetta delle ore in proporzione ai minuti', () => {
    const date = new Date(2024, 0, 1, 6, 30, 0, 0);
    const angles = computeHandAngles(date);

    // 6.5 ore * 30 gradi = 195 gradi.
    expect(angles.hours).toBeCloseTo(195, 5);
  });
});
