import { useTranslation } from 'react-i18next';
import { GAMES } from '@/games/registry';
import { availableViews } from '@/games/types';
import { useNav } from '@/store';

export function GameList() {
  const { t } = useTranslation();
  const openGame = useNav((s) => s.openGame);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-1 text-ink">{t('app.chooseGame')}</h1>
      <p className="text-muted mb-6">{t('app.subtitle')}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((g) => {
          const views = availableViews(g);
          const playable = views.includes('play');
          return (
            <button
              key={g.id}
              onClick={() => openGame(g.id)}
              className="group text-left rounded-2xl felt-table p-5 hover:scale-[1.02] hover:-translate-y-0.5 transition duration-200"
            >
              <div className="text-xl font-bold text-white drop-shadow">
                {t(`games.${g.id}.name`)}
              </div>
              <div className="text-white/80 text-sm mt-1">{t(`games.${g.id}.tagline`)}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-black/25 text-white/90">
                  {views.map((v) => t('nav.' + v)).join(' · ')}
                </span>
                {!playable && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-400/90 text-black">
                    {t('app.rulesOnly')}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
