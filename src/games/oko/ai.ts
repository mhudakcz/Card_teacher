// Oko bere — strategie krupiéra. Tři obtížnosti mění, jak chytře dobírá.
//   • easy:   bázlivý, stojí už na 14 → často nechá nízký součet a prohraje.
//   • medium: učebnicové pravidlo, dobírá do 17.
//   • hard:   sleduje hráčův součet a dobírá, dokud ho nepřekoná (nebo nepřetáhne).

import { type OkoState, type OkoMove, handValue } from './engine';

export type Difficulty = 'easy' | 'medium' | 'hard';

export function chooseMove(state: OkoState, level: Difficulty): OkoMove {
  const dealer = state.players[1];
  const player = state.players[0];
  const dv = handValue(dealer.hand);

  if (level === 'easy') {
    return dv < 14 ? { type: 'hit' } : { type: 'stand' };
  }

  if (level === 'medium') {
    return dv < 17 ? { type: 'hit' } : { type: 'stand' };
  }

  // hard: pokud hráč už dohrál (stojí/přetáhl), žene se za jeho součtem.
  const playerDone = player.stood || player.busted;
  if (playerDone && !player.busted) {
    const pv = handValue(player.hand);
    if (dv <= pv) return { type: 'hit' }; // musí ho překonat
    return { type: 'stand' };
  }
  // jinak solidní základ: dobírej do 17.
  return dv < 17 ? { type: 'hit' } : { type: 'stand' };
}
