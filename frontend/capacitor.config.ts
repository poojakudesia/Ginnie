import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor wraps the built web app (dist/) into native iOS + Android projects
 * for the App Store / Google Play.
 *
 * IMPORTANT: a packaged app has no Vite dev proxy, so build with an absolute
 * backend URL:  VITE_API_BASE_URL=https://api.myginnie.life npm run build
 * (see src/api/client.ts).
 */
const config: CapacitorConfig = {
  appId: 'com.myginnie.app',
  appName: 'My Ginnie',
  webDir: 'dist',
  backgroundColor: '#FCF1F0',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#7C3763',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK', // dark icons on the light paper background
      backgroundColor: '#FCF1F0',
    },
  },
  ios: {
    contentInset: 'always',
  },
  // For on-device live reload during development, uncomment and set your LAN IP:
  // server: { url: 'http://192.168.1.42:5173', cleartext: true },
};

export default config;
