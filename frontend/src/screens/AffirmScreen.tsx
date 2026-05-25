import React, { useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLTopBar } from '../components/DLTopBar';
import { DLCard } from '../components/DLCard';
import { DLLabel } from '../components/DLLabel';
import { DLAura } from '../components/DLAura';

const SUGGESTIONS = [
  'I am a magnet for abundance and opportunity.',
  'Everything I desire is already making its way to me.',
  'I am worthy of my dream life in every way.',
  'The universe always supports my highest good.',
  'I attract love, wealth, and health effortlessly.',
];

interface AffirmLine {
  text: string;
  timestamp?: string;
}

export const AffirmScreen: React.FC = () => {
  const [lines, setLines] = useState<AffirmLine[]>([
    { text: '' },
    { text: '' },
    { text: '' },
  ]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleBlur = (i: number) => {
    if (lines[i].text.trim()) {
      const updated = [...lines];
      updated[i] = {
        ...updated[i],
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setLines(updated);
    }
    setEditIndex(null);
  };

  const handleChange = (i: number, val: string) => {
    const updated = [...lines];
    updated[i] = { text: val };
    setLines(updated);
  };

  const applySuggestion = (s: string) => {
    const emptyIdx = lines.findIndex((l) => !l.text.trim());
    if (emptyIdx !== -1) {
      handleChange(emptyIdx, s);
    }
  };

  return (
    <DLScreen scroll={false} pad={false} style={{ background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <DLTopBar title="Affirmations ✦" showBack />

      {/* Lined paper */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 0',
          background: `
            repeating-linear-gradient(
              transparent,
              transparent 39px,
              var(--line) 39px,
              var(--line) 40px
            )
          `,
          backgroundPositionY: '16px',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              height: 40,
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                color: 'var(--line-strong)',
                width: 18,
                textAlign: 'right',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <input
              value={line.text}
              onChange={(e) => handleChange(i, e.target.value)}
              onFocus={() => setEditIndex(i)}
              onBlur={() => handleBlur(i)}
              placeholder={editIndex === i ? '' : `Affirmation ${i + 1}...`}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--serif)',
                fontSize: 17,
                fontStyle: 'italic',
                color: 'var(--ink)',
                lineHeight: 1,
              }}
            />
            {line.timestamp && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', flexShrink: 0 }}>
                {line.timestamp}
              </span>
            )}
          </div>
        ))}

        <div style={{ padding: '16px 24px' }}>
          {/* 369 tip */}
          <DLCard tone="plum" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>3</span>
              <div>
                <DLLabel style={{ color: 'var(--btn)', marginBottom: 2, display: 'block' }}>369 Method</DLLabel>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
                  Write each affirmation 3× morning, 6× afternoon, 9× night.
                </p>
              </div>
            </div>
          </DLCard>

          {/* Aura suggestions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <DLAura size={28} glow={false} />
              <DLLabel style={{ color: 'var(--btn)' }}>Aura suggests</DLLabel>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => applySuggestion(s)}
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: 14,
                    background: 'var(--card)',
                    border: '1.5px solid var(--line)',
                    cursor: 'pointer',
                    fontFamily: 'var(--serif)',
                    fontSize: 14,
                    fontStyle: 'italic',
                    color: 'var(--ink)',
                    lineHeight: 1.4,
                  }}
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DLScreen>
  );
};
