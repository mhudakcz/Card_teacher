import { describe, expect, it } from 'vitest';
import type { Card } from '@/core/cards';
import { seededRng } from '@/core/cards';
import {
  applyMove,
  cardValue,
  hasCanasta,
  initKanasta,
  isCanasta,
  isPureCanasta,
  isRedThree,
  isWild,
  legalMoves,
  meldRank,
  playerScore,
  HAND,
  type KanastaState,
} from './engine';

function c(suit: string, rank: string, n = 0): Card {
  return { deck: 'french', suit: suit as Card['suit'], rank, id: `f-${suit}-${rank}-${n}` };
}
function joker(n: number): Card {
  return { deck: 'french', suit: 'spades', rank: 'JOKER', id: `joker-${n}` };
}

function newGame(seed = 7): KanastaState {
  return initKanasta({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'PC', isHuman: false },
    ],
    rng: seededRng(seed),
  });
}

describe('kanasta engine', () => {
  it('rozdá 11 karet každému', () => {
    const s = newGame();
    expect(s.players[0].hand).toHaveLength(HAND);
    expect(s.players[1].hand).toHaveLength(HAND);
    expect(s.discard).toHaveLength(1);
  });

  it('bodové hodnoty karet', () => {
    expect(cardValue(joker(0))).toBe(50);
    expect(cardValue(c('hearts', 'A'))).toBe(20);
    expect(cardValue(c('hearts', '2'))).toBe(20);
    expect(cardValue(c('hearts', 'K'))).toBe(10);
    expect(cardValue(c('hearts', '5'))).toBe(5);
  });

  it('divoké karty: žolík a dvojka', () => {
    expect(isWild(joker(0))).toBe(true);
    expect(isWild(c('hearts', '2'))).toBe(true);
    expect(isWild(c('hearts', 'A'))).toBe(false);
  });

  it('červené trojky pozná', () => {
    expect(isRedThree(c('hearts', '3'))).toBe(true);
    expect(isRedThree(c('diamonds', '3'))).toBe(true);
    expect(isRedThree(c('spades', '3'))).toBe(false);
  });

  it('platná sestava: 3 stejné hodnoty', () => {
    expect(meldRank([c('hearts', 'K', 1), c('spades', 'K', 2), c('clubs', 'K', 3)])).toBe('K');
  });

  it('sestava s divokou kartou (2 přirozené + 1 divoká)', () => {
    expect(meldRank([c('hearts', '7', 1), c('spades', '7', 2), joker(0)])).toBe('7');
  });

  it('neplatná sestava: jen 1 přirozená + 2 divoké', () => {
    expect(meldRank([c('hearts', '7', 1), joker(0), c('spades', '2', 2)])).toBeNull();
  });

  it('neplatná sestava: moc divokých (max 3)', () => {
    expect(
      meldRank([c('hearts', '7', 1), c('spades', '7', 2), joker(0), joker(1), c('clubs', '2', 3), c('hearts', '2', 4)]),
    ).toBeNull();
  });

  it('kanasta = 7+ karet, čistá vs smíšená', () => {
    const pure = { rank: 'K', cards: Array.from({ length: 7 }, (_, i) => c('hearts', 'K', i)) };
    const mixed = { rank: 'K', cards: [...Array.from({ length: 6 }, (_, i) => c('hearts', 'K', i)), joker(0)] };
    expect(isCanasta(pure)).toBe(true);
    expect(isPureCanasta(pure)).toBe(true);
    expect(isPureCanasta(mixed)).toBe(false);
    expect(isCanasta(mixed)).toBe(true);
  });

  it('layMeld přesune karty z ruky do sestavy', () => {
    let s = newGame();
    s.phase = 'play';
    s.players[0].hand = [c('hearts', 'K', 1), c('spades', 'K', 2), c('clubs', 'K', 3), c('hearts', '9', 9)];
    s.current = 0;
    s = applyMove(s, { type: 'layMeld', cardIds: ['f-hearts-K-1', 'f-spades-K-2', 'f-clubs-K-3'] });
    expect(s.players[0].melds).toHaveLength(1);
    expect(s.players[0].melds[0].cards).toHaveLength(3);
    expect(s.players[0].hand).toHaveLength(1);
  });

  it('jde ven jen s kanastou; skóre zahrne bonusy', () => {
    let s = newGame();
    s.phase = 'play';
    s.current = 0;
    // sedm králů (kanasta) vyložených + jedna karta na odhoz
    s.players[0].melds = [{ rank: 'K', cards: Array.from({ length: 7 }, (_, i) => c('hearts', 'K', i)) }];
    s.players[0].hand = [c('hearts', '9', 1)];
    expect(hasCanasta(s.players[0])).toBe(true);
    s = applyMove(s, { type: 'discard', cardId: 'f-hearts-9-1' });
    expect(s.winner).toBe('you');
    // 7×10 + čistá kanasta 500 + go out 100 = 670
    expect(s.scores![0]).toBe(670);
  });

  it('legalMoves: draw fáze nabízí dobírání', () => {
    const s = newGame();
    const types = legalMoves(s).map((m) => m.type);
    expect(types).toContain('drawStock');
    expect(types).toContain('drawDiscard');
  });

  it('playerScore odečte karty v ruce', () => {
    const p = {
      id: 'x', name: 'x', isHuman: false, melds: [], redThrees: [],
      hand: [c('hearts', 'A', 1), c('hearts', 'K', 2)],
    };
    expect(playerScore(p, false)).toBe(-30); // 20 + 10
  });

  it('dohraje partii do konce (stock dojde)', () => {
    let s = newGame();
    let guard = 0;
    while (!s.winner && guard++ < 2000) {
      const moves = legalMoves(s);
      s = applyMove(s, moves[0]);
    }
    expect(s.winner).not.toBeNull();
    expect(s.scores).not.toBeNull();
  });
});
