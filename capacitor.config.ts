import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paytrack',
  appName: 'PayTrack',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
      autoDeletePrevious: false,
    }
  }
};

export default config;
