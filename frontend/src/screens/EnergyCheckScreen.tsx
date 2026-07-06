import React, { useEffect, useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { DLDots } from '../components/DLDots';
import { DLAura } from '../components/DLAura';
import { useAppStore } from '../store/app';
import { useTrackerStore } from '../store/tracker';

interface Option {
  id: string;
  score: number;
  label: string;
}

interface Question {
  field: string;
  eyebrow: string;
  title: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    field: 'position',
    eyebrow: 'A question of altitude',
    title: 'Where do you feel you are right now?',
    options: [
      { id: 'leading',   score: 4, label: 'Leading & thriving' },
      { id: 'flow',      score: 3, label: 'In my flow' },
      { id: 'rhythm',    score: 2, label: 'Building my rhythm' },
      { id: 'awakening', score: 1, label: 'Just awakening' },
    ],
  },
  {
    field: 'consistency',
    eyebrow: 'A question of rhythm',
    title: 'How consistent has your practice felt this week?',
    options: [
      { id: 'rock_solid', score: 4, label: 'Rock solid' },
      { id: 'mostly',     score: 3, label: 'Mostly there' },
      { id: 'patchy',     score: 2, label: 'Patchy' },
      { id: 'barely',     score: 1, label: 'Barely showed up' },
    ],
  },
  {
    field: 'belief',
    eyebrow: 'A question of faith',
    title: "How strong is your belief it's working?",
    options: [
      { id: 'unshakable', score: 4, label: 'Unshakable' },
      { id: 'growing',    score: 3, label: 'Growing' },
      { id: 'wavering',   score: 2, label: 'Wavering' },
      { id: 'low',        score: 1, label: 'Running low' },
    ],
  },
  {
    field: 'energy',
    eyebrow: 'A question of vitality',
    title: 'Your energy this week?',
    options: [
      { id: 'vibrant',  score: 4, label: 'Vibrant' },
      { id: 'steady',   score: 3, label: 'Steady' },
      { id: 'drained',  score: 2, label: 'Drained' },
      { id: 'depleted', score: 1, label: 'Depleted' },
    ],
  },
];

interface TierResult {
  tier: string;
  title: string;
  message: string;
}

const resolveTier = (avg: number): TierResult => {
  if (avg >= 3.5)
    return {
      tier: 'thriving',
      title: "You're thriving ✦",
      message:
        "You're leading your own energy — intent is becoming impact. Keep raising the bar.",
    };
  if (avg >= 2.5)
    return {
      tier: 'flow',
      title: "You're in flow",
      message: 'Consistency and belief are carrying you forward. Hold this momentum.',
    };
  if (avg >= 1.75)
    return {
      tier: 'building',
      title: "You're building rhythm",
      message: "You're on the path. A little more steadiness and it compounds.",
    };
  return {
    tier: 'awakening',
    title: 'Time to reactivate',
    message: "Your potential is real — let's give it a gentle boost this week.",
  };
};

const REALIGN_TECHNIQUES = [
  'Take 2 minutes for a gratitude burst — name 3 wins.',
  'Do a 5-minute visualization before you sleep tonight.',
  'Say one affirmation out loud, right now.',
];

const todayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
};

export const EnergyCheckScreen: React.FC = () => {
  const { goto } = useAppStore();
  const recordEnergyCheck = useTrackerStore((s) => s.recordEnergyCheck);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  // per-question: selected option id + score
  const [answers, setAnswers] = useState<Record<string, { id: string; score: number }>>({});
  const recorded = React.useRef(false);

  const q = QUESTIONS[step];
  const current = answers[q.field];
  const isLast = step === QUESTIONS.length - 1;

  const choose = (o: Option) =>
    setAnswers((a) => ({ ...a, [q.field]: { id: o.id, score: o.score } }));

  const handleNext = () => {
    if (!current) return;
    if (isLast) setDone(true);
    else setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) goto('tracker');
    else setStep((s) => s - 1);
  };

  // ── Compute result ───────────────────────────────────────────────
  const scores = QUESTIONS.map((qq) => answers[qq.field]?.score ?? 0);
  const avg = scores.reduce((sum, v) => sum + v, 0) / QUESTIONS.length;
  const result = resolveTier(avg);
  const hasLowAnswer = scores.some((v) => v > 0 && v <= 2);
  const needsRealign =
    result.tier === 'building' || result.tier === 'awakening' || hasLowAnswer;

  // Record once, when the result is first shown.
  useEffect(() => {
    if (!done || recorded.current) return;
    recorded.current = true;
    const answerMap: Record<string, string> = {};
    QUESTIONS.forEach((qq) => {
      const a = answers[qq.field];
      if (a) answerMap[qq.field] = a.id;
    });
    recordEnergyCheck({ date: todayKey(), tier: result.tier, answers: answerMap });
  }, [done, answers, result.tier, recordEnergyCheck]);

  // ── Result screen ────────────────────────────────────────────────
  if (done) {
    return (
      <DLScreen scroll pad>
        <div
          style={{
            paddingTop: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            animation: 'dlFadeUp 0.5s ease both',
          }}
        >
          <DLAura size={80} glow style={{ marginTop: 24, marginBottom: 26 }} />

          <DLLabel style={{ color: 'var(--btn)' }}>Weekly Energy Check</DLLabel>
          <DLDisplay size="md" center style={{ marginTop: 10, marginBottom: 12, lineHeight: 1.14 }}>
            {result.title}
          </DLDisplay>
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 15,
              lineHeight: 1.5,
              color: 'var(--ink-2)',
              maxWidth: 340,
              margin: '0 auto',
            }}
          >
            {result.message}
          </p>

          {/* Realign card OR keep-going card */}
          {needsRealign ? (
            <div
              style={{
                marginTop: 28,
                width: '100%',
                textAlign: 'left',
                background: 'var(--card)',
                border: '1.5px solid var(--line)',
                borderRadius: 20,
                padding: '20px 20px 22px',
                boxShadow: '0 8px 24px rgba(33,31,26,0.06)',
              }}
            >
              <DLLabel style={{ color: 'var(--btn)' }}>Realign your energy ✦</DLLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                {REALIGN_TECHNIQUES.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span
                      style={{
                        flexShrink: 0,
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        background: 'var(--accent-soft)',
                        color: 'var(--btn)',
                        fontFamily: 'var(--mono)',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--sans)',
                        fontSize: 14.5,
                        lineHeight: 1.4,
                        color: 'var(--ink)',
                      }}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: 28,
                width: '100%',
                textAlign: 'left',
                background: 'var(--accent-soft)',
                border: '1.5px solid var(--line)',
                borderRadius: 20,
                padding: '20px',
              }}
            >
              <DLLabel style={{ color: 'var(--btn)' }}>Keep going</DLLabel>
              <p
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 14.5,
                  lineHeight: 1.45,
                  color: 'var(--ink)',
                  marginTop: 12,
                }}
              >
                Nothing to fix — keep your streak alive and trust the process.
              </p>
            </div>
          )}

          <DLButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => goto('tracker')}
            style={{ marginTop: 28, marginBottom: 32 }}
          >
            Back to my practice →
          </DLButton>
        </div>
      </DLScreen>
    );
  }

  // ── Question screen ──────────────────────────────────────────────
  return (
    <DLScreen scroll pad>
      <div style={{ paddingTop: 16 }}>
        {/* Top: back + dots */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
          }}
        >
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.12em',
              color: 'var(--ink)',
              padding: 0,
            }}
          >
            ← BACK
          </button>
          <DLDots total={QUESTIONS.length} current={step} />
        </div>

        <DLLabel style={{ color: 'var(--btn)' }}>
          Energy Check · {step + 1} of {QUESTIONS.length}
        </DLLabel>
        <DLDisplay size="sm" style={{ marginTop: 10, marginBottom: 6, lineHeight: 1.12 }}>
          {q.title}
        </DLDisplay>
        <p
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10.5,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 20,
          }}
        >
          {q.eyebrow}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map((o) => {
            const on = current?.id === o.id;
            return (
              <button
                key={o.id}
                onClick={() => choose(o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  padding: '15px 16px',
                  borderRadius: 16,
                  background: on ? 'var(--ink)' : 'var(--card)',
                  color: on ? 'var(--paper)' : 'var(--ink)',
                  border: `1.5px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
                  boxShadow: on ? '0 8px 20px rgba(33,31,26,0.16)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 14.5,
                    lineHeight: 1.35,
                    fontWeight: on ? 500 : 400,
                  }}
                >
                  {o.label}
                </span>
              </button>
            );
          })}
        </div>

        <DLButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!current}
          onClick={handleNext}
          style={{ marginTop: 24, marginBottom: 32 }}
        >
          {isLast ? 'See where I’ve reached ✦' : 'Continue →'}
        </DLButton>
      </div>
    </DLScreen>
  );
};
