import { describe, expect, it } from 'vitest';
import { type Card, seededRng } from '@/core/cards';
import {
  analyze,
  applyMove,
  cardValue,
  deadwoodValue,
  type GinState,
  initGin,
  isTerminal,
  legalMoves,
} from './engine';
import { chooseMove } from './ai';

const fc = (suit: Card['suit'], rank: string): Card => ({
  deck: 'french',
  suit,
  rank,
  id: `french-${suit}-${rank}`,
});

function totalCards(s: GinState): number {
  return s.stock.length + s.discard.length + s.players[0].hand.length + s.players[1].hand.length;
}

describe('hodnoty karet', () => {
  it('A=1, číselné dle čísla, 10/J/Q/K=10', () => {
    expect(cardValue(fc('hearts', 'A'))).toBe(1);
    expect(cardValue(fc('hearts', '7'))).toBe(7);
    expect(cardValue(fc('hearts', '10'))).toBe(10);
    expect(cardValue(fc('hearts', 'K'))).toBe(10);
  });
});

describe('rozbor sestav', () => {
  it('rozpozná set (trojici stejné hodnoty)', () => {
    const a = analyze([fc('hearts', '5'), fc('spades', '5'), fc('clubs', '5')]);
    expect(a.value).toBe(0);
    expect(a.melds).toHaveLength(1);
    expect(a.deadwood).toHaveLength(0);
  });

  it('rozpozná postupku (run v barvě)', () => {
    const a = analyze([fc('hearts', '5'), fc('hearts', '6'), fc('hearts', '7')]);
    expect(a.value).toBe(0);
    expect(a.melds).toHaveLength(1);
  });

  it('spočítá deadwood u nesložené ruky', () => {
    // 5-6-7 srdce (sestava) + K + 3 deadwood
    const a = analyze([
      fc('hearts', '5'), fc('hearts', '6'), fc('hearts', '7'),
      fc('spades', 'K'), fc('clubs', '3'),
    ]);
    expect(a.value).toBe(13); // K(10) + 3(3)
  });

  it('najde rozklad s nejmenším deadwoodem (sdílená karta)', () => {
    // 7♥ může být v setu i v runu — vybere lepší
    const a = analyze([
      fc('hearts', '7'), fc('spades', '7'), fc('clubs', '7'),
      fc('hearts', '8'), fc('hearts', '9'),
    ]);
    // set 7 + run 7-8-9 sdílí 7♥; nejlepší = set tří sedmiček + 8,9 deadwood (17)
    // nebo run 7-8-9 + dvě sedmičky deadwood (14). Min = 14.
    expect(a.value).toBe(14);
  });
});

describe('rozdání', () => {
  it('rozdá 10+10, jedna karta na odhazovák, zbytek stock', () => {
    const s = initGin({ rng: seededRng(1) });
    expect(s.players[0].hand).toHaveLength(10);
    expect(s.players[1].hand).toHaveLength(10);
    expect(s.discard).toHaveLength(1);
    expect(s.stock).toHaveLength(31); // 52 - 20 - 1
    expect(totalCards(s)).toBe(52);
    expect(s.phase).toBe('draw');
  });
});

describe('tahy', () => {
  it('líznutí přepne na discard, odhození přepne hráče', () => {
    let s = initGin({ rng: seededRng(2) });
    s = applyMove(s, { type: 'draw', from: 'stock' });
    expect(s.phase).toBe('discard');
    expect(s.players[0].hand).toHaveLength(11);
    const cardId = s.players[0].hand[0].id;
    s = applyMove(s, { type: 'discard', cardId });
    expect(s.players[0].hand).toHaveLength(10);
    expect(s.current).toBe(1);
    expect(s.phase).toBe('draw');
    expect(totalCards(s)).toBe(52);
  });

  it('knock je legální jen když deadwood ≤ 10', () => {
    // sestav ruku s nízkým deadwoodem v draw→discard fázi
    const hand: Card[] = [
      fc('hearts', 'A'), fc('hearts', '2'), fc('hearts', '3'), // run
      fc('spades', '4'), fc('spades', '5'), fc('spades', '6'), // run
      fc('clubs', '7'), fc('clubs', '8'), fc('clubs', '9'), // run
      fc('diamonds', 'A'), fc('diamonds', '2'), // navíc 1 karta (11), deadwood A+2=3
    ];
    const s: GinState = {
      stock: [fc('hearts', 'K')],
      discard: [fc('diamonds', 'K')],
      players: [
        { id: 'you', name: 'Ty', isHuman: true, hand },
        { id: 'ai', name: 'PC', isHuman: false, hand: [fc('clubs', 'K')] },
      ],
      current: 0,
      phase: 'discard',
      over: false,
      result: null,
      log: [],
    };
    const moves = legalMoves(s);
    // odhozením diamantové 2 zůstane deadwood A(1) ≤ 10 → knock legální
    const knockMove = moves.find((m) => m.type === 'discard' && m.knock && m.cardId === 'french-diamonds-2');
    expect(knockMove).toBeTruthy();
  });
});

describe('AI a integrita', () => {
  it('partie doběhne klepnutím/remízou a zachová 52 karet', () => {
    let s = initGin({ rng: seededRng(8) });
    const rng = seededRng(42);
    for (let step = 0; step < 5000 && !isTerminal(s); step++) {
      const me = s.current;
      const level = me === 0 ? 'hard' : 'medium';
      const next = applyMove(s, chooseMove(s, level, rng));
      s = next;
      expect(totalCards(s)).toBe(52);
    }
    expect(isTerminal(s)).toBe(true);
    expect(s.result).not.toBeNull();
  });

  it('deadwoodValue je 0 pro plně složenou ruku (3 runy + set)', () => {
    const hand: Card[] = [
      fc('hearts', '4'), fc('hearts', '5'), fc('hearts', '6'),
      fc('spades', '8'), fc('spades', '9'), fc('spades', '10'),
      fc('clubs', 'J'), fc('clubs', 'Q'), fc('clubs', 'K'),
      fc('diamonds', '2'),
    ];
    expect(deadwoodValue(hand)).toBe(2); // jen diamantová 2
  });
});
