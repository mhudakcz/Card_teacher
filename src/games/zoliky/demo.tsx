import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const c = (suit: Card['suit'], rank: string): Card => ({
  deck: 'french',
  suit,
  rank,
  id: `french-${suit}-${rank}`,
});

const joker = (n: number): Card => ({ deck: 'french', suit: 'spades', rank: 'JOKER', id: `joker-${n}` });

const SETS: Record<string, Card[]> = {
  set: [c('spades', '7'), c('hearts', '7'), c('clubs', '7')],
  run: [c('hearts', '5'), c('hearts', '6'), c('hearts', '7')],
  joker: [c('hearts', '5'), joker(0), c('hearts', '7')],
};

export function renderZolikyDemo(kind: string) {
  const cards = SETS[kind];
  if (!cards) return null;
  return (
    <div className="flex items-center gap-2 my-4 p-4 rounded-xl felt-table">
      {cards.map((card) => (
        <CardView key={card.id} card={card} size="md" />
      ))}
    </div>
  );
}
