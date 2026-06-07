// Taroky — strategie počítače. Tři obtížnosti.
//   • easy:   náhodná povolená karta.
//   • medium: bere bodované štychy levně, jinak šetří honéry a vynáší laciné.
//   • hard:   jako medium + hlídá pagát na poslední štych a agresivněji trumfuje body.

import { type TarokyState, type TarokyMove, legalMoves, cardPoints } from './engine';
import { type Card, isTrump, TAROCK_TRUMPS } from '@/core/cards';

export type Difficulty = 'easy' | 'medium' | 'hard';

const TRUMP_ORDER: Record<string, number> = Object.fromEntries(
  TAROCK_TRUMPS.map((r, i) => [r, i + 1]),
);
const SUIT_ORDER: Record<string, number> = {
  '7': 1, '8': 2, '9': 3, '10': 4, U: 5, O: 6, K: 7, A: 8,
};

/** Cennost karty (nerad ji ztrácím): body + síla. */
function value(card: Card): number {
  const strength = isTrump(card) ? 8 + TRUMP_ORDER[card.rank] : (SUIT_ORDER[card.rank] ?? 0);
  return cardPoints(card) * 3 + strength;
}

function cardById(state: TarokyState, id: string): Card {
  return state.players[state.current].hand.find((c) => c.id === id)!;
}

function beats(lead: Card, ch: Card): boolean {
  const lt = isTrump(lead);
  const ct = isTrump(ch);
  if (ct && !lt) return true;
  if (!ct && lt) return false;
  if (ct && lt) return TRUMP_ORDER[ch.rank] > TRUMP_ORDER[lead.rank];
  if (ch.suit !== lead.suit) return false;
  return SUIT_ORDER[ch.rank] > SUIT_ORDER[lead.rank];
}

export function chooseMove(state: TarokyState, level: Difficulty): TarokyMove {
  const moves = legalMoves(state);
  if (moves.length === 1) return moves[0];

  if (level === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const cards = moves.map((m) => ({ m, c: cardById(state, m.cardId) }));

  // Vynáším.
  if (state.trick.length === 0) {
    // hard: na poslední štych si schovává pagát; jinak vynese nejlevnější.
    if (level === 'hard' && state.tricksLeft === 1) {
      const pagat = cards.find(({ c }) => isTrump(c) && c.rank === 'I');
      if (pagat) return pagat.m;
    }
    return cards.sort((a, b) => value(a.c) - value(b.c))[0].m;
  }

  // Odpovídám — můžu vzít štych?
  const lead = state.trick[0].card;
  const leadPoints = cardPoints(lead);
  const winning = cards.filter(({ c }) => beats(lead, c));

  const wantTake = leadPoints > 0 || level === 'hard';
  if (wantTake && winning.length > 0) {
    return winning.sort((a, b) => value(a.c) - value(b.c))[0].m;
  }
  // nevyplácí se / nemůžu vzít → zahoď nejlevnější
  return cards.sort((a, b) => value(a.c) - value(b.c))[0].m;
}
