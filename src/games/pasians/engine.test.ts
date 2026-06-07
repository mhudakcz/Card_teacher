import { describe, expect, it } from 'vitest';
import { type Card, seededRng } from '@/core/cards';
import {
  applyMove,
  canPlayToFoundation,
  canStackOnTableau,
  initKlondike,
  isTerminal,
  type KlondikeState,
  legalMoves,
  rankValue,
  SUITS,
} from './engine';

const fc = (suit: Card['suit'], rank: string): Card => ({
  deck: 'french',
  suit,
  rank,
  id: `french-${suit}-${rank}`,
});

function totalCards(s: KlondikeState): number {
  let n = s.stock.length + s.waste.length;
  for (const f of s.foundations) n += f.length;
  for (const p of s.tableau) n += p.faceDown.length + p.faceUp.length;
  return n;
}

describe('init', () => {
  it('rozdá 52 karet: sloupce 1..7 + 24 v balíčku', () => {
    const s = initKlondike({ rng: seededRng(1) });
    expect(totalCards(s)).toBe(52);
    expect(s.stock).toHaveLength(24);
    s.tableau.forEach((p, i) => {
      expect(p.faceDown.length + p.faceUp.length).toBe(i + 1);
      expect(p.faceUp).toHaveLength(1); // jen vrchní je odkrytá
    });
  });

  it('výchozí lízání je 1 a redeals neomezené', () => {
    const s = initKlondike({ rng: seededRng(1) });
    expect(s.drawCount).toBe(1);
    expect(s.redealsLeft).toBeNull();
  });
});

describe('pravidla skládání', () => {
  it('na cíl smí jen eso do prázdna, pak stejná barva o 1 výš', () => {
    expect(canPlayToFoundation([], fc('hearts', 'A'))).toBe(true);
    expect(canPlayToFoundation([], fc('hearts', '2'))).toBe(false);
    expect(canPlayToFoundation([fc('hearts', 'A')], fc('hearts', '2'))).toBe(true);
    expect(canPlayToFoundation([fc('hearts', 'A')], fc('spades', '2'))).toBe(false);
  });

  it('na sloupec smí opačná barva o 1 níž; do prázdna jen král', () => {
    expect(canStackOnTableau(undefined, fc('spades', 'K'))).toBe(true);
    expect(canStackOnTableau(undefined, fc('spades', 'Q'))).toBe(false);
    expect(canStackOnTableau(fc('spades', '8'), fc('hearts', '7'))).toBe(true); // černá ← červená
    expect(canStackOnTableau(fc('spades', '8'), fc('clubs', '7'))).toBe(false); // stejná barva
    expect(canStackOnTableau(fc('spades', '8'), fc('hearts', '6'))).toBe(false); // špatná hodnota
  });

  it('rankValue: A=1 … K=13', () => {
    expect(rankValue(fc('spades', 'A'))).toBe(1);
    expect(rankValue(fc('spades', 'K'))).toBe(13);
  });
});

describe('tahy s balíčkem', () => {
  it('draw přesune kartu na odhazovák', () => {
    const s = initKlondike({ rng: seededRng(2) });
    const next = applyMove(s, { type: 'draw' });
    expect(next.waste).toHaveLength(1);
    expect(next.stock).toHaveLength(23);
  });

  it('draw 3 přesune tři karty', () => {
    const s = initKlondike({ rng: seededRng(2), drawCount: 3 });
    const next = applyMove(s, { type: 'draw' });
    expect(next.waste).toHaveLength(3);
  });

  it('recycle vrátí odhazovák do balíčku, až když je balíček prázdný', () => {
    let s = initKlondike({ rng: seededRng(2) });
    // vylízej celý balíček
    while (s.stock.length > 0) s = applyMove(s, { type: 'draw' });
    expect(s.waste).toHaveLength(24);
    s = applyMove(s, { type: 'recycle' });
    expect(s.stock).toHaveLength(24);
    expect(s.waste).toHaveLength(0);
  });
});

describe('výhra', () => {
  it('doskládání čtyř králů na cíle (A..Q) hru dokončí', () => {
    // Postavíme stav: každý cíl má A..Q (12 karet), král sedí na vrchu sloupce.
    const foundations = SUITS.map((suit) =>
      ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q'].map((r) => fc(suit, r)),
    );
    const tableau = SUITS.map((suit) => ({ faceDown: [], faceUp: [fc(suit, 'K')] }));
    while (tableau.length < 7) tableau.push({ faceDown: [], faceUp: [] });

    let s: KlondikeState = {
      stock: [],
      waste: [],
      foundations,
      tableau,
      drawCount: 1,
      redealsLeft: null,
      moves: 0,
      won: false,
    };
    expect(isTerminal(s)).toBe(false);
    for (let pile = 0; pile < 4; pile++) {
      s = applyMove(s, { type: 'tableauToFoundation', pile });
    }
    expect(isTerminal(s)).toBe(true);
    expect(s.won).toBe(true);
  });
});

describe('integrita', () => {
  it('greedy průchod legálními tahy zachová 52 karet a nespadne', () => {
    let s = initKlondike({ rng: seededRng(5) });
    for (let step = 0; step < 300 && !s.won; step++) {
      const moves = legalMoves(s);
      if (moves.length === 0) break;
      // preferuj tahy na cíl, jinak první
      const toF = moves.find((m) => m.type === 'wasteToFoundation' || m.type === 'tableauToFoundation');
      s = applyMove(s, toF ?? moves[0]);
      expect(totalCards(s)).toBe(52);
    }
    expect(totalCards(s)).toBe(52);
  });
});
