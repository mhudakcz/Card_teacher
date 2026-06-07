import type { GameDefinition } from '@/games/types';
import { tarokyRules, tarokyTutorial } from './content';
import { renderTarokyDemo } from './demo';
import { TarokyBoard } from './Board';

export const tarokyGame: GameDefinition = {
  id: 'taroky',
  rules: tarokyRules,
  tutorial: tarokyTutorial,
  renderDemo: renderTarokyDemo,
  Board: TarokyBoard,
};
