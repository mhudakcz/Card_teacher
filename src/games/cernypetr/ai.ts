// Černý Petr — strategie počítače. Tři obtížnosti.
//   • easy:   náhodná karta od soupeře.
//   • medium: přednostně bere kartu, kterou si rovnou spáruje (zmenší ruku).
//   • hard:   jako medium + nikdy si dobrovolně nevezme Černého Petra, když má na výběr.
// Pozn.: Černý Petr je z velké části hra náhody — „těžký" soupeř má dokonalý přehled
// a vyhýbá se Petrovi, takže se na něj smůla nalepí mnohem hůř.

import { type CernyPetrState, type CernyPetrMove, isPetr } from './engine';
import type { Card } from '@/core/cards';

export type Difficulty = 'easy' | 'medium' | 'hard';

function pick(index: number): CernyPetrMove {
  return { type: 'draw', index };
}

export function chooseMove(state: CernyPetrState, level: Difficulty): CernyPetrMove {
  const me = state.players[state.current];
  const opp = state.players[(state.current + 1) % 2];
  const hand = opp.hand;
  const myRanks = new Set(me.hand.map((c) => c.rank));

  if (level === 'easy') {
    return pick(Math.floor(Math.random() * hand.length));
  }

  // Indexy, které soupeř (= tažený balíček) nabízí.
  const candidates = hand.map((card, index) => ({ card, index }));

  // Těžký: vyřaď Černého Petra, pokud existuje jiná možnost.
  let pool = candidates;
  if (level === 'hard') {
    const safe = candidates.filter((c) => !isPetr(c.card));
    if (safe.length > 0) pool = safe;
  }

  // Přednostně karta, která se rovnou spáruje.
  const pairing = pool.filter((c) => myRanks.has(c.card.rank));
  const chosen = pairing.length > 0 ? pairing : pool;
  const rngPick: { card: Card; index: number } =
    chosen[Math.floor(Math.random() * chosen.length)];
  return pick(rngPick.index);
}
