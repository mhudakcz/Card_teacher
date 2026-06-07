import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const suit = (s: Card['suit'], rank: string): Card => ({
  deck: 'tarock',
  suit: s,
  rank,
  id: `tarock-${s}-${rank}`,
});
const trump = (rank: string): Card => ({
  deck: 'tarock',
  suit: 'trump' as Card['suit'],
  rank,
  id: `tarock-trump-${rank}`,
});

export function renderTarokyDemo(kind: string) {
  if (kind === 'trumps') {
    const cards = [trump('I'), trump('XII'), trump('XXI'), trump('SKYZ')];
    return (
      <div className="flex flex-wrap items-center gap-1 my-4 p-4 rounded-xl felt-table">
        {cards.map((card) => (
          <CardView key={card.id} card={card} size="sm" />
        ))}
        <span className="text-amber-200 font-bold text-sm ml-2">I (pagát) … XXI (mond) … Škýz</span>
      </div>
    );
  }

  if (kind === 'beat') {
    return (
      <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/70 mb-1">vynáší</span>
          <CardView card={suit('hearts', 'A')} size="md" />
        </div>
        <div className="text-2xl text-white/80">→</div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-amber-200 mb-1">trumf bere</span>
          <CardView card={trump('V')} size="md" />
        </div>
      </div>
    );
  }

  if (kind === 'honours') {
    return (
      <div className="flex flex-wrap items-center gap-1 my-4 p-4 rounded-xl felt-table">
        <CardView card={trump('I')} size="sm" />
        <CardView card={trump('XXI')} size="sm" />
        <CardView card={trump('SKYZ')} size="sm" />
        <CardView card={suit('acorns', 'K')} size="sm" />
        <span className="text-white font-bold text-sm ml-2">honéry a král = 5 b.</span>
      </div>
    );
  }

  return null;
}
