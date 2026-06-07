import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const c = (suit: Card['suit'], rank: string): Card => ({
  deck: 'czech',
  suit,
  rank,
  id: `czech-${suit}-${rank}`,
});

export function renderMariasDemo(kind: string) {
  if (kind === 'order') {
    const cards = ['A', '10', 'K', 'O', 'U', '9', '8', '7'].map((r) => c('hearts', r));
    return (
      <div className="flex flex-wrap items-center gap-1 my-4 p-4 rounded-xl felt-table">
        {cards.map((card) => (
          <CardView key={card.id} card={card} size="sm" />
        ))}
      </div>
    );
  }

  if (kind === 'trump') {
    return (
      <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/70 mb-1">vynáší (srdce)</span>
          <CardView card={c('hearts', 'A')} size="md" />
        </div>
        <div className="text-2xl text-white/80">→</div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-emerald-200 mb-1">trumf bere</span>
          <CardView card={c('bells', '7')} size="md" />
        </div>
      </div>
    );
  }

  if (kind === 'marriage') {
    return (
      <div className="flex items-center gap-2 my-4 p-4 rounded-xl felt-table">
        <CardView card={c('acorns', 'K')} size="md" />
        <CardView card={c('acorns', 'O')} size="md" />
        <span className="text-white font-bold text-lg ml-2">= hláška 20 / 40 b.</span>
      </div>
    );
  }

  return null;
}
