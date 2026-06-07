import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyMove,
  initZoliky,
  legalMoves,
  topDiscard,
  type ZolikyMove,
  type ZolikyState,
} from './engine';
import { findMelds } from './melds';
import { chooseMove, type Difficulty } from './ai';
import { CardView } from '@/ui/components/CardView';

const HUMAN = 0;

function newGame(): ZolikyState {
  return initZoliky({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'Počítač', isHuman: false },
    ],
  });
}

export function ZolikyBoard() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<ZolikyState>(() => newGame());
  const [lastMsg, setLastMsg] = useState('');

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setState(newGame());
    setLastMsg('');
  }, []);

  const apply = useCallback(
    (move: ZolikyMove) => {
      setState((prev) => {
        const next = applyMove(prev, move);
        if (next.log.length > 0) {
          const e = next.log[next.log.length - 1];
          setLastMsg(t(e.key, e.params as any) as string);
        }
        return next;
      });
    },
    [t],
  );

  const isHumanTurn = state.current === HUMAN && !state.winner;

  // Tah počítače.
  useEffect(() => {
    if (state.winner) return;
    if (state.players[state.current].isHuman) return;
    const level = difficulty;
    const id = setTimeout(() => {
      setState((prev) => {
        if (prev.winner || prev.players[prev.current].isHuman) return prev;
        const next = applyMove(prev, chooseMove(prev, level));
        if (next.log.length > 0) {
          const e = next.log[next.log.length - 1];
          setLastMsg(t(e.key, e.params as any) as string);
        }
        return next;
      });
    }, 800);
    return () => clearTimeout(id);
  }, [state, difficulty, t]);

  const human = state.players[HUMAN];
  const ai = state.players[1];
  const done = !!state.winner;
  const top = topDiscard(state);

  // Náhled rozkladu lidské ruky (jen pro nápovědu).
  const melds = useMemo(() => findMelds(human.hand), [human.hand]);
  const meldIds = useMemo(() => {
    const m = new Set<string>();
    if (melds) for (const g of melds) for (const c of g) m.add(c.id);
    return m;
  }, [melds]);

  const drawPhase = isHumanTurn && state.phase === 'draw';
  const discardPhase = isHumanTurn && state.phase === 'discard';
  const canDrawDiscard = useMemo(
    () => drawPhase && legalMoves(state).some((m) => m.type === 'drawDiscard'),
    [state, drawPhase],
  );

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
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
        <button
          onClick={() => reset(difficulty)}
          className="px-3 py-1.5 rounded-lg bg-line/40 text-ink hover:text-accent text-sm transition"
        >
          {t('play.newGame')}
        </button>
      </div>

      {/* Soupeř */}
      <div className="rounded-2xl felt-table p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">{ai.name}</span>
          <span className="text-xs text-white/70">{ai.hand.length} {t('zoliky.cards')}</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {ai.hand.map((card) => (
            <CardView key={card.id} card={card} faceDown={!done} size="sm" />
          ))}
        </div>
      </div>

      {/* Stůl: balíček + odhazovák */}
      <div className="rounded-2xl felt-table p-5 mb-3 flex items-center justify-center gap-10 min-h-[9rem]">
        <button
          onClick={() => drawPhase && apply({ type: 'drawStock' })}
          disabled={!drawPhase}
          className="flex flex-col items-center disabled:cursor-default"
        >
          <span className="text-xs text-white/80 mb-1">{t('zoliky.stock')} ({state.stock.length})</span>
          <span className={drawPhase ? 'ring-2 ring-accent rounded-xl' : ''}>
            <CardView faceDown size="lg" />
          </span>
        </button>
        <button
          onClick={() => canDrawDiscard && apply({ type: 'drawDiscard' })}
          disabled={!canDrawDiscard}
          className="flex flex-col items-center disabled:cursor-default"
        >
          <span className="text-xs text-white/80 mb-1">{t('zoliky.discard')}</span>
          {top ? (
            <span className={canDrawDiscard ? 'ring-2 ring-accent rounded-xl' : ''}>
              <CardView card={top} size="lg" />
            </span>
          ) : (
            <span className="text-white/40 text-sm w-20 h-28 flex items-center justify-center">—</span>
          )}
        </button>
      </div>

      {/* Stavová lišta */}
      <div className="h-7 mb-2 text-center text-sm">
        {done ? (
          <span className="font-bold text-accent animate-pop inline-block">
            {state.winner === human.id
              ? t('play.youWon')
              : state.winner === 'push'
                ? t('oko.push')
                : t('play.youLost', { name: ai.name })}
          </span>
        ) : drawPhase ? (
          <span className="text-accent font-medium">{t('zoliky.drawPhase')}</span>
        ) : discardPhase ? (
          <span className="text-accent font-medium">{t('zoliky.discardPhase')}</span>
        ) : (
          <span className="text-muted">{t('play.opponentTurn', { name: ai.name })}</span>
        )}
        {lastMsg && <span className="ml-2 text-muted/70">· {lastMsg}</span>}
      </div>

      {/* Ruka hráče */}
      <div className="rounded-2xl felt-table p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">{human.name}</span>
          <span className="text-xs text-white/70">
            {melds ? t('zoliky.ready') : `${human.hand.length} ${t('zoliky.cards')}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {human.hand.map((card) => (
            <CardView
              key={card.id}
              card={card}
              size="lg"
              selectable={discardPhase}
              dimmed={!discardPhase && meldIds.size > 0 && !meldIds.has(card.id)}
              onClick={() => apply({ type: 'discard', cardId: card.id })}
            />
          ))}
        </div>
        {discardPhase && <p className="mt-2 text-xs text-white/60">{t('zoliky.discardHint')}</p>}

        {done && (
          <button
            onClick={() => reset(difficulty)}
            className="mt-3 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold text-sm shadow-card transition"
          >
            {t('play.newGame')}
          </button>
        )}
      </div>
    </div>
  );
}
