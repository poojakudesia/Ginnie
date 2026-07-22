# Google Play — submission checklist

## ⛔ The debug APK is NOT acceptable
Play requires a **signed release .aab** pointing at your **production HTTPS backend**.
Full build steps: [`../MOBILE.md`](../MOBILE.md) §6.

---

## What to have ready before you start

### The app bundle
- [ ] Backend deployed to HTTPS (Render — see `../render.yaml`), URL working at `/health`
- [ ] `frontend/.env` → `VITE_API_BASE_URL=https://<your-render-url>`
- [ ] Release keystore created + `keystore.properties` set (MOBILE.md §6a–6b) — **back the keystore up**
- [ ] Built the signed bundle: `cd frontend && npm run mobile:build && cd android && ./gradlew bundleRelease`
  - → `frontend/android/app/build/outputs/bundle/release/app-release.aab`

### Graphics (all provided in this folder)
- [ ] **App icon** 512×512 — `app-icon-512.png` ✅
- [ ] **Feature graphic** 1024×500 — `feature-graphic-1024x500.png` ✅
- [ ] **Phone screenshots** — 2–8, portrait, min 1080×1920. Capture on your phone
      (screens suggested in `listing.md`). *You must take these from the running app.*

### Listing text (in `listing.md`)
- [ ] App name, short + full description, keywords, category ✅

### Required URLs / info
- [ ] **Privacy policy URL** — host `privacy-policy.html` (GitHub Pages, Render static, or any host) ✅ page provided
- [ ] Support email
- [ ] Content rating questionnaire (app is 4+/Everyone)
- [ ] Data safety form — answers in `listing.md`
- [ ] Target audience + ads declaration (no ads)

---

## Steps in Play Console (play.google.com/console — one-time $25)
1. **Create app** → name, default language, app/free.
2. **Store listing** → paste text from `listing.md`; upload `app-icon-512.png`,
   `feature-graphic-1024x500.png`, and your phone screenshots.
3. **App content** → privacy policy URL, data safety, content rating, target audience, ads = No.
4. **Testing → Internal testing → Create release** → upload `app-release.aab` → add your
   email as a tester → open the opt-in link on your phone → install from Play (true end-to-end test).
5. When happy → **Production → Create release** → upload → **Submit for review**.

## Hosting the privacy policy fast (free)
Option — GitHub Pages: put `privacy-policy.html` in a repo, enable Pages, use that URL.
Option — Render static site: point it at this folder, serve `privacy-policy.html`.
