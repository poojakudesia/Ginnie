# Dream Life → Google Play: a first-timer's step-by-step

No coding experience needed. Follow the parts in order. Total: ~2–3 hours,
mostly waiting and form-filling. Do it on your **Mac**.

Terms you'll see:
- **Backend** = the server that stores accounts/wishes. It must live on the internet.
- **AAB** = the app file Google Play accepts (like an "APK" but the required kind).
- **Keystore** = your secret signing key. Guard it — losing it means you can never update the app again.

---

## PART 1 — Make 3 free/cheap accounts (15 min)
1. **GitHub** — you already have this (your code is at github.com/poojakudesia/Ginnie).
2. **Render** (free backend host) → https://render.com → "Get Started" → sign in **with GitHub**.
3. **Google Play Console** (one-time **$25**) → https://play.google.com/console → sign up.
   *(You can do Parts 2–5 while the Play account verifies.)*

---

## PART 2 — Put the backend online (Render) — 20 min
1. Render dashboard → **New +** → **Blueprint**.
2. Connect your GitHub → pick repo **poojakudesia/Ginnie** → **Apply**.
   Render reads the included `render.yaml` and creates the server + database automatically.
3. When it finishes, click the **dreamlife-api** service. Under the name is a link like
   `https://api.myginnie.life` — **copy it**.
4. Test it: open that link with `/health` on the end in your browser
   (`https://api.myginnie.life/health`). You should see `{"status":"ok"}`.
   *(First load can take ~50s — the free server "wakes up".)*
5. (Optional, for AI features) In the service → **Environment** → add
   `ANTHROPIC_API_KEY` = your key from console.anthropic.com. Without it the app still
   works using built-in fallbacks.

---

## PART 3 — Publish your privacy policy (Google requires a public link) — 10 min
Easiest free way, using GitHub Pages:
1. Go to github.com/poojakudesia/Ginnie → **Settings** → **Pages** (left menu).
2. Under "Build and deployment", Source = **Deploy from a branch**, Branch = **main**,
   folder = **/ (root)** → **Save**.
3. Wait ~2 min. Your policy will be live at:
   `https://myginnie.life/privacy`
4. Open that link to confirm it loads. **Copy it** — you'll paste it into Play.
   *(Want a different contact email in it? Edit `store-assets/privacy-policy.html` first.)*

---

## PART 4 — Point the app at your live backend — 5 min
Open **Terminal** and run (replace the URL if yours differs):
```bash
cd ~/Ginnie/frontend
sed -i '' "s|^VITE_API_BASE_URL=.*|VITE_API_BASE_URL=https://api.myginnie.life|" .env
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
npm run mobile:build
```
This bakes your live server address into the app. Wait for it to finish (`Sync finished`).

---

## PART 5 — Build the signed app bundle (Android Studio wizard) — 20 min
This is the friendliest way — no code editing. The wizard also **creates your keystore** for you.

1. Open the project in Android Studio:
   ```bash
   cd ~/Ginnie/frontend
   npm run cap:android
   ```
   Wait for "Gradle sync" (bottom bar) to finish.
2. Top menu: **Build → Generate Signed Bundle / APK…**
3. Choose **Android App Bundle** → **Next**.
4. Under "Key store path" click **Create new…**:
   - **Key store path**: click the folder icon → save as `dreamlife-release.jks` in your
     Documents (somewhere safe, NOT inside the project).
   - **Password** / **Confirm**: make one up — **write it down**.
   - Under "Key": **Alias** = `dreamlife`; **Password** = (can be the same) — **write it down**.
   - **Validity (years)**: 30.
   - **First and last name**: your name. The rest is optional. → **OK**.
5. Back on the wizard: make sure your new keystore is filled in, passwords entered → **Next**.
6. Build variant: **release** → **Finish**.
7. When it's done a small popup appears bottom-right → click **locate**. Your file is:
   `~/Ginnie/frontend/android/app/build/outputs/bundle/release/app-release.aab`

> 🔐 **Back up two things forever:** the `dreamlife-release.jks` file and the passwords.
> If you lose them you can never publish an update to this app.

---

## PART 6 — Create the app in Play Console — 10 min
1. play.google.com/console → **Create app**.
2. App name: **Dream Life** · Language: English · Type: **App** · **Free** → check the
   declarations → **Create app**.

---

## PART 7 — Fill the store listing (upload the graphics) — 20 min
Left menu → **Grow → Store presence → Main store listing**. Fill using the ready text in
`store-assets/listing.md`, and upload the images from your project's `store-assets` folder:
- **App icon**: `store-assets/app-icon-512.png`
- **Feature graphic**: `store-assets/feature-graphic-1024x500.png`
- **Phone screenshots** (2–8): take these on your phone from the installed app
  (Practice, Wishes, Guide, You). On most Androids: press **Power + Volume-Down**.
  Then AirDrop/email them to your Mac and upload.
- Short description + Full description: copy from `listing.md`.
→ **Save**.

---

## PART 8 — Answer the required questionnaires — 20 min
Left menu → **Policy → App content**. Complete each item:
- **Privacy policy**: paste your GitHub Pages URL from Part 3.
- **Data safety**: answers are in `store-assets/listing.md` (collects name/email + your
  practice content; not sold; not shared for ads; encrypted in transit; deletable).
- **Content rating**: fill the questionnaire → it will rate the app "Everyone".
- **Target audience**: 18+ (or 13+). Not directed at children.
- **Ads**: **No**.
- **Government app / financial**: No.

---

## PART 9 — Upload the app & submit — 15 min
Start with a private test, then go live.
1. Left menu → **Testing → Internal testing** → **Create new release**.
2. **Upload** your `app-release.aab` (from Part 5).
3. Release name fills automatically → add a one-line "What's new" → **Next → Save and publish**.
4. On the **Testers** tab, add your own email, then copy the **opt-in link**, open it on your
   phone, and install Dream Life from the Play Store. **This is your real end-to-end test.**
5. Happy? Left menu → **Production → Create new release** → upload the same `.aab` →
   **Save → Review release → Start rollout to Production**.
6. Google reviews it (a few hours to a few days). You'll get an email when it's live. 🎉

---

## If you get stuck
- Backend link shows an error → Part 2 didn't finish; check Render "Logs".
- App installs but "can't reach server" → the `.env` URL is wrong or you skipped
  `npm run mobile:build` in Part 4. Redo Part 4, rebuild the `.aab`.
- Play rejects the upload → make sure it's the `.aab` (not the debug `.apk`).
