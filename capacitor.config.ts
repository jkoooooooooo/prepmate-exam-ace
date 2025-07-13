import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.98e689e7d15c45ad8781ffc670369603',
  appName: 'prepmate-exam-ace',
  webDir: 'dist',
  server: {
    url: 'https://98e689e7-d15c-45ad-8781-ffc670369603.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4F46E5',
      showSpinner: false
    }
  }
};

export default config;