import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';
import { handValue } from './engine';

const c = (suit: Card['suit'], rank: string): Card => ({
  deck: 'czech',
  suit,
  rank,
  id: `czech-${suit}-${rank}`,
});

const SETS: Record<string, Card[]> = {
  value: [c('hearts', 'A'), c('bells', '10')],
  soft: [c('hearts', 'A'), c('acorns', 'K'), c('leaves', '10')],
  bust: [c('hearts', '10'), c('bells', '9'), c('leaves', '8')],
};

export function renderOkoDemo(kind: string) {
  const hand = SETS[kind];
  if (!hand) return null;
  const value = handValue(hand);
  const bust = value > 21;
  return (
    <div className="flex items-center gap-6 my-4 p-4 rounded-xl felt-table">
      <div className="flex gap-2">
        {hand.map((card) => (
          <CardView key={card.id} card={card} size="md" />
        ))}
      </div>
      <div
        className={`text-2xl font-black ${bust ? 'text-rose-300' : 'text-white'}`}
      >
        = {value}
      </div>
    </div>
  );
}
