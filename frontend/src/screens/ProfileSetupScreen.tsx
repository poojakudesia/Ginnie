import React, { useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';

const LEVELS = [
  {
    id: 'explorer',
    level: 1,
    title: 'Explorer',
    tag: 'NEW HERE',
    blurb: 'Start your journey with open curiosity.',
    icon: '🌱',
    gradient: 'linear-gradient(135deg, #2E5C3E 0%, #4E8C5A 100%)',
    color: '#4CAF50',
    glow: 'rgba(76,175,80,0.55)',
    align: 'flex-start' as const,
  },
  {
    id: 'catalyst',
    level: 2,
    title: 'Catalyst',
    tag: 'SOME EXPERIENCE',
    blurb: 'Go deeper with consistent practice.',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #C2410C 0%, #F59E0B 100%)',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.55)',
    align: 'flex-end' as const,
  },
  {
    id: 'master',
    level: 3,
    title: 'Master',
    tag: 'ADVANCED',
    blurb: 'Level up to a quantum manifestation state.',
    icon: '🌙',
    gradient: 'linear-gradient(135deg, #4C2A6E 0%, #8B5CF6 100%)',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.5)',
    align: 'flex-start' as const,
  },
] as const;

// Decorative magical specks scattered across the path
const SPECKS = [
  { char: '✦', x: 70, y: 30, size: 16, color: 'rgba(180,160,210,0.5)' },
  { char: '⋆', x: 88, y: 38, size: 22, color: 'rgba(140,200,150,0.45)' },
  { char: '✧', x: 12, y: 47, size: 13, color: 'rgba(200,170,120,0.5)' },
  { char: '◇', x: 90, y: 55, size: 11, color: 'rgba(120,180,230,0.45)' },
  { char: '✦', x: 8, y: 64, size: 12, color: 'rgba(210,160,180,0.45)' },
  { char: '⟡', x: 80, y: 70, size: 14, color: 'rgba(200,180,120,0.4)' },
  { char: '⋆', x: 30, y: 78, size: 16, color: 'rgba(150,170,220,0.4)' },
  { char: '✧', x: 60, y: 16, size: 12, color: 'rgba(160,200,160,0.45)' },
];

// Dotted trail clusters that wind between the cards
const TRAIL = [
  { x: 72, y: 27 }, { x: 78, y: 30 }, { x: 84, y: 34 }, { x: 88, y: 40 },
  { x: 20, y: 60 }, { x: 26, y: 64 }, { x: 33, y: 67 }, { x: 40, y: 68 },
];

export const ProfileSetupScreen: React.FC = () => {
  const goto = useAppStore((s) => s.goto);
  const { user, setUser } = useAuthStore();
  const [selected, setSelected] = useState<string>('explorer');

  const handleContinue = () => {
    if (user) {
      setUser({ ...user, familiarity: selected as 'explorer' | 'catalyst' | 'master' });
    }
    goto('wish-builder');
  };

  return (
    <DLScreen scroll pad>
      <div style={{ paddingTop: 16, paddingBottom: 8 }}>
        <DLLabel style={{ color: 'var(--btn)' }}>Step 1 of 4</DLLabel>
        <DLDisplay size="md" style={{ marginTop: 8 }}>
          Where are you<br />
          <span style={{ fontStyle: 'italic' }}>on your path!</span>
        </DLDisplay>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
          This helps Ginnie personalize your experience.
        </p>
      </div>

      {/* Path arena */}
      <div style={{ position: 'relative', margin: '20px 0 16px' }}>

        {/* Magical swirl background */}
        <div
          style={{
            position: 'absolute',
            inset: '-10px -8px',
            background:
              'radial-gradient(60% 40% at 85% 35%, rgba(180,160,220,0.10) 0%, transparent 60%),' +
              'radial-gradient(50% 35% at 12% 62%, rgba(150,190,150,0.10) 0%, transparent 60%)',
            borderRadius: 30,
            pointerEvents: 'none',
          }}
        />

        {/* Decorative specks */}
        {SPECKS.map((s, i) => (
          <span
            key={`s-${i}`}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              fontSize: s.size,
              color: s.color,
              pointerEvents: 'none',
              animation: `dlBreathe ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i % 4) * 0.4}s`,
            }}
          >
            {s.char}
          </span>
        ))}

        {/* Dotted winding trail */}
        {TRAIL.map((d, i) => (
          <span
            key={`t-${i}`}
            style={{
              position: 'absolute',
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: 5,
              height: 5,
              borderRadius: 999,
              background: 'var(--line-strong)',
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Staggered level cards */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 22 }}>
          {LEVELS.map((level) => {
            const isActive = selected === level.id;
            return (
              <div key={level.id} style={{ display: 'flex', justifyContent: level.align }}>
                <div
                  onClick={() => setSelected(level.id)}
                  style={{
                    width: '86%',
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: 0,
                    cursor: 'pointer',
                    borderRadius: 22,
                    background: 'var(--card)',
                    transition: 'all 0.25s ease',
                    boxShadow: isActive
                      ? `0 0 0 2px ${level.color}, 0 0 22px 2px ${level.glow}, 0 10px 26px rgba(0,0,0,0.10)`
                      : '0 4px 16px rgba(0,0,0,0.08)',
                    transform: isActive ? 'scale(1.015)' : 'scale(1)',
                  }}
                >
                  {/* Icon tile */}
                  <div
                    style={{
                      width: 92,
                      flexShrink: 0,
                      borderRadius: 18,
                      margin: 10,
                      background: level.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 38,
                      boxShadow: isActive
                        ? `0 0 16px ${level.glow}, inset 0 1px 0 rgba(255,255,255,0.3)`
                        : 'inset 0 1px 0 rgba(255,255,255,0.25)',
                    }}
                  >
                    {level.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: '14px 14px 14px 4px', minWidth: 0 }}>
                    {/* Top row: LEVEL badge + check */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          color: isActive ? level.color : 'var(--ink-2)',
                          background: isActive ? `${level.glow.replace('0.5', '0.16').replace('0.55', '0.16')}` : 'var(--accent-soft)',
                          padding: '4px 12px',
                          borderRadius: 999,
                        }}
                      >
                        LEVEL {level.level}
                      </span>
                      {isActive && (
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            background: 'linear-gradient(135deg, var(--btn), var(--btn-deep))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Title + tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                      <span style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 17, color: 'var(--ink)' }}>
                        {level.title}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 9,
                          letterSpacing: '0.1em',
                          color: 'var(--btn)',
                          background: 'var(--accent-soft)',
                          padding: '3px 8px',
                          borderRadius: 999,
                        }}
                      >
                        {level.tag}
                      </span>
                    </div>

                    {/* Blurb */}
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.45, margin: 0 }}>
                      {level.blurb}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DLButton variant="primary" size="lg" fullWidth onClick={handleContinue} style={{ marginBottom: 24 }}>
        That's me →
      </DLButton>
    </DLScreen>
  );
};
