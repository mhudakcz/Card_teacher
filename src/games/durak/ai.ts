// AI pro Durak ve třech obtížnostech.
// easy = náhoda; medium = šetří trumfy, brání nejnižší kartou;
// hard = navíc nepřehazuje zbytečně a nepřihrává vysoké karty.

import type { Card } from '@/core/cards';
import { type DurakMove, type DurakState, currentPlayer, defender, legalMoves, rankValue } from './engine';

export type Difficulty = 'easy' | 'medium' | 'hard';

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function cardOf(s: DurakState, who: 0 | 1, id: string): Card | undefined {
  return s.players[who].hand.find((c) => c.id === id);
}

/** Skóre karty pro „čím nižší, tím radši ji obětuju" (trumf má velkou přirážku). */
function dumpScore(card: Card, trumpSuit: string): number {
  return rankValue(card) + (card.suit === trumpSuit ? 100 : 0);
}

export function chooseMove(s: DurakState, level: Difficulty, rng: () => number = Math.random): DurakMove {
  const moves = legalMoves(s);
  if (moves.length === 0) return { type: 'done' };
  if (level === 'easy') return pick(moves, rng);

  const me = currentPlayer(s);
  const trump = s.trumpSuit;

  const defendMoves = moves.filter((m) => m.type === 'defend') as Extract<DurakMove, { type: 'defend' }>[];
  const attackMoves = moves.filter((m) => m.type === 'attack') as Extract<DurakMove, { type: 'attack' }>[];

  // --- Obrana ---
  if (defendMoves.length > 0 || moves.some((m) => m.type === 'take')) {
    if (defendMoves.length === 0) return { type: 'take' };
    // Vyber nejlevnější přebíjející kartu (netrumf má přednost před trumfem).
    const ranked = defendMoves
      .map((m) => ({ m, card: cardOf(s, me, m.cardId)! }))
      .sort((a, b) => dumpScore(a.card, trump) - dumpScore(b.card, trump));
    const cheapest = ranked[0];
    if (level === 'hard') {
      // Když by přebití stálo trumf a útok je nízký (a balíček ještě plný), raději ber.
      const open = s.table.find((t) => t.defense === null)!;
      if (cheapest.card.suit === trump && open.attack.suit !== trump && rankValue(open.attack) <= 8 && s.deck.length > 8) {
        return { type: 'take' };
      }
    }
    return cheapest.m;
  }

  // --- Útok ---
  if (attackMoves.length > 0) {
    const ranked = attackMoves
      .map((m) => ({ m, card: cardOf(s, me, m.cardId)! }))
      .sort((a, b) => dumpScore(a.card, trump) - dumpScore(b.card, trump));
    const lowest = ranked[0];
    const canFinish = moves.some((m) => m.type === 'done');

    if (!canFinish) {
      // První útok v kole — nejnižší karta (netrumf přednostně).
      return lowest.m;
    }
    // Přihrávka k rozehranému kolu: jen nízkou netrumfovou kartu, jinak ukonči.
    const defLeft = s.players[defender(s)].hand.length;
    const cap = level === 'hard' ? 8 : 9;
    if (defLeft > 0 && lowest.card.suit !== trump && rankValue(lowest.card) <= cap) {
      return lowest.m;
    }
    return { type: 'done' };
  }

  // Jen ukončení.
  return moves.find((m) => m.type === 'done') ?? pick(moves, rng);
}
