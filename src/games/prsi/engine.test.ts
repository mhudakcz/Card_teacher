import { describe, it, expect } from 'vitest';
import { initPrsi, legalMoves, applyMove, topCard, type PrsiState } from './engine';
import { seededRng, type Card } from '@/core/cards';

function setup(): PrsiState {
  return initPrsi({
    players: [
      { id: 'p0', name: 'Hráč', isHuman: true },
      { id: 'p1', name: 'AI', isHuman: false },
    ],
    rng: seededRng(42),
  });
}

const card = (suit: Card['suit'], rank: string): Card => ({
  deck: 'czech',
  suit,
  rank,
  id: `czech-${suit}-${rank}`,
});

describe('initPrsi', () => {
  it('rozdá každému 4 karty a začne neutrální vrchní kartou', () => {
    const s = setup();
    expect(s.players[0].hand).toHaveLength(4);
    expect(s.players[1].hand).toHaveLength(4);
    const top = topCard(s);
    expect(['7', 'A', 'O']).not.toContain(top.rank);
  });

  it('balíček + ruce + odhazovák = 32 karet', () => {
    const s = setup();
    const total = s.deck.length + s.discard.length + s.players.reduce((n, p) => n + p.hand.length, 0);
    expect(total).toBe(32);
  });
});

describe('matching a tahy', () => {
  it('lze zahrát kartu shodné barvy nebo hodnoty', () => {
    const s = setup();
    s.discard = [card('hearts', '8')];
    s.activeSuit = 'hearts';
    s.players[0].hand = [card('hearts', 'K'), card('bells', '8'), card('leaves', '9')];
    const moves = legalMoves(s);
    const playable = moves.filter((m) => m.type === 'play').map((m) => (m as any).cardId);
    expect(playable).toContain('czech-hearts-K'); // shoda barvy
    expect(playable).toContain('czech-bells-8'); // shoda hodnoty
    expect(playable).not.toContain('czech-leaves-9');
  });

  it('svršek lze zahrát na cokoli a změní barvu', () => {
    const s = setup();
    s.discard = [card('hearts', '8')];
    s.activeSuit = 'hearts';
    s.players[0].hand = [card('bells', 'O'), card('acorns', '9')];
    s.current = 0;
    const next = applyMove(s, { type: 'play', cardId: 'czech-bells-O', chosenSuit: 'acorns' }, seededRng(1));
    expect(next.activeSuit).toBe('acorns');
  });
});

describe('sedmička', () => {
  it('sčítá trest a vynutí líznutí nebo přebití', () => {
    const s = setup();
    s.discard = [card('hearts', '7')];
    s.activeSuit = 'hearts';
    s.pendingDraw = 2;
    s.current = 1;
    s.players[1].hand = [card('bells', '7'), card('leaves', 'K')];
    const moves = legalMoves(s);
    expect(moves.some((m) => m.type === 'drawPenalty')).toBe(true);
    expect(moves.some((m) => m.type === 'play' && (m as any).cardId === 'czech-bells-7')).toBe(true);
    expect(moves.some((m) => m.type === 'play' && (m as any).cardId === 'czech-leaves-K')).toBe(false);

    const after = applyMove(s, { type: 'play', cardId: 'czech-bells-7' }, seededRng(1));
    expect(after.pendingDraw).toBe(4);
  });

  it('drawPenalty vezme nasčítané karty a vynuluje trest', () => {
    const s = setup();
    s.discard = [card('hearts', '7')];
    s.pendingDraw = 4;
    s.current = 1;
    const before = s.players[1].hand.length;
    const after = applyMove(s, { type: 'drawPenalty' }, seededRng(1));
    expect(after.players[1].hand.length).toBe(before + 4);
    expect(after.pendingDraw).toBe(0);
  });
});

describe('eso', () => {
  it('eso nastaví přeskočení a acceptSkip ho sníží', () => {
    const s = setup();
    s.discard = [card('hearts', '9')];
    s.activeSuit = 'hearts';
    s.players[0].hand = [card('hearts', 'A')];
    s.current = 0;
    // hráč 0 zahraje eso -> ale to by vyhrál (prázdná ruka). Přidej kartu.
    s.players[0].hand = [card('hearts', 'A'), card('bells', '9')];
    const afterAce = applyMove(s, { type: 'play', cardId: 'czech-hearts-A' }, seededRng(1));
    expect(afterAce.pendingSkip).toBe(1);
    expect(afterAce.current).toBe(1);

    const afterSkip = applyMove(afterAce, { type: 'acceptSkip' }, seededRng(1));
    expect(afterSkip.pendingSkip).toBe(0);
    expect(afterSkip.current).toBe(0);
  });
});

describe('vítězství', () => {
  it('hráč bez karet vyhrává', () => {
    const s = setup();
    s.discard = [card('hearts', '9')];
    s.activeSuit = 'hearts';
    s.players[0].hand = [card('hearts', 'K')];
    s.current = 0;
    const after = applyMove(s, { type: 'play', cardId: 'czech-hearts-K' }, seededRng(1));
    expect(after.winner).toBe('p0');
  });
});

describe('nemutuje předchozí stav', () => {
  it('applyMove vrací nový objekt', () => {
    const s = setup();
    const handBefore = s.players[0].hand.length;
    applyMove(s, { type: 'draw' }, seededRng(1));
    expect(s.players[0].hand.length).toBe(handBefore);
  });
});
