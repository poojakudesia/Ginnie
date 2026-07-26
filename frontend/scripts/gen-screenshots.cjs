/* Render every screen of Dream Life and save phone-sized PNGs to ../screenshots/
   Usage: node scripts/gen-screenshots.cjs   (a vite preview server must serve dist on PORT) */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(ROOT, '..', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.SHOT_BASE || 'http://localhost:4180';

// ── sample data ───────────────────────────────────────────────────────────
const d = new Date();
const key = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
const today = key(d);
const y = new Date(d); y.setDate(d.getDate() - 1); const yest = key(y);

const USER = { id: 'u1', email: 'pooja@example.com', name: 'Pooja', avatar_url: '', phone: '', familiarity: 'explorer', last_screen: 'tracker', xp: 340, streak_count: 5, techniques: ['viz', 'affirm', 'gratitude'] };
const TECHNIQUES = ['viz', 'affirm', 'gratitude'];
const QUIZ = { modality: 'visual', habitStyle: 'micro', blocker: 'consistency', mindOpen: 'morning', mentalState: 'not_ready' };
const WISHES = [
  { id: 'w1', title: 'I have my dream loft in Brooklyn with morning light', category: 'Home', why: 'Space to create.', progress_label: 'In progress', timeline: '1y', pct_complete: 35, is_manifested: false, created_at: new Date(d.getTime() - 90 * 864e5).toISOString() },
  { id: 'w2', title: 'I move through my days at 85kg, light and strong', category: 'Health', why: 'Energy and ease.', progress_label: 'In progress', timeline: '6m', pct_complete: 45, is_manifested: false, created_at: new Date(d.getTime() - 40 * 864e5).toISOString() },
  { id: 'w3', title: 'I lead design at a studio I love', category: 'Career', why: 'Do my best work.', progress_label: 'Close', timeline: '3y', pct_complete: 100, is_manifested: true, created_at: new Date(d.getTime() - 200 * 864e5).toISOString() },
];
const TRACKER = {
  days: {
    [today]: { checks: { viz: { done: true }, affirm: { done: true }, gratitude: { done: true } }, mood: 'grateful' },
    [yest]: { checks: { viz: { done: true } } },
  },
  energyChecks: [{ date: today, tier: 'flow', answers: {} }],
  lastEnergyCheck: today,
  earnedBadge: 'shifter',
  reviewedWishes: ['w1', 'w2', 'w3'], // suppress the completion modal in shots
};

const wrap = (state) => JSON.stringify({ state, version: 0 });
const seed = (screen, wishes) => ({
  'dream-life-auth': wrap({ user: USER, token: 'demo-token' }),
  'dream-life-app': wrap({ screen, palette: 'petal', wishes: wishes ?? WISHES, techniques: TECHNIQUES, authMode: 'signup', methodQuiz: QUIZ }),
  'dream-life-tracker': wrap(TRACKER),
});

const SHOTS = [
  { file: '01-welcome', screen: 'welcome' },
  { file: '02-sign-in', screen: 'signin' },
  { file: '03-profile-setup', screen: 'profile-setup' },
  { file: '04-wish-builder', screen: 'wish-builder', wishes: [] },
  { file: '05-wishes-summary', screen: 'wishes' },
  { file: '06-method-match', screen: 'questions' },
  { file: '07-energy-scan', screen: 'energy', wait: 900 },
  { file: '08-your-match', screen: 'techniques', wait: 2200 },
  { file: '09-guide-lessons', screen: 'lessons' },
  { file: '10-lesson-detail', screen: 'tutorial' },
  { file: '11-plan-timeline', screen: 'plan' },
  { file: '12-practice-tracker', screen: 'tracker' },
  { file: '13-wishes-manifest', screen: 'manifest' },
  { file: '14-energy-check', screen: 'energy-check' },
  { file: '15-profile-you', screen: 'profile' },
];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  for (const shot of SHOTS) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const data = seed(shot.screen, shot.wishes);
    await ctx.addInitScript((d) => {
      for (const k in d) window.localStorage.setItem(k, d[k]);
    }, data);
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(shot.wait || 1100);
    await page.screenshot({ path: path.join(OUT, `${shot.file}.png`) });
    console.log('shot', shot.file);
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
