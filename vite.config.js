import { defineConfig } from 'vite';

export default defineConfig({
  base: '/2048/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
