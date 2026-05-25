import React, { useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { DLDots } from '../components/DLDots';
import { useAppStore } from '../store/app';

const QUESTIONS = [
  {
    hero: '🌅',
    heroGrad: 'linear-gradient(180deg, #FFD4A3 0%, #FFA07A 100%)',
    title: 'When does your mind feel most open?',
    options: [
      { id: 'morning', label: 'Morning', icon: '🌄', desc: 'Fresh start energy' },
      { id: 'walk', label: 'On a walk', icon: '🚶', desc: 'Moving meditation' },
      { id: 'sleep', label: 'Before sleep', icon: '🌙', desc: 'Dream state' },
      { id: 'shower', label: 'In the shower', icon: '🚿', desc: 'Flow state' },
    ],
  },
  {
    hero: '💭',
    heroGrad: 'linear-gradient(180deg, #C4B5FD 0%, #7C3AED 100%)',
    title: "What's your loudest doubt?",
    options: [
      { id: 'not-ready', label: "I'm not ready", icon: '⏳', desc: 'Timing fear' },
      { id: 'too-late', label: "It's too late", icon: '🕰', desc: 'Age/time fear' },
      { id: 'dont-deserve', label: "I don't deserve it", icon: '💔', desc: 'Worth fear' },
      { id: 'tried-before', label: "I've tried before", icon: '🔄', desc: 'Past fear' },
    ],
  },
  {
    hero: '⏱',
    heroGrad: 'linear-gradient(180deg, #86EFAC 0%, #16A34A 100%)',
    title: 'How much time can you give daily?',
    options: [
      { id: '5min', label: '5 min', icon: '⚡', desc: 'Micro sessions' },
      { id: '10min', label: '10 min', icon: '🔥', desc: 'Power practice' },
      { id: '15min', label: '15 min', icon: '✨', desc: 'Deep dive' },
      { id: '20min', label: '20+ min', icon: '🌟', desc: 'Full ritual' },
    ],
  },
  {
    hero: '✦',
    heroGrad: 'linear-gradient(180deg, #FCD34D 0%, #D97706 100%)',
    title: 'Which feels most like belief?',
    options: [
      { id: 'writing', label: 'Writing', icon: '✍️', desc: 'Script it' },
      { id: 'saying', label: 'Saying it aloud', icon: '🗣', desc: 'Affirm it' },
      { id: 'seeing', label: 'Seeing it', icon: '👁', desc: 'Visualize it' },
      { id: 'feeling', label: 'Feeling it', icon: '💫', desc: 'Embody it' },
    ],
  },
];

export const QuestionsScreen: React.FC = () => {
  const goto = useAppStore((s) => s.goto);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const q = QUESTIONS[step];
  const selected = answers[step];

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      goto('technique-picker');
    }
  };

  return (
    <DLScreen pad={false} style={{ background: 'var(--paper)' }}>
      {/* Hero panel */}
      <div
        style={{
          height: 180,
          background: q.heroGrad,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64,
          flexShrink: 0,
          transition: 'background 0.4s ease',
        }}
      >
        {q.hero}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 32px' }}>
        <div style={{ marginBottom: 20 }}>
          <DLLabel style={{ color: 'var(--btn)', marginBottom: 6, display: 'block' }}>
            Question {step + 1} of {QUESTIONS.length}
          </DLLabel>
          <DLDisplay size="sm">{q.title}</DLDisplay>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {q.options.map((opt) => {
            const isActive = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAnswers({ ...answers, [step]: opt.id })}
                style={{
                  borderRadius: 18,
                  padding: '18px 14px',
                  background: isActive ? 'var(--accent-soft)' : 'var(--card)',
                  border: isActive ? '2px solid var(--btn)' : '1.5px solid var(--line)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 6,
                  transition: 'all 0.15s',
                  boxShadow: isActive ? '0 6px 16px rgba(124,55,99,0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 28 }}>{opt.icon}</span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, color: isActive ? 'var(--btn)' : 'var(--ink)' }}>
                  {opt.label}
                </span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)' }}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <DLDots total={QUESTIONS.length} current={step} />
          <DLButton
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selected}
            onClick={handleNext}
          >
            {step < QUESTIONS.length - 1 ? 'Next →' : 'Continue →'}
          </DLButton>
        </div>
      </div>
    </DLScreen>
  );
};
