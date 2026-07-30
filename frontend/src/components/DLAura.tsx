import React, { CSSProperties } from 'react';

interface DLAuraProps {
  size?: number;
  glow?: boolean;
  rings?: boolean;
  style?: CSSProperties;
}

export const DLAura: React.FC<DLAuraProps> = ({
  size = 80,
  glow = true,
  rings = false,
  style,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Outer breathing rings */}
      {rings && (
        <>
          <div
            style={{
              position: 'absolute',
              width: size * 1.6,
              height: size * 1.6,
              borderRadius: '50%',
              border: '1.5px solid rgba(124,55,99,0.15)',
              animation: 'dlBreathe 3s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: size * 1.35,
              height: size * 1.35,
              borderRadius: '50%',
              border: '1.5px solid rgba(124,55,99,0.22)',
              animation: 'dlBreathe 3s ease-in-out infinite 0.5s',
            }}
          />
        </>
      )}

      {/* Glow */}
      {glow && (
        <div
          style={{
            position: 'absolute',
            width: size * 1.1,
            height: size * 1.1,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,55,99,0.3) 0%, transparent 70%)',
            animation: 'dlBreathe 3s ease-in-out infinite',
          }}
        />
      )}

      {/* Avatar circle */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C97BA8 0%, #7C3763 50%, #5B2D5E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          boxShadow: glow
            ? `0 0 ${size * 0.3}px rgba(124,55,99,0.4), inset 0 1px 0 rgba(255,255,255,0.3)`
            : 'inset 0 1px 0 rgba(255,255,255,0.3)',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        <img
          src="/logo.png"
          alt="Ginnie"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span
          style={{
            position: 'absolute',
            fontSize: size * 0.38,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          ✦
        </span>
      </div>
    </div>
  );
};
