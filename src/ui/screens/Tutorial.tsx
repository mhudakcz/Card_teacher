import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Lng } from '@/i18n';
import { getGame } from '@/games/registry';
import { useNav } from '@/store';

export function Tutorial() {
  const { t, i18n } = useTranslation();
  const game = useNav((s) => s.game);
  const setView = useNav((s) => s.setView);
  const def = game ? getGame(game) : undefined;
  const [i, setI] = useState(0);

  if (!def?.tutorial) return null;

  const lng = (i18n.language as Lng) in def.tutorial ? (i18n.language as Lng) : 'cs';
  const steps = def.tutorial[lng];
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
      {step.demo && def.renderDemo?.(step.demo)}

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
