import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyMove,
  hasCanasta,
  initKanasta,
  isCanasta,
  isPureCanasta,
  meldRank,
  topDiscard,
  type KanastaMove,
  type KanastaState,
  type Meld,
} from './engine';
import { chooseMove, type Difficulty } from './ai';
import { CardView } from '@/ui/components/CardView';

const HUMAN = 0;

function newGame(): KanastaState {
  return initKanasta({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'ai', name: 'Počítač', isHuman: false },
    ],
  });
}

function MeldRow({ meld, onClick, clickable }: { meld: Meld; onClick?: () => void; clickable?: boolean }) {
  const { t } = useTranslation();
  const tag = isPureCanasta(meld)
    ? t('kanasta.pureCanasta')
    : isCanasta(meld)
      ? t('kanasta.mixedCanasta')
      : null;
  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      className={`flex items-center gap-0.5 rounded-lg p-1 transition ${
        clickable ? 'ring-1 ring-accent/60 hover:bg-white/10 cursor-pointer' : 'cursor-default'
      }`}
    >
      {meld.cards.map((c) => (
        <CardView key={c.id} card={c} size="sm" />
      ))}
      {tag && <span className="text-[10px] font-bold text-emerald-200 ml-1">{tag}</span>}
    </button>
  );
}

export function KanastaBoard() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<KanastaState>(() => newGame());
  const [lastMsg, setLastMsg] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setState(newGame());
    setLastMsg('');
    setSelected(new Set());
  }, []);

  const isHumanTurn = state.current === HUMAN && !state.winner;

  const apply = useCallback((move: KanastaMove) => {
    setState((prev) => {
      const next = applyMove(prev, move);
      if (next.log.length > 0) {
        const e = next.log[next.log.length - 1];
        setLastMsg(t(e.key, e.params as any) as string);
      }
      return next;
    });
    setSelected(new Set());
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
    }, 800);
    return () => clearTimeout(id);
  }, [state, difficulty, t]);

  const ai = state.players[1];
  const human = state.players[HUMAN];
  const done = !!state.winner;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedIds = [...selected];
  const selectedCards = human.hand.filter((c) => selected.has(c.id));
  const canLayMeld = isHumanTurn && state.phase === 'play' && meldRank(selectedCards) !== null;
  const canDiscard = isHumanTurn && state.phase === 'play' && selectedIds.length === 1;

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
            {ai.hand.length} {t('kanasta.cards')} · {t('kanasta.redThrees', { value: ai.redThrees.length })}
          </span>
        </div>
        <div className="flex gap-1 mb-2">
          {ai.hand.map((card) => (
            <CardView key={card.id} card={card} faceDown size="sm" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ai.melds.map((m, i) => (
            <MeldRow key={i} meld={m} />
          ))}
        </div>
      </div>

      {/* Stůl: balíček + odhazovák */}
      <div className="rounded-2xl felt-table p-4 mb-3 flex items-center justify-center gap-10 min-h-[8rem]">
        <button
          type="button"
          className="flex flex-col items-center"
          disabled={!(isHumanTurn && state.phase === 'draw')}
          onClick={() => apply({ type: 'drawStock' })}
        >
          <span className="text-xs text-white/80 mb-1">
            {t('kanasta.stock')} ({state.stock.length})
          </span>
          <div className={isHumanTurn && state.phase === 'draw' ? 'ring-2 ring-accent rounded-xl' : ''}>
            <CardView faceDown size="lg" />
          </div>
        </button>
        <button
          type="button"
          className="flex flex-col items-center"
          disabled={!(isHumanTurn && state.phase === 'draw' && state.discard.length > 0)}
          onClick={() => apply({ type: 'drawDiscard' })}
        >
          <span className="text-xs text-white/80 mb-1">{t('kanasta.discard')}</span>
          <div className={isHumanTurn && state.phase === 'draw' ? 'ring-2 ring-accent rounded-xl' : ''}>
            {topDiscard(state) ? <CardView card={topDiscard(state)} size="lg" /> : <span className="text-white/40">—</span>}
          </div>
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
            {state.scores && ` (${state.scores[0]} : ${state.scores[1]})`}
          </span>
        ) : isHumanTurn ? (
          <span className="text-accent font-medium">
            {state.phase === 'draw' ? t('kanasta.drawPhase') : t('kanasta.playPhase')}
          </span>
        ) : (
          <span className="text-muted">{t('play.opponentTurn', { name: ai.name })}</span>
        )}
        {lastMsg && <span className="ml-2 text-muted/70">· {lastMsg}</span>}
      </div>

      {/* Hráč: sestavy + akce + ruka */}
      <div className="rounded-2xl felt-table p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">{human.name}</span>
          <span className="text-xs text-white/70">
            {t('kanasta.redThrees', { value: human.redThrees.length })}
            {hasCanasta(human) && ` · ${t('kanasta.hasCanasta')}`}
          </span>
        </div>

        {/* Vlastní sestavy (klik = přidat vybrané karty) */}
        {human.melds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {human.melds.map((m, i) => (
              <MeldRow
                key={i}
                meld={m}
                clickable={isHumanTurn && state.phase === 'play' && selectedIds.length > 0}
                onClick={() => apply({ type: 'addToMeld', meldIndex: i, cardIds: selectedIds })}
              />
            ))}
          </div>
        )}

        {/* Akční tlačítka */}
        {isHumanTurn && state.phase === 'play' && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              disabled={!canLayMeld}
              onClick={() => apply({ type: 'layMeld', cardIds: selectedIds })}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                canLayMeld ? 'bg-accent text-accent-ink hover:bg-accent-hover' : 'bg-line/30 text-muted'
              }`}
            >
              {t('kanasta.layMeld')}
            </button>
            <button
              disabled={!canDiscard}
              onClick={() => apply({ type: 'discard', cardId: selectedIds[0] })}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                canDiscard ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-line/30 text-muted'
              }`}
            >
              {t('kanasta.discardBtn')}
            </button>
            <span className="text-xs text-white/60">{t('kanasta.selectHint')}</span>
          </div>
        )}

        {/* Ruka */}
        <div className="flex flex-wrap gap-2">
          {human.hand.map((card) => {
            const sel = selected.has(card.id);
            const pickable = isHumanTurn && state.phase === 'play';
            return (
              <div key={card.id} className={sel ? '-translate-y-3 transition' : 'transition'}>
                <CardView
                  card={card}
                  size="lg"
                  selectable={pickable}
                  onClick={() => pickable && toggle(card.id)}
                />
              </div>
            );
          })}
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
