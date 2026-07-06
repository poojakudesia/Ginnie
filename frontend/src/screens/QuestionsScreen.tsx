import React, { useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { DLDots } from '../components/DLDots';
import { useAppStore } from '../store/app';
import type { MethodQuizAnswers } from '../lib/methodMatch';

interface Option {
  id: string;
  icon: string;
  label: string;
}

interface Question {
  field: keyof MethodQuizAnswers;
  eyebrow: string;
  title: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    field: 'modality',
    eyebrow: 'A question of imagination',
    title: 'When you daydream about something you truly want, how does it show up?',
    options: [
      { id: 'visual',  icon: '🎬', label: 'I see it like a movie in my head' },
      { id: 'verbal',  icon: '🗣️', label: 'I hear myself talking about it, or say it out loud' },
      { id: 'written', icon: '✍️', label: 'I want to write it down, make notes or lists' },
      { id: 'feeling', icon: '💓', label: 'I feel it in my body — excitement, warmth, butterflies' },
    ],
  },
  {
    field: 'habitStyle',
    eyebrow: 'A question of rhythm',
    title: "What's your style when building a new daily habit?",
    options: [
      { id: 'structured', icon: '📋', label: 'Give me exact steps and a streak to protect' },
      { id: 'intuitive',  icon: '🌊', label: 'I go with my mood — rigid routines kill it for me' },
      { id: 'micro',      icon: '⏱️', label: 'Tiny rituals, 5 minutes max' },
      { id: 'immersive',  icon: '🌙', label: 'Fewer but deep, immersive sessions' },
    ],
  },
  {
    field: 'blocker',
    eyebrow: 'A question of friction',
    title: 'What usually gets in the way after you set an intention?',
    options: [
      { id: 'consistency', icon: '😅', label: "I forget / can't stay consistent" },
      { id: 'doubt',       icon: '🤔', label: 'Doubt creeps in ("is this even working?")' },
      { id: 'impatience',  icon: '⏳', label: "Impatience about when it'll happen" },
      { id: 'clarity',     icon: '🌫️', label: "I'm not 100% clear on what I actually want" },
    ],
  },
  {
    field: 'mindOpen',
    eyebrow: 'A question of timing',
    title: 'When does your mind feel most open?',
    options: [
      { id: 'morning',    icon: '🌄', label: 'Morning' },
      { id: 'walk',       icon: '🚶', label: 'On a walk' },
      { id: 'shower',     icon: '🚿', label: 'In the shower' },
      { id: 'meditation', icon: '🧘', label: 'During meditation' },
      { id: 'sleep',      icon: '🌙', label: 'Before sleep' },
    ],
  },
  {
    field: 'mentalState',
    eyebrow: 'A question of the heart',
    title: "What's your current mental state?",
    options: [
      { id: 'dont_deserve', icon: '💭', label: "I don't deserve it" },
      { id: 'not_ready',    icon: '⏳', label: 'I am not ready' },
      { id: 'too_old',      icon: '🕰', label: 'I am too old' },
      { id: 'tried_before', icon: '🔄', label: 'I have tried before' },
    ],
  },
];

export const QuestionsScreen: React.FC = () => {
  const { goto, goBack, setMethodQuiz } = useAppStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<MethodQuizAnswers>>({});

  const q = QUESTIONS[step];
  const current = answers[q.field];
  const isLast = step === QUESTIONS.length - 1;

  const choose = (id: string) => setAnswers((a) => ({ ...a, [q.field]: id }));

  const handleNext = () => {
    if (!current) return;
    if (isLast) {
      // Persist the full set of answers to the profile, then match
      setMethodQuiz(answers as MethodQuizAnswers);
      goto('techniques');
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step === 0) goBack();
    else setStep((s) => s - 1);
  };

  return (
    <DLScreen scroll pad>
      <div style={{ paddingTop: 16 }}>
        {/* Top: back + dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <button
            onClick={handleBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em',
              color: 'var(--ink)', padding: 0,
            }}
          >
            ← BACK
          </button>
          <DLDots total={QUESTIONS.length} current={step} />
        </div>

        <DLLabel style={{ color: 'var(--btn)' }}>
          Method Match · {step + 1} of {QUESTIONS.length}
        </DLLabel>
        <DLDisplay size="sm" style={{ marginTop: 10, marginBottom: 6, lineHeight: 1.12 }}>
          {q.title}
        </DLDisplay>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>
          {q.eyebrow}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map((o) => {
            const on = current === o.id;
            return (
              <button
                key={o.id}
                onClick={() => choose(o.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  textAlign: 'left', cursor: 'pointer', width: '100%',
                  padding: '15px 16px',
                  borderRadius: 16,
                  background: on ? 'var(--ink)' : 'var(--card)',
                  color: on ? 'var(--paper)' : 'var(--ink)',
                  border: `1.5px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
                  boxShadow: on ? '0 8px 20px rgba(33,31,26,0.16)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{o.icon}</span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 14.5, lineHeight: 1.35, fontWeight: on ? 500 : 400 }}>
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
          {isLast ? 'Match my practice ✦' : 'Continue →'}
        </DLButton>
      </div>
    </DLScreen>
  );
};
