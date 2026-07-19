import React from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { useAppStore } from '../store/app';
import { wishProgress } from '../lib/wishTimeline';

const CATEGORY_TONE: Record<string, string> = {
  Career: '#7A9E7E', Love: '#C97785', Health: '#6BAF64',
  Wealth: '#DC8551', Travel: '#5B8FB5', Purpose: '#9B7AB5',
};

export const ManifestScreen: React.FC = () => {
  const { goto, wishes } = useAppStore();

  const manifested = wishes.filter((w) => w.is_manifested);
  const active = wishes.filter((w) => !w.is_manifested);

  return (
    <DLScreen scroll pad={false}>
      {/* subtle animated aura keyframe for the trophy shine */}
      <style>{`
        @keyframes dlShine {
          0% { transform: translateX(-120%) rotate(20deg); }
          100% { transform: translateX(320%) rotate(20deg); }
        }
      `}</style>

      <div style={{ padding: '20px 22px 0' }}>
        <DLLabel style={{ color: 'var(--btn)' }}>Your wishes ✦</DLLabel>
        <DLDisplay size="md" style={{ marginTop: 8, lineHeight: 1.05 }}>
          Where your<br />
          <span style={{ fontStyle: 'italic' }}>dreams stand.</span>
        </DLDisplay>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', margin: '10px 0 14px', lineHeight: 1.5 }}>
          {manifested.length > 0
            ? `${manifested.length} manifested · ${active.length} in motion. Look how far you've come.`
            : 'Every rep moves the needle. Keep showing up.'}
        </p>

        {/* Add a wish (up to 3 active) */}
        {active.length < 3 && (
          <button
            onClick={() => goto('wish-builder')}
            style={{
              width: '100%', cursor: 'pointer',
              border: 'none', borderRadius: 14, padding: '13px 16px',
              background: 'linear-gradient(135deg, var(--btn), var(--btn-deep))',
              color: 'var(--btn-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--sans)', fontSize: 14.5, fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 17 }}>＋</span> Add a wish
          </button>
        )}
      </div>

      {/* ── Manifested (trophy) section ─────────────────────────── */}
      {manifested.length > 0 && (
        <div style={{ padding: '20px 22px 0' }}>
          <DLLabel style={{ color: 'var(--btn)', marginBottom: 12, display: 'block' }}>
            ✦ Manifested — you made these real
          </DLLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {manifested.map((w) => (
              <div
                key={w.id}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 24,
                  padding: '22px 20px',
                  background: 'linear-gradient(135deg, #F5DA8E 0%, #E0A93C 45%, #C28E2A 100%)',
                  boxShadow: '0 12px 34px rgba(194,142,42,0.45)',
                  color: '#3A2A08',
                }}
              >
                {/* moving shine */}
                <div
                  style={{
                    position: 'absolute', top: 0, bottom: 0, width: 60,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                    animation: 'dlShine 3.6s ease-in-out infinite',
                    pointerEvents: 'none',
                  }}
                />
                {/* sparkle halo */}
                <div style={{ position: 'absolute', top: -24, right: -24, width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 65%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em',
                    fontWeight: 600, background: 'rgba(58,42,8,0.16)', padding: '5px 12px', borderRadius: 999,
                  }}>
                    ✦ MANIFESTED
                  </span>
                  <span style={{ fontSize: 30, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🏆</span>
                </div>

                <div style={{ position: 'relative', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 4 }}>
                  {w.category}
                </div>
                <div style={{ position: 'relative', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 24, lineHeight: 1.25, marginBottom: 12 }}>
                  {w.title}
                </div>
                <div style={{ position: 'relative', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, letterSpacing: '0.01em' }}>
                  You called this in — and it came. That power is yours. ✦
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Active (in motion) section ──────────────────────────── */}
      <div style={{ padding: '22px 22px 40px' }}>
        {active.length > 0 && (
          <DLLabel style={{ color: 'var(--muted)', marginBottom: 12, display: 'block' }}>
            In motion
          </DLLabel>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {active.map((w) => {
            const p = wishProgress(w);
            const tone = CATEGORY_TONE[w.category] || 'var(--btn)';
            return (
              <div
                key={w.id}
                style={{
                  borderRadius: 20,
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  padding: 18,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: tone }}>
                    {w.category}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                    {p.daysLeft > 0 ? `${p.daysLeft} days left` : 'timeline complete'}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 14 }}>
                  {w.title}
                </div>

                {/* progress bar */}
                <div style={{ height: 8, borderRadius: 999, background: 'rgba(33,31,26,0.08)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${p.pct}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${tone}, var(--btn))`,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                    {Math.round(p.pct)}% through your {w.timeline} timeline
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: tone }}>keep going ✦</span>
                </div>
              </div>
            );
          })}

          {wishes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>✦</div>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, margin: 0 }}>
                Your wishes will bloom here.
              </p>
            </div>
          )}
        </div>
      </div>
    </DLScreen>
  );
};
