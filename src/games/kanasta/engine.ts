// Kanasta — zjednodušený engine (čisté TS, nezná React). Heads-up (2 hráči, bez týmů).
//   • 2 francouzské balíčky + 4 žolíci (108 karet). Každý dostane 11 karet.
//   • Tah: líznout (z balíčku nebo vrchní z odhazováku) → volitelně vyložit/rozšířit sestavy → odhodit.
//   • Sestava = 3+ karty STEJNÉ hodnoty; divoké (žolík, dvojka) doplňují (min. 2 přirozené, max. 3 divoké).
//   • Kanasta = sestava o 7+ kartách: čistá 500 b., smíšená 300 b.
//   • Červené trojky (srdce/káry): bonus 100 b., odkládají se stranou.
//   • „Jít ven" (vyprázdnit ruku) smí jen ten, kdo má aspoň jednu kanastu. Bonus 100 b.

import { type Card, frenchDeckN, isJoker, shuffle } from '@/core/cards';

export const HAND = 11;
export const GO_OUT_BONUS = 100;

export interface Meld {
  rank: string; // přirozená hodnota sestavy
  cards: Card[];
}

export interface KanastaPlayer {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  melds: Meld[];
  redThrees: Card[];
}

export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export type KanastaPhase = 'draw' | 'play';

export interface KanastaState {
  players: KanastaPlayer[];
  stock: Card[];
  discard: Card[];
  current: number;
  phase: KanastaPhase;
  winner: string | null;
  scores: [number, number] | null;
  log: LogEntry[];
}

export type KanastaMove =
  | { type: 'drawStock' }
  | { type: 'drawDiscard' }
  | { type: 'layMeld'; cardIds: string[] }
  | { type: 'addToMeld'; meldIndex: number; cardIds: string[] }
  | { type: 'discard'; cardId: string };

export interface KanastaInitOptions {
  players: { id: string; name: string; isHuman: boolean }[];
  rng?: () => number;
}

export function isWild(card: Card): boolean {
  return isJoker(card) || card.rank === '2';
}

export function isRedThree(card: Card): boolean {
  return card.rank === '3' && (card.suit === 'hearts' || card.suit === 'diamonds');
}

export function cardValue(card: Card): number {
  if (isJoker(card)) return 50;
  if (card.rank === 'A' || card.rank === '2') return 20;
  if (['K', 'Q', 'J', '10', '9', '8'].includes(card.rank)) return 10;
  return 5; // 3,4,5,6,7
}

export function isCanasta(meld: Meld): boolean {
  return meld.cards.length >= 7;
}

export function isPureCanasta(meld: Meld): boolean {
  return isCanasta(meld) && meld.cards.every((c) => !isWild(c));
}

export function hasCanasta(p: KanastaPlayer): boolean {
  return p.melds.some(isCanasta);
}

/** Je seznam karet platná NOVÁ sestava? Vrací přirozenou hodnotu nebo null. */
export function meldRank(cards: Card[]): string | null {
  if (cards.length < 3) return null;
  const naturals = cards.filter((c) => !isWild(c));
  const wilds = cards.filter(isWild);
  if (naturals.length < 2) return null;
  if (wilds.length > 3) return null;
  const rank = naturals[0].rank;
  if (rank === '3') return null; // trojky se nemeldují (červené jsou bonus, černé jen 5 b.)
  if (!naturals.every((c) => c.rank === rank)) return null;
  return rank;
}

/** Lze tyto karty přidat k existující sestavě? */
function canExtend(meld: Meld, cards: Card[]): boolean {
  const naturals = cards.filter((c) => !isWild(c));
  if (!naturals.every((c) => c.rank === meld.rank)) return false;
  const wildsAfter = [...meld.cards, ...cards].filter(isWild).length;
  const natAfter = [...meld.cards, ...cards].filter((c) => !isWild(c)).length;
  return wildsAfter <= 3 && natAfter >= 2;
}

export function initKanasta(opts: KanastaInitOptions): KanastaState {
  const rng = opts.rng ?? Math.random;
  const stock = shuffle(frenchDeckN(2, 4), rng);

  const players: KanastaPlayer[] = opts.players.map((p) => ({
    ...p,
    hand: [],
    melds: [],
    redThrees: [],
  }));
  for (let r = 0; r < HAND; r++) {
    for (const p of players) {
      let card = stock.pop()!;
      // Červené trojky se rovnou odkládají a líže se náhrada.
      while (isRedThree(card)) {
        p.redThrees.push(card);
        card = stock.pop()!;
      }
      p.hand.push(card);
    }
  }
  sortHand(players[0].hand);
  sortHand(players[1].hand);
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

export function topDiscard(state: KanastaState): Card | undefined {
  return state.discard[state.discard.length - 1];
}

const RANK_ORDER: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  J: 11, Q: 12, K: 13, A: 14, JOKER: 99,
};

function sortHand(hand: Card[]): void {
  hand.sort((a, b) => (RANK_ORDER[a.rank] ?? 0) - (RANK_ORDER[b.rank] ?? 0) || a.suit.localeCompare(b.suit));
}

export function legalMoves(state: KanastaState): KanastaMove[] {
  if (state.winner) return [];
  const p = state.players[state.current];
  if (state.phase === 'draw') {
    const moves: KanastaMove[] = [{ type: 'drawStock' }];
    if (state.discard.length > 0) moves.push({ type: 'drawDiscard' });
    return moves;
  }
  // play: může odhodit kteroukoli kartu (meldy jsou volitelné a řeší se zvlášť)
  return p.hand.map((c) => ({ type: 'discard', cardId: c.id }));
}

function takeFromHand(p: KanastaPlayer, ids: string[]): Card[] | null {
  const picked: Card[] = [];
  for (const id of ids) {
    const c = p.hand.find((x) => x.id === id);
    if (!c) return null;
    picked.push(c);
  }
  return picked;
}

function drawReplacingRedThrees(state: KanastaState, p: KanastaPlayer): Card | null {
  while (state.stock.length > 0) {
    const card = state.stock.pop()!;
    if (isRedThree(card)) {
      p.redThrees.push(card);
      state.log.push({ key: 'kanasta.log.redThree', params: { name: p.name } });
      continue;
    }
    return card;
  }
  return null;
}

/** Aplikuje tah a vrátí NOVÝ stav (původní nemutuje). */
export function applyMove(prev: KanastaState, move: KanastaMove): KanastaState {
  const state: KanastaState = structuredClone(prev);
  state.log = [];
  if (state.winner) return state;
  const p = state.players[state.current];

  if (move.type === 'drawStock') {
    if (state.phase !== 'draw') return state;
    const card = drawReplacingRedThrees(state, p);
    if (!card) {
      finish(state);
      return state;
    }
    p.hand.push(card);
    sortHand(p.hand);
    state.phase = 'play';
    state.log.push({ key: 'kanasta.log.drewStock', params: { name: p.name } });
    return state;
  }

  if (move.type === 'drawDiscard') {
    if (state.phase !== 'draw' || state.discard.length === 0) return state;
    p.hand.push(state.discard.pop()!);
    sortHand(p.hand);
    state.phase = 'play';
    state.log.push({ key: 'kanasta.log.drewDiscard', params: { name: p.name } });
    return state;
  }

  if (move.type === 'layMeld') {
    if (state.phase !== 'play') return state;
    const cards = takeFromHand(p, move.cardIds);
    if (!cards) return state;
    const rank = meldRank(cards);
    if (!rank) return state;
    for (const c of cards) p.hand.splice(p.hand.findIndex((x) => x.id === c.id), 1);
    p.melds.push({ rank, cards });
    state.log.push({ key: 'kanasta.log.melded', params: { name: p.name, rank } });
    handleEmptyAfterMeld(state, p);
    return state;
  }

  if (move.type === 'addToMeld') {
    if (state.phase !== 'play') return state;
    const meld = p.melds[move.meldIndex];
    if (!meld) return state;
    const cards = takeFromHand(p, move.cardIds);
    if (!cards || cards.length === 0) return state;
    if (!canExtend(meld, cards)) return state;
    for (const c of cards) p.hand.splice(p.hand.findIndex((x) => x.id === c.id), 1);
    meld.cards.push(...cards);
    state.log.push({ key: 'kanasta.log.extended', params: { name: p.name, rank: meld.rank } });
    handleEmptyAfterMeld(state, p);
    return state;
  }

  // discard — ukončí tah
  if (state.phase !== 'play') return state;
  const idx = p.hand.findIndex((c) => c.id === move.cardId);
  if (idx === -1) return state;
  const card = p.hand.splice(idx, 1)[0];
  state.discard.push(card);
  state.log.push({ key: 'kanasta.log.discarded', params: { name: p.name } });

  // „Jít ven": prázdná ruka + aspoň jedna kanasta.
  if (p.hand.length === 0 && hasCanasta(p)) {
    state.log.push({ key: 'kanasta.log.out', params: { name: p.name } });
    finish(state, state.current);
    return state;
  }

  state.current = (state.current + 1) % state.players.length;
  state.phase = 'draw';
  return state;
}

/** Pokud hráč vyložil úplně celou ruku: s kanastou jde ven, jinak končí tah (líznutí příště). */
function handleEmptyAfterMeld(state: KanastaState, p: KanastaPlayer): void {
  if (p.hand.length > 0) return;
  if (hasCanasta(p)) {
    state.log.push({ key: 'kanasta.log.out', params: { name: p.name } });
    finish(state, state.current);
  } else {
    state.current = (state.current + 1) % state.players.length;
    state.phase = 'draw';
  }
}

export function playerScore(p: KanastaPlayer, wentOut: boolean): number {
  let s = 0;
  for (const meld of p.melds) {
    s += meld.cards.reduce((sum, c) => sum + cardValue(c), 0);
    if (isPureCanasta(meld)) s += 500;
    else if (isCanasta(meld)) s += 300;
  }
  s += p.redThrees.length * 100;
  s -= p.hand.reduce((sum, c) => sum + cardValue(c), 0);
  if (wentOut) s += GO_OUT_BONUS;
  return s;
}

function finish(state: KanastaState, wentOutIdx: number | null = null): void {
  const s0 = playerScore(state.players[0], wentOutIdx === 0);
  const s1 = playerScore(state.players[1], wentOutIdx === 1);
  state.scores = [s0, s1];
  if (s0 > s1) state.winner = state.players[0].id;
  else if (s1 > s0) state.winner = state.players[1].id;
  else state.winner = 'push';
  state.log.push({ key: 'kanasta.log.final', params: { a: s0, b: s1 } });
}

export function isTerminal(state: KanastaState): boolean {
  return state.winner !== null;
}
