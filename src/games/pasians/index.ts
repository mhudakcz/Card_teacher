import type { GameDefinition } from '@/games/types';
import { pasiansRules, pasiansTutorial } from './content';
import { renderPasiansDemo } from './demo';
import { PasiansBoard } from './Board';

export const pasiansGame: GameDefinition = {
  id: 'pasians',
  rules: pasiansRules,
  tutorial: pasiansTutorial,
  renderDemo: renderPasiansDemo,
  Board: PasiansBoard,
};
