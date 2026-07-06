import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLDisplay } from '../components/DLDisplay';
import { DLLabel } from '../components/DLLabel';
import { useAppStore } from '../store/app';
import { useTrackerStore } from '../store/tracker';
import { practiceMeta, MOODS } from '../lib/practices';
import { badgeForRate } from '../lib/badges';
import { pendingReviewWish, timelineLabel } from '../lib/wishTimeline';
import { updateWish } from '../api/wishes';

const DAYS_SHOWN = 14;
const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const TrackerScreen: React.FC = () => {
  const { goto, techniques, wishes, manifestWish } = useAppStore();
  const { days, toggleCheck, setProof, setMood, earnedBadge, setBadge, lastEnergyCheck, reviewedWishes, markReviewed } =
    useTrackerStore();

  const practiceIds = techniques.length > 0 ? techniques : ['viz', 'affirm', 'gratitude'];

  // A wish whose timeline has elapsed and hasn't been reviewed yet
  const pending = pendingReviewWish(wishes, reviewedWishes);
  const [celebrated, setCelebrated] = useState<{ title: string } | null>(null);
  const activeWishes = wishes.filter((w) => !w.is_manifested).length;

  const reviewAchieved = (achieved: boolean) => {
    if (!pending) return;
    markReviewed(pending.id);
    if (achieved) {
      manifestWish(pending.id);
      updateWish(pending.id, { is_manifested: true, pct_complete: 100 }).catch(() => {});
      setCelebrated({ title: pending.title });
    }
  };

  // Build the last N days (newest first). Runtime browser code — new Date() is fine.
  const dayList = useMemo(() => {
    const out: { key: string; date: Date; isToday: boolean; isPast: boolean }[] = [];
    const today = new Date();
    const todayKey = dayKey(today);
    for (let i = 0; i < DAYS_SHOWN; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = dayKey(d);
      out.push({ key, date: d, isToday: key === todayKey, isPast: key < todayKey });
    }
    return out;
  }, []);

  // In-memory proof previews (object URLs) keyed by `${dayKey}:${appId}`
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});
  const fileInput = useRef<{ date: string; appId: string } | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const countDone = (key: string) =>
    practiceIds.filter((id) => days[key]?.checks[id]?.done).length;

  // Weekly consistency rate over the last 7 elapsed days (today + 6 past)
  const weekRate = useMemo(() => {
    const week = dayList.slice(0, 7);
    const possible = week.length * practiceIds.length;
    if (possible === 0) return 0;
    let done = 0;
    week.forEach((d) => (done += countDone(d.key)));
    return done / possible;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, dayList, practiceIds.length]);

  const badge = badgeForRate(weekRate);

  // Track total completed practice-instances to know if a full week is "done"
  const totalDone = useMemo(
    () => dayList.reduce((n, d) => n + countDone(d.key), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [days, dayList],
  );

  // Once the user has logged a meaningful week (>= 7 completions), lock in the badge
  useEffect(() => {
    if (totalDone >= 7 && earnedBadge !== badge.id) {
      setBadge(badge.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalDone, badge.id]);

  const openProofPicker = (date: string, appId: string) => {
    fileInput.current = { date, appId };
    hiddenInputRef.current?.click();
  };

  const onProofSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = fileInput.current;
    if (!file || !target) return;
    const url = URL.createObjectURL(file);
    setProofUrls((p) => ({ ...p, [`${target.date}:${target.appId}`]: url }));
    setProof(target.date, target.appId, file.name);
    e.target.value = '';
  };

  const dayStatus = (key: string, isPast: boolean, isToday: boolean) => {
    const done = countDone(key);
    const total = practiceIds.length;
    if (total > 0 && done === total) return { icon: '⭐', tint: '#E0A93C' };      // all → star
    if (done > 0) return { icon: '◐', tint: '#9B7AB5' };                            // missed one → partial
    if (isPast) return { icon: '🥀', tint: '#B85C5C' };                            // missed all → not consistent
    return { icon: isToday ? '•' : '○', tint: 'var(--muted)' };                    // today / future-neutral
  };

  const energyCheckReady =
    !lastEnergyCheck || dayList.some((d) => d.isPast && d.key > lastEnergyCheck && totalDone >= 7);

  return (
    <DLScreen scroll pad={false}>
      <input
        ref={hiddenInputRef}
        type="file"
        accept="image/*"
        onChange={onProofSelected}
        style={{ display: 'none' }}
      />

      <div style={{ padding: '18px 20px 10px' }}>
        <DLLabel style={{ color: 'var(--btn)' }}>Your practice ✦</DLLabel>
        <DLDisplay size="md" style={{ marginTop: 8, lineHeight: 1.05 }}>
          Show up,<br />
          <span style={{ fontStyle: 'italic' }}>day by day.</span>
        </DLDisplay>

        {/* Badge / standing card */}
        <div
          style={{
            marginTop: 16,
            borderRadius: 20,
            background: badge.gradient,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 65%)' }} />
          <div
            style={{
              width: 54, height: 54, borderRadius: 16, flexShrink: 0,
              background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}
          >
            {badge.emoji}
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.14em', opacity: 0.8 }}>
              THIS WEEK · {Math.round(weekRate * 100)}% CONSISTENT
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontStyle: 'italic', lineHeight: 1.1, marginTop: 2 }}>
              {badge.name}
            </div>
          </div>
        </div>

        {/* Weekly Energy Check banner */}
        <button
          onClick={() => goto('energy-check')}
          style={{
            marginTop: 12, width: '100%', textAlign: 'left',
            borderRadius: 16, padding: '13px 16px', cursor: 'pointer',
            border: energyCheckReady ? 'none' : '1.5px solid var(--line)',
            background: energyCheckReady ? 'var(--ink)' : 'var(--card)',
            color: energyCheckReady ? 'var(--paper)' : 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600 }}>
                Weekly Energy Check
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: 0.7, letterSpacing: '0.04em' }}>
                {energyCheckReady ? 'Ready — see where you are' : 'Keep going, check in weekly'}
              </div>
            </div>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>→</span>
        </button>
      </div>

      {/* Day timeline */}
      <div style={{ padding: '10px 20px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {dayList.map(({ key, date, isToday, isPast }) => {
          const rec = days[key];
          const done = countDone(key);
          const total = practiceIds.length;
          const allDone = total > 0 && done === total;
          const status = dayStatus(key, isPast, isToday);
          const locked = false; // all shown days are today-or-past → editable

          return (
            <div
              key={key}
              style={{
                borderRadius: 20,
                background: 'var(--card)',
                border: `1px solid ${isToday ? 'var(--btn)' : 'var(--line)'}`,
                boxShadow: isToday ? '0 8px 24px rgba(124,55,99,0.12)' : 'none',
                overflow: 'hidden',
              }}
            >
              {/* Day header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic', color: 'var(--ink)' }}>
                    {isToday ? 'Today' : WEEKDAY[date.getDay()]}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--muted)' }}>
                    {MONTH[date.getMonth()]} {date.getDate()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                    {done}/{total}
                  </span>
                  <span style={{ fontSize: 18, color: status.tint }}>{status.icon}</span>
                </div>
              </div>

              {/* Practice checkboxes */}
              <div style={{ padding: '0 16px 6px' }}>
                {practiceIds.map((id) => {
                  const meta = practiceMeta(id);
                  const check = rec?.checks[id];
                  const isDone = !!check?.done;
                  const proofUrl = proofUrls[`${key}:${id}`];
                  return (
                    <div key={id} style={{ borderTop: '1px solid var(--line)', padding: '11px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                          onClick={() => toggleCheck(key, id)}
                          disabled={locked}
                          aria-label={`Toggle ${meta.name}`}
                          style={{
                            width: 26, height: 26, borderRadius: 8, flexShrink: 0, cursor: 'pointer',
                            border: isDone ? 'none' : '1.8px solid var(--line-strong)',
                            background: isDone ? meta.tone : 'transparent',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, transition: 'all 0.15s',
                          }}
                        >
                          {isDone ? '✓' : ''}
                        </button>
                        <span style={{ fontSize: 17, width: 22, textAlign: 'center', flexShrink: 0 }}>{meta.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'var(--sans)', fontSize: 14.5,
                            color: isDone ? 'var(--muted)' : 'var(--ink)',
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}>
                            {meta.name}
                          </div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>
                            {meta.clock}
                          </div>
                        </div>

                        {/* Optional proof */}
                        {isDone && (
                          proofUrl ? (
                            <img
                              src={proofUrl}
                              alt="proof"
                              style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--line)' }}
                            />
                          ) : check?.proofName ? (
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', flexShrink: 0 }}>✓ proof</span>
                          ) : (
                            <button
                              onClick={() => openProofPicker(key, id)}
                              style={{
                                flexShrink: 0, cursor: 'pointer',
                                background: 'var(--accent-soft)', border: 'none', borderRadius: 999,
                                padding: '6px 11px', fontFamily: 'var(--mono)', fontSize: 9.5,
                                letterSpacing: '0.04em', color: 'var(--btn)',
                              }}
                            >
                              ＋ proof
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mood prompt when the whole day is complete */}
              {allDone && (
                <div style={{ borderTop: '1px solid var(--line)', padding: '12px 16px 14px', background: 'var(--accent-soft)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--btn)', marginBottom: 10, textTransform: 'uppercase' }}>
                    {rec?.mood ? 'You felt' : 'How are you feeling?'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {MOODS.map((m) => {
                      const on = rec?.mood === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setMood(key, m.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                            padding: '7px 12px', borderRadius: 999,
                            border: on ? 'none' : '1.5px solid var(--line-strong)',
                            background: on ? 'var(--btn)' : 'var(--card)',
                            color: on ? 'var(--btn-text)' : 'var(--ink)',
                            fontFamily: 'var(--sans)', fontSize: 13,
                          }}
                        >
                          <span>{m.emoji}</span>
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Wish completion review — timeline reached */}
      {pending && !celebrated && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', padding: 24 }}>
          <div style={{ width: '100%', background: 'var(--paper)', borderRadius: 26, padding: '26px 22px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', animation: 'dlFadeUp 0.35s ease' }}>
            <div style={{ fontSize: 34, textAlign: 'center', marginBottom: 6 }}>🌟</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--btn)', textAlign: 'center', textTransform: 'uppercase' }}>
              {timelineLabel(pending.timeline)} journey complete
            </div>
            <DLDisplay size="sm" center style={{ marginTop: 10, marginBottom: 8 }}>
              Did it <span style={{ fontStyle: 'italic' }}>come true?</span>
            </DLDisplay>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.4, margin: '0 0 20px' }}>
              "{pending.title}"
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => reviewAchieved(true)}
                style={{ width: '100%', padding: '15px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, var(--btn), var(--btn-deep))', color: 'var(--btn-text)', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                Yes — it manifested! 🎉
              </button>
              <button
                onClick={() => reviewAchieved(false)}
                style={{ width: '100%', padding: '14px', borderRadius: 999, border: '1.5px solid var(--line-strong)', background: 'transparent', color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 14, cursor: 'pointer' }}
              >
                Not yet — I'm still becoming
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration + add-another-wish */}
      {celebrated && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', padding: 24 }}>
          <div style={{ width: '100%', background: 'var(--paper)', borderRadius: 26, padding: '28px 22px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', animation: 'dlFadeUp 0.35s ease' }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
            <DLDisplay size="sm" center style={{ marginBottom: 8 }}>
              You <span style={{ fontStyle: 'italic' }}>manifested it.</span>
            </DLDisplay>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 22px' }}>
              "{celebrated.title}" is complete ✦ Your energy created this. {activeWishes < 3 ? 'Ready to call in the next one?' : "You're pursuing the max of 3 wishes right now."}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeWishes < 3 && (
                <button
                  onClick={() => { setCelebrated(null); goto('wish-builder'); }}
                  style={{ width: '100%', padding: '15px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, var(--btn), var(--btn-deep))', color: 'var(--btn-text)', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
                >
                  + Add a new wish
                </button>
              )}
              <button
                onClick={() => setCelebrated(null)}
                style={{ width: '100%', padding: '14px', borderRadius: 999, border: '1.5px solid var(--line-strong)', background: 'transparent', color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 14, cursor: 'pointer' }}
              >
                Keep manifesting
              </button>
            </div>
          </div>
        </div>
      )}
    </DLScreen>
  );
};
