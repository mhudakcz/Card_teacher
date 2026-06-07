import type { GameDefinition } from '@/games/types';
import { zolikyRules, zolikyTutorial } from './content';
import { renderZolikyDemo } from './demo';
import { ZolikyBoard } from './Board';

export const zolikyGame: GameDefinition = {
  id: 'zoliky',
  rules: zolikyRules,
  tutorial: zolikyTutorial,
  renderDemo: renderZolikyDemo,
  Board: ZolikyBoard,
};
