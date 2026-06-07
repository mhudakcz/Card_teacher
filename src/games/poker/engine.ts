// Poker — Texas Hold'em, herní engine (čisté TS, nezná React). Heads-up (2 hráči).
//   • 52 francouzských karet, každý dostane 2 vlastní (hole) karty.
//   • Postupně přibývá 5 společných karet: flop (3), turn (1), river (1).
//   • Sázecí kola: preflop → flop → turn → river → showdown.
//   • Dealer (button) vkládá malý blind a hraje preflop první, postflop poslední.
//   • Bank získá nejlepší pětikartová kombinace, nebo poslední nesložený hráč.

import { type Card, frenchDeck, shuffle, seededRng } from '@/core/cards';
import { evaluate, compareScore, categoryName, type HandCategory } from './eval';

export const START_CHIPS = 1000;
export const SMALL_BLIND = 10;
export const BIG_BLIND = 20;
const HOLE = 2;

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'done';

export interface PokerPlayer {
  id: string;
  name: string;
  isHuman: boolean;
  hole: Card[];
  chips: number;
  bet: number; // vsazeno v aktuálním sázecím kole
  committed: number; // vsazeno celkem v tomto rozdání
  folded: boolean;
  allIn: boolean;
  hasActed: boolean; // jednal od posledního navýšení v tomto kole
}

export interface HandResult {
  winner: string; // id vítěze, nebo 'push' při dělení banku
  reason: 'fold' | 'showdown';
  potWon: number;
  winnerIdx?: number;
  category?: HandCategory; // kategorie vítězné kombinace (showdown)
}

export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export interface PokerState {
  players: PokerPlayer[];
  deck: Card[];
  community: Card[];
  pot: number;
  street: Street;
  button: number; // index dealera (malý blind)
  current: number; // kdo je na tahu
  betToMatch: number; // nejvyšší sázka v tomto kole
  minRaise: number; // minimální navýšení
  revealed: boolean; // odkryté karty soupeře (po showdownu)
  result: HandResult | null; // výsledek posledního rozdání
  winner: string | null; // id vítěze celé partie (soupeř bez žetonů)
  seed: number | null;
  log: LogEntry[];
}

export type PokerMove =
  | { type: 'fold' }
  | { type: 'check' }
  | { type: 'call' }
  | { type: 'raise'; to: number }
  | { type: 'nextHand' };

export interface PokerInitOptions {
  players: { id: string; name: string; isHuman: boolean }[];
  seed?: number;
}

function makeRng(state: PokerState): () => number {
  if (state.seed === null) return Math.random;
  const rng = seededRng(state.seed);
  state.seed = (state.seed + 0x9e3779b9) | 0;
  return rng;
}

function commit(state: PokerState, idx: number, amount: number): number {
  const p = state.players[idx];
  const pay = Math.min(Math.max(amount, 0), p.chips);
  p.chips -= pay;
  p.bet += pay;
  p.committed += pay;
  state.pot += pay;
  if (p.chips === 0) p.allIn = true;
  return pay;
}

function startHand(state: PokerState): void {
  const deck = shuffle(frenchDeck(), makeRng(state));
  state.community = [];
  state.pot = 0;
  state.street = 'preflop';
  state.revealed = false;
  state.result = null;
  state.betToMatch = 0;
  state.minRaise = BIG_BLIND;

  for (const p of state.players) {
    p.hole = [];
    p.bet = 0;
    p.committed = 0;
    p.folded = false;
    p.allIn = false;
    p.hasActed = false;
  }
  for (let r = 0; r < HOLE; r++) {
    for (const p of state.players) p.hole.push(deck.pop()!);
  }
  state.deck = deck;

  const sb = state.button;
  const bb = (state.button + 1) % state.players.length;
  commit(state, sb, SMALL_BLIND);
  commit(state, bb, BIG_BLIND);
  state.players[sb].hasActed = false;
  state.players[bb].hasActed = false;
  state.betToMatch = BIG_BLIND;
  state.minRaise = BIG_BLIND;
  state.current = sb; // heads-up: button hraje preflop první

  state.log.push({ key: 'poker.log.blinds', params: { sb: SMALL_BLIND, bb: BIG_BLIND } });
}

export function initPoker(opts: PokerInitOptions): PokerState {
  const state: PokerState = {
    players: opts.players.map((p) => ({
      ...p,
      hole: [],
      chips: START_CHIPS,
      bet: 0,
      committed: 0,
      folded: false,
      allIn: false,
      hasActed: false,
    })),
    deck: [],
    community: [],
    pot: 0,
    street: 'preflop',
    button: 0,
    current: 0,
    betToMatch: 0,
    minRaise: BIG_BLIND,
    revealed: false,
    result: null,
    winner: null,
    seed: opts.seed ?? null,
    log: [],
  };
  startHand(state);
  return state;
}

/** Kolik musí hráč na tahu dorovnat. */
export function callAmount(state: PokerState): number {
  const p = state.players[state.current];
  return Math.min(state.betToMatch - p.bet, p.chips);
}

/** Rozsah navýšení (cílová celková sázka v tomto kole), nebo null když nelze. */
export function raiseLimits(state: PokerState): { min: number; max: number } | null {
  const p = state.players[state.current];
  const toCall = state.betToMatch - p.bet;
  if (p.chips <= toCall) return null; // jen dorovnat all-in nebo složit
  const max = p.bet + p.chips;
  const min = Math.min(state.betToMatch + state.minRaise, max);
  return { min, max };
}

export function legalMoves(state: PokerState): PokerMove[] {
  if (state.winner) return [];
  if (state.street === 'done') return [{ type: 'nextHand' }];
  if (state.street === 'showdown') return [];
  const p = state.players[state.current];
  const toCall = state.betToMatch - p.bet;
  const moves: PokerMove[] = [{ type: 'fold' }];
  if (toCall === 0) moves.push({ type: 'check' });
  else moves.push({ type: 'call' });
  const lim = raiseLimits(state);
  if (lim) moves.push({ type: 'raise', to: lim.min });
  return moves;
}

function liveIndexes(state: PokerState): number[] {
  const out: number[] = [];
  for (let i = 0; i < state.players.length; i++) if (!state.players[i].folded) out.push(i);
  return out;
}

function bettingClosed(state: PokerState): boolean {
  const needAct = state.players.filter((p) => !p.folded && !p.allIn);
  return needAct.every((p) => p.hasActed && p.bet === state.betToMatch);
}

function nextActor(state: PokerState): number {
  const n = state.players.length;
  for (let step = 1; step <= n; step++) {
    const i = (state.current + step) % n;
    const p = state.players[i];
    if (!p.folded && !p.allIn) return i;
  }
  return state.current;
}

function firstToActPostflop(state: PokerState): number {
  const n = state.players.length;
  for (let step = 1; step <= n; step++) {
    const i = (state.button + step) % n;
    const p = state.players[i];
    if (!p.folded && !p.allIn) return i;
  }
  return state.button;
}

function advanceOneStreet(state: PokerState): void {
  for (const p of state.players) {
    p.bet = 0;
    p.hasActed = false;
  }
  state.betToMatch = 0;
  state.minRaise = BIG_BLIND;

  if (state.street === 'preflop') {
    for (let i = 0; i < 3; i++) state.community.push(state.deck.pop()!);
    state.street = 'flop';
  } else if (state.street === 'flop') {
    state.community.push(state.deck.pop()!);
    state.street = 'turn';
  } else if (state.street === 'turn') {
    state.community.push(state.deck.pop()!);
    state.street = 'river';
  } else if (state.street === 'river') {
    state.street = 'showdown';
  }
}

function checkMatchWinner(state: PokerState): void {
  const alive = state.players.filter((p) => p.chips > 0);
  if (alive.length === 1) state.winner = alive[0].id;
}

function awardFold(state: PokerState, winnerIdx: number): void {
  const w = state.players[winnerIdx];
  const potWon = state.pot;
  w.chips += state.pot;
  state.pot = 0;
  state.result = { winner: w.id, reason: 'fold', potWon, winnerIdx };
  state.log.push({ key: 'poker.log.wins', params: { name: w.name, pot: potWon } });
  state.street = 'done';
  checkMatchWinner(state);
}

function showdown(state: PokerState): void {
  state.revealed = true;
  const live = liveIndexes(state);

  // Vrácení přeplatku (heads-up): kdo vsadil víc, než mohl soupeř dorovnat.
  if (live.length === 2) {
    const [a, b] = live;
    const diff = state.players[a].committed - state.players[b].committed;
    if (diff > 0) {
      state.players[a].chips += diff;
      state.pot -= diff;
    } else if (diff < 0) {
      state.players[b].chips += -diff;
      state.pot -= -diff;
    }
  }

  const scored = live.map((i) => ({ i, score: evaluate([...state.players[i].hole, ...state.community]) }));
  scored.sort((x, y) => compareScore(y.score, x.score));
  const best = scored[0].score;
  const winners = scored.filter((s) => compareScore(s.score, best) === 0).map((s) => s.i);
  const potWon = state.pot;

  if (winners.length === 1) {
    const w = winners[0];
    state.players[w].chips += state.pot;
    state.result = {
      winner: state.players[w].id,
      reason: 'showdown',
      potWon,
      winnerIdx: w,
      category: categoryName(best),
    };
    state.log.push({ key: 'poker.log.wins', params: { name: state.players[w].name, pot: potWon } });
  } else {
    const share = Math.floor(state.pot / winners.length);
    let rem = state.pot - share * winners.length;
    for (const w of winners) {
      state.players[w].chips += share + (rem > 0 ? 1 : 0);
      if (rem > 0) rem--;
    }
    state.result = { winner: 'push', reason: 'showdown', potWon, category: categoryName(best) };
    state.log.push({ key: 'poker.log.split', params: { pot: potWon } });
  }
  state.pot = 0;
  state.street = 'done';
  checkMatchWinner(state);
}

function runStreets(state: PokerState): void {
  for (;;) {
    advanceOneStreet(state);
    if (state.street === 'showdown') {
      showdown(state);
      return;
    }
    const wagerers = state.players.filter((p) => !p.folded && !p.allIn);
    if (wagerers.length >= 2) {
      state.current = firstToActPostflop(state);
      return;
    }
    // Nikdo (nebo jen jeden) už nemůže sázet → automaticky dotočíme karty.
  }
}

function progress(state: PokerState): void {
  const live = liveIndexes(state);
  if (live.length === 1) {
    awardFold(state, live[0]);
    return;
  }
  if (bettingClosed(state)) {
    runStreets(state);
  } else {
    state.current = nextActor(state);
  }
}

/** Aplikuje tah a vrátí NOVÝ stav (původní nemutuje). */
export function applyMove(prev: PokerState, move: PokerMove): PokerState {
  const state: PokerState = structuredClone(prev);
  state.log = [];

  if (move.type === 'nextHand') {
    if (state.winner || state.street !== 'done') return state;
    state.button = (state.button + 1) % state.players.length;
    startHand(state);
    return state;
  }

  if (state.winner || state.street === 'done' || state.street === 'showdown') return state;

  const cur = state.current;
  const p = state.players[cur];
  const toCall = state.betToMatch - p.bet;

  switch (move.type) {
    case 'fold':
      p.folded = true;
      p.hasActed = true;
      state.log.push({ key: 'poker.log.folds', params: { name: p.name } });
      break;
    case 'check':
      if (toCall !== 0) return state; // nelze čekat, je co dorovnat
      p.hasActed = true;
      state.log.push({ key: 'poker.log.checks', params: { name: p.name } });
      break;
    case 'call': {
      const pay = commit(state, cur, toCall);
      p.hasActed = true;
      state.log.push({ key: 'poker.log.calls', params: { name: p.name, amount: pay } });
      break;
    }
    case 'raise': {
      const maxTo = p.bet + p.chips;
      let to = Math.min(move.to, maxTo);
      const minTo = Math.min(state.betToMatch + state.minRaise, maxTo);
      if (to < minTo) to = minTo;
      const inc = to - p.bet;
      if (inc <= 0 || inc > p.chips) return state; // neplatné navýšení
      const prevBetToMatch = state.betToMatch;
      commit(state, cur, inc);
      const raiseAmount = p.bet - prevBetToMatch;
      if (raiseAmount >= state.minRaise) state.minRaise = raiseAmount;
      state.betToMatch = Math.max(state.betToMatch, p.bet);
      for (let i = 0; i < state.players.length; i++) {
        if (i !== cur && !state.players[i].folded && !state.players[i].allIn) state.players[i].hasActed = false;
      }
      p.hasActed = true;
      state.log.push({ key: 'poker.log.raises', params: { name: p.name, to: state.betToMatch } });
      break;
    }
  }

  progress(state);
  return state;
}

export function isTerminal(state: PokerState): boolean {
  return state.winner !== null;
}
