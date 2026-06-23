import type { Player, RuntimeState } from '../types';

interface Props {
  players: Player[];
  runtime: RuntimeState;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

function scoreColor(score: number): string {
  if (score < 0) return 'var(--color-score-neg)';
  if (score > 0) return 'var(--color-score-pos)';
  return 'white';
}

export function FinalScores({ players, runtime, onPlayAgain, onNewGame }: Props) {
  const sorted = [...players].sort((a, b) => (runtime.scores[b.id] ?? 0) - (runtime.scores[a.id] ?? 0));
  const winner = sorted[0];
  const winnerScore = runtime.scores[winner?.id] ?? 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 15, 47, 0.97)',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        padding: '48px',
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--color-gold)', textAlign: 'center', letterSpacing: '0.05em' }}>
        FINAL SCORES
      </div>

      {winner && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', color: 'white', textAlign: 'center' }}>
          🏆 <strong>{winner.name}</strong> wins with <span style={{ color: 'var(--color-gold)' }}>${winnerScore}</span>!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '480px' }}>
        {sorted.map((player, i) => {
          const score = runtime.scores[player.id] ?? 0;
          return (
            <div
              key={player.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderRadius: '8px',
                backgroundColor: i === 0 ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)',
                border: i === 0 ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', width: '24px' }}>#{i + 1}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'white', fontWeight: 600 }}>{player.name}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.5rem', fontWeight: 700, color: scoreColor(score) }}>
                {score < 0 ? `-$${Math.abs(score)}` : `$${score}`}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={onPlayAgain}
          style={{
            height: '56px',
            padding: '0 32px',
            backgroundColor: 'var(--color-gold)',
            color: '#050F2F',
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            letterSpacing: '0.05em',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          PLAY AGAIN
        </button>
        <button
          onClick={onNewGame}
          style={{
            height: '56px',
            padding: '0 32px',
            backgroundColor: 'transparent',
            color: 'white',
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            letterSpacing: '0.05em',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          EDIT GAME
        </button>
      </div>
    </div>
  );
}
