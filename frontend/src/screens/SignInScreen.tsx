import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { signup, login, oauthGoogle, oauthFacebook } from '../api/auth';
import { getWishes } from '../api/wishes';
import { DLScreen } from '../components/DLScreen';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';
import type { AuthResponse } from '../api/auth';

// ─── Country data ────────────────────────────────────────────────────────────

interface Country {
  code: string;
  flag: string;
  name: string;
  digits: string[];
  minLen: number;
  maxLen: number;
}

const COUNTRIES: Country[] = [
  { code: '+1',   flag: '🇺🇸', name: 'US',  digits: ['1'],   minLen: 10, maxLen: 10 },
  { code: '+1',   flag: '🇨🇦', name: 'CA',  digits: [],      minLen: 10, maxLen: 10 },
  { code: '+44',  flag: '🇬🇧', name: 'GB',  digits: ['44'],  minLen: 10, maxLen: 10 },
  { code: '+91',  flag: '🇮🇳', name: 'IN',  digits: ['91'],  minLen: 10, maxLen: 10 },
  { code: '+61',  flag: '🇦🇺', name: 'AU',  digits: ['61'],  minLen: 9,  maxLen: 9  },
  { code: '+86',  flag: '🇨🇳', name: 'CN',  digits: ['86'],  minLen: 11, maxLen: 11 },
  { code: '+49',  flag: '🇩🇪', name: 'DE',  digits: ['49'],  minLen: 10, maxLen: 11 },
  { code: '+33',  flag: '🇫🇷', name: 'FR',  digits: ['33'],  minLen: 9,  maxLen: 9  },
  { code: '+81',  flag: '🇯🇵', name: 'JP',  digits: ['81'],  minLen: 10, maxLen: 11 },
  { code: '+55',  flag: '🇧🇷', name: 'BR',  digits: ['55'],  minLen: 10, maxLen: 11 },
  { code: '+7',   flag: '🇷🇺', name: 'RU',  digits: ['7'],   minLen: 10, maxLen: 10 },
  { code: '+971', flag: '🇦🇪', name: 'AE',  digits: ['971'], minLen: 9,  maxLen: 9  },
  { code: '+65',  flag: '🇸🇬', name: 'SG',  digits: ['65'],  minLen: 8,  maxLen: 8  },
  { code: '+82',  flag: '🇰🇷', name: 'KR',  digits: ['82'],  minLen: 9,  maxLen: 11 },
  { code: '+52',  flag: '🇲🇽', name: 'MX',  digits: ['52'],  minLen: 10, maxLen: 10 },
  { code: '+34',  flag: '🇪🇸', name: 'ES',  digits: ['34'],  minLen: 9,  maxLen: 9  },
  { code: '+39',  flag: '🇮🇹', name: 'IT',  digits: ['39'],  minLen: 9,  maxLen: 10 },
  { code: '+31',  flag: '🇳🇱', name: 'NL',  digits: ['31'],  minLen: 9,  maxLen: 9  },
  { code: '+27',  flag: '🇿🇦', name: 'ZA',  digits: ['27'],  minLen: 9,  maxLen: 9  },
  { code: '+92',  flag: '🇵🇰', name: 'PK',  digits: ['92'],  minLen: 10, maxLen: 10 },
];

// ─── Validation helpers ──────────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

interface PwStrength {
  score: number; // 0–4
  hasLength: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const getPwStrength = (pw: string): PwStrength => {
  const hasLength  = pw.length >= 8;
  const hasUpper   = /[A-Z]/.test(pw);
  const hasNumber  = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  return { score, hasLength, hasUpper, hasNumber, hasSpecial };
};

const strengthColor = (score: number): string => {
  if (score <= 1) return '#E05252';
  if (score === 2) return '#F59E0B';
  if (score === 3) return '#EAB308';
  return '#22C55E';
};

// ─── Inline error style ──────────────────────────────────────────────────────

const errorStyle: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 10.5,
  color: '#E05252',
  marginTop: 4,
  letterSpacing: '0.02em',
};

// ─── Shared input style factory ──────────────────────────────────────────────

const inputBase: CSSProperties = {
  width: '100%',
  background: 'var(--card)',
  border: '1.5px solid var(--line)',
  borderRadius: 14,
  padding: '13px 16px',
  fontFamily: 'var(--sans)',
  fontSize: 15,
  color: 'var(--ink)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
  appearance: 'none',
  WebkitAppearance: 'none',
};

const labelStyle: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  display: 'block',
  marginBottom: 6,
};

// ─── Spinner ─────────────────────────────────────────────────────────────────

const Spinner: React.FC<{ color?: string }> = ({ color = '#fff' }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ animation: 'dl-spin 0.75s linear infinite', flexShrink: 0 }}
  >
    <path d="M12 2a10 10 0 0 1 10 10" opacity="1" />
    <path d="M12 2a10 10 0 0 0-10 10" opacity="0.3" />
  </svg>
);

// ─── Password strength bar ────────────────────────────────────────────────────

const StrengthBar: React.FC<{ strength: PwStrength }> = ({ strength }) => {
  const color = strengthColor(strength.score);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: i < strength.score ? color : 'var(--line)',
              transition: 'background 0.25s',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', marginTop: 6 }}>
        {[
          { ok: strength.hasLength,  label: '8+ chars' },
          { ok: strength.hasUpper,   label: 'Uppercase' },
          { ok: strength.hasNumber,  label: 'Number' },
          { ok: strength.hasSpecial, label: 'Special' },
        ].map(({ ok, label }) => (
          <span
            key={label}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: ok ? '#22C55E' : 'var(--muted)',
              letterSpacing: '0.03em',
              transition: 'color 0.2s',
            }}
          >
            {ok ? '✓' : '○'} {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Mode pill toggle ─────────────────────────────────────────────────────────

const ModePill: React.FC<{ mode: 'signup' | 'signin'; onChange: (m: 'signup' | 'signin') => void }> = ({ mode, onChange }) => (
  <div
    style={{
      display: 'inline-flex',
      background: 'var(--card)',
      border: '1.5px solid var(--line)',
      borderRadius: 999,
      padding: 4,
      alignSelf: 'center',
      marginBottom: 28,
    }}
  >
    {(['signup', 'signin'] as const).map((m) => (
      <button
        key={m}
        onClick={() => onChange(m)}
        style={{
          padding: '8px 22px',
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--mono)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          transition: 'background 0.2s, color 0.2s',
          background: mode === m ? 'var(--btn)' : 'transparent',
          color: mode === m ? 'var(--btn-text)' : 'var(--muted)',
        }}
      >
        {m === 'signup' ? 'Sign up' : 'Sign in'}
      </button>
    ))}
  </div>
);

// ─── Country picker ────────────────────────────────────────────────────────────

const CountryPicker: React.FC<{
  selected: Country;
  onSelect: (c: Country) => void;
}> = ({ selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '13px 12px',
          background: 'var(--card)',
          border: '1.5px solid var(--line)',
          borderRadius: 14,
          cursor: 'pointer',
          fontFamily: 'var(--sans)',
          fontSize: 14,
          color: 'var(--ink)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{selected.flag}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{selected.code}</span>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>▾</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            background: 'var(--card)',
            border: '1.5px solid var(--line)',
            borderRadius: 14,
            boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
            maxHeight: 220,
            overflowY: 'auto',
            minWidth: 160,
          }}
        >
          {COUNTRIES.map((c, i) => (
            <button
              key={`${c.name}-${i}`}
              type="button"
              onClick={() => { onSelect(c); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                background: selected.name === c.name ? 'var(--accent-soft)' : 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--sans)',
                fontSize: 13,
                color: 'var(--ink)',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 16 }}>{c.flag}</span>
              <span style={{ flex: 1 }}>{c.name}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

export const SignInScreen: React.FC = () => {
  const goto = useAppStore((s) => s.goto);
  const authMode = useAppStore((s) => s.authMode);
  const setWishes = useAppStore((s) => s.setWishes);
  const setTechniques = useAppStore((s) => s.setTechniques);
  const { setUser, setToken } = useAuthStore();

  // mode — initialized from how the user entered (Let's Begin = signup,
  // "I already have an account" = signin)
  const [mode, setMode] = useState<'signup' | 'signin'>(authMode);

  // fields
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [phone, setPhone]           = useState('');
  const [country, setCountry]       = useState<Country>(COUNTRIES[0]);

  // ui state
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched]       = useState<Record<string, boolean>>({});
  const [loading, setLoading]       = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [apiError, setApiError]     = useState('');

  const strength = getPwStrength(password);

  // ── Validation ──────────────────────────────────────────────────────────────

  const errors: Record<string, string> = {};
  if (mode === 'signup') {
    if (!name.trim())               errors.name = 'Name is required';
    else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    if (!email.trim())              errors.email = 'Email is required';
    else if (!isValidEmail(email))  errors.email = 'Enter a valid email address';

    if (!password)                  errors.password = 'Password is required';
    else if (strength.score < 4)    errors.password = 'Password does not meet all requirements';

    if (!confirm)                   errors.confirm = 'Please confirm your password';
    else if (confirm !== password)  errors.confirm = 'Passwords do not match';

    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (!/^\d+$/.test(phone))
        errors.phone = 'Phone number must contain digits only';
      else if (digits.length < country.minLen)
        errors.phone = `${country.name} numbers need ${country.minLen} digits`;
      else if (digits.length > country.maxLen)
        errors.phone = `${country.name} numbers can't exceed ${country.maxLen} digits`;
    }
  } else {
    if (!email.trim())              errors.email = 'Email is required';
    else if (!isValidEmail(email))  errors.email = 'Enter a valid email address';

    if (!password)                  errors.password = 'Password is required';
  }

  const isFormValid = Object.keys(errors).length === 0;

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));
  const err = (field: string) => touched[field] ? errors[field] : undefined;

  // ── Country auto-detect ──────────────────────────────────────────────────────

  const handlePhoneChange = (value: string) => {
    // Strip all non-digit characters — phone field is numeric only
    const numeric = value.replace(/\D/g, '');
    setPhone(numeric);
  };

  // ── Social SDK injection ─────────────────────────────────────────────────────

  // After any successful auth: store session, then route based on whether
  // the user already has wishes (returning user → daily rituals/home,
  // new user → onboarding/profile-setup).
  const finishAuth = async (result: AuthResponse) => {
    setUser(result.user);
    setToken(result.access_token);

    const u = result.user;
    // Restore chosen practices into the app so the tracker/plan reflect them
    if (u.techniques && u.techniques.length > 0) setTechniques(u.techniques);

    try {
      const existing = await getWishes();
      if (existing && existing.length > 0) setWishes(existing);

      // 1) Already practicing → always land on the Practice timeline
      if (u.techniques && u.techniques.length > 0) {
        goto('tracker');
        return;
      }
      // 2) Mid-onboarding → resume exactly where they left off
      const RESUMABLE = new Set([
        'profile-setup', 'wish-builder', 'wishes',
        'questions', 'energy', 'techniques', 'tutorial', 'plan', 'tracker',
      ]);
      if (u.last_screen && RESUMABLE.has(u.last_screen)) {
        goto(u.last_screen);
        return;
      }
      // 3) Has wishes but no saved stage → resume at the wishes summary
      if (existing && existing.length > 0) {
        goto('wishes');
        return;
      }
    } catch {
      // network issue — fall through to onboarding start
    }
    goto('profile-setup');
  };

  useEffect(() => {
    // Google Identity Services
    if (!document.getElementById('gsi-script')) {
      const script = document.createElement('script');
      script.id = 'gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      document.head.appendChild(script);
    }

    // @ts-ignore
    window.handleGoogleCredential = async (response: any) => {
      try {
        setSocialLoading('google');
        const result = await oauthGoogle(response.credential);
        await finishAuth(result);
      } catch (e: any) {
        toast.error(e?.response?.data?.detail || 'Google sign-in failed');
      } finally {
        setSocialLoading(null);
      }
    };

    // Facebook SDK
    if (!document.getElementById('fb-script')) {
      // @ts-ignore
      window.fbAsyncInit = function () {
        // @ts-ignore
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
          version: 'v19.0',
          cookie: true,
          xfbml: false,
        });
      };
      const fbScript = document.createElement('script');
      fbScript.id = 'fb-script';
      fbScript.src = 'https://connect.facebook.net/en_US/sdk.js';
      fbScript.async = true;
      fbScript.defer = true;
      document.head.appendChild(fbScript);
    }

  }, []);

  // ── Social handlers ───────────────────────────────────────────────────────────

  const handleGoogleLogin = () => {
    // @ts-ignore
    window.google?.accounts.id.prompt();
  };

  const handleFacebookLogin = () => {
    setSocialLoading('facebook');
    // @ts-ignore
    window.FB?.login(
      async (response: any) => {
        if (response.authResponse) {
          try {
            const result = await oauthFacebook(response.authResponse.accessToken);
            await finishAuth(result);
          } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Facebook sign-in failed');
          } finally {
            setSocialLoading(null);
          }
        } else {
          setSocialLoading(null);
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  // ── Form submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const allFields = mode === 'signup'
      ? ['name', 'email', 'password', 'confirm']
      : ['email', 'password'];
    setTouched(Object.fromEntries(allFields.map((f) => [f, true])));
    if (!isFormValid) {
      toast.error('Please fix the highlighted fields above');
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      let result;
      if (mode === 'signup') {
        result = await signup({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone ? `${country.code}${phone}` : undefined,
        });
      } else {
        result = await login({ email: email.trim(), password });
      }
      await finishAuth(result);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: any) => d.msg).join(', ')
          : e?.message === 'Network Error'
            ? 'Cannot reach server. Make sure the backend is running on port 8000.'
            : e?.message || 'Something went wrong. Please try again.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Spinner keyframe — injected once */}
      <style>{`@keyframes dl-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hidden Google One Tap trigger div */}
      <div
        id="g_id_onload"
        data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}
        data-callback="handleGoogleCredential"
        data-auto_prompt="false"
        style={{ display: 'none' }}
      />

      <DLScreen scroll pad>
        <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 48, paddingBottom: 48 }}>

          {/* Heading */}
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <h1
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 30,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {mode === 'signup' ? (
                <>Dream life<br /><em>starts here ✦</em></>
              ) : (
                <>Welcome<br /><em>back ✦</em></>
              )}
            </h1>
            <p
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 14,
                color: 'var(--muted)',
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              {mode === 'signup'
                ? 'Create your free account to begin manifesting.'
                : 'Sign back in to continue your journey.'}
            </p>
          </div>

          {/* Mode toggle */}
          <ModePill mode={mode} onChange={(m) => { setMode(m); setTouched({}); setApiError(''); }} />

          {/* ── Form fields ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Name (signup only) */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => touch('name')}
                  placeholder="Your full name"
                  style={{ ...inputBase, borderColor: err('name') ? '#E05252' : undefined }}
                />
                {err('name') && <p style={errorStyle}>{err('name')}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => touch('email')}
                placeholder="you@email.com"
                style={{ ...inputBase, borderColor: err('email') ? '#E05252' : undefined }}
              />
              {err('email') && <p style={errorStyle}>{err('email')}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => touch('password')}
                  placeholder="••••••••"
                  style={{
                    ...inputBase,
                    paddingRight: 48,
                    borderColor: err('password') ? '#E05252' : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    fontSize: 16,
                    padding: 0,
                    lineHeight: 1,
                  }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              {err('password') && <p style={errorStyle}>{err('password')}</p>}
              {mode === 'signup' && password.length > 0 && <StrengthBar strength={strength} />}
            </div>

            {/* Confirm password (signup only) */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onBlur={() => touch('confirm')}
                    placeholder="••••••••"
                    style={{
                      ...inputBase,
                      paddingRight: 48,
                      borderColor: err('confirm') ? '#E05252' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--muted)',
                      fontSize: 16,
                      padding: 0,
                      lineHeight: 1,
                    }}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
                {err('confirm') && <p style={errorStyle}>{err('confirm')}</p>}
              </div>
            )}

            {/* Phone (signup only, optional) */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Phone <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <CountryPicker selected={country} onSelect={setCountry} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => touch('phone')}
                    placeholder="555-555-5555"
                    style={{
                      ...inputBase,
                      flex: 1,
                      borderColor: err('phone') ? '#E05252' : undefined,
                    }}
                  />
                </div>
                {err('phone') && <p style={errorStyle}>{err('phone')}</p>}
              </div>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(224,82,82,0.10)',
                border: '1px solid rgba(224,82,82,0.25)',
              }}
            >
              <p style={{ ...errorStyle, margin: 0, fontSize: 12 }}>{apiError}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            style={{
              marginTop: 24,
              width: '100%',
              padding: '17px 36px',
              borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg, var(--btn) 0%, var(--btn-deep) 100%)',
              color: 'var(--btn-text)',
              fontFamily: 'var(--sans)',
              fontSize: 17,
              fontWeight: 500,
              cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
              opacity: loading || !isFormValid ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 10px 24px rgba(124,55,99,0.28)',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? (
              <>
                <Spinner />
                {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
              </>
            ) : (
              mode === 'signup' ? 'Create account →' : 'Sign in →'
            )}
          </button>

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--muted)',
                letterSpacing: '0.08em',
              }}
            >
              OR
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          {/* Social login buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={!!socialLoading}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 999,
                border: '1.5px solid var(--line)',
                background: '#fff',
                color: '#333',
                fontFamily: 'var(--sans)',
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: socialLoading ? 'not-allowed' : 'pointer',
                opacity: socialLoading && socialLoading !== 'google' ? 0.5 : 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'opacity 0.2s',
              }}
            >
              {socialLoading === 'google' ? (
                <Spinner color="#4285F4" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={!!socialLoading}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 999,
                border: 'none',
                background: '#1877F2',
                color: '#fff',
                fontFamily: 'var(--sans)',
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: socialLoading ? 'not-allowed' : 'pointer',
                opacity: socialLoading && socialLoading !== 'facebook' ? 0.5 : 1,
                boxShadow: '0 2px 8px rgba(24,119,242,0.3)',
                transition: 'opacity 0.2s',
              }}
            >
              {socialLoading === 'facebook' ? (
                <Spinner color="#fff" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              )}
              Continue with Facebook
            </button>
          </div>

          {/* Privacy note */}
          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              borderRadius: 14,
              background: 'var(--accent-soft)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
            <p
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 12,
                color: 'var(--muted)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Your data is encrypted and never shared. We respect your privacy and manifestation journey.
            </p>
          </div>

          {/* Toggle mode link */}
          <p
            style={{
              textAlign: 'center',
              fontFamily: 'var(--sans)',
              fontSize: 13,
              color: 'var(--muted)',
              marginTop: 24,
              marginBottom: 0,
            }}
          >
            {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setTouched({}); setApiError(''); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--sans)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--btn)',
                padding: 0,
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </p>

        </div>
      </DLScreen>
    </>
  );
};
