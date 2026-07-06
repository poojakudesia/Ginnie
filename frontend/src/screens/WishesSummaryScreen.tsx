import React from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { useAppStore } from '../store/app';

// Soft pastel palettes — muted, "locked in stone" feel (matches wishes.png)
const CARD_TONES = [
  { bg: '#CBDCC0', label: 'rgba(47,61,36,0.62)', text: '#2F3D24', remove: 'rgba(47,61,36,0.10)' },
  { bg: '#E8D6AE', label: 'rgba(71,58,30,0.62)', text: '#473A1E', remove: 'rgba(71,58,30,0.10)' },
  { bg: '#DDCBE0', label: 'rgba(58,42,64,0.62)', text: '#3A2A40', remove: 'rgba(58,42,64,0.10)' },
];

export const WishesSummaryScreen: React.FC = () => {
  const { goto, goBack, wishes, removeWish } = useAppStore();
  // Only wishes still in progress count toward the cap of 3
  const active = wishes.filter((w) => !w.is_manifested);
  const count = active.length;

  return (
    <DLScreen scroll pad={false}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 22px 8px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={goBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            color: 'var(--ink)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
          }}
        >
          ← BACK
        </button>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'var(--muted)',
          }}
        >
          04 · YOUR GOALS
        </span>
        {/* progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, width: 56, justifyContent: 'flex-end' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: i === 2 ? 16 : 5,
                height: 5,
                borderRadius: 999,
                background: i === 2 ? 'var(--btn)' : 'var(--line-strong)',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: '0 22px' }}>
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'var(--muted)',
            margin: '14px 0 10px',
          }}
        >
          {count} OF 3 ADDED
        </div>

        {/* Title */}
        <DLDisplay size="md" style={{ lineHeight: 1.05 }}>
          your goals,<br />
          <span style={{ fontStyle: 'italic' }}>set in stone.</span>
        </DLDisplay>

        <p
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'var(--muted)',
            lineHeight: 1.5,
            margin: '12px 0 22px',
          }}
        >
          Once we begin, these are locked. The practice trusts the practice — no editing midway.
        </p>

        {/* Goal cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
          {active.map((wish, i) => {
            const tone = CARD_TONES[i % CARD_TONES.length];
            return (
              <div
                key={wish.id}
                style={{
                  background: tone.bg,
                  borderRadius: 18,
                  padding: '16px 18px 18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10.5,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: tone.label,
                    }}
                  >
                    Goal {String(i + 1).padStart(2, '0')} · {wish.category}
                  </span>
                  <button
                    onClick={() => removeWish(wish.id)}
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 9.5,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: tone.text,
                      background: tone.remove,
                      border: 'none',
                      borderRadius: 999,
                      padding: '5px 11px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 21,
                    fontStyle: 'italic',
                    lineHeight: 1.32,
                    color: tone.text,
                  }}
                >
                  {wish.title}
                </div>
              </div>
            );
          })}

          {/* Add another (dashed) */}
          {count < 3 && (
            <button
              onClick={() => goto('wish-builder')}
              style={{
                borderRadius: 18,
                border: '1.5px dashed var(--line-strong)',
                padding: '22px 20px',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'var(--sans)',
                fontSize: 14,
                color: 'var(--ink-2)',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              Add goal {count + 1}
            </button>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '8px 22px 32px', marginTop: 'auto' }}>
        <DLButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={count === 0}
          onClick={() => goto('questions')}
        >
          Continue with {count} {count === 1 ? 'goal' : 'goals'} →
        </DLButton>
      </div>
    </DLScreen>
  );
};
