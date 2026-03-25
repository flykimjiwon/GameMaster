import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: './',
  resolve: {
    alias: {
      'break_infinity.js': path.resolve(
        __dirname,
        '../../node_modules/break_infinity.js/dist/break_infinity.esm.js'
      ),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3010,
    open: true,
  },
  optimizeDeps: {
    include: ['phaser', 'rot-js', 'localforage', 'lz-string', 'gsap'],
  },
});
