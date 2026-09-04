import { describe, it, expect } from 'vitest';
import { formatFileSize, formatRelativeDate } from '../src/utils/formatters.js';

describe('formatFileSize', () => {
  it('restituisce 0 Bytes per input zero', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('formatta correttamente i byte', () => {
    expect(formatFileSize(512)).toBe('512 Bytes');
  });

  it('formatta correttamente i kilobyte', () => {
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('formatta correttamente i megabyte con due decimali', () => {
    expect(formatFileSize(3_500_000)).toMatch(/3\.[0-9]+ MB/);
  });
});

describe('formatRelativeDate', () => {
  it('descrive un timestamp recente come pochi secondi fa', () => {
    const now = new Date();
    expect(formatRelativeDate(now)).toBe('pochi secondi fa');
  });

  it('descrive un timestamp di qualche minuto fa', () => {
    const date = new Date(Date.now() - 120_000);
    expect(formatRelativeDate(date)).toBe('2 minuti fa');
  });

  it('formatta le date più vecchie di un giorno in formato italiano', () => {
    const date = new Date(2024, 0, 15, 10, 30);
    const result = formatRelativeDate(date);
    expect(result).toContain('15/01/2024');
  });
});
