// Žolíky (Rummy) — herní engine (čisté TS, nezná React). Heads-up (2 hráči).
//   • 2 francouzské balíčky + 4 žolíci (108 karet). Každý dostane 9 karet.
//   • Tah: líznout 1 kartu (z balíčku nebo z vrchu odhazováku) → odhodit 1 kartu.
//   • Vyhraje ten, kdo po odhození složí celou ruku (9 karet) na platné sestavy.

import { type Card, frenchDeckN, shuffle } from '@/core/cards';
import { canMeldAll, cardScore } from './melds';

export const HAND = 9;

export interface ZolikyPlayer {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
}

export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export type ZolikyPhase = 'draw' | 'discard';

export interface ZolikyState {
  players: ZolikyPlayer[];
  stock: Card[]; // dobírací balíček
  discard: Card[]; // odhazovák (poslední je navrchu)
  current: number;
  phase: ZolikyPhase; // co má hráč na tahu udělat
  winner: string | null; // id vítěze, nebo 'push' (došly karty)
  scores: [number, number] | null; // body soupeřů (zbytek v ruce) při remíze
  log: LogEntry[];
}

export type ZolikyMove =
  | { type: 'drawStock' }
  | { type: 'drawDiscard' }
  | { type: 'discard'; cardId: string };

export interface ZolikyInitOptions {
  players: { id: string; name: string; isHuman: boolean }[];
  seed?: number;
  rng?: () => number;
}

export function initZoliky(opts: ZolikyInitOptions): ZolikyState {
  const rng = opts.rng ?? Math.random;
  const stock = shuffle(frenchDeckN(2, 4), rng);

  const players: ZolikyPlayer[] = opts.players.map((p) => ({ ...p, hand: [] }));
  for (let r = 0; r < HAND; r++) {
    for (const p of players) p.hand.push(stock.pop()!);
  }
  const discard = [stock.pop()!];

  return {
    players,
    stock,
    discard,
    current: 0,
    phase: 'draw',
    winner: null,
    scores: null,
    log: [],
  };
}

export function topDiscard(state: ZolikyState): Card | undefined {
  return state.discard[state.discard.length - 1];
}

export function legalMoves(state: ZolikyState): ZolikyMove[] {
  if (state.winner) return [];
  const p = state.players[state.current];
  if (state.phase === 'draw') {
    const moves: ZolikyMove[] = [{ type: 'drawStock' }];
    if (state.discard.length > 0) moves.push({ type: 'drawDiscard' });
    return moves;
  }
  return p.hand.map((c) => ({ type: 'discard', cardId: c.id }));
}

function sortHand(hand: Card[]): void {
  const order: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    J: 11, Q: 12, K: 13, A: 14, JOKER: 99,
  };
  hand.sort((a, b) => a.suit.localeCompare(b.suit) || (order[a.rank] ?? 0) - (order[b.rank] ?? 0));
}

function reshuffleIfNeeded(state: ZolikyState): void {
  if (state.stock.length === 0 && state.discard.length > 1) {
    const top = state.discard.pop()!;
    state.stock = state.discard;
    state.discard = [top];
    // Promíchání odhazováku zpět do balíčku.
    for (let i = state.stock.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.stock[i], state.stock[j]] = [state.stock[j], state.stock[i]];
    }
  }
}

/** Aplikuje tah a vrátí NOVÝ stav (původní nemutuje). */
export function applyMove(prev: ZolikyState, move: ZolikyMove): ZolikyState {
  const state: ZolikyState = structuredClone(prev);
  state.log = [];
  if (state.winner) return state;

  const p = state.players[state.current];

  if (move.type === 'drawStock') {
    if (state.phase !== 'draw') return state;
    reshuffleIfNeeded(state);
    if (state.stock.length === 0) {
      // Nikdo nemůže dobírat → remíza podle zbytku v ruce.
      finishDraw(state);
      return state;
    }
    p.hand.push(state.stock.pop()!);
    sortHand(p.hand);
    state.phase = 'discard';
    state.log.push({ key: 'zoliky.log.drewStock', params: { name: p.name } });
    return state;
  }

  if (move.type === 'drawDiscard') {
    if (state.phase !== 'draw' || state.discard.length === 0) return state;
    p.hand.push(state.discard.pop()!);
    sortHand(p.hand);
    state.phase = 'discard';
    state.log.push({ key: 'zoliky.log.drewDiscard', params: { name: p.name } });
    return state;
  }

  // discard
  if (state.phase !== 'discard') return state;
  const idx = p.hand.findIndex((c) => c.id === move.cardId);
  if (idx === -1) return state;
  const card = p.hand.splice(idx, 1)[0];
  state.discard.push(card);
  state.log.push({ key: 'zoliky.log.discarded', params: { name: p.name } });

  // Výhra: zbylých 9 karet tvoří platné sestavy.
  if (canMeldAll(p.hand)) {
    state.winner = p.id;
    state.log.push({ key: 'zoliky.log.wins', params: { name: p.name } });
    return state;
  }

  state.current = (state.current + 1) % state.players.length;
  state.phase = 'draw';
  return state;
}

function finishDraw(state: ZolikyState): void {
  const score = (i: number) => state.players[i].hand.reduce((s, c) => s + cardScore(c), 0);
  const s0 = score(0);
  const s1 = score(1);
  state.scores = [s0, s1];
  if (s0 < s1) state.winner = state.players[0].id;
  else if (s1 < s0) state.winner = state.players[1].id;
  else state.winner = 'push';
  state.log.push({ key: 'zoliky.log.empty' });
}

export function isTerminal(state: ZolikyState): boolean {
  return state.winner !== null;
}
