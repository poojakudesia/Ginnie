import React from 'react';

interface DLDotsProps {
  total: number;
  current: number;
}

export const DLDots: React.FC<DLDotsProps> = ({ total, current }) => {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 999,
            background: i === current
              ? 'linear-gradient(90deg, var(--btn), var(--btn-deep))'
              : 'var(--line-strong)',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
};
