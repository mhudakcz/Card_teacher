import type { GameDefinition } from '@/games/types';
import { prsiRules, prsiTutorial } from './content';
import { renderPrsiDemo } from './demo';
import { PrsiBoard } from './Board';

export const prsiGame: GameDefinition = {
  id: 'prsi',
  rules: prsiRules,
  tutorial: prsiTutorial,
  renderDemo: renderPrsiDemo,
  Board: PrsiBoard,
};
