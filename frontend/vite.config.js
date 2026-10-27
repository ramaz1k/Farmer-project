import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API = 'http://localhost:5260'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      ['/auth', '/farmers', '/products', '/orders', '/reviews'].map((p) => [
        p,
        { target: API, changeOrigin: true },
      ]),
    ),
  },
})
