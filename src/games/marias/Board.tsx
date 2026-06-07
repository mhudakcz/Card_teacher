import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyMove,
  cardPoints,
  initMarias,
  legalMoves,
  type MariasMove,
  type MariasState,
} from './engine';
import { chooseMove, type Difficulty } from './ai';
import { CardView } from '@/ui/components/CardView';
import { SuitIcon } from '@/ui/components/SuitIcon';

const HUMAN = 0;

function newGame(): MariasState {
  return initMarias({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'Počítač', isHuman: false },
    ],
  });
}

function wonPoints(state: MariasState, idx: number): number {
  const p = state.players[idx];
  let s = p.won.reduce((sum, c) => sum + cardPoints(c), 0) + p.marriagePoints;
  if (state.winner && state.lastTrickWinner === idx) s += 10;
  return s;
}

export function MariasBoard() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<MariasState>(() => newGame());
  const [lastMsg, setLastMsg] = useState('');

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setState(newGame());
    setLastMsg('');
  }, []);

  const isHumanTurn = state.current === HUMAN && !state.winner;

  const apply = useCallback((move: MariasMove) => {
    setState((prev) => {
      const next = applyMove(prev, move);
      if (next.log.length > 0) {
        const e = next.log[next.log.length - 1];
        setLastMsg(t(e.key, e.params as any) as string);
      }
      return next;
    });
  }, [t]);

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
    }, 850);
    return () => clearTimeout(id);
  }, [state, difficulty, t]);

  const legalIds = useMemo(() => {
    const ids = new Set<string>();
    if (isHumanTurn) for (const m of legalMoves(state)) ids.add(m.cardId);
    return ids;
  }, [state, isHumanTurn]);

  const ai = state.players[1];
  const human = state.players[HUMAN];
  const done = !!state.winner;

  // Karty ve štychu seřazené tak, aby soupeřova byla nahoře.
  const trickCards = state.trick;

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
          <span className="text-xs text-white/70">
            {ai.hand.length} karet · {t('marias.points', { value: wonPoints(state, 1) })}
          </span>
        </div>
        <div className="flex gap-1">
          {ai.hand.map((card) => (
            <CardView key={card.id} card={card} faceDown size="sm" />
          ))}
        </div>
      </div>

      {/* Stůl: trumf + štych */}
      <div className="rounded-2xl felt-table p-6 mb-3 flex items-center justify-center gap-10 min-h-[8rem]">
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/80 mb-1">{t('marias.trump')}</span>
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <SuitIcon suit={state.trump} size={32} />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/80 mb-1">{t('marias.trick')}</span>
          <div className="flex gap-2 min-h-[7rem] items-center">
            {trickCards.length === 0 ? (
              <span className="text-white/40 text-sm">—</span>
            ) : (
              trickCards.map((tr) => <CardView key={tr.card.id} card={tr.card} size="lg" />)
            )}
          </div>
        </div>
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
            {state.scores && ` (${state.scores[0]} : ${state.scores[1]})`}
          </span>
        ) : isHumanTurn ? (
          <span className="text-accent font-medium">
            {state.trick.length === 0 ? t('marias.yourLead') : t('marias.yourResponse')}
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
          <span className="text-xs text-white/70">
            {t('marias.points', { value: wonPoints(state, 0) })}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {human.hand.map((card) => (
            <CardView
              key={card.id}
              card={card}
              size="lg"
              selectable={isHumanTurn && legalIds.has(card.id)}
              dimmed={isHumanTurn && !legalIds.has(card.id)}
              onClick={() => apply({ type: 'play', cardId: card.id })}
            />
          ))}
        </div>

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
