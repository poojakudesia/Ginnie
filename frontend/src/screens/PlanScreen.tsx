import React from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { useAppStore } from '../store/app';

const PRACTICE_INFO: Record<string, { name: string; emoji: string; when: string; clock: string; order: number; tone: string }> = {
  viz:       { name: 'Visualization',   emoji: '◐', when: 'Morning',            clock: '7:00 AM',  order: 420,  tone: '#7A9E7E' },
  affirm:    { name: 'Affirmations',    emoji: '✦', when: 'After coffee',       clock: '8:30 AM',  order: 510,  tone: '#DC8551' },
  '369':     { name: '3-6-9 Method',    emoji: '③', when: 'Morning · Noon · Night', clock: '3× daily', order: 540, tone: '#DC8551' },
  meditate:  { name: 'Meditation',      emoji: '◎', when: 'Midday',             clock: '12:30 PM', order: 750,  tone: '#7A9E7E' },
  '555':     { name: '55×5 Method',     emoji: '⑤', when: 'Midday',             clock: '12:00 PM', order: 720,  tone: '#9B7AB5' },
  movie:     { name: 'Vision Movie',    emoji: '▸', when: 'Afternoon',          clock: '1:00 PM',  order: 780,  tone: '#9B7AB5' },
  gratitude: { name: 'Gratitude',       emoji: '♡', when: 'Evening',            clock: '8:00 PM',  order: 1200, tone: '#DC8551' },
  script:    { name: 'Scripting',       emoji: '✎', when: 'Before bed',         clock: '9:30 PM',  order: 1290, tone: '#7A9E7E' },
};

const FALLBACK_IDS = ['viz', 'affirm', 'gratitude'];

const LINE_X = 26;

export const PlanScreen: React.FC = () => {
  const techniques = useAppStore((s) => s.techniques);
  const goto = useAppStore((s) => s.goto);

  const resolved = techniques
    .map((id) => (PRACTICE_INFO[id] ? { id, ...PRACTICE_INFO[id] } : null))
    .filter((p): p is { id: string } & (typeof PRACTICE_INFO)[string] => p !== null);

  const source =
    resolved.length > 0
      ? resolved
      : FALLBACK_IDS.map((id) => ({ id, ...PRACTICE_INFO[id] }));

  const practices = [...source].sort((a, b) => a.order - b.order);

  return (
    <DLScreen scroll pad>
      <div style={{ paddingTop: 28, paddingBottom: 40 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <DLLabel color="var(--btn)" style={{ display: 'block', marginBottom: 12 }}>
            YOUR PLAN ✦
          </DLLabel>
          <DLDisplay size="md">
            Your daily rhythm,
            <br />
            <span style={{ fontStyle: 'italic' }}>in sequence.</span>
          </DLDisplay>
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--muted)',
              margin: '14px 0 0',
              maxWidth: 320,
            }}
          >
            Follow this order each day. Small, steady reps — this is how the
            practice compounds.
          </p>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative', paddingLeft: 0 }}>
          {/* Vertical line */}
          <div
            style={{
              position: 'absolute',
              left: LINE_X,
              top: 14,
              bottom: 14,
              width: 2,
              transform: 'translateX(-1px)',
              background: 'var(--line-strong)',
              borderRadius: 2,
            }}
          />

          {practices.map((p, i) => (
            <div
              key={p.id}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                marginBottom: i === practices.length - 1 ? 0 : 18,
              }}
            >
              {/* Node dot */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: p.tone,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: 14,
                  lineHeight: 1,
                  boxShadow: '0 0 0 4px var(--paper)',
                  animation: 'dlFadeUp 0.5s ease both',
                  animationDelay: `${i * 0.12}s`,
                }}
              >
                {p.emoji}
              </div>

              {/* Card */}
              <div
                style={{
                  flex: 1,
                  background: 'var(--card)',
                  border: '0.5px solid var(--line)',
                  borderRadius: 16,
                  padding: 14,
                  animation: 'dlFadeUp 0.5s ease both',
                  animationDelay: `${i * 0.12}s`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <DLLabel color="var(--muted)">
                    {p.clock} · {p.when}
                  </DLLabel>
                  <DLLabel color="var(--muted)" style={{ opacity: 0.7 }}>
                    STEP {i + 1}
                  </DLLabel>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--ink)',
                  }}
                >
                  {p.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 32 }}>
          <DLButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => goto('tracker')}
          >
            Start Manifesting ✦
          </DLButton>
        </div>
      </div>
    </DLScreen>
  );
};
