import type { GameDefinition } from '@/games/types';
import { cernyPetrRules, cernyPetrTutorial } from './content';
import { renderCernyPetrDemo } from './demo';
import { CernyPetrBoard } from './Board';

export const cernyPetrGame: GameDefinition = {
  id: 'cernypetr',
  rules: cernyPetrRules,
  tutorial: cernyPetrTutorial,
  renderDemo: renderCernyPetrDemo,
  Board: CernyPetrBoard,
};
