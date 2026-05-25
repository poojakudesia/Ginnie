import React, { CSSProperties } from 'react';
import { useAppStore } from '../store/app';

interface DLTopBarProps {
  title?: string;
  showBack?: boolean;
  trailing?: React.ReactNode;
  onBack?: () => void;
  transparent?: boolean;
  style?: CSSProperties;
}

export const DLTopBar: React.FC<DLTopBarProps> = ({
  title,
  showBack = false,
  trailing,
  onBack,
  transparent = false,
  style,
}) => {
  const goBack = useAppStore((s) => s.goBack);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: transparent ? 'transparent' : 'var(--paper)',
        flexShrink: 0,
        gap: 12,
        ...style,
      }}
    >
      <div style={{ width: 40, display: 'flex', alignItems: 'center' }}>
        {showBack && (
          <button
            onClick={onBack || goBack}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: 'var(--card)',
              border: '1.5px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
              color: 'var(--ink)',
              flexShrink: 0,
            }}
          >
            ←
          </button>
        )}
      </div>

      {title && (
        <span
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--ink)',
            flex: 1,
            textAlign: 'center',
          }}
        >
          {title}
        </span>
      )}

      <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {trailing}
      </div>
    </div>
  );
};
