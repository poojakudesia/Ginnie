import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/app';
import { DLTopBar } from '../components/DLTopBar';
import { DLButton } from '../components/DLButton';
import { DLInput } from '../components/DLInput';
import { DLAura } from '../components/DLAura';
import { DLCard } from '../components/DLCard';
import { DLChip } from '../components/DLChip';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { DLScreen } from '../components/DLScreen';

type Phase = 'intro' | 'playing' | 'reflect';
type Ambiance = 'rain' | 'forest' | 'waves' | 'fire' | 'silence';
type Length = 3 | 5 | 10 | 15;

export const VizScreen: React.FC = () => {
  const { goto, wishes } = useAppStore();
  const [phase, setPhase] = useState<Phase>('intro');
  const [ambiance, setAmbiance] = useState<Ambiance>('silence');
  const [length, setLength] = useState<Length>(5);
  const [seconds, setSeconds] = useState(300);
  const [paused, setPaused] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [bizarreSign, setBizarreSign] = useState<'yes' | 'not-yet' | null>(null);
  const [signDesc, setSignDesc] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const firstWish = wishes[0];
  const wishTitle = firstWish?.title || 'I am living my dream life, fully and completely.';

  useEffect(() => {
    if (phase === 'playing') {
      setSeconds(length * 60);
    }
  }, [phase, length]);

  useEffect(() => {
    if (phase === 'playing' && !paused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setPhase('reflect');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, paused]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleBegin = () => {
    setSeconds(length * 60);
    setPhase('playing');
  };

  const handleLog = () => {
    goto('home');
  };

  // ── INTRO PHASE ──
  if (phase === 'intro') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #F4EFE5 0%, #DDE6D0 100%)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <DLTopBar
          title="Visualization"
          showBack
          onBack={() => goto('home')}
          transparent
        />

        <div style={{ padding: '4px 20px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <DLLabel style={{ color: 'var(--muted)' }}>5 minutes · wish 01</DLLabel>

          <DLDisplay size="md" italic>
            close your eyes. be there already.
          </DLDisplay>

          {/* Ginnie whispers card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 22,
              padding: 20,
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <DLLabel style={{ color: 'var(--btn)', marginBottom: 8, display: 'block' }}>
              Ginnie whispers ✦
            </DLLabel>
            <p
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 16,
                fontStyle: 'italic',
                color: 'var(--ink)',
                lineHeight: 1.55,
                margin: '0 0 12px',
              }}
            >
              "{wishTitle}"
            </p>
            <p
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 13,
                color: 'var(--ink-2)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Walk into the room where this is already true...
            </p>
          </div>

          {/* Ambiance chips */}
          <div>
            <DLLabel style={{ marginBottom: 10, display: 'block' }}>Ambiance</DLLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['rain', 'forest', 'waves', 'fire', 'silence'] as Ambiance[]).map((a) => (
                <DLChip
                  key={a}
                  size="sm"
                  active={ambiance === a}
                  onClick={() => setAmbiance(a)}
                >
                  {a}
                </DLChip>
              ))}
            </div>
          </div>

          {/* Length chips */}
          <div>
            <DLLabel style={{ marginBottom: 10, display: 'block' }}>Length</DLLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {([3, 5, 10, 15] as Length[]).map((l) => (
                <DLChip
                  key={l}
                  size="sm"
                  active={length === l}
                  onClick={() => setLength(l)}
                >
                  {l} min
                </DLChip>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <DLButton variant="primary" size="lg" fullWidth onClick={handleBegin}>
              Begin the session ◐
            </DLButton>
            <button
              onClick={() => goto('home')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--sans)',
                fontSize: 13,
                color: 'var(--muted)',
                padding: '4px 8px',
              }}
            >
              not today
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING PHASE ──
  if (phase === 'playing') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 40%, #97AE8E 0%, #4D6749 60%, #2E3F2A 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Ambiance + skip */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            boxSizing: 'border-box',
          }}
        >
          <DLLabel style={{ color: 'rgba(255,255,255,0.7)' }}>{ambiance}</DLLabel>
          <button
            onClick={() => setPhase('reflect')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.06em',
            }}
          >
            Skip →
          </button>
        </div>

        {/* Centered breathing area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            padding: '0 24px',
          }}
        >
          {/* Ginnie with breathing rings */}
          <div
            style={{
              position: 'relative',
              width: 240,
              height: 240,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outer breathing ring */}
            <div
              style={{
                position: 'absolute',
                inset: -80,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.12)',
                animation: 'dlBreathe 4s ease-in-out infinite',
              }}
            />
            {/* Inner breathing ring */}
            <div
              style={{
                position: 'absolute',
                inset: -40,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.2)',
                animation: 'dlBreathe 4s ease-in-out infinite 0.6s',
              }}
            />
            <DLAura size={160} glow />
          </div>

          {/* Timer */}
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 56,
              fontWeight: 300,
              color: '#fff',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}
          >
            {formatTime(seconds)}
          </div>

          {/* Wish quote */}
          <p
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 17,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.85)',
              textAlign: 'center',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 280,
            }}
          >
            "{wishTitle.length > 70 ? wishTitle.slice(0, 70) + '…' : wishTitle}"
          </p>

          {/* Breath cue */}
          <DLLabel style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>
            breathe in · 4 · breathe out · 6
          </DLLabel>

          {/* Pause button */}
          <button
            onClick={() => setPaused((p) => !p)}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: '#fff',
              backdropFilter: 'blur(8px)',
            }}
          >
            {paused ? '▸' : '⏸'}
          </button>
        </div>
      </div>
    );
  }

  // ── REFLECT PHASE ──
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #F4EFE5 0%, #DDE6D0 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <DLTopBar title="Reflect" transparent />

      <div style={{ padding: '4px 20px 48px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <DLDisplay size="md" italic>
          What did you actually feel?
        </DLDisplay>

        <DLInput
          value={feeling}
          onChange={setFeeling}
          placeholder="Describe what came up for you during the session..."
          multiline
          rows={5}
        />

        {/* Bizarre sign prompt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DLLabel>Did you receive a bizarre sign?</DLLabel>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <DLChip
              active={bizarreSign === 'yes'}
              onClick={() => setBizarreSign('yes')}
            >
              Yes — let me tell you
            </DLChip>
            <DLChip
              active={bizarreSign === 'not-yet'}
              onClick={() => setBizarreSign('not-yet')}
            >
              Not yet
            </DLChip>
          </div>
        </div>

        {bizarreSign === 'yes' && (
          <DLInput
            value={signDesc}
            onChange={setSignDesc}
            placeholder="Describe the sign or synchronicity..."
            multiline
            rows={3}
            label="Describe the sign"
          />
        )}

        <DLButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleLog}
          style={{
            background: 'linear-gradient(135deg, #6BAF64 0%, #4D8F46 100%)',
            boxShadow: '0 10px 24px rgba(75,143,70,0.32)',
            marginTop: 8,
          }}
        >
          Log this session ✓
        </DLButton>
      </div>
    </div>
  );
};
