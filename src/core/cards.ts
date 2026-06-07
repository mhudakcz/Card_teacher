// Sdílené jádro karet pro všechny hry.
// Podporuje různé balíčky: české "sedlácké" (32), francouzské (52/54), tarokové (78).

export type DeckKind = 'czech' | 'french' | 'tarock';

// České (sedlácké / německé) barvy — pro Prší, Mariáš, Sedmu.
export type CzechSuit = 'acorns' | 'leaves' | 'hearts' | 'bells';
// Francouzské barvy — pro Poker, Žolíky, Kanastu.
export type FrenchSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type Suit = CzechSuit | FrenchSuit;

// České hodnoty: 7,8,9,10, spodek(U), svršek(O), král(K), eso(A).
export type CzechRank = '7' | '8' | '9' | '10' | 'U' | 'O' | 'K' | 'A';

export interface Card {
  readonly deck: DeckKind;
  readonly suit: Suit;
  readonly rank: string;
  readonly id: string; // stabilní identifikátor, např. "czech-bells-7"
}

export const CZECH_SUITS: CzechSuit[] = ['acorns', 'leaves', 'hearts', 'bells'];
export const CZECH_RANKS: CzechRank[] = ['7', '8', '9', '10', 'U', 'O', 'K', 'A'];

function makeCard(deck: DeckKind, suit: Suit, rank: string): Card {
  return { deck, suit, rank, id: `${deck}-${suit}-${rank}` };
}

/** 32karetní český "sedlácký" balíček (Prší, Mariáš, Sedma). */
export function czechDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of CZECH_SUITS) {
    for (const rank of CZECH_RANKS) {
      cards.push(makeCard('czech', suit, rank));
    }
  }
  return cards;
}

/** Deterministické zamíchání (Fisher–Yates) s injektovatelným RNG kvůli testům. */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Jednoduchý seedovatelný RNG (mulberry32) pro reprodukovatelné rozdání a testy. */
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
