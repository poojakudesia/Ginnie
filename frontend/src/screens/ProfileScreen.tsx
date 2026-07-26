import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { DLScreen } from '../components/DLScreen';
import { DLLabel } from '../components/DLLabel';
import { DLDisplay } from '../components/DLDisplay';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';
import { useTrackerStore } from '../store/tracker';
import { badgeById } from '../lib/badges';
import { changePassword } from '../api/auth';
import { Palette } from '../types';
import { useSettingsStore } from '../store/settings';
import { setReminder } from '../lib/reminders';

const ENERGY_TIER = {
  thriving:  { label: 'Thriving',        emoji: '🌟' },
  flow:      { label: 'In flow',         emoji: '✨' },
  building:  { label: 'Building rhythm', emoji: '🌱' },
  awakening: { label: 'Awakening',       emoji: '🌙' },
} as const;

const THEMES: { id: Palette; label: string; swatch: string }[] = [
  { id: 'petal', label: 'Petal', swatch: '#7C3763' },
  { id: 'sage',  label: 'Sage',  swatch: '#DC8551' },
  { id: 'sand',  label: 'Sand',  swatch: '#A0845C' },
  { id: 'dusk',  label: 'Dusk',  swatch: '#8B5CF6' },
];

// ── Change-password sheet ────────────────────────────────────────────────────
const strong = (v: string) =>
  v.length >= 8 && /[A-Z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);

const ChangePasswordSheet: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!strong(next)) { setError('New password needs 8+ chars, an uppercase, a number, and a symbol.'); return; }
    if (next !== confirm) { setError('New passwords don’t match.'); return; }
    setBusy(true);
    try {
      await changePassword(current, next);
      toast.success('Password updated ✦');
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Could not change password.');
    } finally {
      setBusy(false);
    }
  };

  const field = (label: string, val: string, set: (v: string) => void) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
      <input
        type="password"
        value={val}
        onChange={(e) => set(e.target.value)}
        placeholder="••••••••"
        style={{
          width: '100%', boxSizing: 'border-box', background: 'var(--card)',
          border: '1.5px solid var(--line)', borderRadius: 12, padding: '13px 14px',
          fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', outline: 'none',
        }}
      />
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: 'var(--paper)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '22px 22px 30px', boxShadow: '0 -10px 40px rgba(0,0,0,0.25)', animation: 'dlFadeUp 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <DLDisplay size="sm">Change password</DLDisplay>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--muted)', cursor: 'pointer' }}>×</button>
        </div>
        {field('Current password', current, setCurrent)}
        {field('New password', next, setNext)}
        {field('Confirm new password', confirm, setConfirm)}
        {error && <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#E05252', margin: '2px 0 10px' }}>{error}</p>}
        <button
          onClick={submit}
          disabled={busy || !current || !next || !confirm}
          style={{
            width: '100%', marginTop: 6, padding: '15px', borderRadius: 999, border: 'none',
            background: 'linear-gradient(135deg, var(--btn), var(--btn-deep))', color: 'var(--btn-text)',
            fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600,
            cursor: busy ? 'not-allowed' : 'pointer', opacity: busy || !current || !next || !confirm ? 0.6 : 1,
          }}
        >
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </div>
  );
};

// ── Profile ──────────────────────────────────────────────────────────────────
export const ProfileScreen: React.FC = () => {
  const { goto, setPalette, palette, wishes } = useAppStore();
  const { user, logout } = useAuthStore();
  const { earnedBadge, energyChecks, days } = useTrackerStore();
  const { reminderEnabled, reminderTime, setReminderEnabled, setReminderTime } = useSettingsStore();
  const badge = badgeById(earnedBadge);
  const [showPw, setShowPw] = useState(false);

  const toggleReminder = async () => {
    const [h, m] = reminderTime.split(':').map(Number);
    const now = await setReminder(!reminderEnabled, h, m);
    setReminderEnabled(now);
    if (!reminderEnabled && !now) {
      toast.error('Enable notifications for Dream Life in your phone settings to get reminders.');
    } else {
      toast.success(now ? 'Daily reminder on ✦' : 'Reminder off');
    }
  };

  const changeReminderTime = async (t: string) => {
    setReminderTime(t);
    if (reminderEnabled) {
      const [h, m] = t.split(':').map(Number);
      await setReminder(true, h, m);
    }
  };

  const name = user?.name || 'You';
  const email = user?.email || '';
  const activeWishes = wishes.filter((w) => !w.is_manifested).length;
  const practicesDone = Object.values(days).reduce(
    (n, d) => n + Object.values(d.checks || {}).filter((c) => c.done).length, 0,
  );

  const signOut = () => { logout(); goto('welcome'); };

  const STATS = [
    { value: user?.streak_count ?? 0, label: 'Day streak' },
    { value: practicesDone, label: 'Practices' },
    { value: activeWishes, label: 'Wishes' },
  ];

  return (
    <DLScreen scroll pad={false}>
      <div style={{ padding: '22px 22px 8px' }}>
        <DLLabel style={{ color: 'var(--btn)' }}>Your account ◯</DLLabel>
      </div>

      {/* Identity card */}
      <div style={{ padding: '4px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: 18 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, flexShrink: 0,
            background: badge ? badge.gradient : 'linear-gradient(135deg, var(--btn), var(--btn-deep))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: badge ? 32 : 26, color: '#fff',
            fontFamily: 'var(--serif)', fontStyle: 'italic',
          }}>
            {badge ? badge.emoji : name[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)', lineHeight: 1.1 }}>{name}</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
            {badge && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--btn)', marginTop: 5, textTransform: 'uppercase' }}>{badge.name}</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding: '14px 22px 0', display: 'flex', gap: 10 }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '14px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 26, color: 'var(--ink)' }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.05em', color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Energy check-ins */}
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <DLLabel>How you've felt</DLLabel>
          <button onClick={() => goto('energy-check')} style={{ background: 'var(--accent-soft)', border: 'none', borderRadius: 999, padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.05em', color: 'var(--btn)', textTransform: 'uppercase' }}>⚡ Check in</button>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
          {energyChecks.length === 0 ? (
            <div style={{ padding: 16, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>Your check-in arrives Saturday ✦</div>
          ) : energyChecks.slice(0, 5).map((c, i) => {
            const t = ENERGY_TIER[c.tier as keyof typeof ENERGY_TIER] || { label: c.tier, emoji: '✦' };
            return (
              <div key={`${c.date}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
                <span style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)' }}><span style={{ fontSize: 18 }}>{t.emoji}</span>{t.label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--muted)' }}>{c.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily reminder */}
      <div style={{ padding: '22px 22px 0' }}>
        <DLLabel style={{ marginBottom: 10, display: 'block' }}>Daily reminder</DLLabel>
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
            <div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 14.5, color: 'var(--ink)' }}>Remind me to practice</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>A gentle nudge, once a day</div>
            </div>
            {/* toggle */}
            <button
              onClick={toggleReminder}
              aria-label="Toggle daily reminder"
              style={{
                width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
                background: reminderEnabled ? 'var(--btn)' : 'var(--line-strong)',
                position: 'relative', transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: reminderEnabled ? 21 : 3,
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
          {reminderEnabled && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--line)' }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)' }}>Time</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => changeReminderTime(e.target.value)}
                style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: '6px 10px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Appearance */}
      <div style={{ padding: '22px 22px 0' }}>
        <DLLabel style={{ marginBottom: 10, display: 'block' }}>Appearance</DLLabel>
        <div style={{ display: 'flex', gap: 10 }}>
          {THEMES.map((t) => {
            const on = palette === t.id;
            return (
              <button key={t.id} onClick={() => setPalette(t.id)} style={{ flex: 1, cursor: 'pointer', background: 'var(--card)', border: `1.5px solid ${on ? 'var(--btn)' : 'var(--line)'}`, borderRadius: 14, padding: '12px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: t.swatch, boxShadow: on ? '0 0 0 3px var(--accent-soft)' : 'none' }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.04em', color: on ? 'var(--btn)' : 'var(--muted)', textTransform: 'uppercase' }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Account actions */}
      <div style={{ padding: '22px 22px 40px' }}>
        <DLLabel style={{ marginBottom: 10, display: 'block' }}>Account</DLLabel>
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)' }}>Email</span>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', maxWidth: '62%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
          </div>
          <button onClick={() => setShowPw(true)} style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'none', border: 'none', borderTop: '1px solid var(--line)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)' }}>
            Change password <span style={{ color: 'var(--muted)' }}>›</span>
          </button>
          <button onClick={signOut} style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'none', border: 'none', borderTop: '1px solid var(--line)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 14, color: '#C0453B' }}>
            Sign out <span>→</span>
          </button>
        </div>
      </div>

      {showPw && <ChangePasswordSheet onClose={() => setShowPw(false)} />}
    </DLScreen>
  );
};
