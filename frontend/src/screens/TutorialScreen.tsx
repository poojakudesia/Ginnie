import React, { useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { DLCard } from '../components/DLCard';
import { DLAura } from '../components/DLAura';
import { useAppStore } from '../store/app';

const TECHNIQUES = [
  {
    id: 'viz', name: 'Visualization', emoji: '◐', duration: '5–10 min', desc: 'See it before you see it.',
    tone: 'sage' as const, bg: 'linear-gradient(180deg, #F4EFE5 0%, #DDE6D0 100%)',
    when: 'mornings · 5 min',
    how: ['Sit somewhere quiet', 'Breathe — in 4, out 6', 'Step into the scene', 'Notice details: light, sound, feeling'],
    tip: 'The more sensory the scene, the deeper it lands.',
  },
  {
    id: 'affirm', name: 'Affirmations', emoji: '✦', duration: '3 min', desc: 'Speak it true.',
    tone: 'clay' as const, bg: 'linear-gradient(180deg, #F4EFE5 0%, #F2E1CB 100%)',
    when: 'after coffee · 3 min',
    how: ['Write 3 affirmations in present tense', 'Speak them aloud', 'Time-stamp the entry', "If you don't believe a line, edit until you almost do"],
    tip: 'Belief beats volume. Quiet & true outperforms loud & forced.',
  },
  {
    id: 'movie', name: 'Vision Movie', emoji: '▸', duration: '1 min', desc: 'A 60-second highlight reel.',
    tone: 'plum' as const, bg: 'linear-gradient(180deg, #F4EFE5 0%, #DCD2E0 100%)',
    when: 'weekly · 1 min',
    how: ['Build a 60-second highlight reel', 'Soundtrack it', 'Watch once a day', 'Update as the dream sharpens'],
    tip: "You don't edit the movie for accuracy. You edit it for feeling.",
  },
  {
    id: 'script', name: 'Scripting', emoji: '✎', duration: '7 min', desc: 'Write tomorrow in present tense.',
    tone: 'sage' as const, bg: 'linear-gradient(180deg, #F4EFE5 0%, #DDE6D0 100%)',
    when: 'before bed · 7 min',
    how: ['Write tomorrow as if it already happened', 'Use "I" + past tense', 'Get specific', 'Close the notebook and sleep on it'],
    tip: "Your subconscious doesn't know the difference between vivid memory and vivid imagination.",
  },
  {
    id: 'gratitude', name: 'Gratitude Journal', emoji: '♡', duration: '2 min', desc: 'Three thanks.',
    tone: 'clay' as const, bg: 'linear-gradient(180deg, #F4EFE5 0%, #F2E1CB 100%)',
    when: 'evenings · 2 min',
    how: ["Write 3 things you're grateful for", 'Be specific', 'Include one thing you almost missed', 'Read them tomorrow morning'],
    tip: 'Receipts before requests. The universe trusts grateful people more.',
  },
  {
    id: '369', name: 'The 369 Method', emoji: '③', duration: '5 min', desc: 'Write 3× morning, 6× noon, 9× night.',
    tone: 'clay' as const, bg: 'linear-gradient(180deg, #F4EFE5 0%, #F2E1CB 100%)',
    when: 'morning · noon · night',
    how: ['Morning: write your wish 3 times', 'Noon: write it 6 times', 'Night: write it 9 times', '33 days straight'],
    tip: 'The rhythm is the point. Skipping breaks the spell.',
  },
  {
    id: '555', name: 'The 555 Method', emoji: '⑤', duration: '12 min', desc: 'One affirmation, 55 times, 5 days.',
    tone: 'plum' as const, bg: 'linear-gradient(180deg, #F4EFE5 0%, #DCD2E0 100%)',
    when: 'daily · 12 min',
    how: ['Pick one affirmation. One only.', 'Write it 55 times', 'Repeat for 5 days straight', 'On day 6, ask what you believe now'],
    tip: "It feels absurd at first. That's how you know it's working.",
  },
  {
    id: 'meditate', name: 'Meditation', emoji: '◯', duration: '10 min', desc: 'Quiet the static.',
    tone: 'sage' as const, bg: 'linear-gradient(180deg, #F4EFE5 0%, #DDE6D0 100%)',
    when: 'midday · 10 min',
    how: ['Set a timer. 10 minutes.', 'Close your eyes — focus on breath', 'Thoughts arrive. Just notice.', 'When timer ends, sit one more breath'],
    tip: "Stillness isn't the goal. Returning to stillness is.",
  },
];

const TECHNIQUE_MAP = Object.fromEntries(TECHNIQUES.map((t) => [t.id, t]));

const toneGradients: Record<string, string> = {
  sage: 'linear-gradient(135deg, #7A9E7E 0%, #5A7D5E 100%)',
  clay: 'linear-gradient(135deg, #DC8551 0%, #B86838 100%)',
  plum: 'linear-gradient(135deg, #9B7AB5 0%, #7B5A95 100%)',
};

export const TutorialScreen: React.FC = () => {
  const { goto, techniques } = useAppStore();
  const [lessonIndex, setLessonIndex] = useState(0);

  const tutorialKeys = techniques.filter((t) => TECHNIQUE_MAP[t]);
  const lessonKeys = tutorialKeys.length > 0 ? tutorialKeys : ['viz'];
  const currentKey = lessonKeys[lessonIndex];
  const technique = TECHNIQUE_MAP[currentKey] || TECHNIQUES[0];
  const total = lessonKeys.length;
  const isLast = lessonIndex >= total - 1;
  const nextTechnique = !isLast ? TECHNIQUE_MAP[lessonKeys[lessonIndex + 1]] : null;

  const handleNext = () => {
    if (!isLast) {
      setLessonIndex(lessonIndex + 1);
    } else {
      goto('home');
    }
  };

  const glyphGradient = toneGradients[technique.tone] || toneGradients.sage;

  return (
    <DLScreen
      scroll
      pad={false}
      style={{
        background: technique.bg,
        paddingBottom: 40,
        transition: 'background 0.6s ease',
      }}
    >
      {/* Progress bars */}
      <div style={{ display: 'flex', gap: 4, padding: '20px 20px 0' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 999,
              background: i <= lessonIndex
                ? glyphGradient
                : 'rgba(33,31,26,0.15)',
              transition: 'all 0.4s ease',
            }}
          />
        ))}
      </div>

      {/* Lesson label */}
      <div style={{ padding: '14px 20px 0' }}>
        <DLLabel style={{ color: 'rgba(33,31,26,0.55)', letterSpacing: '0.10em' }}>
          Lesson {lessonIndex + 1} of {total} · {technique.when}
        </DLLabel>
      </div>

      {/* Hero: emoji + heading */}
      <div style={{ padding: '22px 20px 0' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: glyphGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            color: '#fff',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {technique.emoji}
        </div>
        <DLLabel style={{ color: 'rgba(33,31,26,0.5)', marginBottom: 6, display: 'block' }}>
          how to do
        </DLLabel>
        <DLDisplay size="sm" italic style={{ color: '#211F1A', lineHeight: 1.1 }}>
          {technique.name}
        </DLDisplay>
        <p
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'rgba(33,31,26,0.6)',
            marginTop: 6,
            marginBottom: 0,
            lineHeight: 1.5,
          }}
        >
          {technique.desc}
        </p>
      </div>

      {/* Steps */}
      <div style={{ padding: '24px 20px 0' }}>
        <DLLabel style={{ color: 'rgba(33,31,26,0.5)', marginBottom: 14, display: 'block' }}>
          The practice
        </DLLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {technique.how.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  background: glyphGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 11,
                  fontFamily: 'var(--mono)',
                  fontWeight: 600,
                  flexShrink: 0,
                  marginTop: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {i + 1}
              </div>
              <p
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 15,
                  color: '#211F1A',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Aura tip card */}
      <div style={{ padding: '22px 20px 0' }}>
        <div
          style={{
            borderRadius: 22,
            background: '#211F1A',
            padding: '18px 18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <DLAura size={44} glow={false} />
            <div style={{ flex: 1 }}>
              <DLLabel style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 8, display: 'block' }}>
                Aura says ✦
              </DLLabel>
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                "{technique.tip}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '24px 20px 0' }}>
        <DLButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleNext}
          style={{ background: glyphGradient }}
        >
          {isLast
            ? "I'm ready. Let me in →"
            : `Next: ${nextTechnique?.name} →`}
        </DLButton>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => goto('home')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
              fontSize: 13,
              color: 'rgba(33,31,26,0.45)',
              letterSpacing: '0.01em',
            }}
          >
            Skip — I'll learn as I go
          </button>
        </div>
      </div>
    </DLScreen>
  );
};
