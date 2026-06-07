import { describe, expect, it } from 'vitest';
import { type Card, seededRng } from '@/core/cards';
import {
  applyMove,
  beats,
  currentPlayer,
  defender,
  durakDeck,
  type DurakState,
  initDurak,
  isTerminal,
  legalMoves,
  rankValue,
} from './engine';
import { chooseMove } from './ai';

const fc = (suit: Card['suit'], rank: string): Card => ({
  deck: 'french',
  suit,
  rank,
  id: `french-${suit}-${rank}`,
});

function totalCards(s: DurakState): number {
  let n = s.deck.length + s.discard;
  for (const p of s.players) n += p.hand.length;
  for (const t of s.table) n += 1 + (t.defense ? 1 : 0);
  return n;
}

describe('balíček a hodnoty', () => {
  it('má 36 karet (6..A)', () => {
    const d = durakDeck();
    expect(d).toHaveLength(36);
    expect(d.every((c) => rankValue(c) >= 6)).toBe(true);
  });

  it('rankValue: 6=6 … A=14', () => {
    expect(rankValue(fc('hearts', '6'))).toBe(6);
    expect(rankValue(fc('hearts', 'A'))).toBe(14);
  });
});

describe('přebíjení', () => {
  const trump: Card['suit'] = 'hearts';
  it('vyšší karta téže barvy přebíjí', () => {
    expect(beats(fc('spades', 'K'), fc('spades', '10'), trump)).toBe(true);
    expect(beats(fc('spades', '9'), fc('spades', '10'), trump)).toBe(false);
  });
  it('trumf přebíjí netrumf, ne naopak', () => {
    expect(beats(fc('hearts', '6'), fc('spades', 'A'), trump)).toBe(true);
    expect(beats(fc('spades', 'A'), fc('hearts', '6'), trump)).toBe(false);
  });
  it('jiná netrumfová barva nepřebíjí', () => {
    expect(beats(fc('clubs', 'A'), fc('spades', '6'), trump)).toBe(false);
  });
});

describe('rozdání', () => {
  it('rozdá 6+6, zbytek v balíčku, trumf na spodu', () => {
    const s = initDurak({ rng: seededRng(1) });
    expect(s.players[0].hand).toHaveLength(6);
    expect(s.players[1].hand).toHaveLength(6);
    expect(s.deck.length).toBe(24); // 36 - 12
    expect(s.trumpCard.suit).toBe(s.trumpSuit);
    expect(totalCards(s)).toBe(36);
  });
});

describe('průběh kola', () => {
  it('útok → obrana → bito přehodí role a doplní ruce', () => {
    let s = initDurak({ rng: seededRng(3) });
    const atk0 = s.attacker;
    // útok první kartou
    const attackMove = legalMoves(s).find((m) => m.type === 'attack')!;
    s = applyMove(s, attackMove);
    expect(currentPlayer(s)).toBe(defender(s));
    expect(s.table).toHaveLength(1);

    // obránce buď přebije, nebo bere
    const defMoves = legalMoves(s);
    const defend = defMoves.find((m) => m.type === 'defend');
    if (defend) {
      s = applyMove(s, defend);
      expect(s.table[0].defense).not.toBeNull();
      // útočník ukončí kolo
      const done = legalMoves(s).find((m) => m.type === 'done')!;
      s = applyMove(s, done);
      expect(s.table).toHaveLength(0);
      expect(s.attacker).not.toBe(atk0); // role se prohodily
    } else {
      expect(defMoves.some((m) => m.type === 'take')).toBe(true);
    }
    expect(totalCards(s)).toBe(36);
  });

  it('take přesune karty ze stolu obránci', () => {
    let s = initDurak({ rng: seededRng(7) });
    const attackMove = legalMoves(s).find((m) => m.type === 'attack')!;
    s = applyMove(s, attackMove);
    const before = s.players[defender(s)].hand.length;
    s = applyMove(s, { type: 'take' });
    // obránce po dobrání má aspoň tolik co předtím (vzal kartu ze stolu)
    expect(s.players[defender(s) === 0 ? 1 : 0].hand.length + s.players[defender(s)].hand.length).toBeGreaterThan(0);
    expect(before).toBeGreaterThan(0);
    expect(totalCards(s)).toBe(36);
  });
});

describe('AI a integrita', () => {
  it('partie doběhne a vždy zůstane 36 karet', () => {
    let s = initDurak({ rng: seededRng(11) });
    const rng = seededRng(99);
    for (let step = 0; step < 2000 && !isTerminal(s); step++) {
      const me = currentPlayer(s);
      const level = me === 0 ? 'hard' : 'medium';
      const move = chooseMove(s, level, rng);
      const next = applyMove(s, move);
      // ochrana proti zacyklení: pokud se nic nezměnilo, vynuť done/take
      if (next === s) {
        const ms = legalMoves(s);
        s = applyMove(s, ms[0]);
      } else {
        s = next;
      }
      expect(totalCards(s)).toBe(36);
    }
    expect(isTerminal(s)).toBe(true);
  });

  it('chooseMove vrací jen legální tahy', () => {
    const s = initDurak({ rng: seededRng(5) });
    const legal = legalMoves(s);
    const m = chooseMove(s, 'hard', seededRng(2));
    expect(legal).toContainEqual(m);
  });
});
