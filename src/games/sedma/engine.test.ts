import { describe, it, expect } from 'vitest';
import type { Card } from '@/core/cards';
import { seededRng } from '@/core/cards';
import {
  applyMove,
  beats,
  cardPoints,
  initSedma,
  legalMoves,
  type SedmaState,
} from './engine';

const c = (suit: Card['suit'], rank: string): Card => ({
  deck: 'czech',
  suit,
  rank,
  id: `czech-${suit}-${rank}`,
});

function blank(p0: Card[], p1: Card[], deck: Card[] = []): SedmaState {
  return {
    players: [
      { id: 'you', name: 'Ty', isHuman: true, hand: p0, won: [] },
      { id: 'ai', name: 'PC', isHuman: false, hand: p1, won: [] },
    ],
    deck,
    trick: [],
    leader: 0,
    current: 0,
    lastTrickWinner: null,
    winner: null,
    scores: null,
    log: [],
  };
}

describe('cardPoints', () => {
  it('desítky a esa = 10, ostatní 0', () => {
    expect(cardPoints(c('hearts', '10'))).toBe(10);
    expect(cardPoints(c('bells', 'A'))).toBe(10);
    expect(cardPoints(c('leaves', 'K'))).toBe(0);
    expect(cardPoints(c('acorns', '7'))).toBe(0);
  });
});

describe('beats', () => {
  it('stejná hodnota přebíjí', () => {
    expect(beats(c('hearts', 'K'), c('bells', 'K'))).toBe(true);
    expect(beats(c('hearts', 'K'), c('bells', '9'))).toBe(false);
  });
  it('sedmička přebíjí cokoli', () => {
    expect(beats(c('hearts', 'A'), c('bells', '7'))).toBe(true);
    expect(beats(c('hearts', '7'), c('bells', '7'))).toBe(true);
  });
  it('na sedmičku nestačí jiná hodnota', () => {
    expect(beats(c('hearts', '7'), c('bells', 'A'))).toBe(false);
  });
});

describe('init', () => {
  it('rozdá po 4 a talon má 24', () => {
    const s = initSedma({
      players: [
        { id: 'you', name: 'Ty', isHuman: true },
        { id: 'ai', name: 'PC', isHuman: false },
      ],
      rng: seededRng(3),
    });
    expect(s.players[0].hand).toHaveLength(4);
    expect(s.players[1].hand).toHaveLength(4);
    expect(s.deck).toHaveLength(24);
  });
});

describe('legalMoves', () => {
  it('lze zahrát kteroukoli kartu v ruce', () => {
    const s = blank([c('hearts', 'K'), c('bells', '9')], [c('leaves', '8')]);
    expect(legalMoves(s)).toHaveLength(2);
  });
});

describe('štych', () => {
  it('soupeř přebije stejnou hodnotou a bere štych', () => {
    const s = blank([c('hearts', 'K')], [c('bells', 'K')]);
    const afterLead = applyMove(s, { type: 'play', cardId: 'czech-hearts-K' });
    expect(afterLead.current).toBe(1);
    const resolved = applyMove(afterLead, { type: 'play', cardId: 'czech-bells-K' });
    expect(resolved.players[1].won).toHaveLength(2);
    expect(resolved.leader).toBe(1);
  });

  it('když soupeř nepřebije, bere vynášející', () => {
    const s = blank([c('hearts', 'K')], [c('bells', '9')]);
    const resolved = applyMove(
      applyMove(s, { type: 'play', cardId: 'czech-hearts-K' }),
      { type: 'play', cardId: 'czech-bells-9' },
    );
    expect(resolved.players[0].won).toHaveLength(2);
    expect(resolved.leader).toBe(0);
  });

  it('sedmička soupeře bere i eso', () => {
    const s = blank([c('hearts', 'A')], [c('bells', '7')]);
    const resolved = applyMove(
      applyMove(s, { type: 'play', cardId: 'czech-hearts-A' }),
      { type: 'play', cardId: 'czech-bells-7' },
    );
    expect(resolved.players[1].won).toHaveLength(2);
  });
});

describe('konec a body', () => {
  it('vyhodnotí body včetně posledního štychu', () => {
    // Jediný štych: hráč 0 vynese desítku, hráč 1 nepřebije → hráč 0 bere 10 b. + 10 za poslední štych.
    const s = blank([c('hearts', '10')], [c('bells', '9')]);
    const resolved = applyMove(
      applyMove(s, { type: 'play', cardId: 'czech-hearts-10' }),
      { type: 'play', cardId: 'czech-bells-9' },
    );
    expect(resolved.winner).toBe('you');
    expect(resolved.scores).toEqual([20, 0]);
  });

  it('nemutuje původní stav', () => {
    const s = blank([c('hearts', 'K')], [c('bells', 'K')]);
    applyMove(s, { type: 'play', cardId: 'czech-hearts-K' });
    expect(s.players[0].hand).toHaveLength(1);
    expect(s.trick).toHaveLength(0);
  });
});
