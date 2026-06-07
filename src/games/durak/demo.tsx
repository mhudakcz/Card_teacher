import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const fc = (suit: Card['suit'], rank: string): Card => ({
  deck: 'french',
  suit,
  rank,
  id: `french-${suit}-${rank}`,
});

export function renderDurakDemo(kind: string) {
  if (kind === 'trump') {
    return (
      <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
        <CardView card={fc('spades', 'A')} size="md" />
        <div className="text-white font-bold text-lg">←</div>
        <CardView card={fc('hearts', '6')} size="md" />
        <div className="text-white font-bold text-lg">trumf bije eso</div>
      </div>
    );
  }
  if (kind === 'beat') {
    return (
      <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
        <CardView card={fc('spades', '10')} size="md" />
        <div className="text-white font-bold text-lg">←</div>
        <CardView card={fc('spades', 'K')} size="md" />
        <div className="text-white font-bold text-lg">vyšší v barvě přebíjí</div>
      </div>
    );
  }
  return null;
}
