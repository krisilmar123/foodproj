import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Proxy API requests during development to avoid CORS issues.
      // Any request to /api is forwarded to the Supabase Edge Function endpoint.
      '/api': {
        target: 'https://teifdwvbkmevradstkwb.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/functions/v1/photos-api'),
      },
    },
  },
});
