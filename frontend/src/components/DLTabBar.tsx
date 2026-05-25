import React from 'react';
import { useAppStore } from '../store/app';

const TABS = [
  { id: 'home', label: 'Today', icon: '◐' },
  { id: 'movie', label: 'Movie', icon: '▸' },
  { id: 'affirm', label: 'Affirm', icon: '✦' },
  { id: 'feed', label: 'Path', icon: '↑' },
  { id: 'profile', label: 'You', icon: '◯' },
];

export const DLTabBar: React.FC = () => {
  const { screen, goto } = useAppStore();

  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--card)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 20,
        paddingTop: 4,
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const active = screen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => goto(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            <span
              style={{
                fontSize: 20,
                color: active ? 'var(--btn)' : 'var(--muted)',
                transition: 'color 0.15s',
                lineHeight: 1,
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.06em',
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
