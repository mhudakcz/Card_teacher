// Žolíky — strategie počítače. Tři obtížnosti.
//   • easy:   náhodné tahy.
//   • medium: bere z odhazováku jen když to pomůže, odhazuje nejméně užitečnou kartu.
//   • hard:   navíc hlídá výhru (odhodí tak, aby složil ruku) a šetří žolíky.

import { type ZolikyState, type ZolikyMove, topDiscard } from './engine';
import { canMeldAll, cardScore } from './melds';
import { type Card, isJoker } from '@/core/cards';

export type Difficulty = 'easy' | 'medium' | 'hard';

const SEQ: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  J: 11, Q: 12, K: 13, A: 14,
};

/** Jak je karta „propojená" s ostatními (kandidát na sestavu). */
function connectivity(card: Card, hand: Card[]): number {
  if (isJoker(card)) return 1000; // žolíka nikdy nezahazuj
  let score = 0;
  for (const o of hand) {
    if (o.id === card.id) continue;
    if (isJoker(o)) {
      score += 1;
      continue;
    }
    if (o.rank === card.rank && o.suit !== card.suit) score += 3; // potenciální set
    if (o.suit === card.suit) {
      const d = Math.abs((SEQ[o.rank] ?? 0) - (SEQ[card.rank] ?? 0));
      if (d === 1) score += 2;
      else if (d === 2) score += 1;
    }
  }
  return score;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function chooseMove(state: ZolikyState, level: Difficulty): ZolikyMove {
  const p = state.players[state.current];

  if (level === 'easy') {
    if (state.phase === 'draw') {
      return Math.random() < 0.5 && state.discard.length > 0
        ? { type: 'drawDiscard' }
        : { type: 'drawStock' };
    }
    return { type: 'discard', cardId: randomChoice(p.hand).id };
  }

  // --- DRAW ---
  if (state.phase === 'draw') {
    const top = topDiscard(state);
    if (top && !isJoker(top)) {
      const conn = connectivity(top, p.hand);
      const threshold = level === 'hard' ? 2 : 3;
      if (conn >= threshold) return { type: 'drawDiscard' };
    } else if (top && isJoker(top)) {
      return { type: 'drawDiscard' }; // žolíka ber vždy
    }
    return { type: 'drawStock' };
  }

  // --- DISCARD ---
  // Pokud existuje odhození, kterým ruku složím → vyhraj.
  for (const card of p.hand) {
    const rest = p.hand.filter((c) => c.id !== card.id);
    if (canMeldAll(rest)) return { type: 'discard', cardId: card.id };
  }

  // Jinak odhoď nejméně užitečnou kartu (tiebreak: vyšší body pryč).
  const ranked = [...p.hand].sort((a, b) => {
    const ca = connectivity(a, p.hand);
    const cb = connectivity(b, p.hand);
    if (ca !== cb) return ca - cb;
    return cardScore(b) - cardScore(a);
  });
  return { type: 'discard', cardId: ranked[0].id };
}
