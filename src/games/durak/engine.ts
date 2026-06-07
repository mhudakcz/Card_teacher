// Durak (ruský „blázen") — zjednodušená dvouhráčová varianta.
// 36 karet (6..A), spodní karta určuje trumf. Útočník přihrává karty,
// obránce je musí přebít vyšší kartou téže barvy nebo trumfem, jinak bere.

import { type Card, frenchDeck, type FrenchSuit, shuffle } from '@/core/cards';

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

/** Jedna dvojice na stole: útočná karta a (volitelná) obranná. */
export interface TablePair {
  attack: Card;
  defense: Card | null;
}

export interface DurakState {
  deck: Card[]; // dobírací balíček; trumfová karta je na indexu 0 (líznuta poslední)
  trumpSuit: FrenchSuit;
  trumpCard: Card; // spodní karta (jen k zobrazení)
  discard: number; // počet karet v „odpadu" (bito)
  players: [Player, Player];
  attacker: 0 | 1; // kdo útočí v aktuálním kole
  table: TablePair[];
  over: boolean;
  durak: string | null; // id poraženého (null = remíza)
  log: LogEntry[];
}

export type DurakMove =
  | { type: 'attack'; cardId: string }
  | { type: 'defend'; cardId: string }
  | { type: 'take' }
  | { type: 'done' }; // „bito" — útok končí, přebité karty jdou do odpadu

export const DURAK_RANKS = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
const RANK_VALUE: Record<string, number> = {
  '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13, A: 14,
};

export function rankValue(card: Card): number {
  return RANK_VALUE[card.rank] ?? 0;
}

/** 36karetní balíček pro Durak (6..A ze 4 francouzských barev). */
export function durakDeck(): Card[] {
  return frenchDeck().filter((c) => c.rank in RANK_VALUE);
}

const MAX_ATTACKS = 6;
const HAND_SIZE = 6;

/** Přebíjí karta `def` útočnou kartu `atk`? (vyšší v téže barvě, nebo trumf na netrumf). */
export function beats(def: Card, atk: Card, trumpSuit: FrenchSuit): boolean {
  const defTrump = def.suit === trumpSuit;
  const atkTrump = atk.suit === trumpSuit;
  if (defTrump && !atkTrump) return true;
  if (!defTrump && atkTrump) return false;
  // stejná „trumfovost" → musí být stejná barva a vyšší hodnota
  return def.suit === atk.suit && rankValue(def) > rankValue(atk);
}

export function defender(s: DurakState): 0 | 1 {
  return s.attacker === 0 ? 1 : 0;
}

/** Existuje na stole nepřebitá útočná karta? */
function hasOpenAttack(s: DurakState): boolean {
  return s.table.some((t) => t.defense === null);
}

/** Kdo je právě na tahu (útočník přihrává/ukončuje, obránce brání/bere). */
export function currentPlayer(s: DurakState): 0 | 1 {
  return hasOpenAttack(s) ? defender(s) : s.attacker;
}

/** Hodnoty, které už leží na stole (na ně smí útočník přihrávat). */
function ranksOnTable(s: DurakState): Set<string> {
  const set = new Set<string>();
  for (const t of s.table) {
    set.add(t.attack.rank);
    if (t.defense) set.add(t.defense.rank);
  }
  return set;
}

export interface InitOptions {
  players?: { id: string; name: string; isHuman: boolean }[];
  rng?: () => number;
}

export function initDurak(opts: InitOptions = {}): DurakState {
  const rng = opts.rng ?? Math.random;
  const meta = opts.players ?? [
    { id: 'you', name: 'Ty', isHuman: true },
    { id: 'ai', name: 'Počítač', isHuman: false },
  ];
  const deck = shuffle(durakDeck(), rng);
  const trumpCard = deck[0];
  const trumpSuit = trumpCard.suit as FrenchSuit;

  const players: Player[] = meta.slice(0, 2).map((m) => ({ ...m, hand: [] }));
  // Rozdej po 6 z vrchu (konce pole), trumf zůstává na spodu.
  for (let i = 0; i < HAND_SIZE; i++) {
    for (const p of players) {
      const card = deck.pop();
      if (card) p.hand.push(card);
    }
  }

  // Útočí ten, kdo drží nejnižší trumf; jinak hráč 0.
  let attacker: 0 | 1 = 0;
  let lowest = Infinity;
  players.forEach((p, idx) => {
    for (const c of p.hand) {
      if (c.suit === trumpSuit && rankValue(c) < lowest) {
        lowest = rankValue(c);
        attacker = idx as 0 | 1;
      }
    }
  });

  return {
    deck,
    trumpSuit,
    trumpCard,
    discard: 0,
    players: players as [Player, Player],
    attacker,
    table: [],
    over: false,
    durak: null,
    log: [],
  };
}

function sortHand(hand: Card[], trumpSuit: FrenchSuit): void {
  hand.sort((a, b) => {
    const at = a.suit === trumpSuit ? 1 : 0;
    const bt = b.suit === trumpSuit ? 1 : 0;
    if (at !== bt) return at - bt;
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    return rankValue(a) - rankValue(b);
  });
}

/** Dobrání po kole: nejdřív útočník, pak obránce, oba do 6 karet. */
function replenish(s: DurakState): void {
  const order = [s.attacker, defender(s)];
  for (const idx of order) {
    const p = s.players[idx];
    while (p.hand.length < HAND_SIZE && s.deck.length > 0) {
      const card = s.deck.pop();
      if (card) p.hand.push(card);
    }
    sortHand(p.hand, s.trumpSuit);
  }
}

function checkEnd(s: DurakState): void {
  if (s.deck.length > 0) return; // dokud se dobírá, nikdo není venku
  const a = s.players[0];
  const b = s.players[1];
  const aOut = a.hand.length === 0;
  const bOut = b.hand.length === 0;
  if (!aOut && !bOut) return;
  s.over = true;
  if (aOut && bOut) {
    s.durak = null; // remíza
  } else {
    s.durak = aOut ? b.id : a.id;
    s.log.push({ key: 'durak.log.durak', params: { name: s.players[aOut ? 1 : 0].name } });
  }
}

export function legalMoves(s: DurakState): DurakMove[] {
  if (s.over) return [];
  const moves: DurakMove[] = [];
  const cur = currentPlayer(s);
  const hand = s.players[cur].hand;

  if (hasOpenAttack(s)) {
    // Obránce: přebít otevřenou kartu, nebo vzít.
    const open = s.table.find((t) => t.defense === null)!;
    for (const c of hand) {
      if (beats(c, open.attack, s.trumpSuit)) moves.push({ type: 'defend', cardId: c.id });
    }
    moves.push({ type: 'take' });
    return moves;
  }

  // Útočník: přihrát kartu nebo ukončit kolo.
  const defHand = s.players[defender(s)].hand.length;
  const canAddMore = s.table.length < MAX_ATTACKS && s.table.length < defHand + (s.table.length === 0 ? 1 : 0);
  if (s.table.length === 0) {
    // První útok — libovolná karta.
    for (const c of hand) moves.push({ type: 'attack', cardId: c.id });
  } else {
    if (canAddMore) {
      const ranks = ranksOnTable(s);
      for (const c of hand) {
        if (ranks.has(c.rank)) moves.push({ type: 'attack', cardId: c.id });
      }
    }
    moves.push({ type: 'done' });
  }
  return moves;
}

function take(hand: Card[], cardId: string): Card | undefined {
  const idx = hand.findIndex((c) => c.id === cardId);
  if (idx === -1) return undefined;
  return hand.splice(idx, 1)[0];
}

export function applyMove(prev: DurakState, move: DurakMove): DurakState {
  if (prev.over) return prev;
  const s: DurakState = structuredClone(prev);
  s.log = [];
  const cur = currentPlayer(s);
  const def = defender(s);

  switch (move.type) {
    case 'attack': {
      if (cur !== s.attacker || hasOpenAttack(s)) return prev;
      if (s.table.length >= MAX_ATTACKS) return prev;
      if (s.table.length > 0) {
        const ranks = ranksOnTable(s);
        const card = s.players[cur].hand.find((c) => c.id === move.cardId);
        if (!card || !ranks.has(card.rank)) return prev;
      }
      const card = take(s.players[cur].hand, move.cardId);
      if (!card) return prev;
      s.table.push({ attack: card, defense: null });
      s.log.push({ key: 'durak.log.attack', params: { name: s.players[cur].name } });
      return s;
    }
    case 'defend': {
      if (cur !== def) return prev;
      const open = s.table.find((t) => t.defense === null);
      if (!open) return prev;
      const card = s.players[cur].hand.find((c) => c.id === move.cardId);
      if (!card || !beats(card, open.attack, s.trumpSuit)) return prev;
      open.defense = take(s.players[cur].hand, move.cardId)!;
      s.log.push({ key: 'durak.log.defend', params: { name: s.players[cur].name } });
      return s;
    }
    case 'take': {
      if (cur !== def) return prev;
      // Obránce bere všechny karty ze stolu.
      const grabbed: Card[] = [];
      for (const t of s.table) {
        grabbed.push(t.attack);
        if (t.defense) grabbed.push(t.defense);
      }
      s.players[def].hand.push(...grabbed);
      sortHand(s.players[def].hand, s.trumpSuit);
      s.table = [];
      s.log.push({ key: 'durak.log.take', params: { name: s.players[def].name, count: grabbed.length } });
      // Útočník zůstává; obránce ztrácí právo útočit.
      replenish(s);
      checkEnd(s);
      return s;
    }
    case 'done': {
      if (cur !== s.attacker || s.table.length === 0 || hasOpenAttack(s)) return prev;
      // „Bito" — přebité karty do odpadu.
      s.discard += s.table.reduce((n, t) => n + 1 + (t.defense ? 1 : 0), 0);
      s.table = [];
      s.log.push({ key: 'durak.log.beat', params: { name: s.players[s.attacker].name } });
      replenish(s);
      // Role se prohodí: obránce se stává útočníkem.
      s.attacker = def;
      checkEnd(s);
      return s;
    }
    default:
      return prev;
  }
}

export function isTerminal(s: DurakState): boolean {
  return s.over;
}
