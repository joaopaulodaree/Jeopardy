import { useState, useEffect } from 'react';
import type { Game, Clue, RuntimeState } from '../types';
import { getClueValue } from '../utils/getClueValue';

interface Props {
  game: Game;
  runtime: RuntimeState;
  onTileClick: (clue: Clue, value: number) => void;
  revealed: boolean;
}

export function GameBoard({ game, runtime, onTileClick, revealed }: Props) {
  const [animatedTiles, setAnimatedTiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!revealed) {
      setAnimatedTiles(new Set());
      return;
    }
    // Stagger-animate tiles: left-to-right, top-to-bottom
    // Each tile = col * numRows + row index = delay
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    game.categories.forEach((cat, colIdx) => {
      cat.clues.forEach((clue, rowIdx) => {
        const delay = (rowIdx * game.categories.length + colIdx) * 50;
        const t = setTimeout(() => {
          setAnimatedTiles(prev => new Set(prev).add(clue.id));
        }, delay);
        timeouts.push(t);
      });
    });
    return () => timeouts.forEach(clearTimeout);
  }, [revealed, game.categories]);

  if (game.categories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/60 text-xl">No categories yet — add some in the editor.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div
        className="grid gap-2 h-full"
        style={{ gridTemplateColumns: `repeat(${game.categories.length}, 1fr)` }}
      >
        {/* Category headers */}
        {game.categories.map(cat => (
          <div
            key={cat.id}
            className="flex items-center justify-center p-3 rounded text-center"
            style={{
              backgroundColor: 'var(--color-board)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              color: 'white',
              letterSpacing: '0.05em',
              minHeight: '70px',
            }}
          >
            {cat.name || 'Category'}
          </div>
        ))}

        {/* Clue tiles — row by row */}
        {Array.from({ length: 5 }, (_, rowIdx) =>
          game.categories.map(cat => {
            const clue = cat.clues[rowIdx];
            if (!clue) return <div key={`${cat.id}-${rowIdx}`} />;
            const value = getClueValue(rowIdx);
            const isAnswered = !!runtime.answered[clue.id];
            const isAnimated = animatedTiles.has(clue.id);

            return (
              <button
                key={clue.id}
                onClick={() => !isAnswered && onTileClick(clue, value)}
                disabled={isAnswered}
                style={{
                  backgroundColor: isAnswered
                    ? 'var(--color-tile-answered)'
                    : 'var(--color-tile)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 3vw, 3rem)',
                  color: isAnswered ? 'transparent' : 'var(--color-gold)',
                  minHeight: '80px',
                  opacity: revealed ? (isAnimated ? 1 : 0) : 1,
                  transform: revealed ? (isAnimated ? 'scale(1)' : 'scale(0.8)') : 'scale(1)',
                  transition: 'opacity 200ms ease, transform 200ms ease, background-color 300ms ease',
                  cursor: isAnswered ? 'default' : 'pointer',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => {
                  if (!isAnswered) (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
                }}
                onMouseLeave={e => {
                  if (!isAnswered) (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
              >
                {isAnswered ? '' : `$${value}`}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
