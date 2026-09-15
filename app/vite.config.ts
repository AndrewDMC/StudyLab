import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: vite serve il frontend e fa da proxy verso l'API Express (§Fase 3-4
// del piano). In produzione (container, PIANO.md §8) è Express a servire
// direttamente il build statico — vedi app/server/index.js.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8081',
    },
  },
});
