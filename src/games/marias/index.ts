import type { GameDefinition } from '@/games/types';
import { mariasRules, mariasTutorial } from './content';
import { renderMariasDemo } from './demo';
import { MariasBoard } from './Board';

export const mariasGame: GameDefinition = {
  id: 'marias',
  rules: mariasRules,
  tutorial: mariasTutorial,
  renderDemo: renderMariasDemo,
  Board: MariasBoard,
};
