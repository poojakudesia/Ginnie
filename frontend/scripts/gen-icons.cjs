/* Rasterize the app logo into every icon/splash size stores + PWA need.
   Source priority: resources/logo.png (your brand logo) → else resources/icon.svg
   Also copies the logo to public/logo.png for the in-app avatar.
   Run: node scripts/gen-icons.cjs   (or: npm run icons) */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const LOGO = path.join(ROOT, 'resources', 'logo.png');
const useLogo = fs.existsSync(LOGO);

// Foreground markup: the logo <img> if provided, else the fallback SVG.
let art;
if (useLogo) {
  const b64 = fs.readFileSync(LOGO).toString('base64');
  art = `<img src="data:image/png;base64,${b64}" style="width:100%;height:100%;object-fit:cover" />`;
  // Make the logo available to the running app (welcome avatar, etc.)
  fs.copyFileSync(LOGO, path.join(ROOT, 'public', 'logo.png'));
  console.log('using resources/logo.png (also copied to public/logo.png)');
} else {
  art = fs.readFileSync(path.join(ROOT, 'resources', 'icon.svg'), 'utf8');
  console.log('resources/logo.png not found — using the fallback sparkle SVG');
}

// [outfile, size, background]
const TARGETS = [
  ['public/icon-192.png', 192, null],
  ['public/icon-512.png', 512, null],
  ['public/icon-512-maskable.png', 512, null],
  ['public/apple-touch-icon.png', 180, '#7C3763'],
  ['public/favicon-32.png', 32, null],
  ['public/icon-1024.png', 1024, '#7C3763'],
  ['resources/icon-1024.png', 1024, '#7C3763'],  // for @capacitor/assets
];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  for (const [out, size, bg] of TARGETS) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;padding:0}
      #c{width:${size}px;height:${size}px;${bg ? `background:${bg};` : ''}display:flex;overflow:hidden}
      #c svg,#c img{width:100%;height:100%}
    </style></head><body><div id="c">${art}</div></body></html>`;
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(html, { waitUntil: 'networkidle' });
    const el = await page.$('#c');
    await el.screenshot({ path: path.join(ROOT, out), omitBackground: !bg });
    console.log('wrote', out, `${size}x${size}`);
  }

  // Splash screen 2732x2732 (centered mark on brand gradient)
  const splashHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0}
    #c{width:2732px;height:2732px;background:linear-gradient(135deg,#8E4472,#7C3763 55%,#4B2450);
       display:flex;align-items:center;justify-content:center}
    #m{width:1100px;height:1100px;border-radius:120px;overflow:hidden;display:flex}
    #m svg,#m img{width:100%;height:100%;object-fit:cover}
  </style></head><body><div id="c"><div id="m">${art}</div></div></body></html>`;
  await page.setViewportSize({ width: 2732, height: 2732 });
  await page.setContent(splashHtml, { waitUntil: 'networkidle' });
  const sc = await page.$('#c');
  await sc.screenshot({ path: path.join(ROOT, 'resources', 'splash-2732.png') });
  console.log('wrote resources/splash-2732.png 2732x2732');

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
