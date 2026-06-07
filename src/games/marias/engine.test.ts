import { describe, expect, it } from 'vitest';
import type { Card } from '@/core/cards';
import { seededRng } from '@/core/cards';
import { applyMove, initMarias, legalMoves, cardPoints, HAND, type MariasState } from './engine';

function newGame(seed = 5): MariasState {
  return initMarias({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'PC', isHuman: false },
    ],
    rng: seededRng(seed),
  });
}

function c(suit: string, rank: string, n = 0): Card {
  return { deck: 'czech', suit: suit as Card['suit'], rank, id: `c-${suit}-${rank}-${n}` };
}

describe('mariáš engine', () => {
  it('rozdá 10 karet a určí trumfy', () => {
    const s = newGame();
    expect(s.players[0].hand).toHaveLength(HAND);
    expect(s.players[1].hand).toHaveLength(HAND);
    expect(['acorns', 'leaves', 'hearts', 'bells']).toContain(s.trump);
  });

  it('eso a desítka mají 10 bodů, ostatní 0', () => {
    expect(cardPoints(c('hearts', 'A'))).toBe(10);
    expect(cardPoints(c('hearts', '10'))).toBe(10);
    expect(cardPoints(c('hearts', 'K'))).toBe(0);
    expect(cardPoints(c('hearts', '7'))).toBe(0);
  });

  it('vynášející může zahrát libovolnou kartu', () => {
    const s = newGame();
    expect(legalMoves(s)).toHaveLength(HAND);
  });

  it('soupeř musí ctít barvu', () => {
    let s = newGame();
    s.trump = 'bells';
    s.players[0].hand = [c('hearts', '7', 1)];
    s.players[1].hand = [c('hearts', 'A', 2), c('hearts', '8', 3), c('acorns', '10', 4)];
    s.current = 0;
    s.leader = 0;
    s = applyMove(s, { type: 'play', cardId: 'c-hearts-7-1' });
    // soupeř má srdce → musí hrát srdce, a musí přebít (A nebo 8 obě přebijí 7) → jen vyšší
    const ids = legalMoves(s).map((m) => m.cardId);
    expect(ids).toContain('c-hearts-A-2');
    expect(ids).toContain('c-hearts-8-3');
    expect(ids).not.toContain('c-acorns-10-4');
  });

  it('trumf přebije jinou barvu', () => {
    let s = newGame();
    s.trump = 'bells';
    s.players[0].hand = [c('hearts', 'A', 1)];
    s.players[1].hand = [c('bells', '7', 2)];
    s.current = 0;
    s.leader = 0;
    s = applyMove(s, { type: 'play', cardId: 'c-hearts-A-1' });
    s = applyMove(s, { type: 'play', cardId: 'c-bells-7-2' });
    // bells je trumf → hráč 1 bere štych
    expect(s.lastTrickWinner).toBe(1);
  });

  it('hláška král+svršek dá 20 bodů (40 v trumfech)', () => {
    let s = newGame();
    s.trump = 'acorns';
    s.players[0].hand = [c('hearts', 'K', 1), c('hearts', 'O', 2)];
    s.players[1].hand = [c('bells', '7', 3), c('bells', '8', 4)];
    s.current = 0;
    s.leader = 0;
    s = applyMove(s, { type: 'play', cardId: 'c-hearts-K-1' });
    expect(s.players[0].marriagePoints).toBe(20);
  });

  it('hláška v trumfech dá 40 bodů', () => {
    let s = newGame();
    s.trump = 'hearts';
    s.players[0].hand = [c('hearts', 'K', 1), c('hearts', 'O', 2)];
    s.players[1].hand = [c('bells', '7', 3), c('bells', '8', 4)];
    s.current = 0;
    s.leader = 0;
    s = applyMove(s, { type: 'play', cardId: 'c-hearts-K-1' });
    expect(s.players[0].marriagePoints).toBe(40);
  });

  it('dohraje celou partii a určí vítěze', () => {
    let s = newGame();
    let guard = 0;
    while (!s.winner && guard++ < 100) {
      const m = legalMoves(s)[0];
      s = applyMove(s, m);
    }
    expect(s.winner).not.toBeNull();
    expect(s.scores).not.toBeNull();
  });
});
