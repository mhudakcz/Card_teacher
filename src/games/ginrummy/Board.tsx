import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyMove,
  deadwoodValue,
  type GinMove,
  type GinState,
  initGin,
  legalMoves,
} from './engine';
import { chooseMove, type Difficulty } from './ai';
import { CardView } from '@/ui/components/CardView';
import type { Card } from '@/core/cards';

const HUMAN = 0;

const SUIT_ORDER: Record<string, number> = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function sortForDisplay(hand: Card[]): Card[] {
  return hand.slice().sort((a, b) => {
    if (a.suit !== b.suit) return (SUIT_ORDER[a.suit] ?? 9) - (SUIT_ORDER[b.suit] ?? 9);
    return RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank);
  });
}

function newGame(): GinState {
  return initGin({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'Počítač', isHuman: false },
    ],
  });
}

export function GinRummyBoard() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<GinState>(() => newGame());
  const [lastMsg, setLastMsg] = useState('');
  const [knockArmed, setKnockArmed] = useState(false);

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setState(newGame());
    setLastMsg('');
    setKnockArmed(false);
  }, []);

  const apply = useCallback(
    (move: GinMove) => {
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

  useEffect(() => {
    if (state.over) return;
    if (state.current === HUMAN) return;
    const level = difficulty;
    const id = setTimeout(() => {
      setState((prev) => {
        if (prev.over || prev.current === HUMAN) return prev;
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
  const isHumanTurn = state.current === HUMAN && !state.over;
  const inDraw = isHumanTurn && state.phase === 'draw';
  const inDiscard = isHumanTurn && state.phase === 'discard';
  const done = state.over;

  const moves = useMemo(() => (isHumanTurn ? legalMoves(state) : []), [state, isHumanTurn]);
  const knockable = useMemo(() => {
    const set = new Set<string>();
    for (const m of moves) if (m.type === 'discard' && m.knock) set.add(m.cardId);
    return set;
  }, [moves]);
  const canKnockAny = knockable.size > 0;

  // Deadwood do stavové lišty (10 karet = aktuální, 11 = nejlepší po odhození).
  const deadwood = useMemo(() => {
    const h = human.hand;
    if (h.length <= 10) return deadwoodValue(h);
    let best = Infinity;
    for (const c of h) best = Math.min(best, deadwoodValue(h.filter((x) => x.id !== c.id)));
    return best;
  }, [human.hand]);

  const sortedHand = useMemo(() => sortForDisplay(human.hand), [human.hand]);
  const discardTop = state.discard[state.discard.length - 1];

  const onHandCard = (card: Card) => {
    if (!inDiscard) return;
    if (knockArmed && knockable.has(card.id)) {
      apply({ type: 'discard', cardId: card.id, knock: true });
      setKnockArmed(false);
    } else if (!knockArmed) {
      apply({ type: 'discard', cardId: card.id });
    }
  };

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
            {ai.hand.length} {t('ginrummy.cards')}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ai.hand.map((card) => (
            <CardView key={card.id} faceDown size="sm" />
          ))}
        </div>
      </div>

      {/* Balíček a odhazovák */}
      <div className="rounded-2xl felt-table p-4 mb-3">
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <CardView
              faceDown
              size="md"
              selectable={inDraw && state.stock.length > 0}
              dimmed={state.stock.length === 0}
              onClick={inDraw && state.stock.length > 0 ? () => apply({ type: 'draw', from: 'stock' }) : undefined}
            />
            <span className="text-xs text-white/70">
              {t('ginrummy.stock')}: {state.stock.length}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            {discardTop ? (
              <CardView
                card={discardTop}
                size="md"
                selectable={inDraw}
                onClick={inDraw ? () => apply({ type: 'draw', from: 'discard' }) : undefined}
              />
            ) : (
              <div className="w-16 h-24 rounded-lg border-2 border-dashed border-white/30" />
            )}
            <span className="text-xs text-white/70">{t('ginrummy.discard')}</span>
          </div>
        </div>
      </div>

      {/* Stavová lišta */}
      <div className="h-7 mb-2 text-center text-sm">
        {done ? (
          <span className="font-bold text-accent animate-pop inline-block">
            {!state.result || state.result.winnerId === null
              ? t('ginrummy.draw')
              : state.result.winnerId === human.id
                ? t(state.result.undercut ? 'ginrummy.youUndercut' : 'ginrummy.youWon', {
                    points: state.result.points,
                  })
                : t('ginrummy.youLost', { points: state.result.points })}
          </span>
        ) : isHumanTurn ? (
          <span className="text-accent font-medium">
            {inDraw ? t('ginrummy.drawPhase') : t('ginrummy.discardPhase')} · {t('ginrummy.deadwood', { value: deadwood })}
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
          {inDiscard && canKnockAny && (
            <button
              onClick={() => setKnockArmed((v) => !v)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                knockArmed ? 'bg-accent text-accent-ink' : 'bg-amber-500/80 text-white hover:bg-amber-500'
              }`}
            >
              {knockArmed ? t('ginrummy.knockArmed') : t('ginrummy.knock')}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {sortedHand.map((card) => {
            const selectable = inDiscard && (!knockArmed || knockable.has(card.id));
            return (
              <CardView
                key={card.id}
                card={card}
                size="md"
                selectable={selectable}
                dimmed={inDiscard && knockArmed && !knockable.has(card.id)}
                onClick={selectable ? () => onHandCard(card) : undefined}
              />
            );
          })}
        </div>
        {inDiscard && (
          <p className="text-xs text-white/70 mt-2">
            {knockArmed ? t('ginrummy.knockHint') : t('ginrummy.discardHint')}
          </p>
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
