import React from 'react';

interface IOSFrameProps {
  children: React.ReactNode;
}

export const IOSFrame: React.FC<IOSFrameProps> = ({ children }) => {
  const isDesktop = window.innerWidth > 500;

  if (!isDesktop) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100dvh',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--paper)',
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            paddingTop: 8,
            flexShrink: 0,
            position: 'relative',
            zIndex: 50,
          }}
        />
        <div style={{ height: 'calc(100dvh - 50px)', overflow: 'hidden', position: 'relative' }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0a14 0%, #2d1a2e 50%, #1a0a14 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 372,
          height: 808,
          borderRadius: 52,
          background: '#0d0d0d',
          boxShadow:
            '0 60px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1), inset 0 0 0 2px rgba(255,255,255,0.05)',
          padding: 10,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Screen */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 44,
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--paper)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 34,
              background: '#0d0d0d',
              borderRadius: 999,
              zIndex: 200,
            }}
          />

          {/* Status bar */}
          <div
            style={{
              height: 58,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '0 28px 8px',
              flexShrink: 0,
              position: 'relative',
              zIndex: 100,
            }}
          >
            <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
              9:41
            </span>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--ink)' }}>●●●●</span>
              <span style={{ fontSize: 11, color: 'var(--ink)' }}>WiFi</span>
              <span style={{ fontSize: 11, color: 'var(--ink)' }}>█████</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
