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
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  U: 'U',
  O: 'O',
  K: 'K',
  A: 'A',
};

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

  const color = suitColor(card.suit);
  const label = `${t('card.ranks.' + card.rank)} ${t('card.suits.' + card.suit)}`;

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
        <span>{RANK_LABEL[card.rank]}</span>
        <SuitIcon suit={card.suit} size={14} />
      </div>
      <div className="flex items-center justify-center">
        <SuitIcon suit={card.suit} size={size === 'sm' ? 20 : 30} />
      </div>
      <div className="flex items-center justify-between font-bold leading-none rotate-180">
        <span>{RANK_LABEL[card.rank]}</span>
        <SuitIcon suit={card.suit} size={14} />
      </div>
    </button>
  );
}
