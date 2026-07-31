/* Generate every app icon / splash / PWA image from your logo — using macOS's
   built-in `sips` (no extra install). Run: npm run icons
   Source: resources/logo.png  (fallbacks: assets/logo.png, public/logo.png)
*/
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CANDIDATES = ['resources/logo.png', 'assets/logo.png', 'public/logo.png'];
const src = CANDIDATES.map((p) => path.join(ROOT, p)).find((p) => fs.existsSync(p));

if (!src) {
  console.error(
    '\n⚠️  No logo found. Save your logo image to:\n' +
    '    frontend/resources/logo.png\n' +
    'then run `npm run icons` again.\n',
  );
  process.exit(1);
}

// sips must exist (macOS). If not, bail gracefully.
try {
  execSync('command -v sips', { stdio: 'ignore' });
} catch {
  console.error('`sips` not found — this icon generator needs macOS. Skipping.');
  process.exit(0);
}

const BG = '7C3763'; // brand color (no #)
const sq = (input, size, out) =>
  execSync(`sips -s format png -z ${size} ${size} "${input}" --out "${out}"`, { stdio: 'ignore' });

const ensureDir = (p) => fs.mkdirSync(path.dirname(p), { recursive: true });

// 1) In-app avatar (Welcome hero etc.) — just a copy
const publicLogo = path.join(ROOT, 'public', 'logo.png');
ensureDir(publicLogo);
fs.copyFileSync(src, publicLogo);
console.log('✓ public/logo.png');

// 2) PWA / web + favicon icons
const ICONS = [
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
  ['public/icon-512-maskable.png', 512],
  ['public/apple-touch-icon.png', 180],
  ['public/favicon-32.png', 32],
  ['public/icon-1024.png', 1024],
  ['resources/icon-1024.png', 1024],
  ['assets/icon.png', 1024], // source for @capacitor/assets (native icons)
];
for (const [out, size] of ICONS) {
  const dest = path.join(ROOT, out);
  ensureDir(dest);
  sq(src, size, dest);
  console.log('✓', out, `${size}x${size}`);
}

// 3) Splash 2732×2732 — logo centered on the brand color
const tmp = path.join(ROOT, '.tmp-logo.png');
const splashes = [path.join(ROOT, 'assets', 'splash.png'), path.join(ROOT, 'resources', 'splash-2732.png')];
try {
  sq(src, 1100, tmp);
  for (const out of splashes) {
    ensureDir(out);
    execSync(`sips -p 2732 2732 --padColor ${BG} "${tmp}" --out "${out}"`, { stdio: 'ignore' });
    console.log('✓', path.relative(ROOT, out), '2732x2732');
  }
} finally {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}

console.log('\nDone. Native launcher icons: run `npm run cap:assets` next.');
