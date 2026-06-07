// Žolíky — pravidla sestav (melds) a řešitel rozkladu ruky.
//   • Set (trojice/čtveřice): 3–4 karty STEJNÉ hodnoty, různé barvy.
//   • Run (postupka): 3+ po sobě jdoucích karet STEJNÉ barvy.
//   • Žolík (JOKER) je univerzální — nahradí libovolnou kartu.
//   • Eso lze brát nízko (A-2-3) i vysoko (Q-K-A).

import { type Card, isJoker } from '@/core/cards';

const RANK_SEQ: Record<string, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

function seqVal(rank: string, aceLow: boolean): number {
  if (rank === 'A') return aceLow ? 1 : 14;
  return RANK_SEQ[rank];
}

/** Bodová hodnota karty (pro minimální vyložení / skóre). */
export function cardScore(card: Card): number {
  if (isJoker(card)) return 20;
  if (card.rank === 'A') return 11;
  if (['K', 'Q', 'J', '10'].includes(card.rank)) return 10;
  return RANK_SEQ[card.rank] ?? 0;
}

function removeByIds(pool: Card[], ids: Set<string>): Card[] {
  return pool.filter((c) => !ids.has(c.id));
}

/** Je daná skupina karet platná postupka v barvě? */
export function isRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const naturals = cards.filter((c) => !isJoker(c));
  const jokers = cards.length - naturals.length;
  if (naturals.length === 0) return true; // samé žolíky
  const suit = naturals[0].suit;
  if (!naturals.every((c) => c.suit === suit)) return false;

  const check = (aceLow: boolean): boolean => {
    const vals = naturals.map((c) => seqVal(c.rank, aceLow)).sort((a, b) => a - b);
    for (let i = 1; i < vals.length; i++) if (vals[i] === vals[i - 1]) return false; // duplicitní hodnota
    const span = vals[vals.length - 1] - vals[0] + 1;
    return span <= cards.length && cards.length <= 14 && vals[0] >= 1 && vals[vals.length - 1] <= 14 && jokers >= 0;
  };
  return check(false) || check(true);
}

/** Je daná skupina karet platná trojice/čtveřice stejné hodnoty? */
export function isSet(cards: Card[]): boolean {
  if (cards.length < 3 || cards.length > 4) return false;
  const naturals = cards.filter((c) => !isJoker(c));
  if (naturals.length === 0) return true; // samé žolíky
  const rank = naturals[0].rank;
  if (!naturals.every((c) => c.rank === rank)) return false;
  const suits = naturals.map((c) => c.suit);
  return new Set(suits).size === suits.length; // různé barvy
}

export function isValidMeld(cards: Card[]): boolean {
  return isSet(cards) || isRun(cards);
}

/** Vygeneruje kandidátní sestavy obsahující `anchor` (nežolíkovou kartu). */
function meldsWith(anchor: Card, rest: Card[]): Card[][] {
  const out: Card[][] = [];
  const jokers = rest.filter(isJoker);

  // --- SETY (stejná hodnota, různé barvy) ---
  const sameRank = rest.filter((c) => !isJoker(c) && c.rank === anchor.rank && c.suit !== anchor.suit);
  // jedna reprezentativní karta na barvu
  const bySuit = new Map<string, Card>();
  for (const c of sameRank) if (!bySuit.has(c.suit)) bySuit.set(c.suit, c);
  const suitCards = [...bySuit.values()];
  for (let size = 3; size <= 4; size++) {
    const slots = size - 1; // mimo anchor
    for (let nNat = 0; nNat <= Math.min(slots, suitCards.length); nNat++) {
      const nJok = slots - nNat;
      if (nJok < 0 || nJok > jokers.length) continue;
      for (const combo of choose(suitCards, nNat)) {
        out.push([anchor, ...combo, ...jokers.slice(0, nJok)]);
      }
    }
  }

  // --- RUNY (stejná barva, po sobě jdoucí) ---
  const sameSuit = rest.filter((c) => !isJoker(c) && c.suit === anchor.suit);
  for (const aceLow of [false, true]) {
    const byVal = new Map<number, Card>();
    for (const c of sameSuit) {
      const v = seqVal(c.rank, aceLow);
      if (!byVal.has(v)) byVal.set(v, c);
    }
    const anchorV = seqVal(anchor.rank, aceLow);
    byVal.delete(anchorV); // anchor použijeme zvlášť
    // okna délky 3..(dostupné) obsahující anchorV
    for (let len = 3; len <= 14; len++) {
      for (let start = Math.max(1, anchorV - len + 1); start <= anchorV; start++) {
        const end = start + len - 1;
        if (end > 14 || anchorV < start || anchorV > end) continue;
        const used: Card[] = [anchor];
        let needJok = 0;
        let ok = true;
        for (let v = start; v <= end; v++) {
          if (v === anchorV) continue;
          const card = byVal.get(v);
          if (card) used.push(card);
          else needJok++;
        }
        if (!ok || needJok > jokers.length) continue;
        out.push([...used, ...jokers.slice(0, needJok)]);
      }
    }
  }

  return out;
}

function* choose<T>(arr: T[], k: number): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  for (let i = 0; i <= arr.length - k; i++) {
    for (const tail of choose(arr.slice(i + 1), k - 1)) {
      yield [arr[i], ...tail];
    }
  }
}

/** Lze celou ruku beze zbytku rozložit na platné sestavy? */
export function canMeldAll(cards: Card[]): boolean {
  if (cards.length === 0) return true;
  if (cards.length < 3) return false;

  const anchor = cards.find((c) => !isJoker(c));
  if (!anchor) return cards.length >= 3; // samé žolíky → jedna sestava

  const rest = cards.filter((c) => c.id !== anchor.id);
  for (const meld of meldsWith(anchor, rest)) {
    const ids = new Set(meld.map((c) => c.id));
    const remaining = removeByIds(cards, ids);
    if (canMeldAll(remaining)) return true;
  }
  return false;
}

/** Najde rozklad ruky na sestavy (pro zobrazení), nebo null. */
export function findMelds(cards: Card[]): Card[][] | null {
  if (cards.length === 0) return [];
  if (cards.length < 3) return null;
  const anchor = cards.find((c) => !isJoker(c));
  if (!anchor) return cards.length >= 3 ? [cards] : null;
  const rest = cards.filter((c) => c.id !== anchor.id);
  for (const meld of meldsWith(anchor, rest)) {
    const ids = new Set(meld.map((c) => c.id));
    const remaining = removeByIds(cards, ids);
    const sub = findMelds(remaining);
    if (sub) return [meld, ...sub];
  }
  return null;
}
