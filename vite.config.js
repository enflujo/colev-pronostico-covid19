import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },

  publicDir: 'estaticos',

  build: {
    outDir: 'publico',
    assetsDir: 'recursos',
  },
});
