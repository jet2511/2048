import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/2048/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'og_image.png'],
      manifest: {
        name: '2048 Game',
        short_name: '2048',
        description: 'A minimalist and polished clone of the famous 2048 game.',
        theme_color: '#faf8ef',
        background_color: '#faf8ef',
        display: 'standalone',
        icons: [
          {
            src: 'assets/meta/favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/meta/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  test: {
    include: ['tests/unit/**/*.{test,spec}.js']
  }
});
