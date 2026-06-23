import { useState, useEffect, useCallback, useRef } from 'react';
import type { Game, RuntimeState, Clue } from './types';
import { makeDefaultGame } from './utils/makeDefaultGame';
import { serializeForStorage } from './utils/serializeForStorage';
import { GameBoard } from './components/GameBoard';
import { ClueModal } from './components/ClueModal';
import { PlayerPanel } from './components/PlayerPanel';
import { GameEditor } from './components/GameEditor';
import { FinalScores } from './components/FinalScores';
import './index.css';

const GAME_DEF_KEY = 'jeopardy-game-definition';
const RUNTIME_KEY = 'jeopardy-runtime-state';

function loadGame(): Game {
  try {
    const raw = localStorage.getItem(GAME_DEF_KEY);
    if (raw) {
      const game = JSON.parse(raw) as Game;
      // migrate older saves that lack answerMedia
      for (const cat of game.categories) {
        for (const clue of cat.clues) {
          if (!('answerMedia' in clue)) (clue as Clue).answerMedia = null;
        }
      }
      return game;
    }
  } catch {}
  return makeDefaultGame();
}

function loadRuntime(game: Game): RuntimeState {
  try {
    const raw = localStorage.getItem(RUNTIME_KEY);
    if (raw) return JSON.parse(raw) as RuntimeState;
  } catch {}
  return makeDefaultRuntime(game);
}

function makeDefaultRuntime(game: Game): RuntimeState {
  const scores: Record<string, number> = {};
  const answered: Record<string, boolean> = {};
  for (const player of game.players) scores[player.id] = 0;
  return { scores, answered };
}

type SaveStatus = 'saved' | 'saving' | 'error';

export default function App() {
  const [game, setGame] = useState<Game>(loadGame);
  const [runtime, setRuntime] = useState<RuntimeState>(() => loadRuntime(loadGame()));
  const [activeMode, setActiveMode] = useState<'editor' | 'game'>('editor');
  const [activeClue, setActiveClue] = useState<{ clue: Clue; value: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [boardRevealed, setBoardRevealed] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced autosave of game definition
  useEffect(() => {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(GAME_DEF_KEY, JSON.stringify(serializeForStorage(game)));
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [game]);

  // Immediate save of runtime state
  useEffect(() => {
    try {
      localStorage.setItem(RUNTIME_KEY, JSON.stringify(runtime));
    } catch {}
  }, [runtime]);

  // Keyboard shortcut: Ctrl+E to return to editor in game mode
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setActiveMode('editor');
        setBoardRevealed(false);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleGameChange = useCallback((updated: Game) => {
    setGame(updated);
  }, []);

  function switchToGame() {
    setActiveMode('game');
    setBoardRevealed(false);
    // Short delay then trigger board reveal animation
    setTimeout(() => setBoardRevealed(true), 100);
  }

  function switchToEditor() {
    setActiveMode('editor');
    setBoardRevealed(false);
  }

  function handleTileClick(clue: Clue, value: number) {
    setActiveClue({ clue, value });
  }

  function handleCloseModal() {
    if (activeClue) {
      setRuntime(prev => ({
        ...prev,
        answered: { ...prev.answered, [activeClue.clue.id]: true },
      }));
    }
    setActiveClue(null);
  }

  function handleScore(playerId: string, delta: number) {
    setRuntime(prev => ({
      ...prev,
      scores: { ...prev.scores, [playerId]: (prev.scores[playerId] ?? 0) + delta },
    }));
  }

  function handleSetScore(playerId: string, score: number) {
    setRuntime(prev => ({
      ...prev,
      scores: { ...prev.scores, [playerId]: score },
    }));
  }

  function handleReset() {
    setRuntime(makeDefaultRuntime(game));
    setActiveClue(null);
    setBoardRevealed(false);
    setTimeout(() => setBoardRevealed(true), 100);
  }

  function handlePlayAgain() {
    const newRuntime = makeDefaultRuntime(game);
    setRuntime(newRuntime);
    setBoardRevealed(false);
    setTimeout(() => setBoardRevealed(true), 100);
  }

  function handleNewGame() {
    setActiveMode('editor');
    setBoardRevealed(false);
    setRuntime(makeDefaultRuntime(game));
  }

  // Check if all clues are answered
  const allClues = game.categories.flatMap(c => c.clues);
  const answeredCount = allClues.filter(cl => runtime.answered[cl.id]).length;
  const showFinalScores = activeMode === 'game' && allClues.length > 0 && answeredCount === allClues.length && !activeClue;

  if (activeMode === 'editor') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* NavBar */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(6, 20, 154, 0.4)',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-gold)', letterSpacing: '0.08em' }}>
            JEOPARDY
          </span>
          <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>
            Editor
          </span>
        </div>

        <GameEditor
          game={game}
          saveStatus={saveStatus}
          onGameChange={handleGameChange}
          onSwitchToGame={switchToGame}
        />
      </div>
    );
  }

  // Game mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Gear icon to return to editor */}
      <button
        onClick={switchToEditor}
        title="Return to Editor (Ctrl+E)"
        style={{
          position: 'fixed', top: '12px', right: '12px', zIndex: 40,
          backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%', width: '40px', height: '40px',
          color: 'white', fontSize: '1.1rem', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        ⚙
      </button>

      {/* Game title */}
      <div style={{
        textAlign: 'center', padding: '12px',
        fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
        color: 'var(--color-gold)', letterSpacing: '0.08em',
        backgroundColor: 'var(--color-board)',
      }}>
        {game.title}
      </div>

      {/* Main game area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <GameBoard
          game={game}
          runtime={runtime}
          onTileClick={handleTileClick}
          revealed={boardRevealed}
        />
      </div>

      {/* Player bar at bottom */}
      <PlayerPanel
        players={game.players}
        runtime={runtime}
        activeClue={activeClue}
        onScore={handleScore}
        onSetScore={handleSetScore}
        onReset={handleReset}
      />

      {/* ClueModal */}
      {activeClue && !showFinalScores && (
        <ClueModal
          clue={activeClue.clue}
          value={activeClue.value}
          onClose={handleCloseModal}
        />
      )}

      {/* Final Scores overlay */}
      {showFinalScores && (
        <FinalScores
          players={game.players}
          runtime={runtime}
          onPlayAgain={handlePlayAgain}
          onNewGame={handleNewGame}
        />
      )}

      {/* Spin animation for YouTube loading */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
