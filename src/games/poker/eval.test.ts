import { describe, expect, it } from 'vitest';
import type { Card } from '@/core/cards';
import { evaluate, compareScore, categoryName } from './eval';

function c(suit: string, rank: string): Card {
  return { deck: 'french', suit: suit as Card['suit'], rank, id: `french-${suit}-${rank}` };
}

function score(...cards: Card[]) {
  return evaluate(cards);
}

describe('poker eval', () => {
  it('detekuje vysokou kartu', () => {
    const s = score(c('spades', 'A'), c('hearts', 'J'), c('clubs', '9'), c('diamonds', '5'), c('spades', '2'));
    expect(categoryName(s)).toBe('highCard');
  });

  it('detekuje dvojici', () => {
    const s = score(c('spades', 'K'), c('hearts', 'K'), c('clubs', '9'), c('diamonds', '5'), c('spades', '2'));
    expect(categoryName(s)).toBe('pair');
  });

  it('detekuje dvě dvojice', () => {
    const s = score(c('spades', 'K'), c('hearts', 'K'), c('clubs', '9'), c('diamonds', '9'), c('spades', '2'));
    expect(categoryName(s)).toBe('twoPair');
  });

  it('detekuje trojici', () => {
    const s = score(c('spades', 'K'), c('hearts', 'K'), c('clubs', 'K'), c('diamonds', '9'), c('spades', '2'));
    expect(categoryName(s)).toBe('trips');
  });

  it('detekuje postupku', () => {
    const s = score(c('spades', '6'), c('hearts', '5'), c('clubs', '4'), c('diamonds', '3'), c('spades', '2'));
    expect(categoryName(s)).toBe('straight');
  });

  it('detekuje postupku s nízkým esem (A-2-3-4-5)', () => {
    const s = score(c('spades', 'A'), c('hearts', '5'), c('clubs', '4'), c('diamonds', '3'), c('spades', '2'));
    expect(categoryName(s)).toBe('straight');
    expect(s.tiebreak[0]).toBe(5); // pětka je nejvyšší
  });

  it('detekuje barvu', () => {
    const s = score(c('spades', 'A'), c('spades', 'J'), c('spades', '9'), c('spades', '5'), c('spades', '2'));
    expect(categoryName(s)).toBe('flush');
  });

  it('detekuje full house', () => {
    const s = score(c('spades', 'K'), c('hearts', 'K'), c('clubs', 'K'), c('diamonds', '9'), c('spades', '9'));
    expect(categoryName(s)).toBe('fullHouse');
  });

  it('detekuje čtveřici', () => {
    const s = score(c('spades', 'K'), c('hearts', 'K'), c('clubs', 'K'), c('diamonds', 'K'), c('spades', '9'));
    expect(categoryName(s)).toBe('quads');
  });

  it('detekuje postupku v barvě', () => {
    const s = score(c('spades', '6'), c('spades', '5'), c('spades', '4'), c('spades', '3'), c('spades', '2'));
    expect(categoryName(s)).toBe('straightFlush');
  });

  it('vybere nejlepší pětici ze 7 karet', () => {
    const s = score(
      c('spades', 'A'),
      c('spades', 'K'),
      c('spades', 'Q'),
      c('spades', 'J'),
      c('spades', '10'),
      c('hearts', '2'),
      c('clubs', '3'),
    );
    expect(categoryName(s)).toBe('straightFlush'); // royal flush
    expect(s.tiebreak[0]).toBe(14);
  });

  it('barva přebíjí postupku', () => {
    const flush = score(c('spades', 'A'), c('spades', 'J'), c('spades', '9'), c('spades', '5'), c('spades', '2'));
    const straight = score(c('spades', '6'), c('hearts', '5'), c('clubs', '4'), c('diamonds', '3'), c('spades', '2'));
    expect(compareScore(flush, straight)).toBeGreaterThan(0);
  });

  it('vyšší dvojice přebíjí nižší', () => {
    const aces = score(c('spades', 'A'), c('hearts', 'A'), c('clubs', '9'), c('diamonds', '5'), c('spades', '2'));
    const kings = score(c('spades', 'K'), c('hearts', 'K'), c('clubs', '9'), c('diamonds', '5'), c('spades', '2'));
    expect(compareScore(aces, kings)).toBeGreaterThan(0);
  });

  it('kicker rozhoduje při shodné dvojici', () => {
    const aceKicker = score(c('spades', 'K'), c('hearts', 'K'), c('clubs', 'A'), c('diamonds', '5'), c('spades', '2'));
    const queenKicker = score(c('spades', 'K'), c('hearts', 'K'), c('clubs', 'Q'), c('diamonds', '5'), c('spades', '2'));
    expect(compareScore(aceKicker, queenKicker)).toBeGreaterThan(0);
  });

  it('shodné ruce dají remízu', () => {
    const a = score(c('spades', 'K'), c('hearts', 'K'), c('clubs', '9'), c('diamonds', '5'), c('spades', '2'));
    const b = score(c('diamonds', 'K'), c('clubs', 'K'), c('spades', '9'), c('hearts', '5'), c('clubs', '2'));
    expect(compareScore(a, b)).toBe(0);
  });
});
