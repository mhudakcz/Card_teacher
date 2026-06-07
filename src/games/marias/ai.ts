// Mariáš — strategie počítače. Tři obtížnosti.
//   • easy:   náhodná povolená karta.
//   • medium: bere bodované štychy levně, jinak šetří esa/desítky, vynáší laciné.
//   • hard:   jako medium + hlídá bodované karty soupeře a hláškuje.

import { type MariasState, type MariasMove, legalMoves, cardPoints } from './engine';
import type { Card } from '@/core/cards';

export type Difficulty = 'easy' | 'medium' | 'hard';

const ORDER: Record<string, number> = {
  '7': 1, '8': 2, '9': 3, U: 4, O: 5, K: 6, '10': 7, A: 8,
};

/** Cennost karty (nerad ji ztrácím): body + síla. */
function value(card: Card): number {
  return cardPoints(card) * 2 + (ORDER[card.rank] ?? 0);
}

function cardById(state: MariasState, id: string): Card {
  return state.players[state.current].hand.find((c) => c.id === id)!;
}

export function chooseMove(state: MariasState, level: Difficulty): MariasMove {
  const moves = legalMoves(state);
  if (moves.length === 1) return moves[0];

  if (level === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const cards = moves.map((m) => ({ m, c: cardById(state, m.cardId) }));

  // Vynáším.
  if (state.trick.length === 0) {
    // hard: rád vynese krále/svrška kvůli hlášce
    if (level === 'hard') {
      const marriageLead = cards.find(({ c }) => {
        if (c.rank !== 'K' && c.rank !== 'O') return false;
        const partner = c.rank === 'K' ? 'O' : 'K';
        return state.players[state.current].hand.some((x) => x.suit === c.suit && x.rank === partner);
      });
      if (marriageLead) return marriageLead.m;
    }
    // jinak vynes nejlevnější (nech si bodované)
    return cards.sort((a, b) => value(a.c) - value(b.c))[0].m;
  }

  // Odpovídám — vyhodnotím, zda štych vezmu.
  const lead = state.trick[0].card;
  const leadPoints = cardPoints(lead);
  // moves jsou už filtrované enginem (ctít barvu / trumfovat / přebít).
  const winning = cards.filter(({ c }) => {
    // hrubý odhad: tato karta vezme štych?
    if (c.suit === lead.suit) return (ORDER[c.rank] ?? 0) > (ORDER[lead.rank] ?? 0);
    return c.suit === state.trump && lead.suit !== state.trump;
  });

  const wantTake = leadPoints > 0 || level === 'hard';
  if (wantTake && winning.length > 0) {
    // vezmi nejlevnější vítěznou kartou
    return winning.sort((a, b) => value(a.c) - value(b.c))[0].m;
  }
  // nevyplácí se / nemůžu vzít → zahoď nejlevnější
  return cards.sort((a, b) => value(a.c) - value(b.c))[0].m;
}
