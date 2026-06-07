import { describe, expect, it } from 'vitest';
import {
  applyMove,
  initPoker,
  legalMoves,
  callAmount,
  raiseLimits,
  BIG_BLIND,
  SMALL_BLIND,
  START_CHIPS,
  type PokerState,
} from './engine';

function newGame(seed = 1): PokerState {
  return initPoker({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'PC', isHuman: false },
    ],
    seed,
  });
}

describe('poker engine — rozdání a blindy', () => {
  it('rozdá 2 karty každému a vsadí blindy', () => {
    const s = newGame();
    expect(s.players[0].hole).toHaveLength(2);
    expect(s.players[1].hole).toHaveLength(2);
    expect(s.pot).toBe(SMALL_BLIND + BIG_BLIND);
    expect(s.street).toBe('preflop');
  });

  it('button vsadí malý blind a hraje preflop první', () => {
    const s = newGame();
    const sb = s.button;
    const bb = (s.button + 1) % 2;
    expect(s.players[sb].bet).toBe(SMALL_BLIND);
    expect(s.players[bb].bet).toBe(BIG_BLIND);
    expect(s.current).toBe(sb);
    expect(s.betToMatch).toBe(BIG_BLIND);
  });

  it('nabídne fold/call/raise preflop', () => {
    const s = newGame();
    const moves = legalMoves(s).map((m) => m.type);
    expect(moves).toContain('fold');
    expect(moves).toContain('call');
    expect(moves).toContain('raise');
  });
});

describe('poker engine — sázení', () => {
  it('fold ukončí rozdání a soupeř bere bank', () => {
    const s = newGame();
    const folder = s.current;
    const other = (folder + 1) % 2;
    const next = applyMove(s, { type: 'fold' });
    expect(next.street).toBe('done');
    expect(next.result?.reason).toBe('fold');
    expect(next.result?.winner).toBe(next.players[other].id);
    // Vítěz získal celý bank.
    expect(next.players[other].chips).toBeGreaterThan(START_CHIPS - BIG_BLIND);
  });

  it('call + check přejde z preflopu na flop (3 karty)', () => {
    let s = newGame();
    s = applyMove(s, { type: 'call' }); // SB dorovná
    expect(s.street).toBe('preflop'); // BB má opci
    s = applyMove(s, { type: 'check' }); // BB checkne
    expect(s.street).toBe('flop');
    expect(s.community).toHaveLength(3);
  });

  it('po flopu hraje první hráč mimo button', () => {
    let s = newGame();
    s = applyMove(s, { type: 'call' });
    s = applyMove(s, { type: 'check' });
    expect(s.current).toBe((s.button + 1) % 2);
  });

  it('projde celé rozdání až do showdownu', () => {
    let s = newGame();
    s = applyMove(s, { type: 'call' }); // preflop
    s = applyMove(s, { type: 'check' });
    expect(s.street).toBe('flop');
    s = applyMove(s, { type: 'check' });
    s = applyMove(s, { type: 'check' });
    expect(s.street).toBe('turn');
    s = applyMove(s, { type: 'check' });
    s = applyMove(s, { type: 'check' });
    expect(s.street).toBe('river');
    s = applyMove(s, { type: 'check' });
    s = applyMove(s, { type: 'check' });
    expect(s.street).toBe('done');
    expect(s.community).toHaveLength(5);
    expect(s.result?.reason).toBe('showdown');
    expect(s.revealed).toBe(true);
  });

  it('raise vynutí reakci soupeře', () => {
    let s = newGame();
    const lim = raiseLimits(s)!;
    s = applyMove(s, { type: 'raise', to: lim.min });
    expect(s.betToMatch).toBe(lim.min);
    // soupeř je na tahu a musí dorovnat
    expect(callAmount(s)).toBeGreaterThan(0);
  });

  it('callAmount odpovídá rozdílu sázek', () => {
    const s = newGame();
    expect(callAmount(s)).toBe(BIG_BLIND - SMALL_BLIND);
  });
});

describe('poker engine — další rozdání', () => {
  it('nextHand rozdá znovu a posune button', () => {
    let s = newGame();
    const btn = s.button;
    s = applyMove(s, { type: 'fold' });
    expect(s.street).toBe('done');
    const next = applyMove(s, { type: 'nextHand' });
    expect(next.button).toBe((btn + 1) % 2);
    expect(next.street).toBe('preflop');
    expect(next.pot).toBe(SMALL_BLIND + BIG_BLIND);
  });

  it('součet žetonů a banku zůstává konstantní', () => {
    const s = newGame();
    const total = s.players[0].chips + s.players[1].chips + s.pot;
    expect(total).toBe(START_CHIPS * 2);
    const next = applyMove(s, { type: 'fold' });
    const total2 = next.players[0].chips + next.players[1].chips + next.pot;
    expect(total2).toBe(START_CHIPS * 2);
  });
});
