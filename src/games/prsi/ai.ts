// AI soupeř pro Prší se 3 obtížnostmi.
//   easy   = náhodný legální tah
//   medium = heuristika: bránit se trestu, využít speciální karty, zbavovat se "drahých"
//   hard   = medium + výhled (sleduje počet karet soupeřů a šetří útoky na dobití)

import { type Card, type CzechSuit, CZECH_SUITS } from '@/core/cards';
import { legalMoves, type PrsiMove, type PrsiState } from './engine';

export type Difficulty = 'easy' | 'medium' | 'hard';

export function chooseMove(state: PrsiState, level: Difficulty, rng: () => number = Math.random): PrsiMove {
  const moves = legalMoves(state);
  if (moves.length === 0) return { type: 'draw' };
  if (level === 'easy') return pick(moves, rng);
  return chooseSmart(state, moves, level, rng);
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function chooseSmart(state: PrsiState, moves: PrsiMove[], level: Difficulty, rng: () => number): PrsiMove {
  const me = state.players[state.current];
  const playMoves = moves.filter((m) => m.type === 'play');

  // Pod útokem sedmičky: přebij pokud máš, jinak ber (nemůžeš jinak).
  if (state.pendingDraw > 0) {
    return playMoves[0] ?? { type: 'drawPenalty' };
  }
  // Pod útokem esa: přebij esem (zdrží soupeře), jinak přijmi.
  if (state.pendingSkip > 0) {
    return playMoves[0] ?? { type: 'acceptSkip' };
  }

  if (playMoves.length === 0) return { type: 'draw' };

  const nextOpp = state.players[(state.current + 1) % state.players.length];
  const opponentClose = nextOpp.hand.length <= 2; // soupeř blízko výhry

  const scored = playMoves.map((m) => ({ m, s: scorePlay(state, m, me.hand, opponentClose, level) }));
  scored.sort((a, b) => b.s - a.s);

  // Trochu náhody u medium, ať není čitelné; hard hraje nejlepší tah.
  if (level === 'medium' && scored.length > 1 && rng() < 0.2) {
    return scored[1].m;
  }
  return scored[0].m;
}

function scorePlay(
  state: PrsiState,
  move: Extract<PrsiMove, { type: 'play' }>,
  hand: Card[],
  opponentClose: boolean,
  level: Difficulty,
): number {
  const card = hand.find((c) => c.id === move.cardId)!;
  let s = 0;

  // Útočné karty jsou cennější, když je soupeř blízko výhry.
  if (card.rank === '7') s += opponentClose ? 12 : 6;
  if (card.rank === 'A') s += opponentClose ? 10 : 5;

  // Svršek je univerzál — schovej ho na později, pokud jdou hrát i jiné karty.
  if (card.rank === 'O') {
    s -= 4;
    if (move.chosenSuit) s += suitPreference(hand, move.chosenSuit); // měň na barvu, kterou máš
  }

  // Zbav se vysokých "drahých" karet (král, desítka), ať nezůstanou v ruce.
  if (card.rank === 'K' || card.rank === '10') s += 2;

  // hard: pokud zbude v ruce už jen jedna karta, preferuj tah, který nedává soupeři výhodu.
  if (level === 'hard' && hand.length === 2) s += 3;

  // Drobná preference hrát v platné barvě (udrží konzistenci).
  if (card.suit === state.activeSuit) s += 1;

  return s;
}

function suitPreference(hand: Card[], suit: CzechSuit): number {
  const count = hand.filter((c) => c.suit === suit).length;
  return count; // víc karet dané barvy = lepší volba po svršku
}

export const ALL_SUITS = CZECH_SUITS;
