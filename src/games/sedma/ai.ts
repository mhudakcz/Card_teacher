// Sedma — strategie počítače. Tři obtížnosti.
//   • easy:   náhodná karta.
//   • medium: bere štychy s body, šetří sedmičky, vynáší laciné karty.
//   • hard:   jako medium + agresivněji bere a hlídá poslední štych.

import { type SedmaState, type SedmaMove, beats, cardPoints } from './engine';
import type { Card } from '@/core/cards';

export type Difficulty = 'easy' | 'medium' | 'hard';

const RANK_ORDER: Record<string, number> = {
  '7': 0,
  '8': 1,
  '9': 2,
  U: 3,
  O: 4,
  K: 5,
  '10': 6,
  A: 7,
};

/** Jak moc je karta „cenná" (nerad ji zahazuju). Sedmička je poklad. */
function preciousness(card: Card): number {
  if (card.rank === '7') return 100;
  if (cardPoints(card) > 0) return 50; // desítky, esa
  return RANK_ORDER[card.rank] ?? 0;
}

function pick(cardId: string): SedmaMove {
  return { type: 'play', cardId };
}

/** Nejmíň cenná karta k zahození. */
function junkCard(hand: Card[]): Card {
  return [...hand].sort((a, b) => preciousness(a) - preciousness(b))[0];
}

export function chooseMove(state: SedmaState, level: Difficulty): SedmaMove {
  const hand = state.players[state.current].hand;

  if (level === 'easy') {
    return pick(hand[Math.floor(Math.random() * hand.length)].id);
  }

  // Vynáším (na stole nic není).
  if (state.trick.length === 0) {
    // Vynes laciné — nech si sedmičky a bodované karty.
    return pick(junkCard(hand).id);
  }

  // Odpovídám na vynesenou kartu.
  const lead = state.trick[0];
  const leadPoints = cardPoints(lead);
  const beaters = hand.filter((card) => beats(lead, card));

  if (beaters.length === 0) {
    return pick(junkCard(hand).id); // nemůžu přebít → zahodím nejhorší
  }

  // Nejlevnější způsob, jak přebít.
  const cheapest = [...beaters].sort((a, b) => preciousness(a) - preciousness(b))[0];

  const talonLow = state.deck.length <= 2; // blíž ke konci jde o body víc
  const worthTaking = leadPoints > 0 || (level === 'hard' && talonLow);

  if (worthTaking) {
    return pick(cheapest.id);
  }

  // Bezbodový štych: nevyplácí se utratit poklad (sedmu/bodovku) — radši zahodím.
  if (preciousness(cheapest) >= 50) {
    return pick(junkCard(hand).id);
  }
  return pick(cheapest.id);
}
