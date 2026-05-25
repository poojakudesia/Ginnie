import React, { CSSProperties } from 'react';

interface DLInputProps {
  label?: string;
  hint?: string;
  prefix?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  type?: string;
  style?: CSSProperties;
  inputStyle?: CSSProperties;
  autoFocus?: boolean;
}

export const DLInput: React.FC<DLInputProps> = ({
  label,
  hint,
  prefix,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  type = 'text',
  style,
  inputStyle,
  autoFocus,
}) => {
  const sharedInputStyle: CSSProperties = {
    width: '100%',
    background: 'var(--card)',
    border: '1.5px solid var(--line)',
    borderRadius: 14,
    padding: prefix ? '13px 16px 13px 48px' : '13px 16px',
    fontFamily: 'var(--sans)',
    fontSize: 15,
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
    resize: multiline ? 'none' : undefined,
    lineHeight: 1.5,
    ...inputStyle,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              fontSize: 16,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {prefix}
          </span>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            autoFocus={autoFocus}
            style={sharedInputStyle}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            style={sharedInputStyle}
          />
        )}
      </div>
      {hint && (
        <span
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 12,
            color: 'var(--muted)',
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
};
