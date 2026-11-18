import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'window',
  },
  // Bản production: loại các lời gọi console.* (log token refresh, tín hiệu WebRTC, ...) khỏi bundle.
  build: {
    rolldownOptions: {
      output: {
        minify: mode === 'production' ? { compress: { dropConsole: true } } : undefined,
      },
    },
  },
  server: {
    allowedHosts: true,
  },
}))
