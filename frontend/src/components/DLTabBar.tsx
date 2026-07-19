import React from 'react';
import { useAppStore } from '../store/app';

// Bottom navigation — the single place to move between the app's areas.
// Each tab owns a group of screens so the right tab stays highlighted even on
// sub-screens (e.g. adding a wish keeps "Wishes" active).
const TABS: { id: string; label: string; icon: string; group: string[] }[] = [
  { id: 'tracker',  label: 'Practice', icon: '◐', group: ['tracker', 'energy-check'] },
  { id: 'manifest', label: 'Wishes',   icon: '✦', group: ['manifest', 'wish-builder', 'wishes'] },
  { id: 'tutorial', label: 'Guide',    icon: '❖', group: ['tutorial', 'plan'] },
  { id: 'profile',  label: 'You',      icon: '◯', group: ['profile'] },
];

export const DLTabBar: React.FC = () => {
  const { screen, goto } = useAppStore();

  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--card)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 22,
        paddingTop: 6,
        flexShrink: 0,
        boxShadow: '0 -6px 20px rgba(0,0,0,0.05)',
      }}
    >
      {TABS.map((tab) => {
        const active = tab.group.includes(screen);
        return (
          <button
            key={tab.id}
            onClick={() => goto(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '6px 0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: 19,
                lineHeight: 1,
                color: active ? 'var(--btn)' : 'var(--muted)',
                transition: 'color 0.15s',
                transform: active ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9.5,
                fontWeight: active ? 600 : 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: active ? 'var(--btn)' : 'var(--muted)',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
