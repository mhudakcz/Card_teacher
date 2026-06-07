import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyMove,
  initKlondike,
  type KlondikeMove,
  type KlondikeState,
} from './engine';
import { CardView } from '@/ui/components/CardView';

type Difficulty = 'easy' | 'medium' | 'hard';

const SETTINGS: Record<Difficulty, { drawCount: 1 | 3; redealsLeft: number | null }> = {
  easy: { drawCount: 1, redealsLeft: null },
  medium: { drawCount: 3, redealsLeft: null },
  hard: { drawCount: 3, redealsLeft: 2 },
};

function newGame(d: Difficulty): KlondikeState {
  return initKlondike(SETTINGS[d]);
}

export function PasiansBoard() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<KlondikeState>(() => newGame('easy'));

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setState(newGame(d));
  }, []);

  // Aplikuje první tah ze seznamu, který něco změní (neplatný vrací stejný stav).
  const applyFirst = useCallback((candidates: KlondikeMove[]) => {
    setState((prev) => {
      for (const m of candidates) {
        const next = applyMove(prev, m);
        if (next !== prev) return next;
      }
      return prev;
    });
  }, []);

  const clickStock = () => applyFirst([{ type: 'draw' }, { type: 'recycle' }]);

  const clickWaste = () =>
    applyFirst([
      { type: 'wasteToFoundation' },
      ...Array.from({ length: 7 }, (_, pile) => ({ type: 'wasteToTableau', pile }) as KlondikeMove),
    ]);

  const clickTableau = (pile: number, index: number) => {
    const count = state.tableau[pile].faceUp.length - index;
    const candidates: KlondikeMove[] = [];
    if (count === 1) candidates.push({ type: 'tableauToFoundation', pile });
    for (let to = 0; to < 7; to++) {
      if (to !== pile) candidates.push({ type: 'tableauToTableau', from: pile, count, to });
    }
    applyFirst(candidates);
  };

  const canRecycle =
    state.stock.length === 0 &&
    state.waste.length > 0 &&
    (state.redealsLeft === null || state.redealsLeft > 0);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Obtížnost */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">{t('difficulty.label')}:</span>
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => reset(d)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                difficulty === d ? 'bg-accent text-accent-ink' : 'bg-line/40 text-muted hover:text-ink'
              }`}
            >
              {t('difficulty.' + d)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{t('pasians.moves', { value: state.moves })}</span>
          <button
            onClick={() => reset(difficulty)}
            className="px-3 py-1.5 rounded-lg bg-line/40 text-ink hover:text-accent text-sm transition"
          >
            {t('play.newGame')}
          </button>
        </div>
      </div>

      <div className="rounded-2xl felt-table p-3 sm:p-4">
        {/* Horní řada: balíček + odhazovák | cíle */}
        <div className="flex justify-between gap-2 mb-5">
          <div className="flex gap-2">
            {/* Balíček */}
            <button onClick={clickStock} className="relative" aria-label={t('pasians.stock')}>
              {state.stock.length > 0 ? (
                <CardView faceDown size="sm" />
              ) : (
                <div className="w-11 h-16 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center text-white/50 text-lg">
                  {canRecycle ? '↻' : '∅'}
                </div>
              )}
              {state.redealsLeft !== null && (
                <span className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-white/60">
                  ↻ {state.redealsLeft}
                </span>
              )}
            </button>
            {/* Odhazovák */}
            <button onClick={clickWaste} aria-label={t('pasians.waste')}>
              {state.waste.length > 0 ? (
                <CardView card={state.waste[state.waste.length - 1]} size="sm" selectable />
              ) : (
                <div className="w-11 h-16 rounded-xl border-2 border-dashed border-white/20" />
              )}
            </button>
          </div>

          {/* Cíle */}
          <div className="flex gap-2">
            {state.foundations.map((f, i) => (
              <div key={i}>
                {f.length > 0 ? (
                  <CardView card={f[f.length - 1]} size="sm" />
                ) : (
                  <div className="w-11 h-16 rounded-xl border-2 border-dashed border-white/25 flex items-center justify-center text-white/40 text-xl">
                    ♟
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sloupce */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {state.tableau.map((pile, p) => (
            <div key={p} className="flex flex-col items-center min-h-[6rem]">
              {pile.faceDown.length === 0 && pile.faceUp.length === 0 ? (
                <div className="w-11 h-16 rounded-xl border-2 border-dashed border-white/15" />
              ) : (
                <div className="relative w-11" style={{ height: `${64 + (pile.faceDown.length + pile.faceUp.length - 1) * 20}px` }}>
                  {pile.faceDown.map((card, i) => (
                    <div key={card.id} className="absolute left-0" style={{ top: `${i * 12}px` }}>
                      <CardView faceDown size="sm" />
                    </div>
                  ))}
                  {pile.faceUp.map((card, i) => (
                    <div
                      key={card.id}
                      className="absolute left-0"
                      style={{ top: `${pile.faceDown.length * 12 + i * 20}px` }}
                    >
                      <CardView
                        card={card}
                        size="sm"
                        selectable
                        onClick={() => clickTableau(p, i)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stav */}
      <div className="h-7 mt-3 text-center text-sm">
        {state.won ? (
          <span className="font-bold text-accent animate-pop inline-block">{t('pasians.won')}</span>
        ) : (
          <span className="text-muted">{t('pasians.hint')}</span>
        )}
      </div>

      {state.won && (
        <div className="text-center">
          <button
            onClick={() => reset(difficulty)}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold text-sm shadow-card transition"
          >
            {t('play.newGame')}
          </button>
        </div>
      )}
    </div>
  );
}
