import type { Suit } from '@/core/cards';

const COLORS: Record<string, string> = {
  acorns: '#7c4a14', // žaludy — hnědá
  leaves: '#2f8f2f', // listy — zelená
  hearts: '#d11a2a', // srdce — červená
  bells: '#e0a000', // kule — žlutá
  spades: '#1a1a1a',
  clubs: '#1a1a1a',
  diamonds: '#d11a2a',
};

const PATHS: Record<string, string> = {
  // žaludy — žalud (acorn)
  acorns: 'M12 3c-3 0-5 2-5 5 0 2 1 3 2 4h6c1-1 2-2 2-4 0-3-2-5-5-5zM8 13h8v2a4 4 0 0 1-8 0v-2z',
  // listy — lístek
  leaves: 'M12 2C7 6 5 10 5 14a7 7 0 0 0 14 0c0-4-2-8-7-12zM12 6v13',
  // srdce
  hearts: 'M12 21s-7-4.6-9.3-9C1 8.5 2.8 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.2 0 5 3.5 3.3 7C19 16.4 12 21 12 21z',
  // kule — kruh
  bells: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10z',
  spades:
    'M12 2C8 6 4 9 4 13a4 4 0 0 0 7 3c-.3 2-1 3-2 4h6c-1-1-1.7-2-2-4a4 4 0 0 0 7-3c0-4-4-7-8-11z',
  clubs:
    'M12 2a3.5 3.5 0 0 0-2 6.4A3.5 3.5 0 1 0 11 15c-.3 2-1 3-2 4h6c-1-1-1.7-2-2-4a3.5 3.5 0 1 0 1-6.6A3.5 3.5 0 0 0 12 2z',
  diamonds: 'M12 2l8 10-8 10-8-10z',
};

export function SuitIcon({ suit, size = 18 }: { suit: Suit; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d={PATHS[suit]} fill={COLORS[suit]} />
    </svg>
  );
}

export function suitColor(suit: Suit): string {
  return COLORS[suit] ?? '#1a1a1a';
}
