import { useTranslation } from 'react-i18next';
import type { Lng } from '@/i18n';
import { GAMES } from '@/games/registry';
import { useNav } from '@/store';

/**
 * Tisknutelný dokument se souhrnem pravidel všech her v aktuálním jazyce.
 * Toolbar je skrytý při tisku (.no-print); samotný dokument je laděný pro A4.
 */
export function PrintRules() {
  const { t, i18n } = useTranslation();
  const setPrinting = useNav((s) => s.setPrinting);
  const lng: Lng = i18n.language === 'en' ? 'en' : 'cs';

  return (
    <div className="print-doc mx-auto max-w-3xl bg-white text-black p-8 md:p-12 my-6 rounded-xl shadow-card">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setPrinting(false)}
          className="px-4 py-2 rounded-lg bg-line/40 text-ink hover:text-ink font-medium transition"
        >
          ← {t('nav.back')}
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold shadow-card transition"
        >
          {t('print.print')}
        </button>
      </div>

      <header className="mb-8 border-b-2 border-black/80 pb-4">
        <h1 className="text-3xl font-bold">{t('app.title')}</h1>
        <p className="text-lg text-black/70">{t('print.allRules')}</p>
      </header>

      {GAMES.map((g) => {
        const sections = g.rules[lng] ?? g.rules.cs;
        return (
          <section key={g.id} className="game-rules mb-10">
            <h2 className="text-2xl font-bold border-b border-black/40 pb-1 mb-1">
              {t(`games.${g.id}.name`)}
            </h2>
            <p className="italic text-black/60 mb-3">{t(`games.${g.id}.tagline`)}</p>
            {sections.map((s) => (
              <div key={s.heading} className="mb-3 break-inside-avoid">
                <h3 className="text-base font-semibold">{s.heading}</h3>
                {s.body.map((p, i) => (
                  <p key={i} className="leading-relaxed text-[0.95rem]">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
