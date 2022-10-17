import { defineConfig } from 'vite';

export default defineConfig({
  base: '/pronostico-covid19/',
  server: {
    port: 3000,
  },

  publicDir: 'estaticos',

  build: {
    outDir: 'publico',
    assetsDir: 'recursos',
  },
});
