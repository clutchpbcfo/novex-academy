import type { CapacitorConfig } from '@capacitor/cli';

/**
 * capacitor.config.ts
 *
 * Capacitor wraps the live academy webview. server.url points at
 * academy.novex.finance so the iOS app pulls the latest deployed
 * build automatically — no app re-submission for content updates.
 * App Review accepts hybrid webview apps as long as the native shell
 * adds value (3-tab structure, splash, status-bar, in-app browser).
 */
const config: CapacitorConfig = {
  appId: 'finance.novex.academy',
  appName: 'Novex Academy',
  webDir: 'public',
  server: {
    url: 'https://academy.novex.finance',
    cleartext: false,
    androidScheme: 'https',
    allowNavigation: ['academy.novex.finance', '*.novex.finance', 'novex.finance'],
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#05080d',
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#05080d',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: { style: 'DARK', backgroundColor: '#05080d', overlaysWebView: false },
    Browser: {},
  },
};

export default config;
