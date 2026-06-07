import type { GameDefinition } from '@/games/types';
import { pokerRules, pokerTutorial } from './content';
import { renderPokerDemo } from './demo';
import { PokerBoard } from './Board';

export const pokerGame: GameDefinition = {
  id: 'poker',
  rules: pokerRules,
  tutorial: pokerTutorial,
  renderDemo: renderPokerDemo,
  Board: PokerBoard,
};
