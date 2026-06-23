import { useState, useEffect } from 'react';
import type { Clue } from '../types';

interface Props {
  clue: Clue;
  value: number;
  onClose: () => void;
}

type ModalState = 'question' | 'answer';

function MediaDisplay({ clue }: { clue: Clue }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!clue.media) return null;

  const { media } = clue;
  const src = media.blobUrl ?? media.externalUrl ?? '';

  if (!src && media.type !== 'link') return null;

  const containerStyle: React.CSSProperties = {
    maxHeight: '50%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
  };

  if (media.type === 'youtube') {
    // Convert watch URL to embed URL
    let embedSrc = src;
    const watchMatch = src.match(/[?&]v=([^&]+)/);
    const shortMatch = src.match(/youtu\.be\/([^?]+)/);
    const shortsMatch = src.match(/\/shorts\/([^?]+)/);
    const liveMatch = src.match(/\/live\/([^?]+)/);
    const videoId = watchMatch?.[1] ?? shortMatch?.[1] ?? shortsMatch?.[1] ?? liveMatch?.[1];
    if (videoId) embedSrc = `https://www.youtube.com/embed/${videoId}`;

    return (
      <div style={containerStyle}>
        <div style={{ position: 'relative', width: '100%', maxHeight: '100%' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'var(--color-modal-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <div style={{ width: 40, height: 40, border: '3px solid #FFD700', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}
          <iframe
            src={embedSrc}
            style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
            allowFullScreen
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
          {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>Video unavailable.</p>}
        </div>
      </div>
    );
  }

  if (media.type === 'image') {
    return (
      <div style={containerStyle}>
        {loading && <div style={{ color: 'white/60' }}>Loading image...</div>}
        {error ? (
          <p style={{ color: '#ef4444' }}>Image unavailable.</p>
        ) : (
          <img
            src={src}
            alt="clue media"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: loading ? 'none' : 'block' }}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
        )}
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <div style={containerStyle}>
        <video
          src={src}
          controls
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          onError={() => setError(true)}
        />
        {error && <p style={{ color: '#ef4444' }}>Video unavailable.</p>}
      </div>
    );
  }

  if (media.type === 'link') {
    return (
      <div style={{ ...containerStyle, justifyContent: 'center' }}>
        <a href={media.externalUrl ?? ''} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', textDecoration: 'underline', fontSize: '1.1rem' }}>
          Open link
        </a>
      </div>
    );
  }

  return null;
}

export function ClueModal({ clue, value, onClose }: Props) {
  const [state, setState] = useState<ModalState>('question');

  useEffect(() => {
    setState('question');
  }, [clue.id]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: '96px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'stretch',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel — full width */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'var(--color-modal-bg)',
          display: 'flex',
          flexDirection: 'column',
          padding: '48px',
          gap: '24px',
          overflowY: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Value badge */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-gold)', textAlign: 'center' }}>
          ${value}
        </div>

        {/* Question text */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.3,
            flex: '0 0 auto',
          }}
        >
          {clue.question || <em style={{ opacity: 0.5 }}>No question text</em>}
        </div>

        {/* Media (question state) */}
        {state === 'question' && <MediaDisplay clue={clue} />}

        {/* Answer (shown after reveal) */}
        {state === 'answer' && (
          <>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                color: 'var(--color-gold)',
                textAlign: 'center',
                lineHeight: 1.3,
                flex: '0 0 auto',
              }}
            >
              {clue.answer || <em style={{ opacity: 0.5 }}>No answer provided</em>}
            </div>
            {clue.answerMedia && <MediaDisplay clue={{ ...clue, media: clue.answerMedia }} />}
          </>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {state === 'question' && (
            <button
              onClick={() => setState('answer')}
              style={{
                height: '56px',
                backgroundColor: 'var(--color-gold)',
                color: '#050F2F',
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                letterSpacing: '0.05em',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              REVEAL ANSWER
            </button>
          )}
          {state === 'answer' && (
            <button
              onClick={onClose}
              style={{
                height: '44px',
                backgroundColor: 'transparent',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 600,
                border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
