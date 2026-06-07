// Sdílené jádro karet pro všechny hry.
// Podporuje různé balíčky: české "sedlácké" (32), francouzské (52/54), tarokové (78).

export type DeckKind = 'czech' | 'french' | 'tarock';

// České (sedlácké / německé) barvy — pro Prší, Mariáš, Sedmu.
export type CzechSuit = 'acorns' | 'leaves' | 'hearts' | 'bells';
// Francouzské barvy — pro Poker, Žolíky, Kanastu.
export type FrenchSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

// Tarokový trumf nepatří k žádné barvě.
export type TrumpSuit = 'trump';

export type Suit = CzechSuit | FrenchSuit | TrumpSuit;

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

// Francouzské barvy a hodnoty — pro Poker, Žolíky, Kanastu.
export const FRENCH_SUITS: FrenchSuit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const FRENCH_RANKS: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

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

/** 52karetní francouzský balíček (Poker, Žolíky, Kanasta). */
export function frenchDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of FRENCH_SUITS) {
    for (const rank of FRENCH_RANKS) {
      cards.push(makeCard('french', suit, rank));
    }
  }
  return cards;
}

/** Hodnota žolíka (univerzální karty). */
export const JOKER_RANK = 'JOKER';

/** Je karta žolík (univerzální)? */
export function isJoker(card: Card): boolean {
  return card.rank === JOKER_RANK;
}

/**
 * Vícenásobný francouzský balíček s žolíky (Žolíky, Kanasta).
 * `copies` plných balíčků (52) + `jokers` žolíků. ID jsou unikátní díky příponě kopie.
 */
export function frenchDeckN(copies = 2, jokers = 4): Card[] {
  const cards: Card[] = [];
  for (let copy = 0; copy < copies; copy++) {
    for (const suit of FRENCH_SUITS) {
      for (const rank of FRENCH_RANKS) {
        cards.push({ deck: 'french', suit, rank, id: `french-${suit}-${rank}-${copy}` });
      }
    }
  }
  for (let j = 0; j < jokers; j++) {
    cards.push({ deck: 'french', suit: 'spades', rank: JOKER_RANK, id: `joker-${j}` });
  }
  return cards;
}

// Tarokový balíček (zjednodušený, 54 karet): 4 barvy × 8 karet + 22 trumfů (taroky).
// Barvy používají české suity (žaludy, listy, srdce, kule) kvůli ikonám.
// Trumfy mají suit 'trump' a rank 'I'..'XXI' + 'SKYZ'.
export const TAROCK_SUIT_RANKS: string[] = ['7', '8', '9', '10', 'U', 'O', 'K', 'A'];
export const TAROCK_TRUMPS: string[] = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI',
  'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'SKYZ',
];

/** Je karta tarokový trumf? */
export function isTrump(card: Card): boolean {
  return card.deck === 'tarock' && card.suit === 'trump';
}

/** 54karetní zjednodušený tarokový balíček (Taroky). */
export function tarockDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of CZECH_SUITS) {
    for (const rank of TAROCK_SUIT_RANKS) {
      cards.push({ deck: 'tarock', suit, rank, id: `tarock-${suit}-${rank}` });
    }
  }
  for (const rank of TAROCK_TRUMPS) {
    cards.push({ deck: 'tarock', suit: 'trump', rank, id: `tarock-trump-${rank}` });
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
