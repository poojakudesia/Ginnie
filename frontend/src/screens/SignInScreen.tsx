import React, { useState } from 'react';
import { DLScreen } from '../components/DLScreen';
import { DLButton } from '../components/DLButton';
import { DLInput } from '../components/DLInput';
import { DLTopBar } from '../components/DLTopBar';
import { DLCard } from '../components/DLCard';
import { DLDisplay } from '../components/DLDisplay';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';

export const SignInScreen: React.FC = () => {
  const goto = useAppStore((s) => s.goto);
  const { setUser, setToken } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const canContinue = name.trim().length > 0 && email.includes('@');

  const handleContinue = () => {
    // Mock signup for demo
    setUser({
      id: '1',
      email,
      name,
      familiarity: 'explorer',
      xp: 0,
      streak_count: 0,
      techniques: [],
    });
    setToken('demo-token');
    goto('profile-setup');
  };

  const oauthButton = (icon: string, label: string, bg: string, color: string) => (
    <button
      onClick={handleContinue}
      style={{
        width: '100%',
        padding: '13px 20px',
        borderRadius: 999,
        background: bg,
        color,
        fontFamily: 'var(--sans)',
        fontSize: 14,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        border: `1.5px solid ${bg === '#fff' ? 'var(--line)' : 'transparent'}`,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      Continue with {label}
    </button>
  );

  return (
    <DLScreen scroll pad>
      <DLTopBar showBack title="" />

      <div style={{ padding: '8px 0 24px' }}>
        <DLDisplay size="md">
          Let's meet<br />
          <span style={{ fontStyle: 'italic' }}>you ✦</span>
        </DLDisplay>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>
          Create your free account to begin.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <DLInput
          label="Name"
          prefix="✦"
          value={name}
          onChange={setName}
          placeholder="Your name"
        />
        <DLInput
          label="Email"
          prefix="✉"
          value={email}
          onChange={setEmail}
          placeholder="you@email.com"
          type="email"
        />
        <DLInput
          label="Phone (optional)"
          prefix="+1"
          value={phone}
          onChange={setPhone}
          placeholder="555-555-5555"
          type="tel"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>
          OR
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {oauthButton('', 'Apple', '#000', '#fff')}
        {oauthButton('G', 'Google', '#fff', '#333')}
        {oauthButton('♫', 'Spotify', '#1DB954', '#fff')}
      </div>

      <DLCard tone="paper" style={{ margin: '20px 0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 20 }}>🔒</span>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
          Your data is encrypted and never shared. We respect your privacy and manifestation journey.
        </p>
      </DLCard>

      <DLButton
        variant="primary"
        size="lg"
        fullWidth
        disabled={!canContinue}
        onClick={handleContinue}
        style={{ marginBottom: 24 }}
      >
        Continue →
      </DLButton>
    </DLScreen>
  );
};
