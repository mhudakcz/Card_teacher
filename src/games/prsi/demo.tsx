import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const c = (suit: Card['suit'], rank: string): Card => ({
  deck: 'czech',
  suit,
  rank,
  id: `czech-${suit}-${rank}`,
});

const SETS: Record<string, { top: Card; hand: Card[] }> = {
  match: { top: c('hearts', '8'), hand: [c('hearts', 'K'), c('bells', '8'), c('leaves', '9')] },
  sevens: { top: c('hearts', '7'), hand: [c('bells', '7'), c('leaves', 'K')] },
  ace: { top: c('hearts', 'A'), hand: [c('bells', 'A'), c('leaves', '9')] },
  over: { top: c('hearts', '8'), hand: [c('bells', 'O'), c('acorns', '9')] },
};

export function renderPrsiDemo(kind: string) {
  const set = SETS[kind];
  if (!set) return null;
  const { top, hand } = set;
  return (
    <div className="flex items-center gap-6 my-4 p-4 rounded-xl felt-table">
      <div className="flex flex-col items-center">
        <span className="text-xs text-white/70 mb-1">vrch</span>
        <CardView card={top} size="md" />
      </div>
      <div className="text-2xl text-white/80">↤</div>
      <div className="flex gap-2">
        {hand.map((card) => (
          <CardView key={card.id} card={card} size="md" />
        ))}
      </div>
    </div>
  );
}
