import React, { CSSProperties } from 'react';

interface DLScreenProps {
  children: React.ReactNode;
  bg?: string;
  label?: string;
  pad?: boolean | number;
  scroll?: boolean;
  style?: CSSProperties;
}

export const DLScreen: React.FC<DLScreenProps> = ({
  children,
  bg,
  pad = true,
  scroll = false,
  style,
}) => {
  const padding = pad === true ? '0 20px' : pad === false ? '0' : `0 ${pad}px`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: bg || 'var(--paper)',
        overflowY: scroll ? 'auto' : 'hidden',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
