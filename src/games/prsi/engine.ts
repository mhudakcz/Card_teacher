// Prší — herní engine (čisté TS, nezná React).
// Pravidla: 32 sedláckých karet, kdo se první zbaví karet, vyhrává.
//   • Sedmička (7): další hráč lízne 2 (sčítá se), nebo přebije vlastní 7.
//   • Eso (A): další hráč stojí (skip), nebo přebije vlastním esem.
//   • Svršek (O): lze hrát na cokoli, hráč určí novou barvu.
//   • Jinak musí karta sedět barvou nebo hodnotou na vrchní kartu.

import {
  type Card,
  type Suit,
  type CzechSuit,
  CZECH_SUITS,
  czechDeck,
  shuffle,
} from '@/core/cards';

export interface PrsiPlayer {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
}

export interface PrsiState {
  players: PrsiPlayer[];
  deck: Card[];
  discard: Card[]; // vrchní karta = poslední prvek
  current: number; // index hráče na tahu
  activeSuit: Suit; // platná barva (svršek ji může změnit)
  pendingDraw: number; // nasčítaný trest od sedmiček
  pendingSkip: number; // nasčítané přeskočení od es
  winner: string | null;
  log: LogEntry[];
}

export interface LogEntry {
  key: string; // i18n klíč, např. "play.drew"
  params?: Record<string, string | number>;
}

export type PrsiMove =
  | { type: 'play'; cardId: string; chosenSuit?: CzechSuit }
  | { type: 'draw' }
  | { type: 'drawPenalty' }
  | { type: 'acceptSkip' };

export interface PrsiInitOptions {
  players: { id: string; name: string; isHuman: boolean }[];
  handSize?: number;
  rng?: () => number;
}

const DEFAULT_HAND = 4;

export function initPrsi(opts: PrsiInitOptions): PrsiState {
  const rng = opts.rng ?? Math.random;
  let deck = shuffle(czechDeck(), rng);

  const players: PrsiPlayer[] = opts.players.map((p) => ({
    ...p,
    hand: [],
  }));

  const handSize = opts.handSize ?? DEFAULT_HAND;
  for (let r = 0; r < handSize; r++) {
    for (const p of players) {
      p.hand.push(deck.pop()!);
    }
  }

  // Úvodní karta: přeskoč speciální (7/A/O), ať start není matoucí.
  let topIdx = deck.findIndex((c) => !isSpecial(c));
  if (topIdx === -1) topIdx = deck.length - 1;
  const top = deck.splice(topIdx, 1)[0];

  return {
    players,
    deck,
    discard: [top],
    current: 0,
    activeSuit: top.suit,
    pendingDraw: 0,
    pendingSkip: 0,
    winner: null,
    log: [],
  };
}

function isSpecial(c: Card): boolean {
  return c.rank === '7' || c.rank === 'A' || c.rank === 'O';
}

export function topCard(state: PrsiState): Card {
  return state.discard[state.discard.length - 1];
}

/** Lze kartu zahrát normálně na vrchní kartu při dané platné barvě? */
function matches(card: Card, top: Card, activeSuit: Suit): boolean {
  if (card.rank === 'O') return true; // svršek na cokoli
  return card.suit === activeSuit || card.rank === top.rank;
}

export function legalMoves(state: PrsiState): PrsiMove[] {
  if (state.winner) return [];
  const hand = state.players[state.current].hand;
  const top = topCard(state);

  // Útok sedmičkou: buď přebij 7, nebo si vezmi trest.
  if (state.pendingDraw > 0) {
    const moves: PrsiMove[] = hand
      .filter((c) => c.rank === '7')
      .map((c) => ({ type: 'play', cardId: c.id }) as PrsiMove);
    moves.push({ type: 'drawPenalty' });
    return moves;
  }

  // Útok esem: buď přebij esem, nebo přijmi stání.
  if (state.pendingSkip > 0) {
    const moves: PrsiMove[] = hand
      .filter((c) => c.rank === 'A')
      .map((c) => ({ type: 'play', cardId: c.id }) as PrsiMove);
    moves.push({ type: 'acceptSkip' });
    return moves;
  }

  // Normální tah: každá sedící karta + možnost líznout.
  const moves: PrsiMove[] = [];
  for (const c of hand) {
    if (matches(c, top, state.activeSuit)) {
      if (c.rank === 'O') {
        for (const s of CZECH_SUITS) moves.push({ type: 'play', cardId: c.id, chosenSuit: s });
      } else {
        moves.push({ type: 'play', cardId: c.id });
      }
    }
  }
  moves.push({ type: 'draw' });
  return moves;
}

function nextIndex(state: PrsiState, from = state.current): number {
  return (from + 1) % state.players.length;
}

/** Vrátí kartu z odhazováku zpět do balíčku, když dojde (kromě vrchní). */
function refillDeck(state: PrsiState, rng: () => number): void {
  if (state.deck.length > 0 || state.discard.length <= 1) return;
  const top = state.discard.pop()!;
  state.deck = shuffle(state.discard, rng);
  state.discard = [top];
}

function drawCards(state: PrsiState, playerIdx: number, count: number, rng: () => number): number {
  let drawn = 0;
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) refillDeck(state, rng);
    if (state.deck.length === 0) break;
    state.players[playerIdx].hand.push(state.deck.pop()!);
    drawn++;
  }
  return drawn;
}

/** Aplikuje tah a vrátí NOVÝ stav (původní nemutuje). */
export function applyMove(prev: PrsiState, move: PrsiMove, rng: () => number = Math.random): PrsiState {
  const state: PrsiState = structuredClone(prev);
  state.log = [];
  const me = state.players[state.current];

  switch (move.type) {
    case 'draw': {
      const got = drawCards(state, state.current, 1, rng);
      if (got > 0) state.log.push({ key: 'play.drew', params: { name: me.name } });
      state.current = nextIndex(state);
      break;
    }
    case 'drawPenalty': {
      const n = state.pendingDraw;
      drawCards(state, state.current, n, rng);
      state.pendingDraw = 0;
      state.log.push({ key: 'play.mustDraw', params: { count: n } });
      state.current = nextIndex(state);
      break;
    }
    case 'acceptSkip': {
      state.pendingSkip -= 1;
      state.log.push({ key: 'play.skipped', params: { name: me.name } });
      state.current = nextIndex(state);
      break;
    }
    case 'play': {
      const idx = me.hand.findIndex((c) => c.id === move.cardId);
      const card = me.hand.splice(idx, 1)[0];
      state.discard.push(card);
      state.activeSuit = card.rank === 'O' ? (move.chosenSuit ?? card.suit) : card.suit;

      if (me.hand.length === 0) {
        state.winner = me.id;
        break;
      }

      if (card.rank === '7') state.pendingDraw += 2;
      else if (card.rank === 'A') state.pendingSkip += 1;

      state.current = nextIndex(state);
      break;
    }
  }

  return state;
}

export function isTerminal(state: PrsiState): boolean {
  return state.winner !== null;
}
