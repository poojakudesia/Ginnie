import React, { useRef, useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { DLCard } from '../components/DLCard';
import { DLAura } from '../components/DLAura';
import { useAppStore } from '../store/app';
import { APP_KIND, APP_VIDEOS } from '../lib/methodCatalog';
import { refineAffirmation } from '../api/methods';

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

  // Per-lesson practice capture (write + Aura refine, or file upload)
  const [draft, setDraft] = useState('');
  const [refined, setRefined] = useState<{ text: string; tips: string[]; changed: boolean } | null>(null);
  const [refining, setRefining] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const tutorialKeys = techniques.filter((t) => TECHNIQUE_MAP[t]);
  const lessonKeys = tutorialKeys.length > 0 ? tutorialKeys : ['viz'];
  const currentKey = lessonKeys[lessonIndex];
  const technique = TECHNIQUE_MAP[currentKey] || TECHNIQUES[0];
  const total = lessonKeys.length;
  const isLast = lessonIndex >= total - 1;
  const nextTechnique = !isLast ? TECHNIQUE_MAP[lessonKeys[lessonIndex + 1]] : null;

  const kind = APP_KIND[currentKey] ?? 'text';
  const videos = APP_VIDEOS[currentKey] ?? [];

  const resetCapture = () => {
    setDraft('');
    setRefined(null);
    setRefining(false);
    setUploadName('');
  };

  const handleRefine = async () => {
    if (!draft.trim() || refining) return;
    setRefining(true);
    try {
      const res = await refineAffirmation(draft.trim(), currentKey);
      setRefined({ text: res.refined, tips: res.tips, changed: res.changed });
    } catch {
      setRefined({ text: draft.trim(), tips: ['Aura is resting — keep your words for now ✦'], changed: false });
    } finally {
      setRefining(false);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      setLessonIndex(lessonIndex + 1);
      resetCapture();
    } else {
      goto('plan');
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

      {/* Watch & learn — YouTube explainers */}
      {videos.length > 0 && (
        <div style={{ padding: '22px 20px 0' }}>
          <DLLabel style={{ color: 'rgba(33,31,26,0.5)', marginBottom: 12, display: 'block' }}>
            Watch & learn ▸
          </DLLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {videos.map((v) => (
              <a
                key={v.url}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(33,31,26,0.10)',
                  borderRadius: 14,
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: '#FF0000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: '#fff', fontSize: 15, marginLeft: 2 }}>▶</span>
                </div>
                <span style={{ flex: 1, fontFamily: 'var(--sans)', fontSize: 13.5, color: '#211F1A', lineHeight: 1.35 }}>
                  {v.title}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(33,31,26,0.45)' }}>YT ↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Practice it now — write + Aura refine (text) OR upload (media) */}
      <div style={{ padding: '22px 20px 0' }}>
        <DLLabel style={{ color: 'rgba(33,31,26,0.5)', marginBottom: 12, display: 'block' }}>
          {kind === 'text' ? 'Try it now — write your line' : 'Try it now — add your file'}
        </DLLabel>

        {kind === 'text' ? (
          <div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                currentKey === 'gratitude'
                  ? 'e.g. I am grateful for the morning light…'
                  : 'e.g. I am confident, calm, and open to abundance'
              }
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.75)',
                border: '1.5px solid rgba(33,31,26,0.14)',
                borderRadius: 14,
                padding: '13px 15px',
                fontFamily: 'var(--sans)',
                fontSize: 15,
                color: '#211F1A',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleRefine}
              disabled={!draft.trim() || refining}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '12px 18px',
                borderRadius: 999,
                border: 'none',
                background: glyphGradient,
                color: '#fff',
                fontFamily: 'var(--sans)',
                fontSize: 14,
                fontWeight: 600,
                cursor: !draft.trim() || refining ? 'not-allowed' : 'pointer',
                opacity: !draft.trim() || refining ? 0.6 : 1,
              }}
            >
              {refining ? 'Aura is refining…' : '✦ Refine with Aura'}
            </button>

            {refined && (
              <div
                style={{
                  marginTop: 12,
                  background: '#211F1A',
                  borderRadius: 18,
                  padding: 16,
                  animation: 'dlFadeUp 0.35s ease',
                }}
              >
                <DLLabel style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 8, display: 'block' }}>
                  {refined.changed ? "Aura's refined version ✦" : 'Aura says ✦'}
                </DLLabel>
                <p
                  style={{
                    fontFamily: 'var(--serif)',
                    fontStyle: 'italic',
                    fontSize: 17,
                    color: '#fff',
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  "{refined.text || draft.trim()}"
                </p>
                {refined.tips.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {refined.tips.map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: '#C4A96A', fontSize: 12, flexShrink: 0 }}>✓</span>
                        <span style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                          {t}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {refined.changed && refined.text && (
                  <button
                    onClick={() => { setDraft(refined.text); setRefined(null); }}
                    style={{
                      marginTop: 14,
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 999,
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      background: 'transparent',
                      color: '#fff',
                      fontFamily: 'var(--sans)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Use this version →
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,audio/*,video/*"
              onChange={(e) => setUploadName(e.target.files?.[0]?.name ?? '')}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%',
                padding: '22px 18px',
                borderRadius: 16,
                border: '1.5px dashed rgba(33,31,26,0.25)',
                background: 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 26 }}>⬆</span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#211F1A', fontWeight: 500 }}>
                {uploadName || 'Upload your image, audio or video'}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', color: 'rgba(33,31,26,0.45)' }}>
                {uploadName ? 'TAP TO CHANGE' : 'MP4 · MP3 · JPG · PNG'}
              </span>
            </button>
            {uploadName && (
              <p style={{ marginTop: 10, fontFamily: 'var(--sans)', fontSize: 13, color: 'rgba(33,31,26,0.6)', textAlign: 'center' }}>
                ✓ {uploadName} ready for your practice
              </p>
            )}
          </div>
        )}
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
            ? 'Build my plan →'
            : `Next: ${nextTechnique?.name} →`}
        </DLButton>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => goto('plan')}
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
