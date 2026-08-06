import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ejemplo.aventuramatematica',
  appName: 'NumiMates',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
