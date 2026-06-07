import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyMove,
  handValue,
  initOko,
  type OkoMove,
  type OkoState,
} from './engine';
import { chooseMove, type Difficulty } from './ai';
import { CardView } from '@/ui/components/CardView';

function newGame(): OkoState {
  return initOko({
    players: [
      { id: 'you', name: 'Ty', isHuman: true },
      { id: 'dealer', name: 'Krupiér', isHuman: false },
    ],
  });
}

export function OkoBoard() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<OkoState>(() => newGame());

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setState(newGame());
  }, []);

  const apply = useCallback((move: OkoMove) => {
    setState((prev) => applyMove(prev, move));
  }, []);

  // Krupiér hraje sám, s krátkou prodlevou mezi kartami.
  useEffect(() => {
    if (state.phase !== 'dealer') return;
    const level = difficulty;
    const id = setTimeout(() => {
      setState((prev) => (prev.phase === 'dealer' ? applyMove(prev, chooseMove(prev, level)) : prev));
    }, 800);
    return () => clearTimeout(id);
  }, [state, difficulty]);

  const player = state.players[0];
  const dealer = state.players[1];
  const playerTurn = state.phase === 'player';
  const done = state.phase === 'done';
  const playerValue = handValue(player.hand);
  const dealerValue = handValue(dealer.hand);

  // Během tahu hráče zůstává druhá karta krupiéra skrytá.
  const hideHole = playerTurn;

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

      {/* Krupiér */}
      <div className="rounded-2xl felt-table p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">{dealer.name}</span>
          <span className="text-xs text-white/80">
            {hideHole ? '?' : t('oko.total', { value: dealerValue })}
          </span>
        </div>
        <div className="flex gap-2">
          {dealer.hand.map((card, i) => (
            <CardView key={card.id} card={card} faceDown={hideHole && i > 0} size="md" />
          ))}
        </div>
      </div>

      {/* Stavová lišta */}
      <div className="h-7 mb-3 text-center text-sm">
        {done ? (
          <span className="font-bold text-accent animate-pop inline-block">
            {state.winner === player.id
              ? t('play.youWon')
              : state.winner === 'push'
                ? t('oko.push')
                : t('play.youLost', { name: dealer.name })}
          </span>
        ) : playerTurn ? (
          <span className="text-accent font-medium">{t('play.yourTurn')}</span>
        ) : (
          <span className="text-muted">{t('play.opponentTurn', { name: dealer.name })}</span>
        )}
      </div>

      {/* Hráč */}
      <div className="rounded-2xl felt-table p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">{player.name}</span>
          <span className="text-xs text-white/80">{t('oko.total', { value: playerValue })}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {player.hand.map((card) => (
            <CardView key={card.id} card={card} size="lg" />
          ))}
        </div>

        {playerTurn && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => apply({ type: 'hit' })}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm shadow-card transition"
            >
              {t('oko.hit')}
            </button>
            <button
              onClick={() => apply({ type: 'stand' })}
              className="px-4 py-2 rounded-lg bg-line/40 text-ink hover:text-accent font-semibold text-sm transition"
            >
              {t('oko.stand')}
            </button>
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
