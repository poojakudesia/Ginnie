import React, { CSSProperties } from 'react';

type DisplaySize = 'sm' | 'md' | 'lg' | 'xl';

interface DLDisplayProps {
  children: React.ReactNode;
  size?: DisplaySize;
  italic?: boolean;
  center?: boolean;
  color?: string;
  style?: CSSProperties;
}

const sizeMap: Record<DisplaySize, number> = {
  sm: 28,
  md: 34,
  lg: 44,
  xl: 56,
};

export const DLDisplay: React.FC<DLDisplayProps> = ({
  children,
  size = 'md',
  italic = false,
  center = false,
  color,
  style,
}) => {
  return (
    <div
      style={{
        fontFamily: 'var(--serif)',
        fontSize: sizeMap[size],
        fontStyle: italic ? 'italic' : 'normal',
        fontWeight: 400,
        color: color || 'var(--ink)',
        lineHeight: 1.15,
        textAlign: center ? 'center' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
