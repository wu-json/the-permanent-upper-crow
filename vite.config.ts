import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
  plugins: [tailwindcss()],
  server: {
    port: 3000,
  },
});
