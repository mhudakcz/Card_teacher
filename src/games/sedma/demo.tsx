import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const c = (suit: Card['suit'], rank: string): Card => ({
  deck: 'czech',
  suit,
  rank,
  id: `czech-${suit}-${rank}`,
});

const SETS: Record<string, { lead: Card; response: Card; note: string }> = {
  beat: { lead: c('hearts', 'K'), response: c('bells', 'K'), note: 'bere' },
  seven: { lead: c('hearts', 'A'), response: c('leaves', '7'), note: 'bere' },
};

const POINTS: Card[] = [
  { deck: 'czech', suit: 'hearts', rank: '10', id: 'czech-hearts-10' },
  { deck: 'czech', suit: 'bells', rank: 'A', id: 'czech-bells-A' },
];

export function renderSedmaDemo(kind: string) {
  if (kind === 'points') {
    return (
      <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
        <div className="flex gap-2">
          {POINTS.map((card) => (
            <CardView key={card.id} card={card} size="md" />
          ))}
        </div>
        <div className="text-white font-bold text-lg">= 10 + 10 bodů</div>
      </div>
    );
  }

  const set = SETS[kind];
  if (!set) return null;
  return (
    <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
      <div className="flex flex-col items-center">
        <span className="text-xs text-white/70 mb-1">vynáší</span>
        <CardView card={set.lead} size="md" />
      </div>
      <div className="text-2xl text-white/80">→</div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-emerald-200 mb-1">{set.note}</span>
        <CardView card={set.response} size="md" />
      </div>
    </div>
  );
}
