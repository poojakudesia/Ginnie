import React, { CSSProperties } from 'react';

interface DLLabelProps {
  children: React.ReactNode;
  color?: string;
  style?: CSSProperties;
}

export const DLLabel: React.FC<DLLabelProps> = ({ children, color, style }) => {
  return (
    <span
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: color || 'var(--muted)',
        ...style,
      }}
    >
      {children}
    </span>
  );
};
