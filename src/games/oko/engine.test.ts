import { describe, it, expect } from 'vitest';
import type { Card } from '@/core/cards';
import { seededRng } from '@/core/cards';
import {
  applyMove,
  dealerMove,
  handValue,
  initOko,
  isBust,
  legalMoves,
  type OkoState,
} from './engine';

const c = (rank: string): Card => ({
  deck: 'czech',
  suit: 'hearts',
  rank,
  id: `czech-hearts-${rank}`,
});

function state(playerHand: Card[], dealerHand: Card[], deck: Card[] = []): OkoState {
  return {
    players: [
      { id: 'you', name: 'Ty', isHuman: true, hand: playerHand, stood: false, busted: false },
      { id: 'd', name: 'Krupiér', isHuman: false, hand: dealerHand, stood: false, busted: false },
    ],
    deck,
    current: 0,
    phase: 'player',
    winner: null,
    log: [],
  };
}

describe('handValue', () => {
  it('sčítá podle českých hodnot (A=11,10=10,K=4,O=3,U=2)', () => {
    expect(handValue([c('A'), c('10')])).toBe(21);
    expect(handValue([c('K'), c('O'), c('U')])).toBe(9);
    expect(handValue([c('9'), c('8')])).toBe(17);
  });

  it('eso klesá z 11 na 1 při přetažení', () => {
    expect(handValue([c('A'), c('A'), c('9')])).toBe(21); // 11+1+9
    expect(handValue([c('A'), c('K'), c('10')])).toBe(15); // 1+4+10
  });
});

describe('init', () => {
  it('rozdá po dvou kartách a začíná u hráče', () => {
    const s = initOko({
      players: [
        { id: 'you', name: 'Ty', isHuman: true },
        { id: 'd', name: 'Krupiér', isHuman: false },
      ],
      rng: seededRng(1),
    });
    expect(s.players[0].hand).toHaveLength(2);
    expect(s.players[1].hand).toHaveLength(2);
    expect(s.phase).toBe('player');
    expect(s.deck).toHaveLength(28);
  });
});

describe('legalMoves', () => {
  it('nabízí hit i stand, dokud hráč hraje', () => {
    const moves = legalMoves(state([c('7'), c('8')], [c('9'), c('10')]));
    expect(moves.map((m) => m.type).sort()).toEqual(['hit', 'stand']);
  });

  it('nic, když je hra u konce', () => {
    const s = state([c('7')], [c('8')]);
    s.phase = 'done';
    expect(legalMoves(s)).toHaveLength(0);
  });
});

describe('applyMove', () => {
  it('hit přidá kartu z balíčku', () => {
    const s = state([c('7'), c('8')], [c('9'), c('10')], [c('K')]);
    const next = applyMove(s, { type: 'hit' });
    expect(next.players[0].hand).toHaveLength(3);
    expect(next.players[0].hand[2].rank).toBe('K');
  });

  it('přetažení hráče přepne na krupiéra', () => {
    const s = state([c('K'), c('10')], [c('9'), c('8')], [c('10')]); // 14 + 10 = 24
    const next = applyMove(s, { type: 'hit' });
    expect(next.players[0].busted).toBe(true);
    expect(next.phase).toBe('dealer');
    expect(next.current).toBe(1);
  });

  it('stand přepne na krupiéra', () => {
    const next = applyMove(state([c('K'), c('10')], [c('9'), c('8')]), { type: 'stand' });
    expect(next.players[0].stood).toBe(true);
    expect(next.phase).toBe('dealer');
  });

  it('nemutuje původní stav', () => {
    const s = state([c('7'), c('8')], [c('9'), c('10')], [c('K')]);
    applyMove(s, { type: 'hit' });
    expect(s.players[0].hand).toHaveLength(2);
  });
});

describe('vyhodnocení', () => {
  it('vyšší ruka vyhrává', () => {
    const s = state([c('K'), c('10')], [c('9'), c('8')]); // 14 vs 17
    const next = applyMove(s, { type: 'stand' }); // → dealer phase
    const done = applyMove(next, { type: 'stand' }); // krupiér stojí
    expect(done.phase).toBe('done');
    expect(done.winner).toBe('d');
  });

  it('remíza = push', () => {
    const s = state([c('9'), c('8')], [c('10'), c('7')]); // 17 vs 17
    const done = applyMove(applyMove(s, { type: 'stand' }), { type: 'stand' });
    expect(done.winner).toBe('push');
  });

  it('přetažený hráč prohrává', () => {
    const s = state([c('K'), c('10')], [c('9'), c('8')], [c('10')]);
    const busted = applyMove(s, { type: 'hit' }); // hráč 24 → bust, dealer phase
    const done = applyMove(busted, { type: 'stand' });
    expect(done.winner).toBe('d');
  });
});

describe('dealerMove', () => {
  it('dobírá pod 17, jinak stojí', () => {
    expect(dealerMove(state([], [c('9'), c('7')]))).toEqual({ type: 'hit' }); // 16
    expect(dealerMove(state([], [c('10'), c('7')]))).toEqual({ type: 'stand' }); // 17
  });
});

describe('isBust', () => {
  it('hlásí přetažení přes 21', () => {
    expect(isBust([c('10'), c('10'), c('9')])).toBe(true); // 29
    expect(isBust([c('K'), c('10'), c('7')])).toBe(false); // 21
  });
});
