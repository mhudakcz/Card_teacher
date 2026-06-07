// Hodnocení pokerové kombinace z 5–7 karet (Texas Hold'em).
// Vrací porovnatelné skóre: [kategorie, ...rozhodující hodnoty].
// Kategorie 8 = postupka v barvě … 0 = vysoká karta.

import type { Card } from '@/core/cards';

export const HAND_NAMES = [
  'highCard',
  'pair',
  'twoPair',
  'trips',
  'straight',
  'flush',
  'fullHouse',
  'quads',
  'straightFlush',
] as const;

export type HandCategory = (typeof HAND_NAMES)[number];

const RANK_VALUE: Record<string, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export function rankValue(rank: string): number {
  return RANK_VALUE[rank];
}

export interface HandScore {
  category: number; // 0..8
  tiebreak: number[];
}

/** Najde nejvyšší kartu postupky z množiny hodnot (s esem i jako 1). */
function straightHigh(values: Set<number>): number | null {
  const vals = new Set(values);
  if (vals.has(14)) vals.add(1); // eso může být i nízké (A-2-3-4-5)
  for (let high = 14; high >= 5; high--) {
    if (vals.has(high) && vals.has(high - 1) && vals.has(high - 2) && vals.has(high - 3) && vals.has(high - 4)) {
      return high;
    }
  }
  return null;
}

export function evaluate(cards: Card[]): HandScore {
  const values = cards.map((c) => rankValue(c.rank)).sort((a, b) => b - a);

  // Počty podle hodnoty.
  const countByValue = new Map<number, number>();
  for (const v of values) countByValue.set(v, (countByValue.get(v) ?? 0) + 1);
  // Skupiny seřazené: nejdřív podle četnosti, pak podle hodnoty.
  const groups = [...countByValue.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  // Barvy.
  const bySuit = new Map<string, number[]>();
  for (const c of cards) {
    const arr = bySuit.get(c.suit) ?? [];
    arr.push(rankValue(c.rank));
    bySuit.set(c.suit, arr);
  }
  const flushVals = [...bySuit.values()].find((arr) => arr.length >= 5);

  // Postupka v barvě.
  if (flushVals) {
    const sfHigh = straightHigh(new Set(flushVals));
    if (sfHigh) return { category: 8, tiebreak: [sfHigh] };
  }

  // Čtveřice.
  if (groups[0][1] === 4) {
    const quad = groups[0][0];
    const kicker = values.filter((v) => v !== quad)[0];
    return { category: 7, tiebreak: [quad, kicker] };
  }

  // Full house (trojice + dvojice, nebo dvě trojice).
  const trips = groups.filter((g) => g[1] >= 3).map((g) => g[0]);
  const pairs = groups.filter((g) => g[1] >= 2).map((g) => g[0]);
  if (trips.length >= 1) {
    const topTrip = trips[0];
    const otherPair = pairs.find((v) => v !== topTrip);
    if (otherPair !== undefined) return { category: 6, tiebreak: [topTrip, otherPair] };
  }

  // Barva.
  if (flushVals) {
    const top5 = [...flushVals].sort((a, b) => b - a).slice(0, 5);
    return { category: 5, tiebreak: top5 };
  }

  // Postupka.
  const sHigh = straightHigh(new Set(values));
  if (sHigh) return { category: 4, tiebreak: [sHigh] };

  // Trojice.
  if (trips.length >= 1) {
    const trip = trips[0];
    const kickers = values.filter((v) => v !== trip).slice(0, 2);
    return { category: 3, tiebreak: [trip, ...kickers] };
  }

  // Dvě dvojice.
  if (pairs.length >= 2) {
    const [p1, p2] = pairs;
    const kicker = values.filter((v) => v !== p1 && v !== p2)[0];
    return { category: 2, tiebreak: [p1, p2, kicker] };
  }

  // Jedna dvojice.
  if (pairs.length === 1) {
    const p = pairs[0];
    const kickers = values.filter((v) => v !== p).slice(0, 3);
    return { category: 1, tiebreak: [p, ...kickers] };
  }

  // Vysoká karta.
  return { category: 0, tiebreak: values.slice(0, 5) };
}

/** <0 když a slabší, >0 když a silnější, 0 při shodě. */
export function compareScore(a: HandScore, b: HandScore): number {
  if (a.category !== b.category) return a.category - b.category;
  const len = Math.max(a.tiebreak.length, b.tiebreak.length);
  for (let i = 0; i < len; i++) {
    const av = a.tiebreak[i] ?? 0;
    const bv = b.tiebreak[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

export function categoryName(score: HandScore): HandCategory {
  return HAND_NAMES[score.category];
}
