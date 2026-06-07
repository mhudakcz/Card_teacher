// Oko bere (české 21) — herní engine (čisté TS, nezná React).
// Blackjackový princip s 32 sedláckými kartami. Hráč proti krupiérovi.
//   • Hodnoty: A = 11 (měkká, padá na 1), 10 = 10, K = 4, O = 3, U = 2,
//     9/8/7 podle čísla.
//   • Cíl: co nejblíž 21 (oko), ale ne přes. Přetažení = prohra.
//   • Hráč „bere" (hit) nebo „stojí" (stand). Pak hraje krupiér: dobírá,
//     dokud nemá aspoň 17.

import { type Card, czechDeck, shuffle } from '@/core/cards';

export interface OkoPlayer {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  stood: boolean;
  busted: boolean;
}

export type OkoPhase = 'player' | 'dealer' | 'done';

export interface OkoState {
  players: OkoPlayer[]; // [0] = hráč, [1] = krupiér
  deck: Card[];
  current: number;
  phase: OkoPhase;
  winner: string | null; // id vítěze, nebo 'push' při remíze
  log: LogEntry[];
}

export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export type OkoMove = { type: 'hit' } | { type: 'stand' };

export interface OkoInitOptions {
  players: { id: string; name: string; isHuman: boolean }[];
  rng?: () => number;
}

const TARGET = 21;
const DEALER_STANDS_AT = 17;

const CARD_VALUE: Record<string, number> = {
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  U: 2,
  O: 3,
  K: 4,
  A: 11,
};

/** Nejlepší součet ≤ 21: esa berou 11, případně klesnou na 1. */
export function handValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    total += CARD_VALUE[c.rank];
    if (c.rank === 'A') aces++;
  }
  while (total > TARGET && aces > 0) {
    total -= 10; // eso 11 → 1
    aces--;
  }
  return total;
}

export function isBust(hand: Card[]): boolean {
  return handValue(hand) > TARGET;
}

export function initOko(opts: OkoInitOptions): OkoState {
  const rng = opts.rng ?? Math.random;
  const deck = shuffle(czechDeck(), rng);

  const players: OkoPlayer[] = opts.players.map((p) => ({
    ...p,
    hand: [],
    stood: false,
    busted: false,
  }));

  // Po dvou kartách každému.
  for (let r = 0; r < 2; r++) {
    for (const p of players) p.hand.push(deck.pop()!);
  }

  return {
    players,
    deck,
    current: 0,
    phase: 'player',
    winner: null,
    log: [],
  };
}

export function legalMoves(state: OkoState): OkoMove[] {
  if (state.phase === 'done') return [];
  const me = state.players[state.current];
  if (me.stood || me.busted) return [];
  return [{ type: 'hit' }, { type: 'stand' }];
}

function settle(state: OkoState): void {
  const [player, dealer] = state.players;
  const pv = handValue(player.hand);
  const dv = handValue(dealer.hand);

  let winner: string;
  if (player.busted) winner = dealer.id;
  else if (dealer.busted) winner = player.id;
  else if (pv > dv) winner = player.id;
  else if (dv > pv) winner = dealer.id;
  else winner = 'push';

  state.winner = winner;
  state.phase = 'done';
  state.log.push({ key: 'oko.result', params: { player: pv, dealer: dv } });
}

/** Aplikuje tah a vrátí NOVÝ stav (původní nemutuje). */
export function applyMove(prev: OkoState, move: OkoMove): OkoState {
  const state: OkoState = structuredClone(prev);
  state.log = [];
  if (state.phase === 'done') return state;

  const me = state.players[state.current];

  if (move.type === 'hit') {
    const card = state.deck.pop();
    if (card) me.hand.push(card);
    state.log.push({ key: 'oko.hit', params: { name: me.name } });
    if (isBust(me.hand)) {
      me.busted = true;
      state.log.push({ key: 'oko.bust', params: { name: me.name } });
      advance(state);
    }
    return state;
  }

  // stand
  me.stood = true;
  state.log.push({ key: 'oko.stand', params: { name: me.name } });
  advance(state);
  return state;
}

/** Posune hru dál: z hráče na krupiéra, a z krupiéra na vyhodnocení. */
function advance(state: OkoState): void {
  if (state.phase === 'player') {
    state.phase = 'dealer';
    state.current = 1;
  } else if (state.phase === 'dealer') {
    settle(state);
  }
}

/** Tah krupiéra podle pevného pravidla: dobírej do 17. */
export function dealerMove(state: OkoState): OkoMove {
  const dealer = state.players[1];
  return handValue(dealer.hand) < DEALER_STANDS_AT ? { type: 'hit' } : { type: 'stand' };
}

export function isTerminal(state: OkoState): boolean {
  return state.phase === 'done';
}
