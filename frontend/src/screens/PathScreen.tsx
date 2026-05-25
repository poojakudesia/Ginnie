import React from 'react';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';

const CURRENT_WEEK = 3;
const SAGE = '#6E8868';
const CLAY = '#C97D50';

interface WeekData {
  week: number;
  title: string;
  body: string;
  status: 'done' | 'current' | 'future';
}

const WEEKS: WeekData[] = [
  { week: 1, title: 'Root your why', body: 'Wrote your origin story and anchored the core desire beneath your wish.', status: 'done' },
  { week: 2, title: 'Clear the static', body: 'Identified limiting beliefs and started the reprogramming loop.', status: 'done' },
  { week: 3, title: 'Raise the signal', body: 'Daily visualisation sessions to lock in the feeling of having it now.', status: 'current' },
  { week: 4, title: 'Affirm the new identity', body: 'Write and speak your identity-level affirmations every morning.', status: 'future' },
  { week: 5, title: 'Act as if', body: 'Take one aligned action per day that your future self would take.', status: 'future' },
  { week: 6, title: 'Gratitude amplifier', body: 'Stack gratitude entries before sleep to multiply the frequency.', status: 'future' },
  { week: 7, title: 'Surrender & trust', body: 'Release attachment to the "how" and let the universe route.', status: 'future' },
  { week: 8, title: 'Signs & synchronicities', body: 'Log every sign. Celebrate confirmation from the field.', status: 'future' },
  { week: 9, title: 'Deepen the movie', body: 'Add sensory detail to your mental movie — sound, smell, touch.', status: 'future' },
  { week: 10, title: 'Inspired action sprint', body: 'Follow every intuitive nudge. Move fast, doubt slow.', status: 'future' },
  { week: 11, title: 'Integration', body: 'The new self is the default self. Anchor the identity fully.', status: 'future' },
  { week: 12, title: 'Arrival', body: 'Review, celebrate, and set the next level of the dream.', status: 'future' },
];

export const PathScreen: React.FC = () => {
  const { wishes } = useAppStore();

  const activeWish = wishes[0];
  const wishTitle = activeWish?.title || 'live my dream life';
  const wishWords = wishTitle.trim().split(/\s+/);
  const lastThree = wishWords.slice(-3).join(' ');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (CURRENT_WEEK - 1) * 7);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 12 * 7);
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Weeks rendered in reverse order — week 12 at top, week 1 at bottom
  const reversedWeeks = [...WEEKS].reverse();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--paper)',
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: '52px 22px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 5,
            }}>
              Your path
            </div>
            <div style={{
              fontFamily: 'var(--serif)',
              fontSize: 26,
              color: 'var(--ink)',
              lineHeight: 1.15,
              maxWidth: 230,
            }}>
              <span style={{ fontStyle: 'italic' }}>the climb to</span>
              <br />
              {lastThree}
            </div>
          </div>

          {/* Week pill badge — ink bg, paper text */}
          <div style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: 999,
            padding: '6px 14px',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
            marginTop: 6,
            flexShrink: 0,
          }}>
            WEEK {CURRENT_WEEK} / 12
          </div>
        </div>

        <p style={{
          fontFamily: 'var(--sans)',
          fontSize: 13,
          color: 'var(--muted)',
          margin: '10px 0 0',
          lineHeight: 1.55,
        }}>
          Started {startStr} · Arrival {endStr}
        </p>
      </div>

      {/* ── Ladder scroll area ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 48px' }}>
        <div style={{ position: 'relative' }}>

          {/* Vertical spine: 1.5px, sage→clay gradient, opacity 0.4, absolute left 30px */}
          <div style={{
            position: 'absolute',
            left: 30,
            top: 0,
            bottom: 0,
            width: 1.5,
            transform: 'translateX(-50%)',
            background: `linear-gradient(to bottom, ${SAGE}, ${CLAY})`,
            opacity: 0.4,
            zIndex: 0,
          }} />

          {/* Arrival card at the top */}
          <div style={{ position: 'relative', zIndex: 1, paddingLeft: 60, marginBottom: 6 }}>
            <div style={{
              background: `linear-gradient(135deg, ${SAGE}28, ${CLAY}1A)`,
              border: `1.5px solid ${SAGE}44`,
              borderRadius: 20,
              padding: '16px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${SAGE}, ${CLAY})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: '#fff',
                flexShrink: 0,
              }}>
                ✦
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 22,
                  fontStyle: 'italic',
                  color: 'var(--ink)',
                  lineHeight: 1.2,
                  marginBottom: 3,
                }}>
                  {wishTitle}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  color: 'var(--muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  ARRIVED · {endStr}
                </div>
              </div>
            </div>
          </div>

          {/* Week rungs — reversed (12 at top, 1 at bottom) */}
          {reversedWeeks.map((week, idx) => {
            const isDone = week.status === 'done';
            const isCurrent = week.status === 'current';
            const isFuture = week.status === 'future';

            return (
              <div
                key={week.week}
                className="dl-fade-up"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 0,
                  marginBottom: 8,
                  animationDelay: `${idx * 35}ms`,
                }}
              >
                {/* Node column — 60px wide to align with spine at left 30px */}
                <div style={{
                  width: 60,
                  display: 'flex',
                  justifyContent: 'center',
                  paddingTop: 16,
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    flexShrink: 0,
                    // DONE: sage filled with ✓
                    // CURRENT: ink with outer ring shadow
                    // FUTURE: white with dashed line-strong border
                    background: isDone
                      ? SAGE
                      : isCurrent
                        ? 'var(--ink)'
                        : '#fff',
                    border: isFuture
                      ? `1.5px dashed var(--line-strong)`
                      : 'none',
                    color: isDone ? '#fff' : isCurrent ? '#fff' : 'var(--muted)',
                    boxShadow: isCurrent
                      ? `0 0 0 4px var(--paper), 0 0 0 7px var(--ink), 0 4px 14px rgba(0,0,0,0.22)`
                      : 'none',
                  }}>
                    {isDone ? '✓' : ''}
                  </div>
                </div>

                {/* Content card */}
                <div style={{
                  flex: 1,
                  borderRadius: 18,
                  padding: isCurrent ? '14px 16px' : '12px 14px',
                  // DONE: rgba(110,136,104,0.08), dashed border
                  // CURRENT: var(--ink) with white text, "OPEN →" chip
                  // FUTURE: transparent, dashed border
                  background: isDone
                    ? 'rgba(110,136,104,0.08)'
                    : isCurrent
                      ? 'var(--ink)'
                      : 'transparent',
                  border: isDone
                    ? `1.5px dashed ${SAGE}70`
                    : isCurrent
                      ? 'none'
                      : `1.5px dashed var(--line-strong)`,
                  boxShadow: isCurrent
                    ? '0 4px 20px rgba(0,0,0,0.14)'
                    : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 9,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: isDone
                          ? SAGE
                          : isCurrent
                            ? 'rgba(255,255,255,0.5)'
                            : 'var(--muted)',
                        marginBottom: 3,
                      }}>
                        Week {week.week}
                      </div>
                      <div style={{
                        fontFamily: 'var(--serif)',
                        fontSize: isCurrent ? 17 : 15,
                        fontStyle: 'italic',
                        color: isDone
                          ? 'var(--ink-2)'
                          : isCurrent
                            ? '#fff'
                            : 'var(--muted)',
                        lineHeight: 1.25,
                        marginBottom: (isDone || isCurrent) ? 5 : 0,
                      }}>
                        {week.title}
                      </div>
                      {(isDone || isCurrent) && (
                        <div style={{
                          fontFamily: 'var(--sans)',
                          fontSize: 12,
                          color: isDone
                            ? 'var(--muted)'
                            : 'rgba(255,255,255,0.68)',
                          lineHeight: 1.5,
                        }}>
                          {week.body}
                        </div>
                      )}
                    </div>

                    {/* CURRENT: "OPEN →" chip */}
                    {isCurrent && (
                      <div style={{
                        flexShrink: 0,
                        background: 'rgba(255,255,255,0.14)',
                        borderRadius: 999,
                        padding: '4px 10px',
                        fontFamily: 'var(--mono)',
                        fontSize: 9,
                        letterSpacing: '0.08em',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        alignSelf: 'center',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}>
                        OPEN →
                      </div>
                    )}

                    {/* DONE: tick indicator */}
                    {isDone && (
                      <div style={{
                        flexShrink: 0,
                        fontFamily: 'var(--mono)',
                        fontSize: 11,
                        color: SAGE,
                        alignSelf: 'center',
                        opacity: 0.7,
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Start marker at bottom */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            marginTop: 4,
          }}>
            <div style={{ width: 60, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${SAGE}, ${CLAY})`,
                opacity: 0.5,
              }} />
            </div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              color: 'var(--muted)',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
            }}>
              JOURNEY BEGINS · {startStr}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
