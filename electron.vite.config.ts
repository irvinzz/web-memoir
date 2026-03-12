import { resolve } from 'path';
import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared/index.ts'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          interop: 'auto',
        },
        external: ['crawlee', 'playwright', '@playwright/browser-chromium'],
      },
      watch: {
        buildDelay: 500,
      },
    },
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared/index.ts'),
        '@renderer': resolve('src/renderer/src'),
      },
    },
    plugins: [react()],
  },
});
