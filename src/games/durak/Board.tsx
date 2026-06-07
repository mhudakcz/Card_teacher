import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyMove,
  currentPlayer,
  defender,
  type DurakMove,
  type DurakState,
  initDurak,
  legalMoves,
} from './engine';
import { chooseMove, type Difficulty } from './ai';
import { CardView } from '@/ui/components/CardView';

const HUMAN = 0;

const SUIT_SYMBOL: Record<string, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

function newGame(): DurakState {
  return initDurak({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'Počítač', isHuman: false },
    ],
  });
}

export function DurakBoard() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<DurakState>(() => newGame());
  const [lastMsg, setLastMsg] = useState('');

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setState(newGame());
    setLastMsg('');
  }, []);

  const apply = useCallback(
    (move: DurakMove) => {
      setState((prev) => {
        const next = applyMove(prev, move);
        if (next !== prev && next.log.length > 0) {
          const e = next.log[next.log.length - 1];
          setLastMsg(t(e.key, e.params as any) as string);
        }
        return next;
      });
    },
    [t],
  );

  // Tah počítače.
  useEffect(() => {
    if (state.over) return;
    if (currentPlayer(state) === HUMAN) return;
    const level = difficulty;
    const id = setTimeout(() => {
      setState((prev) => {
        if (prev.over || currentPlayer(prev) === HUMAN) return prev;
        const next = applyMove(prev, chooseMove(prev, level));
        if (next !== prev && next.log.length > 0) {
          const e = next.log[next.log.length - 1];
          setLastMsg(t(e.key, e.params as any) as string);
        }
        return next;
      });
    }, 850);
    return () => clearTimeout(id);
  }, [state, difficulty, t]);

  const human = state.players[HUMAN];
  const ai = state.players[1];
  const isHumanTurn = currentPlayer(state) === HUMAN && !state.over;
  const humanIsDefender = defender(state) === HUMAN;
  const done = state.over;

  const moves = useMemo(() => (isHumanTurn ? legalMoves(state) : []), [state, isHumanTurn]);
  const moveByCard = useMemo(() => {
    const map = new Map<string, DurakMove>();
    for (const m of moves) {
      if (m.type === 'attack' || m.type === 'defend') map.set(m.cardId, m);
    }
    return map;
  }, [moves]);
  const canTake = moves.some((m) => m.type === 'take');
  const canFinish = moves.some((m) => m.type === 'done');

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Obtížnost + nová hra */}
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
            {ai.hand.length} {t('durak.cards')}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ai.hand.length === 0 ? (
            <span className="text-white/40 text-sm">—</span>
          ) : (
            ai.hand.map((card) => <CardView key={card.id} faceDown size="sm" />)
          )}
        </div>
      </div>

      {/* Stůl: trumf + dobírák vlevo, rozehrané dvojice uprostřed */}
      <div className="rounded-2xl felt-table p-4 mb-3 min-h-[10rem]">
        <div className="flex items-start gap-4">
          {/* Dobírací balíček s trumfem */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative w-16 h-24">
              {state.deck.length > 0 ? (
                <>
                  {/* trumfová karta naležato vespod */}
                  <div className="absolute left-2 top-6 rotate-90 origin-center">
                    <CardView card={state.trumpCard} size="sm" />
                  </div>
                  <div className="absolute inset-0">
                    <CardView faceDown size="md" />
                  </div>
                </>
              ) : (
                <div className="w-16 h-24 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
                  <CardView card={state.trumpCard} size="sm" />
                </div>
              )}
            </div>
            <span className="text-xs text-white/70">
              {t('durak.deck')}: {state.deck.length}
            </span>
            <span
              className={`text-xs ${state.trumpSuit === 'hearts' || state.trumpSuit === 'diamonds' ? 'text-red-300' : 'text-white/80'}`}
            >
              {t('durak.trump')}: {SUIT_SYMBOL[state.trumpSuit] ?? state.trumpSuit}
            </span>
          </div>

          {/* Dvojice na stole */}
          <div className="flex flex-wrap gap-3 flex-1 items-start">
            {state.table.length === 0 ? (
              <span className="text-white/40 text-sm self-center">{t('durak.tableEmpty')}</span>
            ) : (
              state.table.map((pair, i) => (
                <div key={pair.attack.id} className="relative w-16 h-28" data-slot={i}>
                  <div className="absolute left-0 top-0">
                    <CardView card={pair.attack} size="md" />
                  </div>
                  {pair.defense && (
                    <div className="absolute left-3 top-7">
                      <CardView card={pair.defense} size="md" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stavová lišta */}
      <div className="h-7 mb-2 text-center text-sm">
        {done ? (
          <span className="font-bold text-accent animate-pop inline-block">
            {state.durak === null
              ? t('durak.draw')
              : state.durak === human.id
                ? t('durak.youLost')
                : t('durak.youWon')}
          </span>
        ) : isHumanTurn ? (
          <span className="text-accent font-medium">
            {humanIsDefender ? t('durak.youDefend') : t('durak.youAttack')}
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
            {human.hand.length} {t('durak.cards')}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {human.hand.length === 0 ? (
            <span className="text-white/40 text-sm">—</span>
          ) : (
            human.hand.map((card) => {
              const move = moveByCard.get(card.id);
              return (
                <CardView
                  key={card.id}
                  card={card}
                  size="md"
                  selectable={!!move}
                  dimmed={isHumanTurn && !move}
                  onClick={move ? () => apply(move) : undefined}
                />
              );
            })
          )}
        </div>

        {/* Akční tlačítka */}
        {isHumanTurn && (canTake || canFinish) && (
          <div className="mt-3 flex gap-2">
            {canTake && (
              <button
                onClick={() => apply({ type: 'take' })}
                className="px-4 py-2 rounded-lg bg-amber-500/80 hover:bg-amber-500 text-white font-semibold text-sm shadow-card transition"
              >
                {t('durak.take')}
              </button>
            )}
            {canFinish && (
              <button
                onClick={() => apply({ type: 'done' })}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold text-sm shadow-card transition"
              >
                {t('durak.done')}
              </button>
            )}
          </div>
        )}

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
