import { describe, expect, it } from 'vitest';
import { seededRng } from '@/core/cards';
import {
  applyMove,
  cernyPetrDeck,
  initCernyPetr,
  isPetr,
  isTerminal,
  legalMoves,
  PETR_RANK,
  PETR_SUIT,
} from './engine';
import { chooseMove } from './ai';

const PLAYERS = [
  { id: 'you', name: 'Ty', isHuman: true },
  { id: 'ai', name: 'PC', isHuman: false },
];

function newGame(seed = 1) {
  return initCernyPetr({ players: PLAYERS, rng: seededRng(seed) });
}

describe('balíček Černého Petra', () => {
  it('má 29 karet (32 minus tři spodci)', () => {
    expect(cernyPetrDeck()).toHaveLength(29);
  });

  it('obsahuje právě jeden spodek (Černý Petr)', () => {
    const unders = cernyPetrDeck().filter((c) => c.rank === PETR_RANK);
    expect(unders).toHaveLength(1);
    expect(unders[0].suit).toBe(PETR_SUIT);
    expect(isPetr(unders[0])).toBe(true);
  });

  it('každá jiná hodnota má 4 kusy → vše se dá spárovat', () => {
    const deck = cernyPetrDeck();
    const counts = new Map<string, number>();
    for (const c of deck) counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1);
    for (const [rank, n] of counts) {
      if (rank === PETR_RANK) expect(n).toBe(1);
      else expect(n).toBe(4);
    }
  });
});

describe('init', () => {
  it('rozdá všech 29 karet mezi dva hráče', () => {
    const s = newGame();
    const total = s.players[0].hand.length + s.players[1].hand.length + s.players[0].discarded + s.players[1].discarded;
    expect(total).toBe(29);
  });

  it('po rozdání nezůstanou v ruce žádné páry', () => {
    const s = newGame(7);
    for (const p of s.players) {
      const ranks = p.hand.map((c) => c.rank);
      expect(new Set(ranks).size).toBe(ranks.length);
    }
  });

  it('odhozených je vždy sudý počet', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const s = newGame(seed);
      expect(s.players[0].discarded % 2).toBe(0);
      expect(s.players[1].discarded % 2).toBe(0);
    }
  });
});

describe('tah', () => {
  it('tažení spárovatelné karty zmenší obě ruce', () => {
    let s = newGame(3);
    const opp = s.players[1];
    // najdi index karty, kterou má hráč 0 v ruce (utvoří pár)
    const myRanks = new Set(s.players[0].hand.map((c) => c.rank));
    const idx = opp.hand.findIndex((c) => myRanks.has(c.rank));
    if (idx === -1) return; // pro tento seed nenastalo
    const before0 = s.players[0].hand.length;
    s = applyMove(s, { type: 'draw', index: idx });
    // hráč 0 si pár odhodil → ruka o 1 menší než před tahem
    expect(s.players[0].hand.length).toBe(before0 - 1);
  });

  it('legalMoves nabízí indexy do soupeřovy ruky', () => {
    const s = newGame();
    expect(legalMoves(s)).toHaveLength(s.players[1].hand.length);
  });
});

describe('konec hry', () => {
  it('AI (easy/medium/hard) vždy dohraje a určí poraženého s Petrem', () => {
    for (const level of ['easy', 'medium', 'hard'] as const) {
      for (let seed = 1; seed <= 30; seed++) {
        let s = newGame(seed);
        let guard = 0;
        while (!isTerminal(s) && guard++ < 200) {
          s = applyMove(s, chooseMove(s, level));
        }
        expect(isTerminal(s)).toBe(true);
        expect(s.loser).not.toBeNull();
        expect(s.winner).not.toBeNull();
        expect(s.winner).not.toBe(s.loser);
        // poražený drží právě Černého Petra
        const loserIdx = s.players.findIndex((p) => p.id === s.loser);
        expect(s.players[loserIdx].hand.some(isPetr)).toBe(true);
      }
    }
  });

  it('těžký soupeř prohrává méně často než lehký (vyhýbá se Petrovi)', () => {
    const run = (level: 'easy' | 'hard') => {
      let aiLosses = 0;
      for (let seed = 1; seed <= 60; seed++) {
        let s = newGame(seed);
        let guard = 0;
        while (!isTerminal(s) && guard++ < 200) {
          // hráč 0 hraje vždy náhodně, hráč 1 (AI) podle úrovně
          const lvl = s.current === 1 ? level : 'easy';
          s = applyMove(s, chooseMove(s, lvl));
        }
        if (s.loser === 'ai') aiLosses++;
      }
      return aiLosses;
    };
    expect(run('hard')).toBeLessThanOrEqual(run('easy'));
  });
});
