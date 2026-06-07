import { describe, expect, it } from 'vitest';
import type { Card } from '@/core/cards';
import { isRun, isSet, canMeldAll, findMelds } from './melds';

let uid = 0;
function c(suit: string, rank: string): Card {
  return { deck: 'french', suit: suit as Card['suit'], rank, id: `c-${suit}-${rank}-${uid++}` };
}
function joker(): Card {
  return { deck: 'french', suit: 'spades', rank: 'JOKER', id: `joker-${uid++}` };
}

describe('žolíky — sety', () => {
  it('tři stejné hodnoty různých barev = set', () => {
    expect(isSet([c('spades', '7'), c('hearts', '7'), c('clubs', '7')])).toBe(true);
  });
  it('stejná barva dvakrát = neplatný set', () => {
    expect(isSet([c('spades', '7'), c('spades', '7'), c('clubs', '7')])).toBe(false);
  });
  it('set se žolíkem', () => {
    expect(isSet([c('spades', '7'), c('hearts', '7'), joker()])).toBe(true);
  });
  it('různé hodnoty = neplatný set', () => {
    expect(isSet([c('spades', '7'), c('hearts', '8'), c('clubs', '7')])).toBe(false);
  });
});

describe('žolíky — runy', () => {
  it('tři po sobě stejné barvy = run', () => {
    expect(isRun([c('hearts', '5'), c('hearts', '6'), c('hearts', '7')])).toBe(true);
  });
  it('run se žolíkem uprostřed', () => {
    expect(isRun([c('hearts', '5'), joker(), c('hearts', '7')])).toBe(true);
  });
  it('různé barvy = neplatný run', () => {
    expect(isRun([c('hearts', '5'), c('spades', '6'), c('hearts', '7')])).toBe(false);
  });
  it('nízké eso A-2-3', () => {
    expect(isRun([c('clubs', 'A'), c('clubs', '2'), c('clubs', '3')])).toBe(true);
  });
  it('vysoké eso Q-K-A', () => {
    expect(isRun([c('clubs', 'Q'), c('clubs', 'K'), c('clubs', 'A')])).toBe(true);
  });
  it('mezera bez žolíka = neplatný run', () => {
    expect(isRun([c('hearts', '5'), c('hearts', '7'), c('hearts', '8')])).toBe(false);
  });
});

describe('žolíky — rozklad ruky', () => {
  it('rozloží 9 karet na tři sestavy', () => {
    const hand = [
      c('spades', '7'), c('hearts', '7'), c('clubs', '7'), // set
      c('hearts', '5'), c('hearts', '6'), c('hearts', '7'), // run
      c('clubs', 'J'), c('clubs', 'Q'), c('clubs', 'K'), // run
    ];
    expect(canMeldAll(hand)).toBe(true);
    expect(findMelds(hand)?.length).toBe(3);
  });

  it('zbývající nezařaditelná karta = nelze rozložit', () => {
    const hand = [
      c('spades', '7'), c('hearts', '7'), c('clubs', '7'),
      c('hearts', '5'), c('hearts', '6'), c('hearts', '8'), // mezera
    ];
    expect(canMeldAll(hand)).toBe(false);
  });

  it('žolíky pomohou dokončit', () => {
    const hand = [
      c('spades', '7'), c('hearts', '7'), joker(), // set se žolíkem
      c('hearts', '5'), joker(), c('hearts', '7'), // run se žolíkem
    ];
    expect(canMeldAll(hand)).toBe(true);
  });
});
