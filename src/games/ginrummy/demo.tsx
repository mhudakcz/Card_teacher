import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const fc = (suit: Card['suit'], rank: string): Card => ({
  deck: 'french',
  suit,
  rank,
  id: `french-${suit}-${rank}`,
});

const SET: Card[] = [fc('hearts', '7'), fc('spades', '7'), fc('clubs', '7')];
const RUN: Card[] = [fc('hearts', '5'), fc('hearts', '6'), fc('hearts', '7')];

export function renderGinRummyDemo(kind: string) {
  if (kind === 'set') {
    return (
      <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
        <div className="flex gap-2">
          {SET.map((card) => (
            <CardView key={card.id} card={card} size="md" />
          ))}
        </div>
        <div className="text-white font-bold text-lg">set — tři sedmičky</div>
      </div>
    );
  }
  if (kind === 'run') {
    return (
      <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
        <div className="flex gap-2">
          {RUN.map((card) => (
            <CardView key={card.id} card={card} size="md" />
          ))}
        </div>
        <div className="text-white font-bold text-lg">run — 5-6-7 srdcí</div>
      </div>
    );
  }
  return null;
}
