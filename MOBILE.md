# Shipping Dream Life to the App Store & Google Play

The app is a React (Vite) web app wrapped with **Capacitor** into native iOS and
Android projects. You build the web bundle, sync it into the native shells, then
submit from Xcode (iOS) and Android Studio (Google Play).

Everything below runs from the `frontend/` folder on a **Mac** (iOS requires macOS).

---

## 0. One-time prerequisites

- **Node 18+**, **npm**
- **Xcode** (App Store) + an **Apple Developer** account ($99/yr)
- **Android Studio** (Google Play) + a **Google Play Console** account ($25 once)
- CocoaPods: `sudo gem install cocoapods`

A **deployed backend** reachable over HTTPS (Render/Railway/Fly/your host). Native
apps can't reach `localhost:8000`. Point the app at it with `VITE_API_BASE_URL`.

---

## 1. Configure the backend URL

```bash
cd frontend
cp .env.example .env
# edit .env →  VITE_API_BASE_URL=https://api.yourdomain.com   (backend root, no /api)
```

On the backend, allow your app + web origins (already includes the Capacitor
origins). For a production web origin, set `CORS_ORIGIN_REGEX` in the backend env,
e.g. `CORS_ORIGIN_REGEX=https://.*\.yourdomain\.com`.

---

## 2. Install Capacitor + add the native platforms (first time only)

```bash
cd frontend
npm install
npm run build                 # produces dist/
npx cap add ios
npx cap add android
```

This creates `frontend/ios/` and `frontend/android/` (committed once, then
regenerated assets are gitignored).

---

## 3. App icons & splash screens

Source art lives in `frontend/resources/` (`icon-1024.png`, `splash-2732.png`),
generated from `resources/icon.svg` via `npm run icons`. Generate the platform
icon/splash sets:

```bash
npm run cap:assets      # runs @capacitor/assets over resources/
```

---

## 4. Build → sync → open

```bash
npm run mobile:build    # vite build + cap sync (copies dist/ into native projects)
npm run cap:ios         # opens Xcode
npm run cap:android     # opens Android Studio
```

Re-run `npm run mobile:build` after any web change.

---

## 5. iOS — App Store

1. In **Xcode**: select the **App** target → **Signing & Capabilities** → your Team;
   set the Bundle Identifier to `com.dreamlife.app` (or your own).
2. Set version (1.0.0) and build number.
3. **Product → Archive** → **Distribute App → App Store Connect**.
4. In **App Store Connect**: create the app, fill the listing (see
   `store-assets/listing.md`), upload screenshots, set privacy answers, submit for
   review.

> Sign in with Apple is **not** used (Google + Facebook only), so no extra Apple
> auth entitlement is required. If you later re-add Apple login, Apple requires it
> when you offer other social logins.

---

## 6. Android — Google Play (signed release AAB)

Google Play requires a **signed .aab** (App Bundle), NOT the debug .apk you used
for testing. Do this from `frontend/`.

### 6a. Create a release keystore (once — back this file up, you cannot recover it)
```bash
keytool -genkey -v -keystore ~/dreamlife-release.keystore \
  -alias dreamlife -keyalg RSA -keysize 2048 -validity 10000
```
Remember the passwords you set.

### 6b. Tell Gradle about it
Create `frontend/android/keystore.properties` (this file is gitignored — never commit it):
```
storeFile=/Users/YOU/dreamlife-release.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=dreamlife
keyPassword=YOUR_KEY_PASSWORD
```
In `frontend/android/app/build.gradle`, inside `android { ... }`, add signing:
```gradle
def kp = new Properties()
def kpFile = rootProject.file("keystore.properties")
if (kpFile.exists()) { kp.load(new FileInputStream(kpFile)) }

signingConfigs {
    release {
        storeFile file(kp['storeFile'])
        storePassword kp['storePassword']
        keyAlias kp['keyAlias']
        keyPassword kp['keyPassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
    }
}
```

### 6c. Build the release AAB (points at your HTTPS backend)
```bash
# .env → VITE_API_BASE_URL=https://dreamlife-api.onrender.com   (your deployed URL)
npm run mobile:build
cd android
./gradlew bundleRelease
```
Output: `frontend/android/app/build/outputs/bundle/release/app-release.aab`

### 6d. Upload in Play Console
1. play.google.com/console → **Create app**.
2. Complete: **App content** (privacy policy URL, data safety, content rating,
   target audience, ads declaration).
3. **Testing → Internal testing → Create release** → upload the `.aab` → add
   testers by email → share the opt-in link (fastest way to try it live).
4. When ready: **Production → Create release** → upload → submit for review.

---

## 7. Alternative: Google Play as a PWA (TWA)

The app is a valid installable PWA (`manifest.webmanifest` + icons + HTTPS). You
can wrap it for Play without Android Studio using **Bubblewrap**:

```bash
npx @bubblewrap/cli init --manifest https://yourdomain.com/manifest.webmanifest
npx @bubblewrap/cli build
```

(iOS has no PWA store path — use the Capacitor route above.)

---

## Checklist before submitting

- [ ] `VITE_API_BASE_URL` points at the live HTTPS backend
- [ ] Backend CORS allows the app origins
- [ ] `ANTHROPIC_API_KEY` set on the backend (Aura match + affirmation refine)
- [ ] Google/Facebook OAuth client IDs set for production redirect URIs
- [ ] Icons/splash generated (`npm run cap:assets`)
- [ ] Privacy policy URL live (required by both stores)
- [ ] Screenshots captured for each required device size
