import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ejemplo.aventuramatematica',
  appName: 'NumiMates',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [
      'https://*.google.com',
      'https://*.googleapis.com',
      'https://*.googlesyndication.com',
      'https://*.doubleclick.net'
    ]
  }
};

export default config;
