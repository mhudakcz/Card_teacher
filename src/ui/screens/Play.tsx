import { getGame } from '@/games/registry';
import { useNav } from '@/store';

export function Play() {
  const game = useNav((s) => s.game);
  const def = game ? getGame(game) : undefined;
  const Board = def?.Board;
  if (!Board) return null;
  return <Board />;
}
