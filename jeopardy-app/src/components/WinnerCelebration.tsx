import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Player, RuntimeState } from '../types';

interface Props {
  players: Player[];
  runtime: RuntimeState;
  onDismiss: () => void;
}

function scoreColor(score: number): string {
  if (score < 0) return 'var(--color-score-neg)';
  if (score > 0) return 'var(--color-gold)';
  return 'white';
}

export function WinnerCelebration({ players, runtime, onDismiss }: Props) {
  const scores = runtime.scores;
  const maxScore = Math.max(...players.map(p => scores[p.id] ?? 0));
  const winners = players.filter(p => (scores[p.id] ?? 0) === maxScore);
  const isTie = winners.length > 1;

  const nonWinners = players
    .filter(p => !winners.some(w => w.id === p.id))
    .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  const runnerUp = nonWinners[0];
  const margin = runnerUp ? maxScore - (scores[runnerUp.id] ?? 0) : null;

  useEffect(() => {
    const fire = () => {
      confetti({ angle: 60, origin: { x: 0, y: 0.6 }, spread: 55, particleCount: 100, colors: ['#FFD700', '#ffffff', '#06149a'] });
      confetti({ angle: 120, origin: { x: 1, y: 0.6 }, spread: 55, particleCount: 100, colors: ['#FFD700', '#ffffff', '#06149a'] });
    };
    fire();
    const t = setTimeout(fire, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 15, 47, 0.97)',
        zIndex: 70,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '48px',
      }}
    >
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.4); }
          70%  { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'rgba(255,215,0,0.7)', letterSpacing: '0.15em', textAlign: 'center', animation: 'fadeUp 0.4s ease both' }}>
        {isTie ? "IT'S A TIE!" : 'WINNER'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {winners.map(winner => (
          <div
            key={winner.id}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
              color: 'var(--color-gold)',
              textAlign: 'center',
              letterSpacing: '0.05em',
              animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
              textShadow: '0 0 40px rgba(255,215,0,0.4)',
            }}
          >
            {winner.name}
          </div>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1.2rem, 3vw, 2rem)', color: 'white', textAlign: 'center', animation: 'fadeUp 0.5s 0.2s ease both', opacity: 0 }}>
        <span style={{ color: scoreColor(maxScore), fontWeight: 700 }}>
          {maxScore < 0 ? `-$${Math.abs(maxScore)}` : `$${maxScore}`}
        </span>
        {!isTie && runnerUp && margin !== null && margin > 0 && (
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7em', marginLeft: '12px' }}>
            beats {runnerUp.name} by ${margin}
          </span>
        )}
      </div>

      <button
        onClick={onDismiss}
        style={{
          marginTop: '16px',
          height: '52px',
          padding: '0 40px',
          backgroundColor: 'transparent',
          color: 'white',
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          letterSpacing: '0.05em',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          cursor: 'pointer',
          animation: 'fadeUp 0.5s 0.4s ease both',
          opacity: 0,
        }}
      >
        CONTINUE GAME
      </button>
    </div>
  );
}
