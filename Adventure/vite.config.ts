import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative base path for GitHub Pages deployment in subfolder
  build: {
    outDir: 'dist',
  }
});
