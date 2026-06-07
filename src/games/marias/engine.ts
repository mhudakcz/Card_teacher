// Mariáš — zjednodušený herní engine (čisté TS, nezná React). Heads-up (2 hráči).
//   • 32 sedláckých karet, trumfová barva určená lízací kartou.
//   • Každý dostane 10 karet, zbytek je talon (nehraje se).
//   • Štych: vynášející hraje kartu, soupeř musí ctít barvu a přebít, jinak trumfovat.
//   • Hláška (král + svršek téže barvy) při vynesení = 20 b. (40 b. v trumfech).
//   • Bodují esa a desítky (10 b.) + poslední štych (10 b.). Víc bodů vyhrává.

import { type Card, czechDeck, shuffle, type Suit } from '@/core/cards';

export const HAND = 10;

// Pořadí síly karet ve štychu (vyšší přebíjí).
const TRICK_ORDER: Record<string, number> = {
  '7': 1, '8': 2, '9': 3, U: 4, O: 5, K: 6, '10': 7, A: 8,
};

export interface MariasPlayer {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  won: Card[];
  marriagePoints: number;
}

export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export interface MariasState {
  players: MariasPlayer[];
  trump: Suit;
  trick: { card: Card; player: number }[];
  leader: number;
  current: number;
  lastTrickWinner: number | null;
  announced: string[]; // klíče "idx-suit" už ohlášených hlášek
  winner: string | null;
  scores: [number, number] | null;
  log: LogEntry[];
}

export type MariasMove = { type: 'play'; cardId: string };

export interface MariasInitOptions {
  players: { id: string; name: string; isHuman: boolean }[];
  rng?: () => number;
}

export function cardPoints(card: Card): number {
  return card.rank === '10' || card.rank === 'A' ? 10 : 0;
}

export function initMarias(opts: MariasInitOptions): MariasState {
  const rng = opts.rng ?? Math.random;
  const deck = shuffle(czechDeck(), rng);
  const trump = deck[0].suit; // lízací karta určuje trumfy

  const players: MariasPlayer[] = opts.players.map((p) => ({
    ...p,
    hand: [],
    won: [],
    marriagePoints: 0,
  }));
  for (let r = 0; r < HAND; r++) {
    for (const p of players) p.hand.push(deck.pop()!);
  }

  return {
    players,
    trump,
    trick: [],
    leader: 0,
    current: 0,
    lastTrickWinner: null,
    announced: [],
    winner: null,
    scores: null,
    log: [],
  };
}

/** Přebíjí karta `b` kartu `a` ve stejné barvě? */
function higher(a: Card, b: Card): boolean {
  return TRICK_ORDER[b.rank] > TRICK_ORDER[a.rank];
}

export function legalMoves(state: MariasState): MariasMove[] {
  if (state.winner) return [];
  const hand = state.players[state.current].hand;
  if (state.trick.length === 0) {
    return hand.map((c) => ({ type: 'play', cardId: c.id }));
  }
  const lead = state.trick[0].card;
  const sameSuit = hand.filter((c) => c.suit === lead.suit);

  if (sameSuit.length > 0) {
    // Ctít barvu; pokud lze přebít, musíš.
    const beaters = sameSuit.filter((c) => higher(lead, c));
    const pool = beaters.length > 0 ? beaters : sameSuit;
    return pool.map((c) => ({ type: 'play', cardId: c.id }));
  }
  // Nemám barvu → musím trumfovat, pokud mám.
  const trumps = hand.filter((c) => c.suit === state.trump);
  const pool = trumps.length > 0 ? trumps : hand;
  return pool.map((c) => ({ type: 'play', cardId: c.id }));
}

function trickWinner(state: MariasState): number {
  const [first, second] = state.trick;
  const L = first.card;
  const R = second.card;
  if (R.suit === L.suit) {
    return higher(L, R) ? second.player : first.player;
  }
  if (R.suit === state.trump && L.suit !== state.trump) return second.player;
  return first.player;
}

/** Zkontroluje hlášku při vynesení krále/svrška. */
function checkMarriage(state: MariasState, playerIdx: number, card: Card): void {
  if (card.rank !== 'K' && card.rank !== 'O') return;
  const partnerRank = card.rank === 'K' ? 'O' : 'K';
  const hasPartner = state.players[playerIdx].hand.some((c) => c.suit === card.suit && c.rank === partnerRank);
  if (!hasPartner) return;
  const key = `${playerIdx}-${card.suit}`;
  if (state.announced.includes(key)) return;
  state.announced.push(key);
  const pts = card.suit === state.trump ? 40 : 20;
  state.players[playerIdx].marriagePoints += pts;
  state.log.push({ key: 'marias.log.marriage', params: { name: state.players[playerIdx].name, pts } });
}

function finish(state: MariasState): void {
  const score = (i: number) => {
    let s = state.players[i].won.reduce((sum, c) => sum + cardPoints(c), 0);
    s += state.players[i].marriagePoints;
    if (state.lastTrickWinner === i) s += 10;
    return s;
  };
  const s0 = score(0);
  const s1 = score(1);
  state.scores = [s0, s1];
  if (s0 > s1) state.winner = state.players[0].id;
  else if (s1 > s0) state.winner = state.players[1].id;
  else state.winner = 'push';
  state.log.push({ key: 'marias.log.final', params: { a: s0, b: s1 } });
}

/** Aplikuje tah a vrátí NOVÝ stav (původní nemutuje). */
export function applyMove(prev: MariasState, move: MariasMove): MariasState {
  const state: MariasState = structuredClone(prev);
  state.log = [];
  if (state.winner) return state;

  const me = state.players[state.current];
  const idx = me.hand.findIndex((c) => c.id === move.cardId);
  if (idx === -1) return state;

  // Hláška se kontroluje při VYNESENÍ (trick je prázdný) a před odebráním karty z ruky.
  if (state.trick.length === 0) checkMarriage(state, state.current, me.hand[idx]);

  const card = me.hand.splice(idx, 1)[0];
  state.trick.push({ card, player: state.current });

  if (state.trick.length < 2) {
    state.current = (state.current + 1) % 2;
    return state;
  }

  // Štych je plný — vyhodnotíme.
  const winnerIdx = trickWinner(state);
  state.players[winnerIdx].won.push(...state.trick.map((t) => t.card));
  const pts = state.trick.reduce((s, t) => s + cardPoints(t.card), 0);
  state.lastTrickWinner = winnerIdx;
  state.log.push({ key: 'marias.log.trick', params: { name: state.players[winnerIdx].name, points: pts } });
  state.trick = [];
  state.leader = winnerIdx;
  state.current = winnerIdx;

  if (state.players.every((p) => p.hand.length === 0)) {
    finish(state);
  }
  return state;
}

export function isTerminal(state: MariasState): boolean {
  return state.winner !== null;
}
