import { describe, expect, it } from 'vitest';
import type { Card } from '@/core/cards';
import { seededRng } from '@/core/cards';
import { applyMove, initTaroky, legalMoves, cardPoints, HAND, type TarokyState } from './engine';

function newGame(seed = 3): TarokyState {
  return initTaroky({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'PC', isHuman: false },
    ],
    rng: seededRng(seed),
  });
}

function suit(s: string, rank: string): Card {
  return { deck: 'tarock', suit: s as Card['suit'], rank, id: `tarock-${s}-${rank}` };
}
function trump(rank: string): Card {
  return { deck: 'tarock', suit: 'trump' as Card['suit'], rank, id: `tarock-trump-${rank}` };
}

describe('taroky engine', () => {
  it('rozdá 12 karet každému', () => {
    const s = newGame();
    expect(s.players[0].hand).toHaveLength(HAND);
    expect(s.players[1].hand).toHaveLength(HAND);
  });

  it('bodové hodnoty: honéry a dvorní karty', () => {
    expect(cardPoints(trump('I'))).toBe(5);
    expect(cardPoints(trump('XXI'))).toBe(5);
    expect(cardPoints(trump('SKYZ'))).toBe(5);
    expect(cardPoints(trump('V'))).toBe(0);
    expect(cardPoints(suit('hearts', 'K'))).toBe(5);
    expect(cardPoints(suit('hearts', 'O'))).toBe(4);
    expect(cardPoints(suit('hearts', 'U'))).toBe(3);
    expect(cardPoints(suit('hearts', '7'))).toBe(0);
  });

  it('vynášející může zahrát libovolnou kartu', () => {
    const s = newGame();
    expect(legalMoves(s)).toHaveLength(HAND);
  });

  it('soupeř musí ctít barvu', () => {
    let s = newGame();
    s.players[0].hand = [suit('hearts', '7')];
    s.players[1].hand = [suit('hearts', 'A'), suit('acorns', 'K'), trump('V')];
    s.current = 0;
    s.leader = 0;
    s = applyMove(s, { type: 'play', cardId: 'tarock-hearts-7' });
    const ids = legalMoves(s).map((m) => m.cardId);
    expect(ids).toEqual(['tarock-hearts-A']);
  });

  it('bez barvy musí trumfovat', () => {
    let s = newGame();
    s.players[0].hand = [suit('hearts', '7')];
    s.players[1].hand = [suit('acorns', 'K'), trump('V'), trump('X')];
    s.current = 0;
    s.leader = 0;
    s = applyMove(s, { type: 'play', cardId: 'tarock-hearts-7' });
    const ids = legalMoves(s).map((m) => m.cardId);
    expect(ids.sort()).toEqual(['tarock-trump-V', 'tarock-trump-X'].sort());
  });

  it('trumf přebije barvu', () => {
    let s = newGame();
    s.players[0].hand = [suit('hearts', 'A')];
    s.players[1].hand = [trump('I')];
    s.current = 0;
    s.leader = 0;
    s = applyMove(s, { type: 'play', cardId: 'tarock-hearts-A' });
    s = applyMove(s, { type: 'play', cardId: 'tarock-trump-I' });
    expect(s.lastTrickWinner).toBe(1);
  });

  it('vyšší trumf bere; Škýz je nejvyšší', () => {
    let s = newGame();
    s.players[0].hand = [trump('XXI')];
    s.players[1].hand = [trump('SKYZ')];
    s.current = 0;
    s.leader = 0;
    s = applyMove(s, { type: 'play', cardId: 'tarock-trump-XXI' });
    s = applyMove(s, { type: 'play', cardId: 'tarock-trump-SKYZ' });
    expect(s.lastTrickWinner).toBe(1);
  });

  it('pagát ultimo: poslední štych pagátem dá bonus', () => {
    let s = newGame();
    // jen jeden štych zbývá
    s.players[0].hand = [trump('I')];
    s.players[1].hand = [suit('hearts', 'A')];
    s.current = 0;
    s.leader = 0;
    s.tricksLeft = 1;
    s = applyMove(s, { type: 'play', cardId: 'tarock-trump-I' });
    s = applyMove(s, { type: 'play', cardId: 'tarock-hearts-A' });
    expect(s.pagatUltimo).toBe(0);
    expect(s.winner).not.toBeNull();
  });

  it('dohraje celou partii a určí vítěze', () => {
    let s = newGame();
    let guard = 0;
    while (!s.winner && guard++ < 200) {
      s = applyMove(s, legalMoves(s)[0]);
    }
    expect(s.winner).not.toBeNull();
    expect(s.scores).not.toBeNull();
  });
});
