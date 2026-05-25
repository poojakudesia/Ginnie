import React from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { useAppStore } from '../store/app';

const CARD_COLORS = [
  { bg: 'linear-gradient(135deg, #A8D5A2 0%, #6BAF64 100%)', text: '#1a3d18' },
  { bg: 'linear-gradient(135deg, #F9C784 0%, #F4A236 100%)', text: '#3d2a0a' },
  { bg: 'linear-gradient(135deg, #B8A5D4 0%, #7B5EA7 100%)', text: '#1e0d3d' },
];

export const WishesSummaryScreen: React.FC = () => {
  const { goto, wishes, removeWish } = useAppStore();

  return (
    <DLScreen scroll pad style={{ paddingTop: 24 }}>
      <DLLabel style={{ color: 'var(--btn)', marginBottom: 6, display: 'block' }}>
        Your wishes ✦
      </DLLabel>
      <DLDisplay size="sm" style={{ marginBottom: 24 }}>
        Looking{' '}
        <span style={{ fontStyle: 'italic' }}>beautiful.</span>
      </DLDisplay>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
        {wishes.map((wish, i) => {
          const colors = CARD_COLORS[i % CARD_COLORS.length];
          return (
            <div
              key={wish.id}
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  background: colors.bg,
                  padding: '20px 20px 24px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: colors.text,
                    opacity: 0.7,
                    marginBottom: 8,
                  }}
                >
                  {wish.category}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 20,
                    fontStyle: 'italic',
                    color: colors.text,
                    lineHeight: 1.3,
                  }}
                >
                  {wish.title}
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.3)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${wish.pct_complete}%`,
                        height: '100%',
                        background: 'rgba(255,255,255,0.7)',
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: colors.text, opacity: 0.7 }}>
                    {wish.timeline}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeWish(wish.id)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          );
        })}

        {/* Add another dashed card */}
        {wishes.length < 3 && (
          <button
            onClick={() => goto('wish-builder')}
            style={{
              borderRadius: 20,
              border: '2px dashed var(--line-strong)',
              padding: '28px 20px',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'var(--sans)',
              fontSize: 14,
              color: 'var(--muted)',
            }}
          >
            <span style={{ fontSize: 20 }}>+</span>
            Add another wish
          </button>
        )}
      </div>

      <DLButton
        variant="primary"
        size="lg"
        fullWidth
        disabled={wishes.length === 0}
        onClick={() => goto('questions')}
        style={{ marginBottom: 32 }}
      >
        Continue →
      </DLButton>
    </DLScreen>
  );
};
