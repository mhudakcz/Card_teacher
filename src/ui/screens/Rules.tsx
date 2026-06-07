import { useTranslation } from 'react-i18next';
import type { Lng } from '@/i18n';
import { getGame } from '@/games/registry';
import { availableViews } from '@/games/types';
import { useNav } from '@/store';

export function Rules() {
  const { t, i18n } = useTranslation();
  const game = useNav((s) => s.game);
  const setView = useNav((s) => s.setView);
  const def = game ? getGame(game) : undefined;
  if (!def) return null;

  const lng = (i18n.language as Lng) in def.rules ? (i18n.language as Lng) : 'cs';
  const sections = def.rules[lng];
  // Další krok: tutoriál, nebo rovnou hra — podle toho, co hra nabízí.
  const next = availableViews(def).find((v) => v !== 'rules');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-ink">
        {t(`games.${def.id}.name`)} — {t('nav.rules')}
      </h1>
      <div className="panel rounded-2xl p-6">
        {sections.map((s) => (
          <section key={s.heading} className="mb-5 last:mb-0">
            <h2 className="text-lg font-semibold text-accent mb-1">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-ink/90 leading-relaxed mb-1">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
      {next && (
        <button
          onClick={() => setView(next)}
          className="mt-4 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold shadow-card transition"
        >
          {t('nav.' + next)} →
        </button>
      )}
    </div>
  );
}
