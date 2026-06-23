import type { Player, RuntimeState, Clue } from '../types';

interface Props {
  players: Player[];
  runtime: RuntimeState;
  activeClue: { clue: Clue; value: number } | null;
  onScore: (playerId: string, delta: number) => void;
  onSetScore: (playerId: string, score: number) => void;
  onReset: () => void;
}

function scoreColor(score: number): string {
  if (score < 0) return 'var(--color-score-neg)';
  if (score > 0) return 'var(--color-score-pos)';
  return 'white';
}

const scoreInputStyle: React.CSSProperties = {
  width: '90px',
  backgroundColor: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '6px',
  padding: '4px 8px',
  fontFamily: 'var(--font-body)',
  fontSize: '1.3rem',
  fontWeight: 700,
  textAlign: 'center',
  outline: 'none',
};

const btnStyle = (bg: string): React.CSSProperties => ({
  height: '44px',
  minWidth: '72px',
  backgroundColor: bg,
  color: 'white',
  fontFamily: 'var(--font-display)',
  fontSize: '1.1rem',
  letterSpacing: '0.03em',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  padding: '0 10px',
  flexShrink: 0,
});

export function PlayerPanel({ players, runtime, activeClue, onScore, onSetScore, onReset }: Props) {
  const delta = activeClue?.value ?? 0;

  return (
    <div
      style={{
        height: '96px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#050F2F',
        borderTop: '2px solid rgba(255,215,0,0.25)',
        padding: '0 12px',
        gap: '8px',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {players.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0 }}>
          No players — add them in the editor.
        </p>
      ) : (
        players.map((player, i) => {
          const score = runtime.scores[player.id] ?? 0;
          return (
            <div
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 12px',
                borderRight: i < players.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600, color: 'white', minWidth: '60px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {player.name}
              </span>

              <input
                type="number"
                key={score}
                defaultValue={score}
                style={{ ...scoreInputStyle, color: scoreColor(score) }}
                onFocus={e => e.target.select()}
                onChange={e => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v)) onSetScore(player.id, v);
                }}
                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              />

              <button onClick={() => onScore(player.id, delta)} style={btnStyle('#15803d')}>
                +{delta > 0 ? delta : '?'}
              </button>
              <button onClick={() => onScore(player.id, -delta)} style={btnStyle('#991b1b')}>
                -{delta > 0 ? delta : '?'}
              </button>
            </div>
          );
        })
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Reset button */}
      <button
        onClick={onReset}
        style={{
          height: '40px',
          padding: '0 16px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '6px',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Reset Game
      </button>
    </div>
  );
}
