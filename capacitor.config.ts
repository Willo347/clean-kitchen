import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.cleankitchen.app',
  appName: 'Clean Kitchen',
  webDir: 'out',
  server: {
    url: 'https://cleankitchen.fr',
    cleartext: false,
  },
};

export default config;
