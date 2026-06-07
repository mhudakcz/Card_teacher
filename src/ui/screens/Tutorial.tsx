import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { prsiTutorial, type TutorialStep } from '@/games/prsi/content';
import type { Lng } from '@/i18n';
import type { Card } from '@/core/cards';
import { CardView } from '@/ui/components/CardView';
import { useNav } from '@/store';

const c = (suit: Card['suit'], rank: string): Card => ({
  deck: 'czech',
  suit,
  rank,
  id: `czech-${suit}-${rank}`,
});

function Demo({ kind }: { kind: NonNullable<TutorialStep['demo']> }) {
  const sets: Record<string, { top: Card; hand: Card[] }> = {
    match: { top: c('hearts', '8'), hand: [c('hearts', 'K'), c('bells', '8'), c('leaves', '9')] },
    sevens: { top: c('hearts', '7'), hand: [c('bells', '7'), c('leaves', 'K')] },
    ace: { top: c('hearts', 'A'), hand: [c('bells', 'A'), c('leaves', '9')] },
    over: { top: c('hearts', '8'), hand: [c('bells', 'O'), c('acorns', '9')] },
  };
  const { top, hand } = sets[kind];
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

export function Tutorial() {
  const { t, i18n } = useTranslation();
  const lng = (i18n.language as Lng) in prsiTutorial ? (i18n.language as Lng) : 'cs';
  const steps = prsiTutorial[lng];
  const [i, setI] = useState(0);
  const setView = useNav((s) => s.setView);
  const step = steps[i];
  const last = i === steps.length - 1;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex gap-1 mb-6">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded transition-colors ${idx <= i ? 'bg-accent' : 'bg-line'}`}
          />
        ))}
      </div>

      <h1 className="text-2xl font-bold mb-2 text-ink">{step.title}</h1>
      <p className="text-ink/90 leading-relaxed">{step.text}</p>
      {step.demo && <Demo kind={step.demo} />}

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="px-4 py-2 rounded-lg bg-line/40 text-ink disabled:opacity-40 transition"
        >
          ← {t('nav.back')}
        </button>
        {last ? (
          <button
            onClick={() => setView('play')}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold shadow-card transition"
          >
            {t('nav.play')} →
          </button>
        ) : (
          <button
            onClick={() => setI((v) => v + 1)}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold shadow-card transition"
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}
