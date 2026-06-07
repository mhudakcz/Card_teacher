// Poker — strategie počítače. Tři obtížnosti.
//   • easy:   hraje skoro náhodně, většinou dorovnává/checkuje.
//   • medium: odhaduje sílu ruky, dorovnává podle pot-odds, navyšuje se silnou rukou.
//   • hard:   přísnější výběr, value-bety a občasný blaf.

import { type PokerState, type PokerMove, raiseLimits } from './engine';
import { evaluate } from './eval';
import { rankValue } from './eval';
import type { Card } from '@/core/cards';

export type Difficulty = 'easy' | 'medium' | 'hard';

/** Síla ruky 0..1 — preflop heuristika, postflop z hodnocení 7 karet. */
function handStrength(hole: Card[], community: Card[]): number {
  if (community.length === 0) return preflopStrength(hole);
  const score = evaluate([...hole, ...community]);
  // Kategorie 0..8 → základ; doplníme nejvyšší rozhodující kartou.
  const base = score.category / 8;
  const high = (score.tiebreak[0] ?? 0) / 14;
  return Math.min(1, base + high * (score.category === 0 ? 0.25 : 0.05));
}

function preflopStrength(hole: Card[]): number {
  const [a, b] = hole.map((c) => rankValue(c.rank)).sort((x, y) => y - x);
  const suited = hole[0].suit === hole[1].suit;
  const pair = a === b;
  let s = (a + b) / 28; // hrubý základ podle výšky karet (0..1)
  if (pair) s += 0.35 + a / 40; // pár je silný
  if (suited) s += 0.1;
  const gap = a - b;
  if (!pair && gap <= 2) s += 0.08; // spojky (potenciál postupky)
  if (a >= 13) s += 0.05; // eso/král
  return Math.min(1, s);
}

function raiseTo(state: PokerState, fraction: number): PokerMove {
  const lim = raiseLimits(state);
  const p = state.players[state.current];
  const toCall = state.betToMatch - p.bet;
  if (!lim) return toCall === 0 ? { type: 'check' } : { type: 'call' };
  const target = state.betToMatch + Math.round((state.pot + toCall) * fraction);
  const to = Math.max(lim.min, Math.min(target, lim.max));
  return { type: 'raise', to };
}

export function chooseMove(state: PokerState, level: Difficulty): PokerMove {
  if (state.street === 'done') return { type: 'nextHand' };

  const p = state.players[state.current];
  const toCall = state.betToMatch - p.bet;
  const canRaise = raiseLimits(state) !== null;
  const strength = handStrength(p.hole, state.community);
  const potOdds = toCall > 0 ? toCall / (state.pot + toCall) : 0;

  if (level === 'easy') {
    const r = Math.random();
    if (toCall === 0) {
      if (canRaise && r < 0.15) return raiseTo(state, 0.5);
      return { type: 'check' };
    }
    if (r < 0.12) return { type: 'fold' };
    if (canRaise && r > 0.92) return raiseTo(state, 0.5);
    return { type: 'call' };
  }

  const aggressive = level === 'hard';
  const raiseThreshold = aggressive ? 0.62 : 0.72;
  const foldMargin = aggressive ? 0.05 : 0.12;
  const bluff = aggressive && Math.random() < 0.12;

  if (toCall === 0) {
    if (canRaise && (strength > raiseThreshold || bluff)) return raiseTo(state, aggressive ? 0.66 : 0.5);
    return { type: 'check' };
  }

  // Je co dorovnat.
  if (strength > raiseThreshold + 0.12 && canRaise) return raiseTo(state, aggressive ? 0.75 : 0.6);
  if (strength + foldMargin < potOdds && !bluff) return { type: 'fold' };
  if (bluff && canRaise) return raiseTo(state, 0.5);
  return { type: 'call' };
}
