import React, { useEffect, useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { DLAura } from '../components/DLAura';
import { useAppStore } from '../store/app';
import { METHODS, methodById, EFFORT_TONE, Method } from '../lib/methodCatalog';
import { topScored, fallbackReason, MethodQuizAnswers } from '../lib/methodMatch';
import { recommendMethods } from '../api/methods';
import { saveTechniques } from '../api/auth';

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
  const { goto, methodQuiz, setTechniques, setFocusLesson } = useAppStore();
  const answers = methodQuiz ?? DEFAULT_ANSWERS;

  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);

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
      } else {
        // Fallback: top-3 scored with a warm local reason line
        const top3 = topScored(answers, 3);
        setRecs(top3.map((method) => ({ method, reason: fallbackReason(method, answers) })));
      }
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adopt = (lead?: Method) => {
    const ids = Array.from(
      new Set([
        ...(lead ? [lead.appId] : []),
        ...recs.map((r) => r.method.appId),
      ]),
    );
    setTechniques(ids);
    saveTechniques(ids); // persist to profile → "started practice" on next login
    setFocusLesson(null);
    return ids;
  };

  // "See tutorial" — adopt the practices and walk through the lessons
  const startPractice = (method: Method) => {
    adopt(method);
    goto('tutorial');
  };

  // "I'm good — let's start" — adopt the practices and skip to the plan
  const letsStart = () => {
    adopt();
    goto('plan');
  };

  const applySwap = (method: Method) => {
    if (swapIndex === null) return;
    setRecs((prev) =>
      prev.map((r, i) =>
        i === swapIndex ? { method, reason: fallbackReason(method, answers) } : r,
      ),
    );
    setSwapIndex(null);
  };

  // Methods available to swap in (everything not already chosen)
  const chosenIds = new Set(recs.map((r) => r.method.id));
  const swapOptions = METHODS.filter((m) => !chosenIds.has(m.id));

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
        <DLLabel style={{ color: 'var(--btn)' }}>Our Match ✦</DLLabel>
        <DLDisplay size="md" style={{ marginTop: 10, marginBottom: 10, lineHeight: 1.05 }}>
          Your practices,<br />
          <span style={{ fontStyle: 'italic' }}>chosen for you.</span>
        </DLDisplay>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.55 }}>
          Ginnie reads your energy to match you with the perfect manifestation
          technique. No wasted effort, just faster alignments.
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

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => startPractice(method)}
                    style={{
                      flex: 1,
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
                    See tutorial →
                  </button>
                  <button
                    onClick={() => setSwapIndex(i)}
                    aria-label="Swap this practice"
                    style={{
                      flexShrink: 0,
                      padding: '13px 16px',
                      borderRadius: 999,
                      border: `1.5px solid ${tone.text}`,
                      background: 'transparent',
                      color: tone.text,
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                    }}
                  >
                    ⇄ Swap
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ready to go — skip the tutorials and begin */}
        <button
          onClick={letsStart}
          style={{
            width: '100%',
            marginBottom: 36,
            padding: '16px 20px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, var(--btn), var(--btn-deep))',
            color: 'var(--btn-text)',
            fontFamily: 'var(--sans)',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 10px 24px rgba(124,55,99,0.28)',
          }}
        >
          I'm good with these — let's start ✦
        </button>
        <p style={{ textAlign: 'center', fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--muted)', marginTop: -24, marginBottom: 28 }}>
          Tap “See tutorial” on any card to learn it first.
        </p>
      </div>

      {/* Swap overlay — pick from all other practices */}
      {swapIndex !== null && (
        <div
          onClick={() => setSwapIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxHeight: '80%',
              overflowY: 'auto',
              background: 'var(--paper)',
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              padding: '20px 20px 28px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
              animation: 'dlFadeUp 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <DLLabel style={{ color: 'var(--btn)' }}>Swap practice</DLLabel>
              <button
                onClick={() => setSwapIndex(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted)', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', margin: '0 0 16px' }}>
              Choose any other practice to take this slot.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {swapOptions.map((m) => {
                const t = EFFORT_TONE[m.effort];
                return (
                  <button
                    key={m.id}
                    onClick={() => applySwap(m)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      textAlign: 'left',
                      width: '100%',
                      padding: 12,
                      borderRadius: 16,
                      border: '1.5px solid var(--line)',
                      background: 'var(--card)',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: t.bg,
                        color: t.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {m.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>
                        {m.name}
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--muted)', marginTop: 2 }}>
                        {t.label} · {m.effort.toUpperCase()} EFFORT
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--btn)' }}>Pick →</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DLScreen>
  );
};
