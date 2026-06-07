import type { GameDefinition } from '@/games/types';
import { okoRules, okoTutorial } from './content';
import { renderOkoDemo } from './demo';
import { OkoBoard } from './Board';

export const okoGame: GameDefinition = {
  id: 'oko',
  rules: okoRules,
  tutorial: okoTutorial,
  renderDemo: renderOkoDemo,
  Board: OkoBoard,
};
