import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const c = (suit: Card['suit'], rank: string): Card => ({
  deck: 'czech',
  suit,
  rank,
  id: `czech-${suit}-${rank}`,
});

const PAIR: Card[] = [c('hearts', '10'), c('bells', '10')];
const PETR: Card = c('acorns', 'U');

export function renderCernyPetrDemo(kind: string) {
  if (kind === 'pair') {
    return (
      <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
        <div className="flex gap-2">
          {PAIR.map((card) => (
            <CardView key={card.id} card={card} size="md" />
          ))}
        </div>
        <div className="text-white font-bold text-lg">= pár → odhodit</div>
      </div>
    );
  }
  if (kind === 'petr') {
    return (
      <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
        <CardView card={PETR} size="md" />
        <div className="text-white font-bold text-lg">Černý Petr — bez páru!</div>
      </div>
    );
  }
  return null;
}
