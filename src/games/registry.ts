// Registr „zásuvných" her. Každá hra je jedna položka; obrazovky a navigace
// pracují jen s tímto registrem, takže přidání hry = přidání jednoho importu.
// Hra musí mít aspoň pravidla; tutoriál a herní deska jsou volitelné.

import type { GameDefinition } from './types';
import { prsiGame } from './prsi';
import { okoGame } from './oko';
import { sedmaGame } from './sedma';
import { zolikyGame } from './zoliky';
import { kanastaGame } from './kanasta';
import { mariasGame } from './marias';
import { tarokyGame } from './taroky';
import { pokerGame } from './poker';
import { cernyPetrGame } from './cernypetr';
import { pasiansGame } from './pasians';

export const GAMES: GameDefinition[] = [
  prsiGame,
  okoGame,
  sedmaGame,
  pokerGame,
  zolikyGame,
  mariasGame,
  kanastaGame,
  tarokyGame,
  cernyPetrGame,
  pasiansGame,
];

export type GameId = (typeof GAMES)[number]['id'];

const BY_ID = new Map<string, GameDefinition>(GAMES.map((g) => [g.id, g]));

export function getGame(id: string): GameDefinition | undefined {
  return BY_ID.get(id);
}
