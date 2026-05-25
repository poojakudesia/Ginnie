import React from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLTopBar } from '../components/DLTopBar';
import { DLLabel } from '../components/DLLabel';
import { DLCard } from '../components/DLCard';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';

const TROPHIES = [
  { id: 't1', name: 'First Wish', icon: '⭐', tier: 'bronze', earned: true },
  { id: 't2', name: '7-Day Streak', icon: '🔥', tier: 'silver', earned: true },
  { id: 't3', name: 'Visualizer', icon: '◐', tier: 'bronze', earned: true },
  { id: 't4', name: 'Manifested!', icon: '✦', tier: 'gold', earned: false },
  { id: 't5', name: 'Scripted', icon: '✍', tier: 'bronze', earned: false },
  { id: 't6', name: '30-Day Streak', icon: '🌙', tier: 'gold', earned: false },
  { id: 't7', name: '369 Master', icon: '③', tier: 'silver', earned: false },
  { id: 't8', name: 'Legend', icon: '👑', tier: 'legend', earned: false },
  { id: 't9', name: 'Vision Movie', icon: '▸', tier: 'bronze', earned: true },
];

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold: '#FFD700',
  legend: '#9B59B6',
};

const SETTINGS = [
  { label: "Edit Aura's voice", icon: '✦' },
  { label: 'Notifications', icon: '🔔' },
  { label: 'Privacy', icon: '🔒' },
  { label: 'Color palette', icon: '🎨' },
  { label: 'Sign out', icon: '→', danger: true },
];

export const ProfileScreen: React.FC = () => {
  const { goto, setPalette, palette, wishes } = useAppStore();
  const { user, logout } = useAuthStore();

  const level = Math.floor((user?.xp || 240) / 100) + 1;
  const xpProgress = ((user?.xp || 240) % 100);

  const rankGradients = [
    'linear-gradient(135deg, #CD7F32, #A0522D)',
    'linear-gradient(135deg, #A8A9AD, #708090)',
    'linear-gradient(135deg, #FFD700, #FFA500)',
    'linear-gradient(135deg, #9B59B6, #6C3483)',
  ];
  const rankGrad = rankGradients[Math.min(level - 1, 3)];
  const famMap = { explorer: 'Explorer', catalyst: 'Catalyst', master: 'Master' };

  const handleSetting = (label: string) => {
    if (label === 'Sign out') {
      logout();
      goto('welcome');
    } else if (label === 'Color palette') {
      const palettes = ['petal', 'sage', 'sand', 'dusk'] as const;
      const idx = palettes.indexOf(palette as typeof palettes[number]);
      setPalette(palettes[(idx + 1) % palettes.length]);
    }
  };

  return (
    <DLScreen scroll={false} pad={false} style={{ display: 'flex', flexDirection: 'column' }}>
      <DLTopBar title="You ◯" />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        {/* Rank banner */}
        <div
          style={{
            background: rankGrad,
            padding: '24px 24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            {user?.name?.[0]?.toUpperCase() || '✦'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 18, color: '#fff' }}>
              {user?.name || 'Manifestor'}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.1em', marginTop: 2 }}>
              {famMap[user?.familiarity || 'explorer'].toUpperCase()} · LEVEL {level}
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <DLLabel>XP Progress</DLLabel>
            <DLLabel style={{ color: 'var(--btn)' }}>{user?.xp || 240} / {level * 100} XP</DLLabel>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${xpProgress}%`,
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, var(--btn), var(--btn-deep))',
              }}
            />
          </div>
        </div>

        {/* 4-stat grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: 'var(--line)',
            margin: '16px 20px',
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid var(--line)',
          }}
        >
          {[
            { label: 'Streak', value: `${user?.streak_count || 7}d 🔥` },
            { label: 'Total XP', value: `${user?.xp || 240} ✦` },
            { label: 'Affirmations', value: '42' },
            { label: 'Skills', value: `${user?.techniques?.length || 3}` },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'var(--card)', padding: '16px 18px' }}>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  color: 'var(--muted)',
                  letterSpacing: '0.08em',
                  marginBottom: 4,
                }}
              >
                {stat.label.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 20, color: 'var(--ink)' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Active quests */}
        {wishes.length > 0 && (
          <div style={{ padding: '0 20px', marginBottom: 20 }}>
            <DLLabel style={{ marginBottom: 10, display: 'block' }}>Active quests</DLLabel>
            <DLCard tone="paper">
              {wishes.map((wish, i) => (
                <div key={wish.id} style={{ marginBottom: i < wishes.length - 1 ? 14 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span
                      style={{
                        fontFamily: 'var(--sans)',
                        fontSize: 13,
                        color: 'var(--ink)',
                        fontStyle: 'italic',
                      }}
                    >
                      {wish.title.length > 40 ? wish.title.slice(0, 40) + '…' : wish.title}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                      {wish.pct_complete}%
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${wish.pct_complete}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, var(--btn), var(--btn-deep))',
                      }}
                    />
                  </div>
                </div>
              ))}
            </DLCard>
          </div>
        )}

        {/* Year heatmap */}
        <div style={{ padding: '0 20px', marginBottom: 20 }}>
          <DLLabel style={{ marginBottom: 10, display: 'block' }}>Year of manifestation</DLLabel>
          <DLCard tone="paper" pad={14}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Array.from({ length: 52 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background:
                      i < 10
                        ? 'var(--btn)'
                        : i < 20
                        ? 'rgba(124,55,99,0.4)'
                        : 'var(--line)',
                  }}
                />
              ))}
            </div>
          </DLCard>
        </div>

        {/* Trophy grid */}
        <div style={{ padding: '0 20px', marginBottom: 20 }}>
          <DLLabel style={{ marginBottom: 10, display: 'block' }}>Trophy room</DLLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {TROPHIES.map((trophy) => (
              <div
                key={trophy.id}
                style={{
                  borderRadius: 16,
                  padding: '14px 10px',
                  background: trophy.earned ? 'var(--card)' : 'transparent',
                  border: trophy.earned
                    ? `2px solid ${TIER_COLORS[trophy.tier]}33`
                    : '1.5px dashed var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  opacity: trophy.earned ? 1 : 0.4,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: trophy.earned
                      ? `linear-gradient(135deg, ${TIER_COLORS[trophy.tier]}44, ${TIER_COLORS[trophy.tier]}22)`
                      : 'var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  {trophy.icon}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 10,
                    color: 'var(--ink)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {trophy.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 8,
                    color: TIER_COLORS[trophy.tier],
                    letterSpacing: '0.06em',
                  }}
                >
                  {trophy.tier.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div style={{ padding: '0 20px' }}>
          <DLLabel style={{ marginBottom: 10, display: 'block' }}>Settings</DLLabel>
          <DLCard tone="paper" pad={0} style={{ overflow: 'hidden' }}>
            {SETTINGS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => handleSetting(s.label)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  borderBottom: i < SETTINGS.length - 1 ? '1px solid var(--line)' : 'none',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{s.icon}</span>
                <span
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 14,
                    color: (s as { danger?: boolean }).danger ? '#E53E3E' : 'var(--ink)',
                    flex: 1,
                  }}
                >
                  {s.label}
                </span>
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>→</span>
              </button>
            ))}
          </DLCard>
        </div>
      </div>
    </DLScreen>
  );
};
