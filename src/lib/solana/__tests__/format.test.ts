import { describe, it, expect } from 'vitest';
import { shortenAddress, formatLamportsToSol } from '../format';

describe('Formatting utilities', () => {
  describe('shortenAddress', () => {
    it('shortens a long address correctly', () => {
      const address = '7XwUMwY2Z2w7xXwUMwY2Z2w7xXwUMwY2Z2w7xXwUMwY2';
      expect(shortenAddress(address)).toBe('7XwU...MwY2');
    });

    it('returns the same address when it is too short', () => {
      expect(shortenAddress('abc')).toBe('abc');
    });
  });

  describe('formatLamportsToSol', () => {
    it('formats lamports correctly', () => {
      expect(formatLamportsToSol(1_500_000_000)).toBe('1,5');
      expect(formatLamportsToSol(100_000_000)).toBe('0,1');
    });
  });
});
