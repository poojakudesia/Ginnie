import React, { CSSProperties } from 'react';

type CardTone = 'paper' | 'sage' | 'clay' | 'plum' | 'ink';

interface DLCardProps {
  children: React.ReactNode;
  tone?: CardTone;
  pad?: number;
  radius?: number;
  shadow?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

const toneStyles: Record<CardTone, CSSProperties> = {
  paper: {
    background: 'var(--card)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 12px rgba(0,0,0,0.06)',
  },
  sage: {
    background: 'rgba(180,200,170,0.22)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  clay: {
    background: 'rgba(220,160,120,0.20)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  plum: {
    background: 'rgba(124,55,99,0.12)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
  },
  ink: {
    background: 'var(--ink)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
};

export const DLCard: React.FC<DLCardProps> = ({
  children,
  tone = 'paper',
  pad = 18,
  radius = 22,
  shadow = true,
  style,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        ...toneStyles[tone],
        borderRadius: radius,
        padding: pad,
        boxShadow: shadow ? toneStyles[tone].boxShadow : 'none',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
