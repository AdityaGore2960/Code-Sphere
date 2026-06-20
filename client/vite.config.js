import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'window',
  },
  resolve: {
    alias: {
      'events': 'events',
      'util': 'util',
      'buffer': 'buffer',
      'process': 'process/browser',
    },
  },
  optimizeDeps: {
    include: ['simple-peer', 'socket.io-client', 'buffer'],
  },
  // Dev server proxy — forwards /api/* to Express at port 5000
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
