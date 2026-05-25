import React, { useState } from 'react';
import { useAppStore } from '../store/app';
import { DLTopBar } from '../components/DLTopBar';
import { DLButton } from '../components/DLButton';
import { DLLabel } from '../components/DLLabel';
import { DLChip } from '../components/DLChip';
import { DLScreen } from '../components/DLScreen';

interface MyMovie {
  id: string;
  title: string;
  duration: string;
  frames: number;
  lastViewed: string;
  gradient: string;
  frameText: string;
}

interface LibraryMovie {
  id: string;
  title: string;
  plays: number;
  gradient: string;
  mood: string;
}

const MY_MOVIES: MyMovie[] = [
  {
    id: 'm1',
    title: 'Movie 01',
    duration: '1:04',
    frames: 8,
    lastViewed: '2 days ago',
    gradient: 'linear-gradient(160deg, #7DAA73 0%, #4D6749 100%)',
    frameText: 'I walk into my dream office, sunlight pouring through tall windows...',
  },
  {
    id: 'm2',
    title: 'Movie 02',
    duration: '0:58',
    frames: 6,
    lastViewed: 'Yesterday',
    gradient: 'linear-gradient(160deg, #DC8551 0%, #B86838 100%)',
    frameText: 'I open the door to my home — exactly as I imagined it...',
  },
];

const LIBRARY_MOVIES: LibraryMovie[] = [
  {
    id: 'l1',
    title: 'Morning Abundance',
    plays: 2841,
    gradient: 'linear-gradient(160deg, #F9C784 0%, #F4A236 100%)',
    mood: 'calm',
  },
  {
    id: 'l2',
    title: 'Success Mindset',
    plays: 1509,
    gradient: 'linear-gradient(160deg, #A78BFA 0%, #7C3AED 100%)',
    mood: 'powerful',
  },
  {
    id: 'l3',
    title: 'Love Attraction',
    plays: 3102,
    gradient: 'linear-gradient(160deg, #F9A8D4 0%, #EC4899 100%)',
    mood: 'open',
  },
  {
    id: 'l4',
    title: 'Financial Freedom',
    plays: 987,
    gradient: 'linear-gradient(160deg, #6EE7B7 0%, #059669 100%)',
    mood: 'expansive',
  },
];

const FRAME_SEGMENTS = 8;

export const MovieScreen: React.FC = () => {
  const { goto } = useAppStore();
  const [tab, setTab] = useState<'mine' | 'library'>('mine');
  const [playing, setPlaying] = useState<string | null>(null);
  const [playingSegment, setPlayingSegment] = useState(2);
  const [paused, setPaused] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');

  const playingMovie =
    MY_MOVIES.find((m) => m.id === playing) ||
    (LIBRARY_MOVIES.find((m) => m.id === playing)
      ? {
          id: playing!,
          title: LIBRARY_MOVIES.find((m) => m.id === playing)!.title,
          duration: '1:04',
          frames: 8,
          lastViewed: '',
          gradient: LIBRARY_MOVIES.find((m) => m.id === playing)!.gradient,
          frameText: 'Feel the scene coming alive around you...',
        }
      : null);

  // ── PLAYING OVERLAY ──
  if (playing && playingMovie) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0E0E0C',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          boxSizing: 'border-box',
          padding: '16px 20px 28px',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => setPlaying(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.10)',
              border: 'none',
              borderRadius: 999,
              padding: '6px 14px',
              cursor: 'pointer',
              color: '#fff',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
            }}
          >
            ← BACK
          </button>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.04em',
            }}
          >
            00:14 / 01:04
          </span>
        </div>

        {/* Main frame card */}
        <div
          style={{
            width: '100%',
            aspectRatio: '4/5',
            borderRadius: 24,
            background: playingMovie.gradient,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 22,
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
            maxHeight: 340,
          }}
        >
          {/* Music note */}
          <div
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: '#fff',
            }}
          >
            ♪
          </div>
          <p
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 18,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {playingMovie.frameText}
          </p>
        </div>

        {/* Progress segments */}
        <div style={{ display: 'flex', gap: 4, width: '100%', marginTop: 20 }}>
          {Array.from({ length: FRAME_SEGMENTS }).map((_, i) => (
            <div
              key={i}
              onClick={() => setPlayingSegment(i)}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 999,
                background:
                  i < playingSegment
                    ? 'rgba(255,255,255,0.9)'
                    : i === playingSegment
                    ? 'rgba(255,255,255,0.55)'
                    : 'rgba(255,255,255,0.18)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            marginTop: 28,
          }}
        >
          <button
            onClick={() => setPlayingSegment((s) => Math.max(0, s - 1))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 24,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ↺
          </button>

          {/* Pause button */}
          <button
            onClick={() => setPaused((p) => !p)}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: '#0E0E0C',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {paused ? '▸' : '⏸'}
          </button>

          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 22,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ♡
          </button>
        </div>
      </div>
    );
  }

  // ── BROWSE / LIST ──
  return (
    <DLScreen scroll={false} pad={false} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 22,
              fontStyle: 'italic',
              color: 'var(--ink)',
              marginBottom: 2,
            }}
          >
            Vision movies
          </div>
          <DLLabel>your wish as a 60-second film.</DLLabel>
        </div>
        <DLButton variant="secondary" size="sm">
          + New
        </DLButton>
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: 'flex',
          padding: '14px 20px 0',
          gap: 6,
          flexShrink: 0,
        }}
      >
        {(['mine', 'library'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              fontFamily: 'var(--sans)',
              fontSize: 13,
              fontWeight: tab === t ? 600 : 400,
              background: tab === t ? 'var(--ink)' : 'transparent',
              color: tab === t ? 'var(--card)' : 'var(--muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {t === 'mine' ? 'My movies' : 'Library'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>
        {tab === 'mine' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Movie cards */}
            {MY_MOVIES.map((m) => (
              <div
                key={m.id}
                onClick={() => setPlaying(m.id)}
                style={{
                  borderRadius: 22,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                  position: 'relative',
                  minHeight: 180,
                  background: m.gradient,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 18,
                  boxSizing: 'border-box',
                }}
              >
                {/* Play button */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 18,
                    right: 18,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    border: '1.5px solid rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: '#fff',
                  }}
                >
                  ▸
                </div>
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 26,
                    fontStyle: 'italic',
                    color: '#fff',
                    marginBottom: 10,
                    maxWidth: '70%',
                  }}
                >
                  {m.title}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.7)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {m.duration}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.7)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {m.frames} frames
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.55)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    viewed {m.lastViewed}
                  </span>
                </div>
              </div>
            ))}

            {/* New movie card */}
            <div
              style={{
                borderRadius: 22,
                minHeight: 100,
                border: '2px dashed var(--line-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: 'pointer',
                color: 'var(--muted)',
              }}
            >
              <span style={{ fontSize: 18 }}>+</span>
              <span
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 14,
                  color: 'var(--muted)',
                }}
              >
                Build a new vision movie
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Search bar */}
            <div
              style={{
                background: 'rgba(0,0,0,0.05)',
                borderRadius: 14,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>⌕</span>
              <input
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Search movies..."
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--sans)',
                  fontSize: 14,
                  color: 'var(--ink)',
                  flex: 1,
                }}
              />
            </div>

            {/* 2×2 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {LIBRARY_MOVIES.filter(
                (m) =>
                  !librarySearch ||
                  m.title.toLowerCase().includes(librarySearch.toLowerCase())
              ).map((m) => (
                <div
                  key={m.id}
                  onClick={() => setPlaying(m.id)}
                  style={{
                    borderRadius: 18,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
                    aspectRatio: '4/5',
                    background: m.gradient,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 14,
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                >
                  {/* Play button */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: '#fff',
                    }}
                  >
                    ▸
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 15,
                      fontStyle: 'italic',
                      color: '#fff',
                      marginBottom: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {m.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.65)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {m.plays.toLocaleString()} plays
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DLScreen>
  );
};
