import { useTranslation } from 'react-i18next';
import type { Card } from '@/core/cards';
import { SuitIcon, suitColor } from './SuitIcon';

interface Props {
  card?: Card;
  faceDown?: boolean;
  selectable?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'w-11 h-16 text-sm',
  md: 'w-16 h-24 text-lg',
  lg: 'w-20 h-28 text-xl',
};

const RANK_LABEL: Record<string, string> = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  J: 'J',
  Q: 'Q',
  U: 'U',
  O: 'O',
  K: 'K',
  A: 'A',
};

function rankLabel(rank: string): string {
  return RANK_LABEL[rank] ?? rank;
}

export function CardView({ card, faceDown, selectable, dimmed, onClick, size = 'md' }: Props) {
  const { t } = useTranslation();
  const base = `relative rounded-xl border shadow-card flex flex-col justify-between select-none ${SIZES[size]}`;

  if (faceDown || !card) {
    return (
      <div
        className={`${base} border-slate-900/40 bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-950`}
        aria-label="rub karty"
      >
        <div className="absolute inset-1.5 rounded-lg border border-white/15" />
        <div className="absolute inset-0 flex items-center justify-center text-white/15 text-2xl font-black">
          ✦
        </div>
      </div>
    );
  }

  if (card.deck === 'tarock' && card.suit === 'trump') {
    const isSkyz = card.rank === 'SKYZ';
    const label = isSkyz ? 'Škýz' : `taroka ${card.rank}`;
    return (
      <button
        type="button"
        onClick={selectable ? onClick : undefined}
        disabled={!selectable}
        aria-label={label}
        className={`${base} bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 text-amber-950 p-1.5 transition animate-card-in ${
          selectable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl ring-2 ring-accent' : 'cursor-default'
        } ${dimmed ? 'opacity-40' : ''}`}
      >
        <div className="flex items-center justify-between font-bold leading-none">
          <span>{isSkyz ? '★' : card.rank}</span>
          <span className="text-[10px]">✦</span>
        </div>
        <div className="flex items-center justify-center font-black leading-none">
          {isSkyz ? '★' : card.rank}
        </div>
        <div className="flex items-center justify-between font-bold leading-none rotate-180">
          <span>{isSkyz ? '★' : card.rank}</span>
          <span className="text-[10px]">✦</span>
        </div>
      </button>
    );
  }

  if (card.rank === 'JOKER') {
    return (
      <button
        type="button"
        onClick={selectable ? onClick : undefined}
        disabled={!selectable}
        aria-label={t('card.joker', 'Žolík')}
        className={`${base} bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-800 text-white p-1.5 transition animate-card-in ${
          selectable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl ring-2 ring-accent' : 'cursor-default'
        } ${dimmed ? 'opacity-40' : ''}`}
      >
        <div className="flex items-center font-bold leading-none">★</div>
        <div className="flex items-center justify-center text-2xl">🃏</div>
        <div className="flex items-center justify-end font-bold leading-none rotate-180">★</div>
      </button>
    );
  }

  const color = suitColor(card.suit);
  const label = `${t('card.ranks.' + card.rank, rankLabel(card.rank))} ${t('card.suits.' + card.suit, card.suit)}`;

  return (
    <button
      type="button"
      onClick={selectable ? onClick : undefined}
      disabled={!selectable}
      aria-label={label}
      className={`${base} bg-white p-1.5 transition animate-card-in ${
        selectable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl ring-2 ring-accent' : 'cursor-default'
      } ${dimmed ? 'opacity-40' : ''}`}
      style={{ color }}
    >
      <div className="flex items-center justify-between font-bold leading-none">
        <span>{rankLabel(card.rank)}</span>
        <SuitIcon suit={card.suit} size={14} />
      </div>
      <div className="flex items-center justify-center">
        <SuitIcon suit={card.suit} size={size === 'sm' ? 20 : 30} />
      </div>
      <div className="flex items-center justify-between font-bold leading-none rotate-180">
        <span>{rankLabel(card.rank)}</span>
        <SuitIcon suit={card.suit} size={14} />
      </div>
    </button>
  );
}
