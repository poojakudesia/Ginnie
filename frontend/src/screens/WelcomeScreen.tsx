import React, { useEffect, useState } from 'react';
import { DLAura } from '../components/DLAura';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { useAppStore } from '../store/app';

const GLYPHS = [
  { char: '✦', x: 8, y: 12, size: 18, delay: 0 },
  { char: '♡', x: 85, y: 8, size: 14, delay: 0.5 },
  { char: '✧', x: 15, y: 65, size: 12, delay: 1 },
  { char: '✦', x: 78, y: 72, size: 22, delay: 0.3 },
  { char: '♡', x: 50, y: 5, size: 10, delay: 0.8 },
  { char: '✧', x: 92, y: 40, size: 16, delay: 1.2 },
  { char: '✦', x: 5, y: 38, size: 10, delay: 0.6 },
];

export const WelcomeScreen: React.FC = () => {
  const goto = useAppStore((s) => s.goto);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #FCE4EC 0%, #F8BBD9 30%, #FCF1F0 70%, #FFF8F7 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 28px 40px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating glyphs */}
      {GLYPHS.map((g, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${g.x}%`,
            top: `${g.y}%`,
            fontSize: g.size,
            color: 'rgba(124,55,99,0.25)',
            animation: `dlBreathe 3s ease-in-out infinite`,
            animationDelay: `${g.delay}s`,
            pointerEvents: 'none',
          }}
        >
          {g.char}
        </div>
      ))}

      {/* Top tagline */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.6s ease',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--btn)',
            marginBottom: 6,
          }}
        >
          Powered by Ginnie ✦
        </div>
        <DLDisplay size="lg" center style={{ color: 'var(--ink)', lineHeight: 1.1 }}>
          Live Your<br />
          <span style={{ fontStyle: 'italic' }}>Dream Life</span>
        </DLDisplay>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'var(--ink-2)',
            marginTop: 8,
            opacity: 0.7,
          }}
        >
          Your Era unlocked.
        </div>
      </div>

      {/* Aura avatar */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.7s ease 0.2s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <DLAura size={160} glow rings />

        <div style={{ textAlign: 'center', maxWidth: 280 }}>
          <DLDisplay size="sm" center>
            Hi, I'm Aura —
          </DLDisplay>
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 15,
              color: 'var(--ink-2)',
              lineHeight: 1.6,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            your personal Ginnie to help you unlock your dream life.
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease 0.4s',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <DLButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => goto('signin')}
        >
          Meet Ginnie ✦
        </DLButton>
        <button
          onClick={() => goto('signin')}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'var(--muted)',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          I already have an account
        </button>
      </div>
    </div>
  );
};
