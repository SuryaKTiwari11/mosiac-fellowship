import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  plugins: [tailwindcss(), react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: false,
    proxy: { '/api': 'http://127.0.0.1:3101' },
  },
  build: { outDir: '../dist', emptyOutDir: true },
});
