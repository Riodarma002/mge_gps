import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/wialon-api': {
        target: 'https://hst-api.wialon.eu',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/wialon-api/, ''),
      },
    },
  },
})
