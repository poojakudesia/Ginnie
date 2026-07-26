import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { DLScreen } from '../components/DLScreen';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { useAppStore } from '../store/app';
import { practiceMeta, PRACTICE_META } from '../lib/practices';
import { saveTechniques } from '../api/auth';

// Short "what it is" line per practice for the list
const BLURB: Record<string, string> = {
  viz: 'See it before you see it.',
  affirm: 'Speak it true, out loud.',
  movie: 'Your wish as a 60-second film.',
  script: 'Write tomorrow in present tense.',
  gratitude: 'Receipts before requests.',
  '369': 'Write it 3×, 6×, then 9× a day.',
  '555': 'One line, 55 times, for 5 days.',
  meditate: 'Drop in and receive.',
};

const ALL_IDS = Object.keys(PRACTICE_META);

export const LessonsScreen: React.FC = () => {
  const { goto, techniques, setTechniques, setFocusLesson } = useAppStore();
  const practiceIds = techniques.length > 0 ? techniques : ['viz', 'affirm', 'gratitude'];

  const [managing, setManaging] = useState(false);
  // { mode: 'swap', index } or { mode: 'add' } — drives the picker sheet
  const [picker, setPicker] = useState<{ mode: 'swap' | 'add'; index?: number } | null>(null);

  const persist = (ids: string[]) => {
    setTechniques(ids);
    saveTechniques(ids);
  };

  const openLesson = (appId: string) => {
    setFocusLesson(appId);
    goto('tutorial');
  };

  const removePractice = (id: string) => {
    if (practiceIds.length <= 1) { toast.error('Keep at least one practice ✦'); return; }
    persist(practiceIds.filter((p) => p !== id));
  };

  const applyPick = (id: string) => {
    if (!picker) return;
    if (picker.mode === 'add') {
      persist([...practiceIds, id]);
    } else if (picker.mode === 'swap' && picker.index != null) {
      persist(practiceIds.map((p, i) => (i === picker.index ? id : p)));
    }
    setPicker(null);
    toast.success('Practice updated ✦');
  };

  const available = ALL_IDS.filter((id) => !practiceIds.includes(id));

  return (
    <DLScreen scroll pad={false}>
      <div style={{ padding: '20px 22px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <DLLabel style={{ color: 'var(--btn)' }}>Your guide ❖</DLLabel>
          <button
            onClick={() => setManaging((m) => !m)}
            style={{
              background: managing ? 'var(--btn)' : 'var(--accent-soft)',
              color: managing ? 'var(--btn-text)' : 'var(--btn)',
              border: 'none', borderRadius: 999, padding: '6px 13px', cursor: 'pointer',
              fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.05em', textTransform: 'uppercase',
            }}
          >
            {managing ? 'Done' : '⇄ Change'}
          </button>
        </div>
        <DLDisplay size="md" style={{ marginTop: 8, lineHeight: 1.05 }}>
          {managing ? (<>Manage your<br /><span style={{ fontStyle: 'italic' }}>practices.</span></>)
                    : (<>How to do<br /><span style={{ fontStyle: 'italic' }}>each practice.</span></>)}
        </DLDisplay>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', margin: '10px 0 4px', lineHeight: 1.5 }}>
          {managing
            ? 'Swap, add, or remove practices anytime — your plan stays yours.'
            : 'Tap any practice to revisit the steps, videos, and tips anytime.'}
        </p>
      </div>

      <div style={{ padding: '12px 22px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {practiceIds.map((id, i) => {
          const meta = practiceMeta(id);
          return (
            <div
              key={id}
              onClick={() => !managing && openLesson(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                cursor: managing ? 'default' : 'pointer',
                background: 'var(--card)', border: '1px solid var(--line)',
                borderRadius: 18, padding: 16,
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                background: meta.tone, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
              }}>
                {meta.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                  {meta.name}
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>
                  {BLURB[id] || 'A practice for your daily rhythm.'}
                </div>
              </div>

              {managing ? (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPicker({ mode: 'swap', index: i }); }}
                    style={{ background: 'var(--accent-soft)', border: 'none', borderRadius: 999, padding: '7px 10px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--btn)' }}
                  >
                    ⇄
                  </button>
                  {practiceIds.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removePractice(id); }}
                      aria-label="Remove practice"
                      style={{ background: 'transparent', border: '1.5px solid var(--line-strong)', borderRadius: 999, padding: '6px 10px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ) : (
                <span style={{ fontFamily: 'var(--mono)', fontSize: 15, color: 'var(--muted)', flexShrink: 0 }}>›</span>
              )}
            </div>
          );
        })}

        {/* Add a practice (manage mode) */}
        {managing && available.length > 0 && (
          <button
            onClick={() => setPicker({ mode: 'add' })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              borderRadius: 18, border: '1.5px dashed var(--line-strong)', background: 'transparent',
              padding: '18px', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--btn)', fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 17 }}>＋</span> Add a practice
          </button>
        )}
      </div>

      {/* Picker sheet */}
      {picker && (
        <div onClick={() => setPicker(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxHeight: '80%', overflowY: 'auto', background: 'var(--paper)', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: '20px 20px 28px', boxShadow: '0 -10px 40px rgba(0,0,0,0.25)', animation: 'dlFadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <DLLabel style={{ color: 'var(--btn)' }}>{picker.mode === 'add' ? 'Add a practice' : 'Swap to'}</DLLabel>
              <button onClick={() => setPicker(null)} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--muted)', cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', margin: '0 0 16px' }}>
              Pick a practice that fits how you like to show up.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {available.map((id) => {
                const meta = practiceMeta(id);
                return (
                  <button
                    key={id}
                    onClick={() => applyPick(id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: 12, borderRadius: 16, border: '1.5px solid var(--line)', background: 'var(--card)', cursor: 'pointer' }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: meta.tone, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{meta.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{meta.name}</div>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--muted)', marginTop: 1 }}>{BLURB[id]}</div>
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
