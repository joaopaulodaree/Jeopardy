import { useState, useRef } from 'react';
import type { Game, Category, Clue, Media } from '../types';
import { detectMediaType } from '../utils/detectMediaType';
import { validateImport } from '../utils/validateImport';
import { serializeForStorage } from '../utils/serializeForStorage';
import { getClueValue } from '../utils/getClueValue';

interface Props {
  game: Game;
  saveStatus: 'saved' | 'saving' | 'error';
  onGameChange: (game: Game) => void;
  onSwitchToGame: () => void;
}

function MediaRow({
  label,
  media,
  onUrlChange,
  onFile,
  onClear,
}: {
  label: string;
  media: import('../types').Media | null;
  onUrlChange: (url: string) => void;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const url = media?.blobUrl ?? media?.externalUrl ?? '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          type="text"
          placeholder={`${label} media — URL or upload`}
          value={url}
          onChange={e => onUrlChange(e.target.value)}
          style={{ ...inputStyle, flex: 1, fontSize: '0.82rem' }}
        />
        <button onClick={() => fileInputRef.current?.click()} style={smallButtonStyle} title="Upload local file">
          📁
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
      {media && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
            {media.type} — {media.blobUrl ? 'local file' : (media.externalUrl ?? '').slice(0, 40) + '...'}
          </span>
          <button onClick={onClear} style={{ ...smallButtonStyle, backgroundColor: 'transparent', color: '#ef4444', fontSize: '0.72rem', padding: '2px 6px' }}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function ClueForm({
  clue,
  index,
  onChange,
}: {
  clue: Clue;
  index: number;
  onChange: (updated: Clue) => void;
}) {
  function handleMediaUrl(key: 'media' | 'answerMedia', url: string) {
    if (!url.trim()) { onChange({ ...clue, [key]: null }); return; }
    const type = detectMediaType(url);
    onChange({ ...clue, [key]: { type, blobUrl: null, externalUrl: url } });
  }

  function handleMediaFile(key: 'media' | 'answerMedia', file: File) {
    const type: Media['type'] = file.type.startsWith('image/') ? 'image' : 'video';
    const blobUrl = URL.createObjectURL(file);
    const old = clue[key];
    if (old?.blobUrl) URL.revokeObjectURL(old.blobUrl);
    onChange({ ...clue, [key]: { type, blobUrl, externalUrl: null } });
  }

  function handleMediaClear(key: 'media' | 'answerMedia') {
    const old = clue[key];
    if (old?.blobUrl) URL.revokeObjectURL(old.blobUrl);
    onChange({ ...clue, [key]: null });
  }

  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-gold)' }}>
          ${getClueValue(index)}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <input
          type="text"
          placeholder="Question (shown to players)"
          value={clue.question}
          onChange={e => onChange({ ...clue, question: e.target.value })}
          style={inputStyle}
        />
        <MediaRow
          label="Question"
          media={clue.media}
          onUrlChange={url => handleMediaUrl('media', url)}
          onFile={f => handleMediaFile('media', f)}
          onClear={() => handleMediaClear('media')}
        />
        <input
          type="text"
          placeholder="Answer"
          value={clue.answer}
          onChange={e => onChange({ ...clue, answer: e.target.value })}
          style={inputStyle}
        />
        <MediaRow
          label="Answer"
          media={clue.answerMedia}
          onUrlChange={url => handleMediaUrl('answerMedia', url)}
          onFile={f => handleMediaFile('answerMedia', f)}
          onClear={() => handleMediaClear('answerMedia')}
        />
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '6px',
  color: 'white',
  padding: '8px 12px',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  width: '100%',
};

const smallButtonStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '6px',
  color: 'white',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontFamily: 'var(--font-body)',
  whiteSpace: 'nowrap',
};

function CategoryAccordion({
  category,
  isOpen,
  onToggle,
  onCategoryChange,
}: {
  category: Category;
  isOpen: boolean;
  onToggle: () => void;
  onCategoryChange: (updated: Category) => void;
}) {
  function updateClue(index: number, updated: Clue) {
    const clues = [...category.clues];
    clues[index] = updated;
    onCategoryChange({ ...category, clues });
  }

  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          backgroundColor: isOpen ? 'rgba(21, 101, 192, 0.3)' : 'rgba(255,255,255,0.05)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '1rem',
          fontWeight: 600,
          textAlign: 'left',
        }}
      >
        <span>{category.name || 'Unnamed Category'}</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={{ padding: '0 16px 12px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <div style={{ paddingTop: '12px', marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Category Name</label>
            <input
              type="text"
              maxLength={200}
              value={category.name}
              onChange={e => onCategoryChange({ ...category, name: e.target.value })}
              style={inputStyle}
              placeholder="Category name"
            />
          </div>
          {category.clues.map((clue, i) => (
            <ClueForm
              key={clue.id}
              clue={clue}
              index={i}
              onChange={updated => updateClue(i, updated)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GameEditor({ game, saveStatus, onGameChange, onSwitchToGame }: Props) {
  const [openCategory, setOpenCategory] = useState<string | null>(game.categories[0]?.id ?? null);
  const [toast, setToast] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function updateCategory(index: number, updated: Category) {
    const categories = [...game.categories];
    categories[index] = updated;
    onGameChange({ ...game, categories });
  }

  function addCategory() {
    if (game.categories.length >= 8) return;
    const newCat: Category = {
      id: crypto.randomUUID(),
      name: `Category ${game.categories.length + 1}`,
      clues: Array.from({ length: 5 }, () => ({ id: crypto.randomUUID(), question: '', answer: '', media: null })),
    };
    const categories = [...game.categories, newCat];
    onGameChange({ ...game, categories });
    setOpenCategory(newCat.id);
  }

  function removeCategory(id: string) {
    if (game.categories.length <= 1) return;
    const categories = game.categories.filter(c => c.id !== id);
    onGameChange({ ...game, categories });
    if (openCategory === id) setOpenCategory(categories[0]?.id ?? null);
  }

  function updatePlayerName(id: string, name: string) {
    const players = game.players.map(p => p.id === id ? { ...p, name } : p);
    onGameChange({ ...game, players });
  }

  function addPlayer() {
    const players = [...game.players, { id: crypto.randomUUID(), name: `Player ${game.players.length + 1}` }];
    onGameChange({ ...game, players });
  }

  function removePlayer(id: string) {
    const players = game.players.filter(p => p.id !== id);
    onGameChange({ ...game, players });
  }

  function handleExport() {
    const data = serializeForStorage(game);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const imported = validateImport(raw);
        onGameChange(imported);
        showToast(`Game loaded: ${imported.title} (${imported.categories.length} categories, ${imported.categories.reduce((n, c) => n + c.clues.filter(cl => cl.question).length, 0)} clues)`);
      } catch (err) {
        showToast(`Import failed: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  }

  const statusColor = saveStatus === 'saved' ? '#9ca3af' : saveStatus === 'saving' ? '#fbbf24' : '#ef4444';
  const statusText = saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Storage full';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'rgba(21,101,192,0.95)', color: 'white', padding: '12px 24px',
          borderRadius: '8px', zIndex: 100, fontFamily: 'var(--font-body)', fontSize: '0.9rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          value={game.title}
          onChange={e => onGameChange({ ...game, title: e.target.value })}
          style={{ ...inputStyle, width: 'auto', flex: 1, fontWeight: 600, fontSize: '1rem' }}
          placeholder="Game title"
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block' }} />
          <span style={{ fontSize: '0.8rem', color: statusColor, fontFamily: 'var(--font-body)' }}>{statusText}</span>
        </div>

        <button onClick={handleExport} style={smallButtonStyle}>Export JSON</button>
        <button onClick={() => importRef.current?.click()} style={smallButtonStyle}>Load Game</button>
        <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ''; }} />

        <button
          onClick={onSwitchToGame}
          style={{ ...smallButtonStyle, backgroundColor: 'var(--color-gold)', color: '#050F2F', fontWeight: 700 }}
        >
          ▶ Play Game
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', gap: '0' }}>
        {/* Categories */}
        <div style={{ flex: 2, padding: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-gold)', letterSpacing: '0.05em' }}>CATEGORIES</h2>
            <button
              onClick={addCategory}
              disabled={game.categories.length >= 8}
              style={{ ...smallButtonStyle, opacity: game.categories.length >= 8 ? 0.4 : 1 }}
            >
              + Add Category
            </button>
          </div>

          {game.categories.map((cat, i) => (
            <div key={cat.id} style={{ position: 'relative' }}>
              <CategoryAccordion
                category={cat}
                isOpen={openCategory === cat.id}
                onToggle={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
                onCategoryChange={updated => updateCategory(i, updated)}
              />
              {game.categories.length > 1 && openCategory === cat.id && (
                <button
                  onClick={() => removeCategory(cat.id)}
                  style={{
                    position: 'absolute', top: '10px', right: '40px',
                    backgroundColor: 'transparent', border: 'none', color: '#ef4444',
                    cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Players sidebar */}
        <div style={{ flex: 1, padding: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-gold)', letterSpacing: '0.05em' }}>PLAYERS</h2>
            <button onClick={addPlayer} style={smallButtonStyle}>+ Add</button>
          </div>

          {game.players.map(player => (
            <div key={player.id} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                type="text"
                value={player.name}
                onChange={e => updatePlayerName(player.id, e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Player name"
              />
              <button
                onClick={() => removePlayer(player.id)}
                style={{ ...smallButtonStyle, backgroundColor: 'transparent', color: '#ef4444', padding: '6px 10px' }}
              >
                ✕
              </button>
            </div>
          ))}

          {game.players.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0 }}>No players added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
