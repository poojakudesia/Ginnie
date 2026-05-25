import React, { useState } from 'react';
import { useAppStore } from '../store/app';
import { DLTopBar } from '../components/DLTopBar';
import { DLButton } from '../components/DLButton';
import { DLInput } from '../components/DLInput';
import { DLCard } from '../components/DLCard';
import { DLLabel } from '../components/DLLabel';
import { DLDisplay } from '../components/DLDisplay';
import { DLScreen } from '../components/DLScreen';

type CapturePhase = 'camera' | 'review';

const ENTRY_ICONS: Record<string, string> = {
  affirm: '✦',
  viz: '◐',
  sign: '✧',
  movie: '▸',
  gratitude: '♡',
  photo: '◧',
};

const ENTRY_ICON_COLORS: Record<string, string> = {
  affirm: '#DC8551',
  viz: '#6BAF64',
  sign: '#A78BFA',
  movie: '#F4A236',
  gratitude: '#EC4899',
  photo: '#38BDF8',
};

interface FeedEntry {
  id: string;
  type: string;
  text: string;
  time: string;
  date: string;
  photo?: boolean;
}

const MOCK_ENTRIES: FeedEntry[] = [
  {
    id: '1',
    type: 'viz',
    text: '5 min visualization · Career wish. Felt the warmth of the office, heard my name announced at the front.',
    time: '7:08 AM',
    date: 'Today',
  },
  {
    id: '2',
    type: 'affirm',
    text: 'I am exactly where I need to be. Abundance flows to me effortlessly.',
    time: '7:22 AM',
    date: 'Today',
  },
  {
    id: '3',
    type: 'photo',
    text: 'Spotted this on the way to work — the exact color I described in my vision board.',
    time: '8:41 AM',
    date: 'Today',
    photo: true,
  },
  {
    id: '4',
    type: 'sign',
    text: 'Saw a double rainbow at the exact moment I was thinking about my wish for the first time today.',
    time: '2:15 PM',
    date: 'Yesterday',
  },
  {
    id: '5',
    type: 'gratitude',
    text: 'Grateful for: the morning light, my health, unexpected opportunities, and every small win.',
    time: '8:03 AM',
    date: 'Yesterday',
  },
  {
    id: '6',
    type: 'movie',
    text: 'Vision movie · Abundant Life · 0:58. Watched twice. Cried happy tears.',
    time: '9:10 AM',
    date: 'May 22',
  },
];

const WISHES_MOCK = ['Career & purpose', 'Home & abundance', 'Love & connection'];

export const FeedScreen: React.FC = () => {
  const { goto } = useAppStore();
  const [capturing, setCapturing] = useState(false);
  const [capturePhase, setCapturePhase] = useState<CapturePhase>('camera');
  const [captureNote, setCaptureNote] = useState('');
  const [selectedWish, setSelectedWish] = useState<number | null>(null);

  const startCapture = () => {
    setCapturePhase('camera');
    setCaptureNote('');
    setSelectedWish(null);
    setCapturing(true);
  };

  const grouped = MOCK_ENTRIES.reduce<Record<string, FeedEntry[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  // ── CAMERA CAPTURE OVERLAY ──
  if (capturing) {
    if (capturePhase === 'camera') {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#0A0A0A',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {/* Viewfinder area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Viewfinder bracket corners */}
            {([
              { top: 60, left: 28 },
              { top: 60, right: 28 },
              { bottom: 60, left: 28 },
              { bottom: 60, right: 28 },
            ] as React.CSSProperties[]).map((pos, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 32,
                  height: 32,
                  borderTop: pos.top !== undefined ? '2.5px solid rgba(255,255,255,0.7)' : 'none',
                  borderBottom: pos.bottom !== undefined ? '2.5px solid rgba(255,255,255,0.7)' : 'none',
                  borderLeft: pos.left !== undefined ? '2.5px solid rgba(255,255,255,0.7)' : 'none',
                  borderRight: pos.right !== undefined ? '2.5px solid rgba(255,255,255,0.7)' : 'none',
                  borderRadius: 3,
                  ...pos,
                }}
              />
            ))}

            {/* Live label */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#EF4444',
                  animation: 'dlBreathe 1.5s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.12em',
                }}
              >
                Receipt MODE · LIVE
              </span>
            </div>

            {/* Placeholder viewfinder */}
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.1em',
                textAlign: 'center',
              }}
            >
              VIEWFINDER
            </div>

            {/* Close */}
            <button
              onClick={() => setCapturing(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>

          {/* Bottom controls */}
          <div
            style={{
              padding: '16px 28px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Gallery button */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 20,
              }}
            >
              ◧
            </div>

            {/* Shutter */}
            <button
              onClick={() => setCapturePhase('review')}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#fff',
                border: '4px solid rgba(255,255,255,0.3)',
                outline: '2px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: '#0A0A0A',
                boxSizing: 'border-box',
              }}
            >
              ◎
            </button>

            {/* Zoom */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              1×
            </div>
          </div>
        </div>
      );
    }

    // capturePhase === 'review'
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--paper)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setCapturePhase('camera')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--muted)',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ← Retake
          </button>
          <DLLabel>Review receipt</DLLabel>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Captured placeholder */}
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: 18,
              background: 'linear-gradient(135deg, #B8D4B0 0%, #7DAA73 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 36 }}>◧</span>
            <DLLabel style={{ color: 'rgba(255,255,255,0.8)' }}>captured</DLLabel>
          </div>

          <DLInput
            value={captureNote}
            onChange={setCaptureNote}
            placeholder="What happened? What did you notice?"
            multiline
            rows={4}
            label="What happened?"
          />

          {/* Connect to wish */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <DLLabel>Connect to a wish</DLLabel>
            {WISHES_MOCK.map((w, i) => (
              <button
                key={i}
                onClick={() => setSelectedWish(i === selectedWish ? null : i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: selectedWish === i ? 'var(--accent-soft)' : 'var(--card)',
                  border: selectedWish === i ? '1.5px solid var(--btn)' : '1.5px solid var(--line)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: `2px solid ${selectedWish === i ? 'var(--btn)' : 'var(--line-strong)'}`,
                    background: selectedWish === i ? 'var(--btn)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {selectedWish === i && (
                    <span style={{ color: '#fff', fontSize: 9 }}>✓</span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 13,
                    color: selectedWish === i ? 'var(--btn)' : 'var(--ink)',
                    fontWeight: selectedWish === i ? 500 : 400,
                  }}
                >
                  {w}
                </span>
              </button>
            ))}
          </div>

          <DLButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setCapturing(false)}
          >
            Save to receipts ✓
          </DLButton>
        </div>
      </div>
    );
  }

  // ── MAIN FEED ──
  return (
    <DLScreen scroll={false} pad={false} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 22,
                fontStyle: 'italic',
                color: 'var(--ink)',
                marginBottom: 2,
              }}
            >
              Receipts
            </div>
            <DLLabel>your proof, day by day.</DLLabel>
          </div>

          {/* Camera FAB top right */}
          <button
            onClick={startCapture}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--btn)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#fff',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            }}
          >
            ◧
          </button>
        </div>
      </div>

      {/* Quick capture banner */}
      <div
        onClick={startCapture}
        style={{
          margin: '14px 20px 0',
          padding: '14px 18px',
          borderRadius: 18,
          background: 'linear-gradient(135deg, var(--accent-soft) 0%, rgba(255,255,255,0.4) 100%)',
          border: '1.5px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--btn)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          ◧
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--sans)',
              fontWeight: 500,
              fontSize: 13,
              color: 'var(--ink)',
              marginBottom: 2,
            }}
          >
            Capture a receipt
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)' }}>
            Photo, sign, or synchronicity — log it now.
          </div>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: 14 }}>→</span>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 80px' }}>
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date} style={{ marginBottom: 28 }}>
            {/* Date group header */}
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 16,
                fontStyle: 'italic',
                color: 'var(--ink-2)',
                marginBottom: 12,
              }}
            >
              {date}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entries.map((entry) => (
                <DLCard key={entry.id} tone="paper" pad={14}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {/* Type icon circle */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: `${ENTRY_ICON_COLORS[entry.type] || 'var(--btn)'}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        color: ENTRY_ICON_COLORS[entry.type] || 'var(--btn)',
                        flexShrink: 0,
                      }}
                    >
                      {ENTRY_ICONS[entry.type] || '✦'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <DLLabel style={{ color: ENTRY_ICON_COLORS[entry.type] || 'var(--btn)' }}>
                          {entry.type}
                        </DLLabel>
                        <DLLabel>{entry.time}</DLLabel>
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--sans)',
                          fontSize: 13,
                          color: 'var(--ink)',
                          lineHeight: 1.55,
                        }}
                      >
                        {entry.text}
                      </div>

                      {/* Photo placeholder */}
                      {entry.photo && (
                        <div
                          style={{
                            marginTop: 10,
                            width: '100%',
                            height: 100,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #B8D4B0 0%, #7DAA73 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 26,
                            color: 'rgba(255,255,255,0.8)',
                          }}
                        >
                          ◧
                        </div>
                      )}
                    </div>
                  </div>
                </DLCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating "Add receipt" pill FAB */}
      <button
        onClick={startCapture}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          borderRadius: 999,
          background: 'linear-gradient(135deg, var(--btn) 0%, var(--btn-deep) 100%)',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          fontFamily: 'var(--sans)',
          fontSize: 13,
          fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        <span style={{ fontSize: 16 }}>◧</span>
        Add receipt
      </button>
    </DLScreen>
  );
};
