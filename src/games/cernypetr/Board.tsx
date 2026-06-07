import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { applyMove, initCernyPetr, type CernyPetrMove, type CernyPetrState } from './engine';
import { chooseMove, type Difficulty } from './ai';
import { CardView } from '@/ui/components/CardView';

const HUMAN = 0;

function newGame(): CernyPetrState {
  return initCernyPetr({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'Počítač', isHuman: false },
    ],
  });
}

export function CernyPetrBoard() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<CernyPetrState>(() => newGame());
  const [lastMsg, setLastMsg] = useState('');

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setState(newGame());
    setLastMsg('');
  }, []);

  const isHumanTurn = state.current === HUMAN && !state.winner;

  const apply = useCallback(
    (move: CernyPetrMove) => {
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

  const ai = state.players[1];
  const human = state.players[HUMAN];
  const done = !!state.winner;

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

      {/* Soupeř — táhneš mu kartu naslepo */}
      <div className="rounded-2xl felt-table p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">{ai.name}</span>
          <span className="text-xs text-white/70">
            {ai.hand.length} {t('cernypetr.cards')} · {t('cernypetr.discarded', { value: ai.discarded })}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ai.hand.length === 0 ? (
            <span className="text-white/40 text-sm">—</span>
          ) : (
            ai.hand.map((card, i) => (
              <CardView
                key={card.id}
                faceDown
                size="sm"
                selectable={isHumanTurn}
                onClick={() => apply({ type: 'draw', index: i })}
              />
            ))
          )}
        </div>
        {isHumanTurn && ai.hand.length > 0 && (
          <p className="text-xs text-white/70 mt-2">{t('cernypetr.drawHint')}</p>
        )}
      </div>

      {/* Stavová lišta */}
      <div className="h-7 mb-2 text-center text-sm">
        {done ? (
          <span className="font-bold text-accent animate-pop inline-block">
            {state.loser === human.id
              ? t('cernypetr.youLost')
              : t('cernypetr.youWon')}
          </span>
        ) : isHumanTurn ? (
          <span className="text-accent font-medium">{t('cernypetr.yourTurn')}</span>
        ) : (
          <span className="text-muted">{t('play.opponentTurn', { name: ai.name })}</span>
        )}
        {lastMsg && <span className="ml-2 text-muted/70">· {lastMsg}</span>}
      </div>

      {/* Ruka hráče (lícem nahoru, jen k přehledu) */}
      <div className="rounded-2xl felt-table p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">{human.name}</span>
          <span className="text-xs text-white/70">
            {human.hand.length} {t('cernypetr.cards')} · {t('cernypetr.discarded', { value: human.discarded })}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {human.hand.length === 0 ? (
            <span className="text-white/40 text-sm">—</span>
          ) : (
            human.hand.map((card) => (
              <CardView
                key={card.id}
                card={card}
                size="md"
                dimmed={done && state.loser === human.id && card.rank === 'U' && card.suit === 'acorns'}
              />
            ))
          )}
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
