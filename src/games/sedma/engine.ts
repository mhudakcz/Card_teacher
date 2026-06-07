// Sedma — herní engine (čisté TS, nezná React). Heads-up varianta (2 hráči).
//   • 32 sedláckých karet, každý 4 na ruce, zbytek je talon.
//   • Vynášející zahraje kartu, soupeř odpoví. Soupeř bere štych, když přiloží
//     kartu STEJNÉ hodnoty nebo SEDMIČKU; jinak bere vynášející.
//   • Sedmička přebíjí cokoli (i sedmu). Po štychu se oba doberou na 4.
//   • Bodují jen desítky a esa (10 b.) + poslední štych (10 b.). Víc než 45 vyhrává.

import { type Card, czechDeck, shuffle } from '@/core/cards';

export interface SedmaPlayer {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  won: Card[]; // karty získané ve štyších
}

export interface SedmaState {
  players: SedmaPlayer[];
  deck: Card[]; // talon
  trick: Card[]; // karty na stole v tomto štychu (v pořadí)
  leader: number; // kdo štych vynesl
  current: number; // kdo je na tahu
  lastTrickWinner: number | null;
  winner: string | null; // id vítěze, nebo 'push'
  scores: [number, number] | null; // konečné body [hráč0, hráč1]
  log: LogEntry[];
}

export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export type SedmaMove = { type: 'play'; cardId: string };

export interface SedmaInitOptions {
  players: { id: string; name: string; isHuman: boolean }[];
  rng?: () => number;
}

const HAND = 4;

export function initSedma(opts: SedmaInitOptions): SedmaState {
  const rng = opts.rng ?? Math.random;
  const deck = shuffle(czechDeck(), rng);

  const players: SedmaPlayer[] = opts.players.map((p) => ({ ...p, hand: [], won: [] }));
  for (let r = 0; r < HAND; r++) {
    for (const p of players) p.hand.push(deck.pop()!);
  }

  return {
    players,
    deck,
    trick: [],
    leader: 0,
    current: 0,
    lastTrickWinner: null,
    winner: null,
    scores: null,
    log: [],
  };
}

export function cardPoints(card: Card): number {
  return card.rank === '10' || card.rank === 'A' ? 10 : 0;
}

/** Přebije odpověď vynesenou kartu? Sedmička přebíjí vše (i sedmu). */
export function beats(lead: Card, response: Card): boolean {
  if (response.rank === '7') return true;
  if (lead.rank === '7') return false;
  return response.rank === lead.rank;
}

export function legalMoves(state: SedmaState): SedmaMove[] {
  if (state.winner) return [];
  return state.players[state.current].hand.map((c) => ({ type: 'play', cardId: c.id }));
}

function nextIndex(state: SedmaState, from = state.current): number {
  return (from + 1) % state.players.length;
}

function drawTo(state: SedmaState, idx: number, target = HAND): void {
  while (state.players[idx].hand.length < target && state.deck.length > 0) {
    state.players[idx].hand.push(state.deck.pop()!);
  }
}

function finish(state: SedmaState): void {
  const score = (i: number) => {
    let s = state.players[i].won.reduce((sum, c) => sum + cardPoints(c), 0);
    if (state.lastTrickWinner === i) s += 10;
    return s;
  };
  const s0 = score(0);
  const s1 = score(1);
  state.scores = [s0, s1];
  if (s0 > s1) state.winner = state.players[0].id;
  else if (s1 > s0) state.winner = state.players[1].id;
  else state.winner = 'push';
  state.log.push({ key: 'sedma.final', params: { a: s0, b: s1 } });
}

/** Aplikuje tah a vrátí NOVÝ stav (původní nemutuje). */
export function applyMove(prev: SedmaState, move: SedmaMove): SedmaState {
  const state: SedmaState = structuredClone(prev);
  state.log = [];
  if (state.winner) return state;

  const me = state.players[state.current];
  const idx = me.hand.findIndex((c) => c.id === move.cardId);
  if (idx === -1) return state;
  const card = me.hand.splice(idx, 1)[0];
  state.trick.push(card);

  if (state.trick.length < state.players.length) {
    // čeká se na odpověď soupeře
    state.current = nextIndex(state);
    return state;
  }

  // Štych je plný — vyhodnotíme (heads-up: vede leader, odpovídá druhý).
  const lead = state.trick[0];
  const response = state.trick[1];
  const winnerIdx = beats(lead, response) ? nextIndex(state, state.leader) : state.leader;

  state.players[winnerIdx].won.push(...state.trick);
  const pts = state.trick.reduce((s, c) => s + cardPoints(c), 0);
  state.lastTrickWinner = winnerIdx;
  state.log.push({
    key: 'sedma.trickTaken',
    params: { name: state.players[winnerIdx].name, points: pts },
  });
  state.trick = [];

  // Dobírání: nejdřív vítěz štychu, pak druhý.
  drawTo(state, winnerIdx);
  drawTo(state, nextIndex(state, winnerIdx));

  state.leader = winnerIdx;
  state.current = winnerIdx;

  // Konec: prázdný talon i ruce.
  if (state.deck.length === 0 && state.players.every((p) => p.hand.length === 0)) {
    finish(state);
  }
  return state;
}

export function isTerminal(state: SedmaState): boolean {
  return state.winner !== null;
}
