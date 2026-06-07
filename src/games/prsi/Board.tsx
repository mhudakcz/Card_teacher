import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CZECH_SUITS, type Card, type CzechSuit } from '@/core/cards';
import {
  applyMove,
  initPrsi,
  legalMoves,
  topCard,
  type PrsiMove,
  type PrsiState,
} from './engine';
import { chooseMove, type Difficulty } from './ai';
import { CardView } from '@/ui/components/CardView';
import { SuitIcon } from '@/ui/components/SuitIcon';

const HUMAN = 0;

function newGame(): PrsiState {
  return initPrsi({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'Počítač', isHuman: false },
    ],
  });
}

export function PrsiBoard() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<PrsiState>(() => newGame());
  const [suitPickFor, setSuitPickFor] = useState<string | null>(null);
  const [lastMsg, setLastMsg] = useState<string>('');

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setState(newGame());
    setSuitPickFor(null);
    setLastMsg('');
  }, []);

  const isHumanTurn = state.current === HUMAN && !state.winner;
  const moves = useMemo(() => (isHumanTurn ? legalMoves(state) : []), [state, isHumanTurn]);

  const playableIds = useMemo(() => {
    const ids = new Set<string>();
    for (const m of moves) if (m.type === 'play') ids.add(m.cardId);
    return ids;
  }, [moves]);

  const apply = useCallback((move: PrsiMove) => {
    setState((prev) => {
      const next = applyMove(prev, move);
      if (next.log.length > 0) {
        const e = next.log[0];
        setLastMsg(translateLog(e.key, e.params));
      }
      return next;
    });
  }, []);

  // Tah počítače s krátkou prodlevou.
  useEffect(() => {
    if (state.winner) return;
    if (state.players[state.current].isHuman) return;
    const level = difficulty;
    const id = setTimeout(() => {
      setState((prev) => {
        if (prev.winner || prev.players[prev.current].isHuman) return prev;
        const move = chooseMove(prev, level);
        const next = applyMove(prev, move);
        if (next.log.length > 0) {
          const e = next.log[0];
          setLastMsg(translateLog(e.key, e.params));
        }
        return next;
      });
    }, 900);
    return () => clearTimeout(id);
  }, [state, difficulty]);

  function translateLog(key: string, params?: Record<string, string | number>): string {
    return t(key, params as any) as string;
  }

  function onCardClick(card: Card) {
    if (!isHumanTurn || !playableIds.has(card.id)) return;
    if (card.rank === 'O') {
      setSuitPickFor(card.id);
    } else {
      apply({ type: 'play', cardId: card.id });
    }
  }

  function onPickSuit(suit: CzechSuit) {
    if (suitPickFor) apply({ type: 'play', cardId: suitPickFor, chosenSuit: suit });
    setSuitPickFor(null);
  }

  const drawAction = useMemo<PrsiMove | null>(() => {
    if (!isHumanTurn) return null;
    if (moves.some((m) => m.type === 'drawPenalty')) return { type: 'drawPenalty' };
    if (moves.some((m) => m.type === 'acceptSkip')) return { type: 'acceptSkip' };
    if (moves.some((m) => m.type === 'draw')) return { type: 'draw' };
    return null;
  }, [moves, isHumanTurn]);

  const ai = state.players[1];
  const human = state.players[HUMAN];
  const top = topCard(state);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Ovládání obtížnosti */}
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
          <span className="text-xs text-white/70">{ai.hand.length} karet</span>
        </div>
        <div className="flex gap-1">
          {ai.hand.map((card) => (
            <CardView key={card.id} card={card} faceDown size="sm" />
          ))}
        </div>
      </div>

      {/* Stůl: balíček + odhazovák */}
      <div className="rounded-2xl felt-table p-6 mb-3 flex items-center justify-center gap-10">
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/80 mb-1">
            {t('play.deck')} ({state.deck.length})
          </span>
          <CardView faceDown size="lg" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/80 mb-1">{t('play.discard')}</span>
          <CardView card={top} size="lg" />
          <div className="mt-2 flex items-center gap-1 text-xs text-white/90 bg-black/25 px-2 py-0.5 rounded-full">
            <SuitIcon suit={state.activeSuit} size={14} />
          </div>
        </div>
      </div>

      {/* Stavová lišta */}
      <div className="h-7 mb-2 text-center text-sm">
        {state.winner ? (
          <span className="font-bold text-accent animate-pop inline-block">
            {state.winner === human.id ? t('play.youWon') : t('play.youLost', { name: ai.name })}
          </span>
        ) : isHumanTurn ? (
          <span className="text-accent font-medium">
            {state.pendingDraw > 0
              ? t('play.mustDraw', { count: state.pendingDraw })
              : t('play.yourTurn')}
          </span>
        ) : (
          <span className="text-muted">{t('play.opponentTurn', { name: ai.name })}</span>
        )}
        {lastMsg && <span className="ml-2 text-muted/70">· {lastMsg}</span>}
      </div>

      {/* Ruka hráče */}
      <div className="rounded-2xl felt-table p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">{human.name}</span>
          <span className="text-xs text-white/70">{human.hand.length} karet</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {human.hand.map((card) => (
            <CardView
              key={card.id}
              card={card}
              size="lg"
              selectable={isHumanTurn && playableIds.has(card.id)}
              dimmed={isHumanTurn && !playableIds.has(card.id)}
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>

        {drawAction && (
          <button
            onClick={() => apply(drawAction)}
            className="mt-3 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm shadow-card transition"
          >
            {drawAction.type === 'drawPenalty'
              ? t('play.mustDraw', { count: state.pendingDraw })
              : drawAction.type === 'acceptSkip'
                ? t('play.skipped', { name: human.name })
                : t('play.draw')}
          </button>
        )}

        {state.winner && (
          <button
            onClick={() => reset(difficulty)}
            className="mt-3 ml-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold text-sm shadow-card transition"
          >
            {t('play.newGame')}
          </button>
        )}
      </div>

      {/* Výběr barvy pro svršek */}
      {suitPickFor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="panel rounded-2xl p-6 animate-pop">
            <h3 className="text-lg font-semibold mb-4 text-center text-ink">{t('play.chooseSuit')}</h3>
            <div className="flex gap-3">
              {CZECH_SUITS.map((s) => (
                <button
                  key={s}
                  onClick={() => onPickSuit(s)}
                  className="w-16 h-16 rounded-xl bg-white flex flex-col items-center justify-center hover:scale-105 hover:ring-2 hover:ring-accent transition shadow-card"
                >
                  <SuitIcon suit={s} size={28} />
                  <span className="text-xs text-slate-700 mt-1">{t('card.suits.' + s)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
