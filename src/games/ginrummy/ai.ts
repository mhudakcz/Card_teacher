// AI pro Gin Rummy ve třech obtížnostech.
// easy = převážně náhoda, klepne jen na gin; medium = bere z odhazováku
// jen když to pomůže a klepe od deadwoodu ≤ 5; hard = klepe hned (≤ 10).

import type { Card } from '@/core/cards';
import { type GinMove, type GinState, analyze, cardValue, deadwoodValue, legalMoves } from './engine';

export type Difficulty = 'easy' | 'medium' | 'hard';

const KNOCK_LIMIT = 10;

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

interface BestDiscard {
  cardId: string;
  deadwood: number;
}

/** Z 11 karet vybere odhoz, který dá nejmenší deadwood (při shodě vyšší kartu). */
function bestDiscard(hand: Card[]): BestDiscard {
  let best: BestDiscard | null = null;
  let bestVal = -1;
  for (const c of hand) {
    const remaining = hand.filter((x) => x.id !== c.id);
    const dw = deadwoodValue(remaining);
    if (best === null || dw < best.deadwood || (dw === best.deadwood && cardValue(c) > bestVal)) {
      best = { cardId: c.id, deadwood: dw };
      bestVal = cardValue(c);
    }
  }
  return best!;
}

export function chooseMove(s: GinState, level: Difficulty, rng: () => number = Math.random): GinMove {
  const me = s.current;
  const hand = s.players[me].hand;

  if (s.phase === 'draw') {
    if (s.stock.length === 0) return { type: 'draw', from: 'discard' };
    if (level === 'easy') return pick(legalMoves(s), rng);
    // Vezmi z odhazováku jen tehdy, když sníží deadwood.
    const top = s.discard[s.discard.length - 1];
    if (top) {
      const d0 = deadwoodValue(hand);
      const sim = hand.concat(top);
      const bd = bestDiscard(sim);
      if (bd.deadwood < d0) return { type: 'draw', from: 'discard' };
    }
    return { type: 'draw', from: 'stock' };
  }

  // discard
  if (level === 'easy') {
    // odhoď nejvyšší kartu, klepni jen na gin
    const bd = bestDiscard(hand);
    const ginNow = analyze(hand.filter((x) => x.id !== bd.cardId)).value === 0;
    return { type: 'discard', cardId: bd.cardId, knock: ginNow };
  }

  const bd = bestDiscard(hand);
  const d = bd.deadwood;
  let knock = false;
  if (d === 0) knock = true;
  else if (level === 'medium' && d <= 5) knock = true;
  else if (level === 'hard' && d <= KNOCK_LIMIT) knock = true;
  return { type: 'discard', cardId: bd.cardId, knock };
}
