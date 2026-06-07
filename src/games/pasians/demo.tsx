import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const fc = (suit: Card['suit'], rank: string): Card => ({
  deck: 'french',
  suit,
  rank,
  id: `french-${suit}-${rank}`,
});

const FOUNDATION: Card[] = [fc('hearts', 'A'), fc('hearts', '2'), fc('hearts', '3')];
const TABLEAU: Card[] = [fc('spades', '8'), fc('hearts', '7'), fc('clubs', '6')];

export function renderPasiansDemo(kind: string) {
  if (kind === 'foundation') {
    return (
      <div className="flex items-center gap-2 my-4 p-4 rounded-xl felt-table">
        {FOUNDATION.map((card) => (
          <CardView key={card.id} card={card} size="sm" />
        ))}
        <span className="text-white font-bold ml-2">A → 2 → 3 …</span>
      </div>
    );
  }
  if (kind === 'tableau') {
    return (
      <div className="flex items-center gap-2 my-4 p-4 rounded-xl felt-table">
        {TABLEAU.map((card) => (
          <CardView key={card.id} card={card} size="sm" />
        ))}
        <span className="text-white font-bold ml-2">8 ♠ → 7 ♥ → 6 ♣</span>
      </div>
    );
  }
  return null;
}
