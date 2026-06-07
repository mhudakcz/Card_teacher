import { useTranslation } from 'react-i18next';
import { useNav } from '@/store';

interface GameCard {
  id: 'prsi';
  available: boolean;
}

const GAMES: GameCard[] = [{ id: 'prsi', available: true }];

// Plánované hry (zatím nedostupné) — ukazují cestu k rozšíření.
const PLANNED = ['Oko bere', 'Sedma', 'Žolíky', 'Kanasta', 'Mariáš', 'Taroky', 'Poker'];

export function GameList() {
  const { t } = useTranslation();
  const openGame = useNav((s) => s.openGame);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-1 text-ink">{t('app.chooseGame')}</h1>
      <p className="text-muted mb-6">{t('app.subtitle')}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => openGame(g.id)}
            className="group text-left rounded-2xl felt-table p-5 hover:scale-[1.02] hover:-translate-y-0.5 transition duration-200"
          >
            <div className="text-xl font-bold text-white drop-shadow">{t(`games.${g.id}.name`)}</div>
            <div className="text-white/80 text-sm mt-1">{t(`games.${g.id}.tagline`)}</div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-black/25 text-white/90">
              {t('nav.rules')} · {t('nav.tutorial')} · {t('nav.play')}
            </div>
          </button>
        ))}

        {PLANNED.map((name) => (
          <div
            key={name}
            className="rounded-2xl border border-dashed border-line panel p-5 opacity-70"
          >
            <div className="text-xl font-bold text-muted">{name}</div>
            <div className="text-muted/70 text-sm mt-1">Připravujeme…</div>
          </div>
        ))}
      </div>
    </div>
  );
}
