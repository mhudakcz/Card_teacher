import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const f = (suit: Card['suit'], rank: string, n = 0): Card => ({
  deck: 'french',
  suit,
  rank,
  id: `french-${suit}-${rank}-${n}`,
});
const joker = (n: number): Card => ({ deck: 'french', suit: 'spades', rank: 'JOKER', id: `joker-${n}` });

export function renderKanastaDemo(kind: string) {
  if (kind === 'meld') {
    const cards = [f('hearts', 'K'), f('spades', 'K'), f('clubs', 'K')];
    return (
      <div className="flex flex-wrap items-center gap-1 my-4 p-4 rounded-xl felt-table">
        {cards.map((card) => (
          <CardView key={card.id} card={card} size="sm" />
        ))}
        <span className="text-white font-bold text-lg ml-3">= sestava</span>
      </div>
    );
  }

  if (kind === 'wild') {
    return (
      <div className="flex flex-wrap items-center gap-1 my-4 p-4 rounded-xl felt-table">
        <CardView card={f('hearts', '7')} size="sm" />
        <CardView card={f('clubs', '7')} size="sm" />
        <CardView card={joker(0)} size="sm" />
        <span className="text-white font-bold text-lg ml-3">2 přirozené + 1 divoká</span>
      </div>
    );
  }

  if (kind === 'canasta') {
    const cards = Array.from({ length: 7 }, (_, i) => f('hearts', 'Q', i));
    return (
      <div className="flex flex-wrap items-center gap-1 my-4 p-4 rounded-xl felt-table">
        {cards.map((card) => (
          <CardView key={card.id} card={card} size="sm" />
        ))}
        <span className="text-emerald-200 font-bold text-lg ml-3">čistá kanasta = 500 b.</span>
      </div>
    );
  }

  return null;
}
