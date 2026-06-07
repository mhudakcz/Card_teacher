// Taroky — zjednodušený herní engine (čisté TS, nezná React). Heads-up (2 hráči).
//   • 54 karet: 4 barvy × 8 + 22 trumfů (taroky I..XXI, Škýz). Každý dostane 12 karet.
//   • Štych: vynášející hraje kartu, soupeř musí ctít barvu; když ji nemá, musí trumfovat.
//   • Trumf přebíjí barvu; nejvyšší trumf bere. Škýz je nejvyšší, pak XXI (mond)… I (pagát).
//   • Bodují honéry (I, XXI, Škýz) a krále/svršky/spodky. Pagát ultimo: poslední štych pagátem = +10.

import { type Card, tarockDeck, isTrump, shuffle, TAROCK_TRUMPS } from '@/core/cards';

export const HAND = 12;
export const PAGAT_ULTIMO_BONUS = 10;

// Síla barevných karet ve štychu (A nejvyšší).
const SUIT_ORDER: Record<string, number> = {
  '7': 1, '8': 2, '9': 3, '10': 4, U: 5, O: 6, K: 7, A: 8,
};
// Síla trumfů: I=1 … XXI=21, Škýz=22.
const TRUMP_ORDER: Record<string, number> = Object.fromEntries(
  TAROCK_TRUMPS.map((r, i) => [r, i + 1]),
);

export interface TarokyPlayer {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  won: Card[];
}

export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export interface TarokyState {
  players: TarokyPlayer[];
  trick: { card: Card; player: number }[];
  leader: number;
  current: number;
  lastTrickWinner: number | null;
  tricksLeft: number;
  pagatUltimo: number | null; // hráč, který uhrál poslední štych pagátem
  winner: string | null;
  scores: [number, number] | null;
  log: LogEntry[];
}

export type TarokyMove = { type: 'play'; cardId: string };

export interface TarokyInitOptions {
  players: { id: string; name: string; isHuman: boolean }[];
  rng?: () => number;
}

/** Bodová hodnota karty (zjednodušeno): honéry a dvorní karty. */
export function cardPoints(card: Card): number {
  if (isTrump(card)) {
    if (card.rank === 'I' || card.rank === 'XXI' || card.rank === 'SKYZ') return 5; // honéry
    return 0;
  }
  if (card.rank === 'K') return 5;
  if (card.rank === 'O') return 4;
  if (card.rank === 'U') return 3;
  return 0;
}

export function initTaroky(opts: TarokyInitOptions): TarokyState {
  const rng = opts.rng ?? Math.random;
  const deck = shuffle(tarockDeck(), rng);

  const players: TarokyPlayer[] = opts.players.map((p) => ({ ...p, hand: [], won: [] }));
  for (let r = 0; r < HAND; r++) {
    for (const p of players) p.hand.push(deck.pop()!);
  }

  return {
    players,
    trick: [],
    leader: 0,
    current: 0,
    lastTrickWinner: null,
    tricksLeft: HAND,
    pagatUltimo: null,
    winner: null,
    scores: null,
    log: [],
  };
}

export function legalMoves(state: TarokyState): TarokyMove[] {
  if (state.winner) return [];
  const hand = state.players[state.current].hand;
  if (state.trick.length === 0) {
    return hand.map((c) => ({ type: 'play', cardId: c.id }));
  }
  const lead = state.trick[0].card;

  if (isTrump(lead)) {
    // Vedl trumf → musíš trumfovat, pokud můžeš.
    const trumps = hand.filter(isTrump);
    const pool = trumps.length > 0 ? trumps : hand;
    return pool.map((c) => ({ type: 'play', cardId: c.id }));
  }
  // Vedla barva → ctít barvu; když nemáš, musíš trumfovat.
  const sameSuit = hand.filter((c) => !isTrump(c) && c.suit === lead.suit);
  if (sameSuit.length > 0) return sameSuit.map((c) => ({ type: 'play', cardId: c.id }));
  const trumps = hand.filter(isTrump);
  const pool = trumps.length > 0 ? trumps : hand;
  return pool.map((c) => ({ type: 'play', cardId: c.id }));
}

function beats(lead: Card, challenger: Card): boolean {
  const lt = isTrump(lead);
  const ct = isTrump(challenger);
  if (ct && !lt) return true; // trumf bije barvu
  if (!ct && lt) return false;
  if (ct && lt) return TRUMP_ORDER[challenger.rank] > TRUMP_ORDER[lead.rank];
  // obě barvy
  if (challenger.suit !== lead.suit) return false; // jiná barva nebije
  return SUIT_ORDER[challenger.rank] > SUIT_ORDER[lead.rank];
}

function trickWinner(state: TarokyState): number {
  const [first, second] = state.trick;
  return beats(first.card, second.card) ? second.player : first.player;
}

function finish(state: TarokyState): void {
  const score = (i: number) => {
    let s = state.players[i].won.reduce((sum, c) => sum + cardPoints(c), 0);
    if (state.pagatUltimo === i) s += PAGAT_ULTIMO_BONUS;
    return s;
  };
  const s0 = score(0);
  const s1 = score(1);
  state.scores = [s0, s1];
  if (s0 > s1) state.winner = state.players[0].id;
  else if (s1 > s0) state.winner = state.players[1].id;
  else state.winner = 'push';
  state.log.push({ key: 'taroky.log.final', params: { a: s0, b: s1 } });
}

/** Aplikuje tah a vrátí NOVÝ stav (původní nemutuje). */
export function applyMove(prev: TarokyState, move: TarokyMove): TarokyState {
  const state: TarokyState = structuredClone(prev);
  state.log = [];
  if (state.winner) return state;

  const me = state.players[state.current];
  const idx = me.hand.findIndex((c) => c.id === move.cardId);
  if (idx === -1) return state;

  const card = me.hand.splice(idx, 1)[0];
  state.trick.push({ card, player: state.current });

  if (state.trick.length < 2) {
    state.current = (state.current + 1) % 2;
    return state;
  }

  // Štych je plný — vyhodnotíme.
  const winnerIdx = trickWinner(state);
  const winnerCard = state.trick.find((tk) => tk.player === winnerIdx)!.card;
  state.players[winnerIdx].won.push(...state.trick.map((tk) => tk.card));
  const pts = state.trick.reduce((s, tk) => s + cardPoints(tk.card), 0);
  state.lastTrickWinner = winnerIdx;
  state.tricksLeft -= 1;
  state.log.push({ key: 'taroky.log.trick', params: { name: state.players[winnerIdx].name, points: pts } });

  // Pagát ultimo: poslední štych uhraný pagátem (taroka I).
  if (state.tricksLeft === 0 && winnerCard.rank === 'I' && isTrump(winnerCard)) {
    state.pagatUltimo = winnerIdx;
    state.log.push({ key: 'taroky.log.pagat', params: { name: state.players[winnerIdx].name } });
  }

  state.trick = [];
  state.leader = winnerIdx;
  state.current = winnerIdx;

  if (state.players.every((p) => p.hand.length === 0)) {
    finish(state);
  }
  return state;
}

export function isTerminal(state: TarokyState): boolean {
  return state.winner !== null;
}
