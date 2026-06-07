import { useTranslation } from 'react-i18next';
import { useNav } from './store';
import { availableViews } from './games/types';
import { getGame } from './games/registry';
import { LangToggle } from './ui/components/LangToggle';
import { ThemeControls } from './ui/components/ThemeControls';
import { GameList } from './ui/screens/GameList';
import { Rules } from './ui/screens/Rules';
import { Tutorial } from './ui/screens/Tutorial';
import { Play } from './ui/screens/Play';

export function App() {
  const { t } = useTranslation();
  const { game, view, setView, goHome } = useNav();
  const def = game ? getGame(game) : undefined;
  const views = def ? availableViews(def) : [];

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 panel border-0 border-b">
        <button onClick={goHome} className="text-left shrink-0">
          <div className="text-lg font-bold text-accent">{t('app.title')}</div>
          <div className="text-xs text-muted">{t('app.subtitle')}</div>
        </button>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {game && (
            <nav className="flex gap-1 text-sm">
              {views.map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded transition ${
                    view === v
                      ? 'bg-accent text-accent-ink shadow-card'
                      : 'bg-line/40 text-muted hover:text-ink'
                  }`}
                >
                  {t('nav.' + v)}
                </button>
              ))}
            </nav>
          )}
          <LangToggle />
          <ThemeControls />
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {!game && <GameList />}
        {game && view === 'rules' && <Rules />}
        {game && view === 'tutorial' && <Tutorial />}
        {game && view === 'play' && <Play />}
      </main>
    </div>
  );
}
