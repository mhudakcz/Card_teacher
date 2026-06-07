// Černý Petr — herní engine (čisté TS, nezná React). Heads-up (2 hráči).
//   • Balíček: 32 sedláckých karet, ale ponecháme jen JEDNOHO spodka (žaludového).
//     Ostatní tři spodky se vyhodí → vznikne 29 karet a právě jeden „lichý" — Černý Petr.
//   • Páry tvoří karty STEJNÉ hodnoty. Páry se ihned odhazují.
//   • Hráči se střídají v tažení skryté karty od soupeře. Když nová karta utvoří pár, odhodí se.
//   • Kdo zůstane na konci s Černým Petrem (osamělý spodek), prohrává.

import { type Card, czechDeck, shuffle } from '@/core/cards';

/** Hodnost a barva Černého Petra (jediný ponechaný spodek). */
export const PETR_RANK = 'U';
export const PETR_SUIT = 'acorns';

export interface CernyPetrPlayer {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  discarded: number; // počet odhozených karet (pro skóre/UI)
}

export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export interface CernyPetrState {
  players: CernyPetrPlayer[];
  current: number; // kdo právě táhne (bere kartu od soupeře)
  lastDrawnId: string | null; // naposledy tažená karta (pro zvýraznění)
  loser: string | null; // id hráče s Černým Petrem
  winner: string | null; // id vítěze
  log: LogEntry[];
}

export type CernyPetrMove = { type: 'draw'; index: number };

export interface CernyPetrInitOptions {
  players: { id: string; name: string; isHuman: boolean }[];
  rng?: () => number;
}

/** Je tato karta Černý Petr (osamělý spodek)? */
export function isPetr(card: Card): boolean {
  return card.rank === PETR_RANK && card.suit === PETR_SUIT;
}

/** Balíček pro Černého Petra: 29 karet (32 minus tři přebyteční spodci). */
export function cernyPetrDeck(): Card[] {
  return czechDeck().filter((c) => c.rank !== PETR_RANK || c.suit === PETR_SUIT);
}

/** Odhodí z ruky všechny páry (dvojice stejné hodnoty). Vrátí počet odhozených karet. */
function discardPairs(hand: Card[]): number {
  const byRank = new Map<string, Card[]>();
  for (const c of hand) {
    const arr = byRank.get(c.rank) ?? [];
    arr.push(c);
    byRank.set(c.rank, arr);
  }
  const keep: Card[] = [];
  let removed = 0;
  for (const arr of byRank.values()) {
    const pairs = Math.floor(arr.length / 2);
    removed += pairs * 2;
    if (arr.length % 2 === 1) keep.push(arr[arr.length - 1]); // lichá zůstává
  }
  hand.length = 0;
  hand.push(...keep);
  return removed;
}

function checkEnd(state: CernyPetrState): void {
  const empty = state.players.findIndex((p) => p.hand.length === 0);
  if (empty === -1) return;
  const safe = state.players[empty];
  const loser = state.players[(empty + 1) % 2];
  state.winner = safe.id;
  state.loser = loser.id;
  state.log.push({ key: 'cernypetr.log.end', params: { name: loser.name } });
}

export function initCernyPetr(opts: CernyPetrInitOptions): CernyPetrState {
  const rng = opts.rng ?? Math.random;
  const deck = shuffle(cernyPetrDeck(), rng);

  const players: CernyPetrPlayer[] = opts.players.map((p) => ({
    ...p,
    hand: [],
    discarded: 0,
  }));
  let i = 0;
  while (deck.length > 0) {
    players[i % 2].hand.push(deck.pop()!);
    i++;
  }
  // Úvodní odhození párů.
  for (const p of players) p.discarded += discardPairs(p.hand);

  const state: CernyPetrState = {
    players,
    current: 0,
    lastDrawnId: null,
    loser: null,
    winner: null,
    log: [],
  };
  checkEnd(state);
  return state;
}

export function legalMoves(state: CernyPetrState): CernyPetrMove[] {
  if (state.winner) return [];
  const opp = state.players[(state.current + 1) % 2];
  return opp.hand.map((_, index) => ({ type: 'draw', index }));
}

/** Aplikuje tah a vrátí NOVÝ stav (původní nemutuje). */
export function applyMove(prev: CernyPetrState, move: CernyPetrMove): CernyPetrState {
  const state: CernyPetrState = structuredClone(prev);
  state.log = [];
  if (state.winner) return state;

  const me = state.players[state.current];
  const oppIdx = (state.current + 1) % 2;
  const opp = state.players[oppIdx];
  if (move.index < 0 || move.index >= opp.hand.length) return state;

  const drawn = opp.hand.splice(move.index, 1)[0];
  state.lastDrawnId = drawn.id;

  // Tvoří tažená karta pár s něčím v ruce?
  const matchIdx = me.hand.findIndex((c) => c.rank === drawn.rank);
  if (matchIdx !== -1) {
    me.hand.splice(matchIdx, 1); // odhoď protějšek
    me.discarded += 2;
    state.log.push({ key: 'cernypetr.log.pair', params: { name: me.name } });
  } else {
    me.hand.push(drawn);
    state.log.push({ key: 'cernypetr.log.draw', params: { name: me.name } });
  }

  checkEnd(state);
  if (!state.winner) state.current = oppIdx;
  return state;
}

export function isTerminal(state: CernyPetrState): boolean {
  return state.winner !== null;
}
