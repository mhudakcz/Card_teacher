import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';

const c = (suit: Card['suit'], rank: string): Card => ({
  deck: 'french',
  suit,
  rank,
  id: `french-${suit}-${rank}`,
});

function Row({ cards }: { cards: Card[] }) {
  return (
    <div className="flex gap-1.5">
      {cards.map((card) => (
        <CardView key={card.id} card={card} size="sm" />
      ))}
    </div>
  );
}

export function renderPokerDemo(kind: string) {
  if (kind === 'hole') {
    return (
      <div className="flex items-center gap-4 my-4 p-4 rounded-xl felt-table">
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/70 mb-1">tvé 2 karty</span>
          <Row cards={[c('spades', 'A'), c('spades', 'K')]} />
        </div>
      </div>
    );
  }

  if (kind === 'community') {
    return (
      <div className="flex flex-wrap items-end gap-4 my-4 p-4 rounded-xl felt-table">
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/70 mb-1">tvé karty</span>
          <Row cards={[c('spades', 'A'), c('spades', 'K')]} />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/70 mb-1">flop + turn + river</span>
          <Row cards={[c('spades', 'Q'), c('spades', 'J'), c('spades', '10'), c('hearts', '4'), c('clubs', '2')]} />
        </div>
      </div>
    );
  }

  if (kind === 'ranking') {
    const examples: { label: string; cards: Card[] }[] = [
      { label: 'postupka v barvě', cards: [c('hearts', '9'), c('hearts', '8'), c('hearts', '7'), c('hearts', '6'), c('hearts', '5')] },
      { label: 'full house', cards: [c('spades', 'K'), c('hearts', 'K'), c('clubs', 'K'), c('diamonds', '9'), c('spades', '9')] },
      { label: 'barva', cards: [c('clubs', 'A'), c('clubs', 'J'), c('clubs', '8'), c('clubs', '5'), c('clubs', '2')] },
    ];
    return (
      <div className="flex flex-col gap-3 my-4 p-4 rounded-xl felt-table">
        {examples.map((ex) => (
          <div key={ex.label} className="flex items-center gap-3">
            <Row cards={ex.cards} />
            <span className="text-white/90 text-sm font-medium">{ex.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
