import type { GameDefinition } from '@/games/types';
import { kanastaRules, kanastaTutorial } from './content';
import { renderKanastaDemo } from './demo';
import { KanastaBoard } from './Board';

export const kanastaGame: GameDefinition = {
  id: 'kanasta',
  rules: kanastaRules,
  tutorial: kanastaTutorial,
  renderDemo: renderKanastaDemo,
  Board: KanastaBoard,
};
