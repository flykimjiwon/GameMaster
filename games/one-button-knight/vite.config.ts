import { defineConfig } from 'vite';
import path from 'path';

// GameMaster root has all the packages installed
const rootNodeModules = path.resolve(__dirname, '../../node_modules');

export default defineConfig({
  root: '.',
  resolve: {
    modules: [rootNodeModules, 'node_modules'],
  },
  server: {
    port: 3010,
    open: true,
    fs: {
      // Allow serving files from GameMaster root node_modules
      allow: ['../..'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['phaser', 'gsap', 'howler', 'localforage'],
  },
});
