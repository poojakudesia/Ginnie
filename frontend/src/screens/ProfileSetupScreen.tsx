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
    title: 'Explorer',
    tag: 'NEW HERE',
    blurb: "You're curious about manifestation and ready to start your journey with an open mind.",
    icon: '🌱',
    gradient: 'linear-gradient(135deg, #A8D5A2 0%, #6BAF64 100%)',
  },
  {
    id: 'catalyst',
    title: 'Catalyst',
    tag: 'SOME EXPERIENCE',
    blurb: "You've tried techniques before and want to go deeper with consistent practice.",
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #F9C784 0%, #F4A236 100%)',
  },
  {
    id: 'master',
    title: 'Master',
    tag: 'ADVANCED',
    blurb: "You live and breathe manifestation. You're here to level up and go quantum.",
    icon: '🌙',
    gradient: 'linear-gradient(135deg, #B8A5D4 0%, #7B5EA7 100%)',
  },
] as const;

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
          <span style={{ fontStyle: 'italic' }}>on your path?</span>
        </DLDisplay>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
          This helps Aura personalize your experience.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '16px 0' }}>
        {LEVELS.map((level) => {
          const isActive = selected === level.id;
          return (
            <div
              key={level.id}
              onClick={() => setSelected(level.id)}
              style={{
                borderRadius: 22,
                overflow: 'hidden',
                border: isActive ? '2px solid var(--btn)' : '2px solid var(--line)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 8px 24px rgba(124,55,99,0.20)' : '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* Illustration band */}
              <div
                style={{
                  height: 80,
                  background: level.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                }}
              >
                {level.icon}
              </div>

              {/* Content */}
              <div
                style={{
                  padding: '14px 18px 16px',
                  background: 'var(--card)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>
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
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
                    {level.blurb}
                  </p>
                </div>

                {isActive && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: 'linear-gradient(135deg, var(--btn), var(--btn-deep))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DLButton variant="primary" size="lg" fullWidth onClick={handleContinue} style={{ marginBottom: 24 }}>
        That's me →
      </DLButton>
    </DLScreen>
  );
};
