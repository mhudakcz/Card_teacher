import type { GameDefinition } from '@/games/types';
import { durakRules, durakTutorial } from './content';
import { renderDurakDemo } from './demo';
import { DurakBoard } from './Board';

export const durakGame: GameDefinition = {
  id: 'durak',
  rules: durakRules,
  tutorial: durakTutorial,
  renderDemo: renderDurakDemo,
  Board: DurakBoard,
};
