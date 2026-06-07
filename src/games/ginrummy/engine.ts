// Gin Rummy — dvouhráčská klasika na 52 karet.
// Hráč lízne (z balíčku nebo z odhazováku), odhodí a může „klepnout",
// když má neslozené karty (deadwood) v hodnotě nejvýš 10 (gin = 0).

import { type Card, frenchDeck, shuffle } from '@/core/cards';

export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
}

export type Phase = 'draw' | 'discard';

export interface KnockResult {
  knockerId: string;
  winnerId: string | null; // null = remíza
  gin: boolean;
  undercut: boolean;
  points: number;
  knockerDeadwood: number;
  oppDeadwood: number;
}

export interface GinState {
  stock: Card[];
  discard: Card[]; // vrchní = poslední prvek
  players: [Player, Player];
  current: 0 | 1;
  phase: Phase;
  over: boolean;
  result: KnockResult | null;
  log: LogEntry[];
}

export type GinMove =
  | { type: 'draw'; from: 'stock' | 'discard' }
  | { type: 'discard'; cardId: string; knock?: boolean };

const HAND_SIZE = 10;
const KNOCK_LIMIT = 10;

const RUN_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function runRank(card: Card): number {
  return RUN_ORDER.indexOf(card.rank);
}

/** Bodová hodnota karty pro deadwood (A=1, 2–9 dle čísla, 10/J/Q/K=10). */
export function cardValue(card: Card): number {
  const r = card.rank;
  if (r === 'A') return 1;
  if (r === '10' || r === 'J' || r === 'Q' || r === 'K') return 10;
  return parseInt(r, 10);
}

// ---- Rozbor ruky: nejlepší sestavy a minimální deadwood ----

function buildMelds(cards: Card[]): number[] {
  const melds: number[] = [];
  const n = cards.length;

  // Trojice/čtveřice (sety) — stejná hodnota.
  const byRank = new Map<string, number[]>();
  cards.forEach((c, i) => {
    const arr = byRank.get(c.rank) ?? [];
    arr.push(i);
    byRank.set(c.rank, arr);
  });
  for (const idxs of byRank.values()) {
    if (idxs.length >= 3) {
      // všechny podmnožiny velikosti 3
      for (let a = 0; a < idxs.length; a++) {
        for (let b = a + 1; b < idxs.length; b++) {
          for (let c = b + 1; c < idxs.length; c++) {
            melds.push((1 << idxs[a]) | (1 << idxs[b]) | (1 << idxs[c]));
          }
        }
      }
      if (idxs.length === 4) {
        melds.push(idxs.reduce((m, i) => m | (1 << i), 0));
      }
    }
  }

  // Postupky (runs) — stejná barva, po sobě jdoucí hodnoty.
  const bySuit = new Map<string, number[]>();
  cards.forEach((c, i) => {
    const arr = bySuit.get(c.suit) ?? [];
    arr.push(i);
    bySuit.set(c.suit, arr);
  });
  for (const idxs of bySuit.values()) {
    const sorted = idxs.slice().sort((x, y) => runRank(cards[x]) - runRank(cards[y]));
    // rozděl na bloky po sobě jdoucích hodnot
    let block: number[] = [];
    const flush = () => {
      for (let start = 0; start < block.length; start++) {
        for (let len = 3; start + len <= block.length; len++) {
          let mask = 0;
          for (let k = start; k < start + len; k++) mask |= 1 << block[k];
          melds.push(mask);
        }
      }
      block = [];
    };
    for (let i = 0; i < sorted.length; i++) {
      if (block.length === 0) {
        block.push(sorted[i]);
      } else {
        const prev = cards[block[block.length - 1]];
        const cur = cards[sorted[i]];
        if (runRank(cur) === runRank(prev) + 1) block.push(sorted[i]);
        else {
          flush();
          block.push(sorted[i]);
        }
      }
    }
    flush();
    void n;
  }
  return melds;
}

export interface Analysis {
  melds: Card[][];
  deadwood: Card[];
  value: number;
}

/** Najde rozklad ruky na sestavy s nejmenším možným deadwoodem. */
export function analyze(cards: Card[]): Analysis {
  const melds = buildMelds(cards);
  const value = cards.map(cardValue);
  const full = (1 << cards.length) - 1;
  const memo = new Map<number, { val: number; meld: number | -1 }>();

  function solve(mask: number): { val: number; meld: number | -1 } {
    if (mask === 0) return { val: 0, meld: -1 };
    const cached = memo.get(mask);
    if (cached) return cached;
    // nejnižší přítomný bit
    let i = 0;
    while (((mask >> i) & 1) === 0) i++;
    // varianta 1: karta i je deadwood
    let best = { val: value[i] + solve(mask & ~(1 << i)).val, meld: -1 };
    // varianta 2: karta i je součástí nějaké sestavy uvnitř mask
    for (const m of melds) {
      if ((m & (1 << i)) && (m & mask) === m) {
        const v = solve(mask & ~m).val;
        if (v < best.val) best = { val: v, meld: m };
      }
    }
    memo.set(mask, best);
    return best;
  }

  // rekonstrukce
  const usedMelds: Card[][] = [];
  let mask = full;
  const deadIdx: number[] = [];
  while (mask !== 0) {
    let i = 0;
    while (((mask >> i) & 1) === 0) i++;
    const step = solve(mask);
    if (step.meld === -1) {
      deadIdx.push(i);
      mask &= ~(1 << i);
    } else {
      const meldCards: Card[] = [];
      for (let k = 0; k < cards.length; k++) if (step.meld & (1 << k)) meldCards.push(cards[k]);
      usedMelds.push(meldCards);
      mask &= ~step.meld;
    }
  }
  const deadwood = deadIdx.map((i) => cards[i]);
  return { melds: usedMelds, deadwood, value: solve(full).val };
}

export function deadwoodValue(cards: Card[]): number {
  return analyze(cards).value;
}

// ---- Layoff: přiložení deadwoodu protihráče na klepačovy sestavy ----

function canExtend(meld: Card[], card: Card): boolean {
  if (meld.length === 0) return false;
  const isRun = meld[0].suit === meld[1].suit && runRank(meld[1]) === runRank(meld[0]) + 1;
  if (isRun) {
    if (card.suit !== meld[0].suit) return false;
    const ranks = meld.map(runRank).sort((a, b) => a - b);
    const lo = ranks[0];
    const hi = ranks[ranks.length - 1];
    return runRank(card) === lo - 1 || runRank(card) === hi + 1;
  }
  // set
  return card.rank === meld[0].rank && meld.length < 4;
}

/** Vrátí deadwood protihráče po přiložení na klepačovy sestavy. */
function deadwoodAfterLayoff(deadwood: Card[], knockerMelds: Card[][]): number {
  const melds = knockerMelds.map((m) => m.slice());
  let remaining = deadwood.slice();
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < remaining.length; i++) {
      const card = remaining[i];
      for (const m of melds) {
        if (canExtend(m, card)) {
          m.push(card);
          remaining.splice(i, 1);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }
  return remaining.reduce((s, c) => s + cardValue(c), 0);
}

// ---- Inicializace a tahy ----

export interface InitOptions {
  players?: { id: string; name: string; isHuman: boolean }[];
  rng?: () => number;
}

export function initGin(opts: InitOptions = {}): GinState {
  const rng = opts.rng ?? Math.random;
  const meta = opts.players ?? [
    { id: 'you', name: 'Ty', isHuman: true },
    { id: 'ai', name: 'Počítač', isHuman: false },
  ];
  const deck = shuffle(frenchDeck(), rng);
  const players: Player[] = meta.slice(0, 2).map((m) => ({ ...m, hand: [] }));
  for (let i = 0; i < HAND_SIZE; i++) {
    for (const p of players) {
      const c = deck.pop();
      if (c) p.hand.push(c);
    }
  }
  const up = deck.pop()!;
  return {
    stock: deck,
    discard: [up],
    players: players as [Player, Player],
    current: 0,
    phase: 'draw',
    over: false,
    result: null,
    log: [],
  };
}

export function legalMoves(s: GinState): GinMove[] {
  if (s.over) return [];
  const moves: GinMove[] = [];
  if (s.phase === 'draw') {
    if (s.stock.length > 0) moves.push({ type: 'draw', from: 'stock' });
    if (s.discard.length > 0) moves.push({ type: 'draw', from: 'discard' });
    return moves;
  }
  // discard: každá karta v ruce; knock jen když po odhození deadwood ≤ 10
  const hand = s.players[s.current].hand;
  for (const c of hand) {
    moves.push({ type: 'discard', cardId: c.id });
    const remaining = hand.filter((x) => x.id !== c.id);
    if (deadwoodValue(remaining) <= KNOCK_LIMIT) {
      moves.push({ type: 'discard', cardId: c.id, knock: true });
    }
  }
  return moves;
}

function resolveKnock(s: GinState, knocker: 0 | 1): void {
  const opp = (knocker === 0 ? 1 : 0) as 0 | 1;
  const kA = analyze(s.players[knocker].hand);
  const oA = analyze(s.players[opp].hand);
  const Dk = kA.value;
  const gin = Dk === 0;
  const oppFull = oA.value;
  const Do = gin ? oppFull : deadwoodAfterLayoff(oA.deadwood, kA.melds);

  let winnerId: string | null;
  let undercut = false;
  let points: number;
  if (gin) {
    winnerId = s.players[knocker].id;
    points = oppFull + 25;
  } else if (Do <= Dk) {
    // undercut — vyhrává obránce
    undercut = true;
    winnerId = s.players[opp].id;
    points = Dk - Do + 25;
  } else {
    winnerId = s.players[knocker].id;
    points = Do - Dk;
  }

  s.over = true;
  s.result = {
    knockerId: s.players[knocker].id,
    winnerId,
    gin,
    undercut,
    points,
    knockerDeadwood: Dk,
    oppDeadwood: Do,
  };
  s.log.push({
    key: gin ? 'ginrummy.log.gin' : undercut ? 'ginrummy.log.undercut' : 'ginrummy.log.knock',
    params: { name: s.players[knocker].name, points },
  });
}

export function applyMove(prev: GinState, move: GinMove): GinState {
  if (prev.over) return prev;
  const s: GinState = structuredClone(prev);
  s.log = [];
  const cur = s.current;
  const hand = s.players[cur].hand;

  if (move.type === 'draw') {
    if (s.phase !== 'draw') return prev;
    if (move.from === 'stock') {
      if (s.stock.length === 0) return prev;
      hand.push(s.stock.pop()!);
      s.log.push({ key: 'ginrummy.log.drewStock', params: { name: s.players[cur].name } });
    } else {
      if (s.discard.length === 0) return prev;
      hand.push(s.discard.pop()!);
      s.log.push({ key: 'ginrummy.log.drewDiscard', params: { name: s.players[cur].name } });
    }
    s.phase = 'discard';
    return s;
  }

  // discard
  if (s.phase !== 'discard') return prev;
  const idx = hand.findIndex((c) => c.id === move.cardId);
  if (idx === -1) return prev;
  const [card] = hand.splice(idx, 1);
  s.discard.push(card);
  s.log.push({ key: 'ginrummy.log.discarded', params: { name: s.players[cur].name } });

  if (move.knock) {
    if (deadwoodValue(hand) > KNOCK_LIMIT) return prev;
    resolveKnock(s, cur);
    return s;
  }

  // konec balíčku bez klepnutí → remíza
  if (s.stock.length === 0) {
    s.over = true;
    s.result = {
      knockerId: '',
      winnerId: null,
      gin: false,
      undercut: false,
      points: 0,
      knockerDeadwood: 0,
      oppDeadwood: 0,
    };
    s.log.push({ key: 'ginrummy.log.draw' });
    return s;
  }

  s.current = (cur === 0 ? 1 : 0) as 0 | 1;
  s.phase = 'draw';
  return s;
}

export function isTerminal(s: GinState): boolean {
  return s.over;
}
