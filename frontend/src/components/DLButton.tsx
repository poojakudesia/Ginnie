import React, { CSSProperties, useState } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light';
type Size = 'sm' | 'md' | 'lg';

interface DLButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
  type?: 'button' | 'submit';
}

export const DLButton: React.FC<DLButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  style,
  type = 'button',
}) => {
  const [pressed, setPressed] = useState(false);

  const sizeStyles: Record<Size, CSSProperties> = {
    sm: { padding: '8px 18px', fontSize: 13, borderRadius: 999 },
    md: { padding: '13px 28px', fontSize: 15, borderRadius: 999 },
    lg: { padding: '17px 36px', fontSize: 17, borderRadius: 999 },
  };

  const variantStyles: Record<Variant, CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--btn) 0%, var(--btn-deep) 100%)',
      color: 'var(--btn-text)',
      boxShadow: pressed
        ? '0 4px 12px rgba(124,55,99,0.25)'
        : '0 10px 24px rgba(124,55,99,0.32), inset 0 1px 0 rgba(255,255,255,0.15)',
      border: 'none',
    },
    secondary: {
      background: 'var(--card)',
      color: 'var(--ink)',
      boxShadow: 'inset 0 0 0 1.5px var(--line-strong)',
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--btn)',
      border: 'none',
      boxShadow: 'none',
    },
    light: {
      background: 'var(--accent-soft)',
      color: 'var(--btn)',
      border: 'none',
      boxShadow: 'none',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        fontFamily: 'var(--sans)',
        fontWeight: 500,
        letterSpacing: '0.01em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transform: pressed && !disabled ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, opacity 0.2s',
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
};
