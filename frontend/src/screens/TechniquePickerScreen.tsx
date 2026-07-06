import React, { useEffect, useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { DLAura } from '../components/DLAura';
import { useAppStore } from '../store/app';
import { methodById, EFFORT_TONE, Method } from '../lib/methodCatalog';
import { topScored, fallbackReason, MethodQuizAnswers } from '../lib/methodMatch';
import { recommendMethods } from '../api/methods';

interface Recommendation {
  method: Method;
  reason: string;
}

// Safe default so the screen still works if the user somehow lands here
// without having taken the quiz.
const DEFAULT_ANSWERS: MethodQuizAnswers = {
  modality: 'visual',
  habitStyle: 'micro',
  blocker: 'consistency',
  mindOpen: 'morning',
  mentalState: 'not_ready',
};

export const TechniquePickerScreen: React.FC = () => {
  const { goto, methodQuiz, setTechniques } = useAppStore();
  const answers = methodQuiz ?? DEFAULT_ANSWERS;

  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [usedAI, setUsedAI] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const top5 = topScored(answers, 5);
      const aiRecs = await recommendMethods(answers, top5);

      if (cancelled) return;

      // Use AI recommendations when we got at least 3 valid, known methods
      const mapped: Recommendation[] = [];
      for (const r of aiRecs) {
        const method = methodById(r.id);
        if (method && !mapped.some((m) => m.method.id === method.id)) {
          mapped.push({ method, reason: r.reason });
        }
      }

      if (mapped.length >= 3) {
        setRecs(mapped.slice(0, 3));
        setUsedAI(true);
      } else {
        // Fallback: top-3 scored with a warm local reason line
        const top3 = topScored(answers, 3);
        setRecs(top3.map((method) => ({ method, reason: fallbackReason(method, answers) })));
        setUsedAI(false);
      }
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPractice = (method: Method) => {
    // Adopt all three recommended practices, lead with the chosen one
    const ids = [method.appId, ...recs.map((r) => r.method.appId).filter((id) => id !== method.appId)];
    setTechniques(Array.from(new Set(ids)));
    goto('tutorial');
  };

  if (loading) {
    return (
      <DLScreen pad>
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            textAlign: 'center',
          }}
        >
          <DLAura size={92} glow rings />
          <div>
            <DLDisplay size="sm" center>
              Matching your<br />
              <span style={{ fontStyle: 'italic' }}>practice…</span>
            </DLDisplay>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>
              Ginnie is reading your answers ✦
            </p>
          </div>
        </div>
      </DLScreen>
    );
  }

  return (
    <DLScreen scroll pad>
      <div style={{ paddingTop: 20 }}>
        <DLLabel style={{ color: 'var(--btn)' }}>
          {usedAI ? 'Ginnie’s match ✦' : 'Your match ✦'}
        </DLLabel>
        <DLDisplay size="sm" style={{ marginTop: 10, marginBottom: 6 }}>
          Your practices,<br />
          <span style={{ fontStyle: 'italic' }}>chosen for you.</span>
        </DLDisplay>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
          Three methods matched to how you dream, build habits, and where you get stuck.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {recs.map(({ method, reason }, i) => {
            const tone = EFFORT_TONE[method.effort];
            return (
              <div
                key={method.id}
                style={{
                  background: tone.bg,
                  borderRadius: 22,
                  padding: 18,
                  animation: `dlFadeUp 0.4s ease ${i * 0.08}s both`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.55)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      flexShrink: 0,
                      color: tone.text,
                    }}
                  >
                    {method.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 9,
                        letterSpacing: '0.12em',
                        color: tone.text,
                        opacity: 0.7,
                        marginBottom: 3,
                      }}
                    >
                      {tone.label} · {method.effort.toUpperCase()} EFFORT
                    </div>
                    <div style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 16, color: tone.text, lineHeight: 1.2 }}>
                      {method.name}
                    </div>
                  </div>
                </div>

                {/* Ginnie's reason */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, flexShrink: 0, color: tone.text, opacity: 0.8 }}>✦</span>
                  <p
                    style={{
                      fontFamily: 'var(--serif)',
                      fontStyle: 'italic',
                      fontSize: 15,
                      lineHeight: 1.4,
                      color: tone.text,
                      margin: 0,
                    }}
                  >
                    {reason}
                  </p>
                </div>

                <button
                  onClick={() => startPractice(method)}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: 999,
                    border: 'none',
                    background: tone.text,
                    color: tone.bg,
                    fontFamily: 'var(--sans)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Start this practice →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </DLScreen>
  );
};
