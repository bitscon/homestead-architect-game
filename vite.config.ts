import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,

    allowedHosts: ['mybarn.barn.workshop.home', 'localhost', '127.0.0.1'],

    hmr: {
      protocol: 'ws',
      clientPort: 8082, // browser connects to :8081 (host), not :5173
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
