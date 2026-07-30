import React, { useEffect, useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLAura } from '../components/DLAura';
import { DLDisplay } from '../components/DLDisplay';
import { useAppStore } from '../store/app';

const STATUS_LINES = [
  'Reading your answers ✦',
  'Sensing your rhythm ✦',
  'Finding your alignment ✦',
];

const SPARKLES: Array<{ glyph: string; top: string; left: string; delay: string; size: number }> = [
  { glyph: '✦', top: '8%', left: '22%', delay: '0s', size: 20 },
  { glyph: '✧', top: '18%', left: '76%', delay: '0.6s', size: 16 },
  { glyph: '⋆', top: '62%', left: '14%', delay: '1.1s', size: 22 },
  { glyph: '✦', top: '70%', left: '82%', delay: '0.3s', size: 14 },
  { glyph: '✧', top: '40%', left: '90%', delay: '0.9s', size: 18 },
  { glyph: '⋆', top: '30%', left: '6%', delay: '1.4s', size: 16 },
];

export const EnergyScreen: React.FC = () => {
  const goto = useAppStore((s) => s.goto);
  const [statusIndex, setStatusIndex] = useState(0);

  // Auto-advance to the match after a short beat.
  useEffect(() => {
    const timeout = setTimeout(() => {
      goto('techniques');
    }, 2800);
    return () => clearTimeout(timeout);
  }, [goto]);

  // Cycle the status lines.
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <DLScreen>
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* Floating sparkle glyphs */}
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              fontSize: s.size,
              color: 'var(--accent)',
              opacity: 0.35,
              pointerEvents: 'none',
              animation: `dlBreathe 3.2s ease-in-out infinite ${s.delay}`,
            }}
          >
            {s.glyph}
          </span>
        ))}

        {/* Ginnie with energy-scanning rings */}
        <div
          style={{
            position: 'relative',
            width: 240,
            height: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Extra concentric pulsing rings */}
          <div
            style={{
              position: 'absolute',
              width: 190,
              height: 190,
              borderRadius: '50%',
              border: '1px solid var(--accent-soft)',
              animation: 'dlBreathe 3.4s ease-in-out infinite 0.2s',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: '50%',
              border: '1px solid var(--line)',
              animation: 'dlBreathe 3.4s ease-in-out infinite 0.7s',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 150,
              height: 150,
              borderRadius: '50%',
              animation: 'dlPulse 2.6s ease-in-out infinite 0.4s',
            }}
          />

          <DLAura size={120} glow rings />
        </div>

        {/* Headline */}
        <div
          className="dl-fade-up"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <DLDisplay size="md" center>
            Ginnie studied your energy…
          </DLDisplay>

          {/* Cycling status line */}
          <div
            key={statusIndex}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 13,
              letterSpacing: '0.02em',
              color: 'var(--muted)',
              animation: 'dlFadeUp 480ms cubic-bezier(.22,.61,.36,1) both',
            }}
          >
            {STATUS_LINES[statusIndex]}
          </div>
        </div>
      </div>

      {/* Skip / advance button */}
      <div
        className="ios-safe-bottom"
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: 34,
        }}
      >
        <button
          type="button"
          className="dl-press"
          onClick={() => goto('techniques')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
            fontSize: 13,
            letterSpacing: '0.04em',
            color: 'var(--muted)',
            padding: '8px 12px',
          }}
        >
          To Your Match →
        </button>
      </div>
    </DLScreen>
  );
};
