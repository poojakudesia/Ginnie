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

const CATEGORIES = ['Career', 'Love', 'Health', 'Wealth', 'Travel', 'Purpose'];
const PROGRESS = ['Not started', 'In progress', 'Close'];
const TIMELINES = ['3m', '6m', '1y', '3y'];

interface Props {
  wishIndex?: number;
}

export const WishBuilderScreen: React.FC<Props> = ({ wishIndex = 0 }) => {
  const { goto, addWish, wishes } = useAppStore();
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('');
  const [why, setWhy] = useState('');
  const [progress, setProgress] = useState(0);
  const [timeline, setTimeline] = useState('');

  const showInsight = category && goal.length > 10;
  const canContinue = goal && category && why && timeline;

  const handleContinue = () => {
    const wish: Wish = {
      id: Date.now().toString(),
      title: goal,
      category,
      why,
      progress_label: PROGRESS[progress],
      timeline,
      pct_complete: progress === 2 ? 75 : progress === 1 ? 40 : 5,
      is_manifested: false,
      created_at: new Date().toISOString(),
    };
    addWish(wish);
    goto('wishes-summary');
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
            placeholder="e.g. Land my dream job at a creative agency"
            multiline
            rows={2}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button
              style={{
                background: 'var(--accent-soft)',
                border: 'none',
                borderRadius: 999,
                padding: '6px 14px',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--btn)',
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              🎙 Voice
            </button>
          </div>
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

        {/* Aura insight */}
        {showInsight && (
          <DLCard tone="plum" style={{ animation: 'dlFadeUp 0.4s ease' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <DLAura size={36} glow={false} />
              <div>
                <DLLabel style={{ color: 'var(--btn)', marginBottom: 4, display: 'block' }}>
                  Aura's insight ✦
                </DLLabel>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.55, margin: 0 }}>
                  This is a powerful {category.toLowerCase()} wish. Your energy around this feels strong —
                  let's channel it into daily practice.
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
        {wishes.length < 2 && (
          <DLButton variant="ghost" size="md" fullWidth onClick={handleContinue}>
            + Add another wish
          </DLButton>
        )}
      </div>
    </DLScreen>
  );
};
