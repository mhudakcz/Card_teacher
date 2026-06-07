// Kanasta — strategie počítače. Tři obtížnosti.
//   • easy:   líže z balíčku, nevykládá, odhazuje nejlevnější.
//   • medium: vykládá sestavy a rozšiřuje je, odhazuje nejméně užitečnou kartu.
//   • hard:   jako medium + bere z odhazováku, když má k vrchní kartě pár, a jde ven hned, jak může.

import {
  type KanastaState,
  type KanastaMove,
  type KanastaPlayer,
  cardValue,
  hasCanasta,
  isWild,
  legalMoves,
  meldRank,
  topDiscard,
} from './engine';
import type { Card } from '@/core/cards';

export type Difficulty = 'easy' | 'medium' | 'hard';

function countByRank(cards: Card[]): Record<string, Card[]> {
  const m: Record<string, Card[]> = {};
  for (const c of cards) {
    if (isWild(c)) continue;
    (m[c.rank] ??= []).push(c);
  }
  return m;
}

/** Najde novou sestavu, kterou lze z ruky vyložit (přirozené karty, případně 1 divoká). */
function findNewMeld(p: KanastaPlayer): string[] | null {
  const groups = countByRank(p.hand);
  for (const rank of Object.keys(groups)) {
    if (rank === '3') continue;
    const nat = groups[rank];
    if (nat.length >= 3) return nat.slice(0, 3).map((c) => c.id);
    if (nat.length === 2) {
      const wild = p.hand.find(isWild);
      if (wild && meldRank([...nat, wild])) return [nat[0].id, nat[1].id, wild.id];
    }
  }
  return null;
}

/** Karty z ruky, které lze přidat k některé existující sestavě. */
function findExtension(p: KanastaPlayer): { meldIndex: number; cardIds: string[] } | null {
  for (let i = 0; i < p.melds.length; i++) {
    const meld = p.melds[i];
    const matching = p.hand.filter((c) => !isWild(c) && c.rank === meld.rank);
    if (matching.length > 0) return { meldIndex: i, cardIds: [matching[0].id] };
  }
  return null;
}

/** Cennost karty pro ruku (vyšší = nerad odhazuji). */
function keepValue(card: Card, hand: Card[]): number {
  if (isWild(card)) return 100;
  const same = hand.filter((c) => c.rank === card.rank).length;
  return same * 10 + cardValue(card);
}

export function chooseMove(state: KanastaState, level: Difficulty): KanastaMove {
  const p = state.players[state.current];

  if (state.phase === 'draw') {
    if (level === 'hard') {
      const top = topDiscard(state);
      if (top && !isWild(top) && p.hand.filter((c) => c.rank === top.rank).length >= 2) {
        return { type: 'drawDiscard' };
      }
    }
    return { type: 'drawStock' };
  }

  // play fáze
  if (level !== 'easy') {
    const meld = findNewMeld(p);
    if (meld) return { type: 'layMeld', cardIds: meld };
    const ext = findExtension(p);
    if (ext) return { type: 'addToMeld', meldIndex: ext.meldIndex, cardIds: ext.cardIds };
  }

  // odhoz: pokud mám kanastu a zbyde mi po odhození prázdná ruka, jdu ven (odhodím cokoli).
  // jinak odhodím nejméně užitečnou kartu.
  const sorted = [...p.hand].sort((a, b) => keepValue(a, p.hand) - keepValue(b, p.hand));
  if (sorted.length > 0) return { type: 'discard', cardId: sorted[0].id };
  return legalMoves(state)[0];
}

void hasCanasta;
