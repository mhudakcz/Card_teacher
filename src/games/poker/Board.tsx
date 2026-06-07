import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyMove,
  callAmount,
  initPoker,
  raiseLimits,
  type PokerMove,
  type PokerState,
} from './engine';
import { chooseMove, type Difficulty } from './ai';
import { CardView } from '@/ui/components/CardView';

const HUMAN = 0;

function newGame(): PokerState {
  return initPoker({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'Počítač', isHuman: false },
    ],
  });
}

export function PokerBoard() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<PokerState>(() => newGame());
  const [lastMsg, setLastMsg] = useState('');
  const [raiseVal, setRaiseVal] = useState(0);

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setState(newGame());
    setLastMsg('');
  }, []);

  const apply = useCallback(
    (move: PokerMove) => {
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

  const isHumanTurn =
    state.current === HUMAN && state.street !== 'done' && state.street !== 'showdown' && !state.winner;

  // Tah počítače.
  useEffect(() => {
    if (state.winner) return;
    if (state.street === 'done' || state.street === 'showdown') return;
    if (state.players[state.current].isHuman) return;
    const level = difficulty;
    const id = setTimeout(() => {
      setState((prev) => {
        if (prev.winner || prev.street === 'done' || prev.players[prev.current].isHuman) return prev;
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

  const limits = useMemo(() => (isHumanTurn ? raiseLimits(state) : null), [state, isHumanTurn]);
  const toCall = isHumanTurn ? callAmount(state) : 0;

  // Drž posuvník navýšení v platném rozsahu.
  useEffect(() => {
    if (limits) setRaiseVal((v) => Math.min(Math.max(v, limits.min), limits.max));
  }, [limits]);

  const human = state.players[HUMAN];
  const ai = state.players[1];
  const done = state.street === 'done';
  const matchOver = !!state.winner;
  const showAi = state.revealed || matchOver;

  const result = state.result;

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
          <span className="font-semibold text-white">
            {ai.name} {state.button === 1 && <span className="text-xs text-amber-300">• {t('poker.button')}</span>}
          </span>
          <span className="text-xs text-white/70">
            {t('poker.chips', { value: ai.chips })}
            {ai.bet > 0 && ` · ${t('poker.bet', { value: ai.bet })}`}
            {ai.folded && ` · ${t('poker.folded')}`}
          </span>
        </div>
        <div className="flex gap-1">
          {ai.hole.map((card) => (
            <CardView key={card.id} card={card} faceDown={!showAi} size="sm" dimmed={ai.folded} />
          ))}
        </div>
      </div>

      {/* Stůl: bank + společné karty */}
      <div className="rounded-2xl felt-table p-5 mb-3 min-h-[9rem]">
        <div className="text-center text-sm text-amber-200 font-semibold mb-3">
          {t('poker.pot', { value: state.pot })}
          {state.street !== 'done' && <span className="text-white/60"> · {t('poker.street.' + state.street)}</span>}
        </div>
        <div className="flex justify-center gap-2 min-h-[6rem] items-center">
          {state.community.length === 0 ? (
            <span className="text-white/40 text-sm">{t('poker.community')}</span>
          ) : (
            state.community.map((card) => <CardView key={card.id} card={card} size="md" />)
          )}
        </div>
      </div>

      {/* Stavová lišta */}
      <div className="min-h-[1.75rem] mb-2 text-center text-sm">
        {matchOver ? (
          <span className="font-bold text-accent animate-pop inline-block">
            {state.winner === human.id ? t('play.youWon') : t('play.youLost', { name: ai.name })}
          </span>
        ) : done && result ? (
          <span className="font-bold text-accent animate-pop inline-block">
            {result.winner === 'push'
              ? t('poker.split', { pot: result.potWon })
              : t('poker.wins', {
                  name: state.players[result.winnerIdx ?? 0].name,
                  pot: result.potWon,
                })}
            {result.reason === 'showdown' && result.category && ` · ${t('poker.hands.' + result.category)}`}
          </span>
        ) : isHumanTurn ? (
          <span className="text-accent font-medium">{t('play.yourTurn')}</span>
        ) : (
          <span className="text-muted">{t('play.opponentTurn', { name: ai.name })}</span>
        )}
        {lastMsg && !matchOver && <span className="ml-2 text-muted/70">· {lastMsg}</span>}
      </div>

      {/* Ruka hráče */}
      <div className="rounded-2xl felt-table p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">
            {human.name} {state.button === HUMAN && <span className="text-xs text-amber-300">• {t('poker.button')}</span>}
          </span>
          <span className="text-xs text-white/70">
            {t('poker.chips', { value: human.chips })}
            {human.bet > 0 && ` · ${t('poker.bet', { value: human.bet })}`}
            {human.folded && ` · ${t('poker.folded')}`}
          </span>
        </div>
        <div className="flex gap-2">
          {human.hole.map((card) => (
            <CardView key={card.id} card={card} size="lg" dimmed={human.folded} />
          ))}
        </div>
      </div>

      {/* Akce */}
      <div className="mt-4 flex flex-col gap-3">
        {isHumanTurn && (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => apply({ type: 'fold' })}
                className="px-4 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-sm shadow-card transition"
              >
                {t('poker.fold')}
              </button>
              {toCall === 0 ? (
                <button
                  onClick={() => apply({ type: 'check' })}
                  className="px-4 py-2 rounded-lg bg-line/50 hover:bg-line text-ink font-semibold text-sm shadow-card transition"
                >
                  {t('poker.check')}
                </button>
              ) : (
                <button
                  onClick={() => apply({ type: 'call' })}
                  className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold text-sm shadow-card transition"
                >
                  {t('poker.call', { amount: toCall })}
                </button>
              )}
              {limits && (
                <button
                  onClick={() => apply({ type: 'raise', to: raiseVal || limits.min })}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold text-sm shadow-card transition"
                >
                  {raiseVal >= limits.max ? t('poker.allIn') : t('poker.raiseTo', { value: raiseVal || limits.min })}
                </button>
              )}
            </div>
            {limits && limits.max > limits.min && (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={limits.min}
                  max={limits.max}
                  step={10}
                  value={raiseVal || limits.min}
                  onChange={(e) => setRaiseVal(Number(e.target.value))}
                  className="flex-1 accent-accent"
                />
                <span className="text-sm text-muted tabular-nums w-16 text-right">{raiseVal || limits.min}</span>
              </div>
            )}
          </>
        )}

        {done && !matchOver && (
          <button
            onClick={() => apply({ type: 'nextHand' })}
            className="self-start px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold text-sm shadow-card transition"
          >
            {t('poker.nextHand')}
          </button>
        )}
        {matchOver && (
          <button
            onClick={() => reset(difficulty)}
            className="self-start px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-ink font-semibold text-sm shadow-card transition"
          >
            {t('play.newGame')}
          </button>
        )}
      </div>
    </div>
  );
}
