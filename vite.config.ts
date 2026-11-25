import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'window',
  },
  build: {
    // Hai bản build độc lập: web -> dist (Dockerfile/Vercel lấy thư mục này), app Android (--mode android) -> dist-android.
    // Tách riêng để build app không ghi đè bản web và ngược lại.
    outDir: mode === 'android' ? 'dist-android' : 'dist',
    rolldownOptions: {
      output: {
        // Mọi bản build (web, android) đều loại các lời gọi console.* (log token refresh, tín hiệu WebRTC, ...) khỏi bundle;
        // chỉ chế độ development giữ lại.
        minify: mode !== 'development' ? { compress: { dropConsole: true } } : undefined,
      },
    },
  },
  server: {
    allowedHosts: true,
  },
}))
