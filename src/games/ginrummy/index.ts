import type { GameDefinition } from '@/games/types';
import { ginRummyRules, ginRummyTutorial } from './content';
import { renderGinRummyDemo } from './demo';
import { GinRummyBoard } from './Board';

export const ginRummyGame: GameDefinition = {
  id: 'ginrummy',
  rules: ginRummyRules,
  tutorial: ginRummyTutorial,
  renderDemo: renderGinRummyDemo,
  Board: GinRummyBoard,
};
