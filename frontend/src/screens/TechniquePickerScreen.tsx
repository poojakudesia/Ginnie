import React, { useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { DLCard } from '../components/DLCard';
import { useAppStore } from '../store/app';

const TECHNIQUES = [
  { id: 'viz', emoji: '◐', name: 'Visualization', desc: 'See your future as if it\'s happening now', time: '10 min', isRec: true },
  { id: 'affirm', emoji: '✦', name: 'Affirmations', desc: 'Reprogram your subconscious with powerful statements', time: '5 min', isRec: true },
  { id: 'movie', emoji: '▸', name: 'Vision Movie', desc: 'Create a mental movie of your desired reality', time: '15 min', isRec: true },
  { id: 'script', emoji: '✍', name: 'Scripting', desc: 'Write your future reality in vivid detail', time: '10 min', isRec: false },
  { id: 'meditate', emoji: '◎', name: 'Meditation', desc: 'Quiet the mind to receive', time: '10 min', isRec: false },
  { id: 'gratitude', emoji: '♡', name: 'Gratitude', desc: 'Amplify what you have to attract more', time: '5 min', isRec: false },
  { id: '369', emoji: '3', name: '369 Method', desc: 'Write your desire 3, 6, and 9 times daily', time: '10 min', isRec: false },
  { id: '555', emoji: '5', name: '55x5 Method', desc: 'Write one affirmation 55 times for 5 days', time: '20 min', isRec: false },
];

export const TechniquePickerScreen: React.FC = () => {
  const { goto, setTechniques } = useAppStore();
  const [selected, setSelected] = useState<Set<string>>(new Set(['viz', 'affirm', 'movie']));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = () => {
    setTechniques(Array.from(selected));
    goto('tutorial');
  };

  const recommended = TECHNIQUES.filter((t) => t.isRec);
  const others = TECHNIQUES.filter((t) => !t.isRec);

  return (
    <DLScreen scroll pad style={{ paddingTop: 20, paddingBottom: 32 }}>
      <DLLabel style={{ color: 'var(--btn)', marginBottom: 6, display: 'block' }}>
        Step 3 of 4
      </DLLabel>
      <DLDisplay size="sm" style={{ marginBottom: 6 }}>
        Pick your<br />
        <span style={{ fontStyle: 'italic' }}>techniques</span>
      </DLDisplay>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
        Choose at least 1. Aura will personalize your daily practice.
      </p>

      {/* Recommended */}
      <DLLabel style={{ marginBottom: 10, display: 'block' }}>⭐ Recommended for you</DLLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
        {recommended.map((t) => {
          const isOn = selected.has(t.id);
          return (
            <div
              key={t.id}
              onClick={() => toggle(t.id)}
              style={{
                borderRadius: 20,
                padding: '18px 18px',
                background: isOn ? 'var(--accent-soft)' : 'var(--card)',
                border: isOn ? '2px solid var(--btn)' : '1.5px solid var(--line)',
                cursor: 'pointer',
                display: 'flex',
                gap: 14,
                alignItems: 'center',
                transition: 'all 0.15s',
                boxShadow: isOn ? '0 6px 16px rgba(124,55,99,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: isOn ? 'linear-gradient(135deg, var(--btn), var(--btn-deep))' : 'var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: isOn ? '#fff' : 'var(--muted)',
                  flexShrink: 0,
                }}
              >
                {t.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 15, color: isOn ? 'var(--btn)' : 'var(--ink)', marginBottom: 3 }}>
                  {t.name}
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
                  {t.desc}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--btn)', marginTop: 4, letterSpacing: '0.06em' }}>
                  {t.time}
                </div>
              </div>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: isOn ? 'linear-gradient(135deg, var(--btn), var(--btn-deep))' : 'var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {isOn ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Others */}
      <DLLabel style={{ marginBottom: 10, display: 'block' }}>More techniques</DLLabel>
      <DLCard tone="paper" pad={0} style={{ overflow: 'hidden', marginBottom: 24 }}>
        {others.map((t, i) => {
          const isOn = selected.has(t.id);
          return (
            <div
              key={t.id}
              onClick={() => toggle(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                borderBottom: i < others.length - 1 ? '1px solid var(--line)' : 'none',
                cursor: 'pointer',
                background: isOn ? 'var(--accent-soft)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: 20, width: 28, textAlign: 'center', color: isOn ? 'var(--btn)' : 'var(--muted)' }}>
                {t.emoji}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 14, color: isOn ? 'var(--btn)' : 'var(--ink)' }}>
                  {t.name}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em' }}>
                  {t.time}
                </div>
              </div>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: isOn ? 'linear-gradient(135deg, var(--btn), var(--btn-deep))' : 'var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  color: '#fff',
                }}
              >
                {isOn ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </DLCard>

      <DLButton variant="primary" size="lg" fullWidth onClick={handleContinue}>
        Continue with {selected.size} technique{selected.size !== 1 ? 's' : ''} →
      </DLButton>
    </DLScreen>
  );
};
