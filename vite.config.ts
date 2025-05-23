import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/ai-project-3rd-sem/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://traffic-monitoring-backend.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
