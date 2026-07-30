import React, { useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLLabel } from '../components/DLLabel';
import { DLDisplay } from '../components/DLDisplay';
import { DLCard } from '../components/DLCard';
import { DLAura } from '../components/DLAura';
import { DLTabBar } from '../components/DLTabBar';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const AURA_MESSAGES = [
  "You don't have to be ready. You just have to begin.",
  "The version of you who has it all — she started today.",
  "Every ritual is a vote for the life you're calling in.",
  "Your future self is already grateful.",
  "Trust the slow magic of consistent action.",
];

const RITUALS = [
  { id: 'viz', label: 'Visualization', glyph: '◐', when: 'mornings', bg: 'linear-gradient(135deg, #DDE6D0 0%, #C8D8BC 100%)' },
  { id: 'affirm', label: 'Affirmations', glyph: '✦', when: 'after coffee', bg: 'linear-gradient(135deg, #F2E1CB 0%, #E8CEB0 100%)' },
  { id: 'movie', label: 'Vision Movie', glyph: '▸', when: 'weekly', bg: 'linear-gradient(135deg, #DCD2E0 0%, #C8BBCF 100%)' },
];

function getTimeOfDay(): 'night' | 'morning' | 'midday' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 5 || h >= 22) return 'night';
  if (h < 12) return 'morning';
  if (h < 14) return 'midday';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function getGreeting(name: string): string {
  const tod = getTimeOfDay();
  const greetMap: Record<string, string> = {
    night: `still up, ${name}.`,
    morning: `good morning, ${name}.`,
    midday: `hey, ${name}.`,
    afternoon: `afternoon, ${name}.`,
    evening: `evening, ${name}.`,
  };
  return greetMap[tod];
}

const SKY_GRADIENTS: Record<string, { bg: string; orbColor: string; dark: boolean }> = {
  night: {
    bg: 'linear-gradient(180deg, #1F2438 0%, #4A3A56 100%)',
    orbColor: 'radial-gradient(circle, rgba(200,180,240,0.6) 0%, rgba(100,80,160,0.2) 60%, transparent 100%)',
    dark: true,
  },
  morning: {
    bg: 'linear-gradient(180deg, #FCDDE3 0%, #FCE0BC 60%, #FFE3B7 100%)',
    orbColor: 'radial-gradient(circle, rgba(255,240,180,0.9) 0%, rgba(255,200,100,0.4) 60%, transparent 100%)',
    dark: false,
  },
  midday: {
    bg: 'linear-gradient(180deg, #E8F4FB 0%, #FDE8D0 60%, #FFE8B0 100%)',
    orbColor: 'radial-gradient(circle, rgba(255,248,200,0.95) 0%, rgba(255,220,80,0.5) 60%, transparent 100%)',
    dark: false,
  },
  afternoon: {
    bg: 'linear-gradient(180deg, #F5DFD0 0%, #F0C8A0 60%, #E8B880 100%)',
    orbColor: 'radial-gradient(circle, rgba(255,230,150,0.85) 0%, rgba(240,160,80,0.4) 60%, transparent 100%)',
    dark: false,
  },
  evening: {
    bg: 'linear-gradient(180deg, #E08AA0 0%, #A07B95 50%, #5B4B6B 100%)',
    orbColor: 'radial-gradient(circle, rgba(255,200,180,0.6) 0%, rgba(180,100,120,0.3) 60%, transparent 100%)',
    dark: true,
  },
};

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
}

function getWeekLabel(): string {
  const tod = getTimeOfDay();
  const labelMap: Record<string, string> = {
    night: 'NIGHT', morning: 'MORNING', midday: 'MIDDAY', afternoon: 'AFTERNOON', evening: 'EVENING',
  };
  return `WEEK 3 · ${labelMap[tod]}`;
}

export const HomeScreen: React.FC = () => {
  const { goto, wishes } = useAppStore();
  const { user } = useAuthStore();

  const name = user?.name?.split(' ')[0] || 'you';
  const streak = user?.streak_count || 0;
  const tod = getTimeOfDay();
  const sky = SKY_GRADIENTS[tod];

  const [done, setDone] = useState<Set<string>>(new Set());
  const [auraMsg] = useState(() => AURA_MESSAGES[Math.floor(Math.random() * AURA_MESSAGES.length)]);

  // Mon=0 based day index
  const todayDow = (new Date().getDay() + 6) % 7;

  const toggleRitual = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dimColor = sky.dark ? 'rgba(255,255,255,0.45)' : 'rgba(33,31,26,0.40)';
  const inkColor = sky.dark ? 'rgba(255,255,255,0.90)' : '#211F1A';
  const subColor = sky.dark ? 'rgba(255,255,255,0.58)' : 'rgba(33,31,26,0.55)';

  return (
    <DLScreen scroll pad={false} style={{ background: 'var(--paper)' }}>
      {/* Sky hero panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 260,
          background: sky.bg,
          borderBottomLeftRadius: 26,
          borderBottomRightRadius: 26,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Sun/moon orb */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: sky.orbColor,
            opacity: 0.85,
            pointerEvents: 'none',
          }}
        />

        {/* Date + week label top-left */}
        <div style={{ position: 'absolute', top: 20, left: 20 }}>
          <DLLabel style={{ color: dimColor, display: 'block', marginBottom: 2 }}>
            {formatDate()}
          </DLLabel>
          <DLLabel style={{ color: sky.dark ? 'rgba(255,255,255,0.32)' : 'rgba(33,31,26,0.32)' }}>
            {getWeekLabel()}
          </DLLabel>
        </div>

        {/* Profile button top-right */}
        <button
          onClick={() => goto('profile')}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--btn) 0%, var(--btn-deep) 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'var(--serif)',
            fontSize: 18,
            fontWeight: 400,
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          }}
        >
          {name.charAt(0).toUpperCase()}
        </button>

        {/* Greeting */}
        <div style={{ position: 'absolute', bottom: 28, left: 20, right: 20 }}>
          <DLDisplay
            size="md"
            italic
            style={{ color: inkColor, lineHeight: 1.15, marginBottom: 8 }}
          >
            {getGreeting(name)}
          </DLDisplay>
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 14,
              color: subColor,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Week 3 of 12 — you're not behind, you're becoming.
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 20px 0' }}>
        {/* Streak card */}
        <DLCard
          tone="paper"
          pad={18}
          style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--btn) 0%, var(--btn-deep) 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(124,55,99,0.28)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 22,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {streak}
            </span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 8,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: 1,
              }}
            >
              days
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <DLLabel style={{ marginBottom: 8, display: 'block' }}>Current streak</DLLabel>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {DAYS.map((day, i) => {
                const isPast = i < todayDow;
                const isToday = i === todayDow;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: isPast
                          ? 'linear-gradient(135deg, var(--btn) 0%, var(--btn-deep) 100%)'
                          : isToday
                          ? 'transparent'
                          : 'var(--line)',
                        border: isToday ? '2px solid var(--btn)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isPast && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                      {isToday && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--btn)' }} />
                      )}
                    </div>
                    <DLLabel style={{ fontSize: 8 }}>{day}</DLLabel>
                  </div>
                );
              })}
            </div>
          </div>
        </DLCard>

        {/* Ginnie daily message */}
        <DLCard tone="paper" pad={16} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <DLAura size={52} glow={false} />
            <div style={{ flex: 1 }}>
              <DLLabel style={{ color: 'var(--btn)', marginBottom: 6, display: 'block' }}>
                Ginnie · daily ✦
              </DLLabel>
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 15,
                  color: 'var(--ink)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                "{auraMsg}"
              </p>
            </div>
          </div>
        </DLCard>

        {/* Today's practice */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>
              Today's practice
            </span>
            <DLLabel style={{ color: done.size === RITUALS.length ? 'var(--btn)' : 'var(--muted)' }}>
              {done.size} of {RITUALS.length} done
            </DLLabel>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RITUALS.map((r) => {
              const isDone = done.has(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    toggleRitual(r.id);
                    goto(r.id);
                  }}
                  style={{
                    width: '100%',
                    borderRadius: 18,
                    padding: '16px 18px',
                    background: r.bg,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    textAlign: 'left',
                    opacity: isDone ? 0.55 : 1,
                    transition: 'opacity 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  }}
                >
                  <span style={{ fontSize: 22, width: 28, textAlign: 'center', flexShrink: 0 }}>
                    {r.glyph}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'var(--sans)',
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#211F1A',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}
                    >
                      {r.label}
                    </div>
                    <DLLabel style={{ color: 'rgba(33,31,26,0.5)', marginTop: 2, display: 'block' }}>
                      {r.when}
                    </DLLabel>
                  </div>
                  <span style={{ fontSize: 16, color: 'rgba(33,31,26,0.35)' }}>→</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wishes carousel */}
        {wishes.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>
                My wishes
              </span>
              <button
                onClick={() => goto('wishes')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  color: 'var(--btn)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                See all →
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 14,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                paddingBottom: 8,
                marginLeft: -4,
                paddingLeft: 4,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {wishes.map((wish, i) => {
                const gradients = [
                  'linear-gradient(160deg, #DDE6D0 0%, #C8D8BC 100%)',
                  'linear-gradient(160deg, #F2E1CB 0%, #E8CEB0 100%)',
                  'linear-gradient(160deg, #DCD2E0 0%, #C8BBCF 100%)',
                ];
                const bg = gradients[i % gradients.length];
                return (
                  <div
                    key={wish.id}
                    style={{
                      width: 230,
                      flexShrink: 0,
                      scrollSnapAlign: 'start',
                      borderRadius: 20,
                      background: bg,
                      padding: 16,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.09)',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '16/10',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.45)',
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: 28, opacity: 0.4 }}>◐</span>
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--serif)',
                        fontStyle: 'italic',
                        fontSize: 14,
                        color: '#211F1A',
                        margin: '0 0 10px',
                        lineHeight: 1.35,
                      }}
                    >
                      {wish.title}
                    </p>
                    <div
                      style={{
                        height: 3,
                        borderRadius: 999,
                        background: 'rgba(33,31,26,0.15)',
                        marginBottom: 6,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 999,
                          background: 'linear-gradient(90deg, var(--btn) 0%, var(--btn-deep) 100%)',
                          width: `${wish.pct_complete || 0}%`,
                        }}
                      />
                    </div>
                    <DLLabel style={{ color: 'rgba(33,31,26,0.45)' }}>
                      {wish.timeline || 'No timeline set'}
                    </DLLabel>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick actions 2×2 */}
        <div style={{ marginBottom: 28 }}>
          <DLLabel style={{ marginBottom: 12, display: 'block' }}>Quick actions</DLLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => goto('journey')}
              style={{
                borderRadius: 18,
                padding: '18px 16px',
                background: 'linear-gradient(135deg, var(--btn) 0%, var(--btn-deep) 100%)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 6px 18px rgba(124,55,99,0.25)',
              }}
            >
              <div style={{ fontFamily: 'var(--sans)', fontSize: 20, color: '#fff', marginBottom: 4 }}>↑</div>
              <div style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 14, color: '#fff', lineHeight: 1.3 }}>
                Climb
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                your path
              </div>
            </button>

            <button
              onClick={() => goto('feed')}
              style={{
                borderRadius: 18,
                padding: '18px 16px',
                background: 'var(--card)',
                border: '1.5px solid var(--line)',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ fontFamily: 'var(--sans)', fontSize: 20, color: 'var(--btn)', marginBottom: 4 }}>✦</div>
              <div style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 14, color: 'var(--ink)', lineHeight: 1.3 }}>
                Receipts
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                14 entries
              </div>
            </button>
          </div>
        </div>
      </div>

      <DLTabBar />
    </DLScreen>
  );
};
