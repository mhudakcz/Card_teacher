import { describe, expect, it } from 'vitest';
import type { Card } from '@/core/cards';
import { applyMove, initZoliky, legalMoves, topDiscard, HAND, type ZolikyState } from './engine';

function newGame(seed = 7): ZolikyState {
  return initZoliky({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'PC', isHuman: false },
    ],
    rng: mulberry(seed),
  });
}

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function c(suit: string, rank: string, n: number): Card {
  return { deck: 'french', suit: suit as Card['suit'], rank, id: `c-${suit}-${rank}-${n}` };
}

describe('žolíky engine', () => {
  it('rozdá 9 karet každému a otočí odhazovák', () => {
    const s = newGame();
    expect(s.players[0].hand).toHaveLength(HAND);
    expect(s.players[1].hand).toHaveLength(HAND);
    expect(s.discard).toHaveLength(1);
    expect(s.phase).toBe('draw');
  });

  it('nabídne líznutí z balíčku i odhazováku', () => {
    const s = newGame();
    const types = legalMoves(s).map((m) => m.type);
    expect(types).toContain('drawStock');
    expect(types).toContain('drawDiscard');
  });

  it('líznutí změní fázi na discard a přidá kartu', () => {
    let s = newGame();
    s = applyMove(s, { type: 'drawStock' });
    expect(s.phase).toBe('discard');
    expect(s.players[0].hand).toHaveLength(HAND + 1);
  });

  it('odhození vrátí kartu na odhazovák a předá tah', () => {
    let s = newGame();
    s = applyMove(s, { type: 'drawStock' });
    const card = s.players[0].hand[0];
    s = applyMove(s, { type: 'discard', cardId: card.id });
    expect(topDiscard(s)?.id).toBe(card.id);
    expect(s.current).toBe(1);
    expect(s.phase).toBe('draw');
  });

  it('líznutí z odhazováku vezme vrchní kartu', () => {
    let s = newGame();
    const top = topDiscard(s)!;
    s = applyMove(s, { type: 'drawDiscard' });
    expect(s.players[0].hand.some((c) => c.id === top.id)).toBe(true);
    expect(s.discard).toHaveLength(0);
  });

  it('složení celé ruky = výhra', () => {
    let s = newGame();
    // Podstrčíme vítěznou ruku: 9 karet ve 3 sestavách + 1 navíc k odhození.
    s.players[0].hand = [
      c('spades', '7', 1), c('hearts', '7', 2), c('clubs', '7', 3),
      c('hearts', '5', 4), c('hearts', '6', 5), c('hearts', '7', 6),
      c('clubs', 'J', 7), c('clubs', 'Q', 8), c('clubs', 'K', 9),
    ];
    s.phase = 'discard';
    // Líznutá karta navíc — přidáme a odhodíme ji.
    const extra = c('diamonds', '2', 10);
    s.players[0].hand.push(extra);
    s = applyMove(s, { type: 'discard', cardId: extra.id });
    expect(s.winner).toBe('you');
  });
});
