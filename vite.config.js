import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The React app runs on http://localhost:5173 and forwards every /api and /uploads
// request to your unchanged Express backend on http://localhost:3000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
});
