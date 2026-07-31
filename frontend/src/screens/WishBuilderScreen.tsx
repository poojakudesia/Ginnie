import React, { useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLInput } from '../components/DLInput';
import { DLChip } from '../components/DLChip';
import { DLCard } from '../components/DLCard';
import { DLLabel } from '../components/DLLabel';
import { DLAura } from '../components/DLAura';
import { DLDisplay } from '../components/DLDisplay';
import { useAppStore } from '../store/app';
import { Wish } from '../types';
import { looksLikeGibberish, analyzeWish } from '../lib/wishAnalysis';
import { createWish } from '../api/wishes';

const CATEGORIES = ['Career', 'Love', 'Health', 'Wealth', 'Travel', 'Purpose'];
const PROGRESS = ['Not started', 'In progress', 'Close'];
const TIMELINES = ['3m', '6m', '1y', '3y'];

export const WishBuilderScreen: React.FC = () => {
  const { goto, addWish, wishes, techniques } = useAppStore();
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('');
  const [why, setWhy] = useState('');
  const [progress, setProgress] = useState(0);
  const [timeline, setTimeline] = useState('');
  const [goalTouched, setGoalTouched] = useState(false);
  const [whyTouched, setWhyTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  // Only wishes still being pursued count toward the cap of 3.
  const activeCount = wishes.filter((w) => !w.is_manifested).length;
  const wishIndex = activeCount;

  // Validation: real, readable text (not random/gibberish) for goal + why
  const isGibberish = goal.trim().length > 0 && looksLikeGibberish(goal);
  const goalError = goalTouched && isGibberish
    ? 'Please write a real goal in a few words — that doesn’t look like one yet.'
    : '';
  const whyGibberish = why.trim().length > 0 && looksLikeGibberish(why);
  const whyError = whyTouched && whyGibberish
    ? 'Tell us in a few real words why this matters.'
    : '';

  // Ginnie's Insight — only once we have a genuine goal + category + timeline
  const analysis =
    !isGibberish && goal.trim().length > 6 && category && timeline
      ? analyzeWish(goal, category, timeline)
      : null;

  const canContinue = !!(goal && category && why && timeline) && !isGibberish && !whyGibberish && !saving;
  // Room for more after saving this one? (cap of 3 active wishes)
  const canAddAnother = activeCount < 2;

  const buildWish = (): Wish => ({
    id: Date.now().toString(),
    title: goal,
    category,
    why,
    progress_label: PROGRESS[progress],
    timeline,
    pct_complete: progress === 2 ? 75 : progress === 1 ? 40 : 5,
    is_manifested: false,
    created_at: new Date().toISOString(),
  });

  // Persist the wish to the user's profile (backend), then to the local store.
  // Falls back to a local-only wish if the network call fails.
  const saveWish = async (): Promise<void> => {
    const local = buildWish();
    setSaving(true);
    try {
      const server = await createWish({
        title: local.title,
        category: local.category,
        why: local.why,
        progress_label: local.progress_label,
        timeline: local.timeline,
      });
      addWish(server);
    } catch {
      addWish(local);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setGoal('');
    setCategory('');
    setWhy('');
    setProgress(0);
    setTimeline('');
  };

  const handleContinue = async () => {
    await saveWish();
    // Adding a wish after onboarding (already practicing) returns to the
    // tracker; during onboarding it proceeds to the wishes summary.
    goto(techniques.length > 0 ? 'tracker' : 'wishes');
  };

  const handleAddAnother = async () => {
    await saveWish();
    resetForm();
    // Bring the freshly blank form back into view
    const scroller = document.querySelector('[data-dl-screen-scroll]');
    if (scroller) scroller.scrollTop = 0;
    else window.scrollTo(0, 0);
  };

  return (
    <DLScreen scroll pad style={{ paddingTop: 20 }}>
      {/* Progress bars */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 999,
              background: i <= wishIndex
                ? 'linear-gradient(90deg, var(--btn), var(--btn-deep))'
                : 'var(--line)',
            }}
          />
        ))}
      </div>

      <DLLabel style={{ color: 'var(--btn)', marginBottom: 4 }}>
        Wish {wishIndex + 1} of 3
      </DLLabel>
      <DLDisplay size="sm" style={{ marginBottom: 20 }}>
        What do you want to<br />
        <span style={{ fontStyle: 'italic' }}>manifest?</span>
      </DLDisplay>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <DLInput
            label="Your goal"
            value={goal}
            onChange={setGoal}
            onBlur={() => setGoalTouched(true)}
            error={goalError}
            placeholder="e.g. Land my dream job at a creative agency"
            multiline
            rows={2}
          />
        </div>

        <div>
          <DLLabel style={{ marginBottom: 8, display: 'block' }}>Category</DLLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((c) => (
              <DLChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </DLChip>
            ))}
          </div>
        </div>

        <DLInput
          label="Why does this matter to you?"
          value={why}
          onChange={setWhy}
          onBlur={() => setWhyTouched(true)}
          error={whyError}
          placeholder="Because I want to feel financially free and..."
          multiline
          rows={3}
        />

        <div>
          <DLLabel style={{ marginBottom: 8, display: 'block' }}>Where are you now?</DLLabel>
          <div style={{ display: 'flex', gap: 10 }}>
            {PROGRESS.map((p, i) => (
              <button
                key={p}
                onClick={() => setProgress(i)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 12,
                  background: progress === i ? 'var(--accent-soft)' : 'var(--card)',
                  border: progress === i ? '1.5px solid var(--btn)' : '1.5px solid var(--line)',
                  fontFamily: 'var(--sans)',
                  fontSize: 12,
                  color: progress === i ? 'var(--btn)' : 'var(--muted)',
                  cursor: 'pointer',
                  fontWeight: progress === i ? 500 : 400,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <DLLabel style={{ marginBottom: 8, display: 'block' }}>Timeline</DLLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            {TIMELINES.map((t) => (
              <DLChip key={t} active={timeline === t} onClick={() => setTimeline(t)}>
                {t}
              </DLChip>
            ))}
          </div>
        </div>

        {/* Ginnie's Insight — feasibility-aware */}
        {analysis && (
          <DLCard
            tone={analysis.verdict === 'rethink' ? 'clay' : 'plum'}
            style={{ animation: 'dlFadeUp 0.4s ease' }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <DLAura size={36} glow={false} />
              <div>
                <DLLabel
                  style={{
                    color: analysis.verdict === 'rethink' ? '#B5701F' : 'var(--btn)',
                    marginBottom: 4,
                    display: 'block',
                  }}
                >
                  {analysis.verdict === 'rethink' ? "Ginnie's Insight · let's rethink" : "Ginnie's Insight ✦"}
                </DLLabel>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.55, margin: 0 }}>
                  {analysis.message}
                </p>
              </div>
            </div>
          </DLCard>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, marginBottom: 32 }}>
        <DLButton variant="primary" size="lg" fullWidth disabled={!canContinue} onClick={handleContinue}>
          Continue →
        </DLButton>
        {canAddAnother && (
          <DLButton variant="ghost" size="md" fullWidth disabled={!canContinue} onClick={handleAddAnother}>
            + Add another wish
          </DLButton>
        )}
      </div>
    </DLScreen>
  );
};
