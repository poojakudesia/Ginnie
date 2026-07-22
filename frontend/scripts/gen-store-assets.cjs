/* Generate Play Store graphics that must be exact sizes.
   node scripts/gen-store-assets.cjs  */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(ROOT, '..', 'store-assets');
fs.mkdirSync(OUT, { recursive: true });

const sparkle = `
  <svg viewBox="0 0 200 200" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFE1F0"/>
    </linearGradient></defs>
    <path fill="url(#s)" d="M100 20 Q100 100 180 100 Q100 100 100 180 Q100 100 20 100 Q100 100 100 20 Z"/>
  </svg>`;

// Feature graphic — 1024 x 500 (required by Google Play)
const featureHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0}
  #c{width:1024px;height:500px;position:relative;overflow:hidden;
     background:linear-gradient(120deg,#8E4472 0%,#7C3763 52%,#4B2450 100%);
     font-family:Georgia,'Times New Roman',serif;color:#FFF3F9;display:flex;align-items:center}
  .glow{position:absolute;width:520px;height:520px;border-radius:50%;left:-120px;top:-60px;
        background:radial-gradient(circle,rgba(255,210,236,0.35) 0%,transparent 62%)}
  .art{width:360px;display:flex;align-items:center;justify-content:center;position:relative}
  .txt{flex:1;padding-right:64px}
  .kicker{font-family:'Courier New',monospace;font-size:15px;letter-spacing:5px;
          text-transform:uppercase;opacity:0.8;margin-bottom:10px}
  .title{font-size:74px;line-height:1.02;font-style:italic;margin:0}
  .tag{font-size:24px;opacity:0.9;margin-top:16px;font-style:normal;
       font-family:'Helvetica Neue',Arial,sans-serif}
</style></head><body>
  <div id="c">
    <div class="glow"></div>
    <div class="art">${sparkle}</div>
    <div class="txt">
      <div class="kicker">Powered by Ginnie ✦</div>
      <h1 class="title">Dream&nbsp;Life</h1>
      <div class="tag">Manifest with your personal guide — day by day.</div>
    </div>
  </div>
</body></html>`;

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1024, height: 500 });
  await page.setContent(featureHtml, { waitUntil: 'networkidle' });
  await (await page.$('#c')).screenshot({ path: path.join(OUT, 'feature-graphic-1024x500.png') });
  console.log('wrote store-assets/feature-graphic-1024x500.png');

  // Copy the 512 icon Play needs for the listing
  fs.copyFileSync(path.join(ROOT, 'public', 'icon-512.png'), path.join(OUT, 'app-icon-512.png'));
  console.log('wrote store-assets/app-icon-512.png');

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
