// Pasiáns (Klondike) — herní engine (čisté TS, nezná React). Solo hra, bez soupeře.
//   • 52 francouzských karet. 7 sloupců (tableau), 4 cíle (foundations), balíček (stock) + odhazovák (waste).
//   • Cíle se skládají vzestupně po barvě A→K. Sloupce sestupně se střídáním barev (červená/černá).
//   • Do prázdného sloupce smí jen král (nebo sled začínající králem).
//   • Obtížnost: lízání 1 / 3 karty a omezený počet průchodů balíčkem.

import { type Card, frenchDeck, shuffle } from '@/core/cards';

export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export type KlondikeSuit = (typeof SUITS)[number];

const RANK_VALUE: Record<string, number> = {
  A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13,
};

export function rankValue(card: Card): number {
  return RANK_VALUE[card.rank] ?? 0;
}

export function isRed(card: Card): boolean {
  return card.suit === 'hearts' || card.suit === 'diamonds';
}

export interface TableauPile {
  faceDown: Card[];
  faceUp: Card[];
}

export interface KlondikeState {
  stock: Card[]; // lícem dolů
  waste: Card[]; // lícem nahoru, vrch = poslední
  foundations: Card[][]; // index dle SUITS
  tableau: TableauPile[]; // 7 sloupců
  drawCount: 1 | 3;
  redealsLeft: number | null; // null = neomezeně
  moves: number;
  won: boolean;
}

export type KlondikeMove =
  | { type: 'draw' }
  | { type: 'recycle' }
  | { type: 'wasteToFoundation' }
  | { type: 'wasteToTableau'; pile: number }
  | { type: 'tableauToFoundation'; pile: number }
  | { type: 'tableauToTableau'; from: number; count: number; to: number }
  | { type: 'foundationToTableau'; suit: number; pile: number };

export interface KlondikeInitOptions {
  drawCount?: 1 | 3;
  redealsLeft?: number | null;
  rng?: () => number;
}

export function initKlondike(opts: KlondikeInitOptions = {}): KlondikeState {
  const rng = opts.rng ?? Math.random;
  const deck = shuffle(frenchDeck(), rng);

  const tableau: TableauPile[] = [];
  for (let i = 0; i < 7; i++) {
    const faceDown: Card[] = [];
    for (let j = 0; j < i; j++) faceDown.push(deck.pop()!);
    const faceUp = [deck.pop()!];
    tableau.push({ faceDown, faceUp });
  }

  return {
    stock: deck, // zbytek (24 karet)
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    drawCount: opts.drawCount ?? 1,
    redealsLeft: opts.redealsLeft === undefined ? null : opts.redealsLeft,
    moves: 0,
    won: false,
  };
}

function foundationIndex(suit: string): number {
  return SUITS.indexOf(suit as KlondikeSuit);
}

/** Smí karta na daný cíl? */
export function canPlayToFoundation(foundation: Card[], card: Card): boolean {
  if (foundation.length === 0) return card.rank === 'A';
  const top = foundation[foundation.length - 1];
  return top.suit === card.suit && rankValue(card) === rankValue(top) + 1;
}

/** Smí (spodní) karta sledu na vrch cílového sloupce? */
export function canStackOnTableau(targetTop: Card | undefined, moving: Card): boolean {
  if (!targetTop) return moving.rank === 'K'; // prázdný sloupec → jen král
  return isRed(targetTop) !== isRed(moving) && rankValue(targetTop) === rankValue(moving) + 1;
}

/** Je sled karet (odshora dolů) korektní sestupný se střídáním barev? */
function isValidRun(cards: Card[]): boolean {
  for (let i = 1; i < cards.length; i++) {
    if (!canStackOnTableau(cards[i - 1], cards[i])) return false;
  }
  return true;
}

function checkWin(state: KlondikeState): void {
  state.won = state.foundations.every((f) => f.length === 13);
}

/** Odkryje vrchní zakrytou kartu sloupce, pokud je lícová část prázdná. */
function flipIfNeeded(pile: TableauPile): void {
  if (pile.faceUp.length === 0 && pile.faceDown.length > 0) {
    pile.faceUp.push(pile.faceDown.pop()!);
  }
}

export function legalMoves(state: KlondikeState): KlondikeMove[] {
  if (state.won) return [];
  const moves: KlondikeMove[] = [];

  if (state.stock.length > 0) moves.push({ type: 'draw' });
  else if (state.waste.length > 0 && (state.redealsLeft === null || state.redealsLeft > 0)) {
    moves.push({ type: 'recycle' });
  }

  // Z odhazováku
  if (state.waste.length > 0) {
    const top = state.waste[state.waste.length - 1];
    if (canPlayToFoundation(state.foundations[foundationIndex(top.suit)], top)) {
      moves.push({ type: 'wasteToFoundation' });
    }
    state.tableau.forEach((p, pile) => {
      if (canStackOnTableau(p.faceUp[p.faceUp.length - 1], top)) {
        moves.push({ type: 'wasteToTableau', pile });
      }
    });
  }

  // Ze sloupců
  state.tableau.forEach((p, from) => {
    if (p.faceUp.length === 0) return;
    const top = p.faceUp[p.faceUp.length - 1];
    if (canPlayToFoundation(state.foundations[foundationIndex(top.suit)], top)) {
      moves.push({ type: 'tableauToFoundation', pile: from });
    }
    // přesun sledu (1..faceUp.length) na jiný sloupec
    for (let count = 1; count <= p.faceUp.length; count++) {
      const moving = p.faceUp.slice(p.faceUp.length - count);
      if (!isValidRun(moving)) continue;
      const bottom = moving[0];
      state.tableau.forEach((q, to) => {
        if (to === from) return;
        if (canStackOnTableau(q.faceUp[q.faceUp.length - 1], bottom)) {
          moves.push({ type: 'tableauToTableau', from, count, to });
        }
      });
    }
  });

  // Z cíle zpět do sloupce (občas potřeba)
  state.foundations.forEach((f, suit) => {
    if (f.length === 0) return;
    const card = f[f.length - 1];
    state.tableau.forEach((p, pile) => {
      if (canStackOnTableau(p.faceUp[p.faceUp.length - 1], card)) {
        moves.push({ type: 'foundationToTableau', suit, pile });
      }
    });
  });

  return moves;
}

/** Aplikuje tah a vrátí NOVÝ stav (původní nemutuje). Neplatný tah = beze změny. */
export function applyMove(prev: KlondikeState, move: KlondikeMove): KlondikeState {
  const state: KlondikeState = structuredClone(prev);
  if (state.won) return state;

  switch (move.type) {
    case 'draw': {
      if (state.stock.length === 0) return prev;
      const n = Math.min(state.drawCount, state.stock.length);
      for (let i = 0; i < n; i++) state.waste.push(state.stock.pop()!);
      break;
    }
    case 'recycle': {
      if (state.stock.length > 0 || state.waste.length === 0) return prev;
      if (state.redealsLeft !== null) {
        if (state.redealsLeft <= 0) return prev;
        state.redealsLeft -= 1;
      }
      while (state.waste.length > 0) state.stock.push(state.waste.pop()!);
      break;
    }
    case 'wasteToFoundation': {
      const card = state.waste[state.waste.length - 1];
      if (!card) return prev;
      const fi = foundationIndex(card.suit);
      if (!canPlayToFoundation(state.foundations[fi], card)) return prev;
      state.foundations[fi].push(state.waste.pop()!);
      break;
    }
    case 'wasteToTableau': {
      const card = state.waste[state.waste.length - 1];
      const pile = state.tableau[move.pile];
      if (!card || !pile) return prev;
      if (!canStackOnTableau(pile.faceUp[pile.faceUp.length - 1], card)) return prev;
      pile.faceUp.push(state.waste.pop()!);
      break;
    }
    case 'tableauToFoundation': {
      const pile = state.tableau[move.pile];
      if (!pile || pile.faceUp.length === 0) return prev;
      const card = pile.faceUp[pile.faceUp.length - 1];
      const fi = foundationIndex(card.suit);
      if (!canPlayToFoundation(state.foundations[fi], card)) return prev;
      state.foundations[fi].push(pile.faceUp.pop()!);
      flipIfNeeded(pile);
      break;
    }
    case 'tableauToTableau': {
      const from = state.tableau[move.from];
      const to = state.tableau[move.to];
      if (!from || !to || move.from === move.to) return prev;
      if (move.count < 1 || move.count > from.faceUp.length) return prev;
      const moving = from.faceUp.slice(from.faceUp.length - move.count);
      if (!isValidRun(moving)) return prev;
      if (!canStackOnTableau(to.faceUp[to.faceUp.length - 1], moving[0])) return prev;
      from.faceUp.splice(from.faceUp.length - move.count, move.count);
      to.faceUp.push(...moving);
      flipIfNeeded(from);
      break;
    }
    case 'foundationToTableau': {
      const f = state.foundations[move.suit];
      const pile = state.tableau[move.pile];
      if (!f || !pile || f.length === 0) return prev;
      const card = f[f.length - 1];
      if (!canStackOnTableau(pile.faceUp[pile.faceUp.length - 1], card)) return prev;
      pile.faceUp.push(f.pop()!);
      break;
    }
    default:
      return prev;
  }

  state.moves += 1;
  checkWin(state);
  return state;
}

export function isTerminal(state: KlondikeState): boolean {
  return state.won;
}
