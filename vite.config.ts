import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api/tmdb': {
        target: 'https://db.1flex.org',
        changeOrigin: true,
        headers: {
          Referer: 'https://www.1flex.org/',
          Origin: 'https://www.1flex.org',
        },
        rewrite: (path) => path.replace(/^\/api\/tmdb/, ''),
      },
    },
  },
});
