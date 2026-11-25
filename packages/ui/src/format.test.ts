import { describe, expect, it } from 'vitest';
import { formatCentavos, formatNumber, formatPhp } from './format';

describe('money formatting', () => {
  it('formats centavos as whole pesos with a peso sign', () => {
    expect(formatCentavos(1234500)).toBe('₱12,345');
    expect(formatCentavos(BigInt(31200000))).toBe('₱312,000');
  });
  it('can show centavos', () => {
    expect(formatCentavos(150, true)).toBe('₱1.50');
  });
  it('rounds calculator pesos', () => {
    expect(formatPhp(84670.4)).toBe('₱84,670');
  });
  it('formats plain numbers', () => {
    expect(formatNumber(7228.3)).toBe('7,228');
    expect(formatNumber(5.4, 1)).toBe('5.4');
  });
});
