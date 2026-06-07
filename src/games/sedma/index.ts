import type { GameDefinition } from '@/games/types';
import { sedmaRules, sedmaTutorial } from './content';
import { renderSedmaDemo } from './demo';
import { SedmaBoard } from './Board';

export const sedmaGame: GameDefinition = {
  id: 'sedma',
  rules: sedmaRules,
  tutorial: sedmaTutorial,
  renderDemo: renderSedmaDemo,
  Board: SedmaBoard,
};
