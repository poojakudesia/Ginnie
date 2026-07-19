import React from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { useAppStore } from '../store/app';
import { practiceMeta } from '../lib/practices';

// Short "what it is" line per practice for the list
const BLURB: Record<string, string> = {
  viz: 'See it before you see it.',
  affirm: 'Speak it true, out loud.',
  movie: 'Your wish as a 60-second film.',
  script: 'Write tomorrow in present tense.',
  gratitude: 'Receipts before requests.',
  '369': 'Write it 3×, 6×, then 9× a day.',
  '555': 'One line, 55 times, for 5 days.',
  meditate: 'Drop in and receive.',
};

export const LessonsScreen: React.FC = () => {
  const { goto, techniques, setFocusLesson } = useAppStore();
  const practiceIds = techniques.length > 0 ? techniques : ['viz', 'affirm', 'gratitude'];

  const openLesson = (appId: string) => {
    setFocusLesson(appId);
    goto('tutorial');
  };

  return (
    <DLScreen scroll pad={false}>
      <div style={{ padding: '20px 22px 8px' }}>
        <DLLabel style={{ color: 'var(--btn)' }}>Your guide ❖</DLLabel>
        <DLDisplay size="md" style={{ marginTop: 8, lineHeight: 1.05 }}>
          How to do<br />
          <span style={{ fontStyle: 'italic' }}>each practice.</span>
        </DLDisplay>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', margin: '10px 0 4px', lineHeight: 1.5 }}>
          Tap any practice to revisit the steps, videos, and tips anytime.
        </p>
      </div>

      <div style={{ padding: '12px 22px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {practiceIds.map((id) => {
          const meta = practiceMeta(id);
          return (
            <button
              key={id}
              onClick={() => openLesson(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                textAlign: 'left', cursor: 'pointer',
                background: 'var(--card)', border: '1px solid var(--line)',
                borderRadius: 18, padding: 16,
              }}
            >
              <div
                style={{
                  width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                  background: meta.tone, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                }}
              >
                {meta.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                  {meta.name}
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>
                  {BLURB[id] || 'A practice for your daily rhythm.'}
                </div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 15, color: 'var(--muted)' }}>›</span>
            </button>
          );
        })}
      </div>
    </DLScreen>
  );
};
