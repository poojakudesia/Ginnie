import React, { CSSProperties } from 'react';

interface DLChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

export const DLChip: React.FC<DLChipProps> = ({
  children,
  active = false,
  onClick,
  size = 'md',
  style,
}) => {
  const padMap = { sm: '6px 14px', md: '9px 18px' };
  const fsMap = { sm: 12, md: 14 };

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: padMap[size],
        borderRadius: 999,
        fontSize: fsMap[size],
        fontFamily: 'var(--sans)',
        fontWeight: active ? 500 : 400,
        background: active
          ? 'linear-gradient(135deg, var(--btn) 0%, var(--btn-deep) 100%)'
          : 'var(--card)',
        color: active ? 'var(--btn-text)' : 'var(--ink)',
        border: active ? 'none' : '1.5px solid var(--line)',
        boxShadow: active
          ? '0 4px 12px rgba(124,55,99,0.28)'
          : 'inset 0 1px 0 rgba(255,255,255,0.6)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
};
