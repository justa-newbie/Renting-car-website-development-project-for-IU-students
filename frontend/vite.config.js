import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // Khi BE Spring Boot chạy ở cổng 8080, mọi request /api sẽ được chuyển tiếp sang đó (tránh lỗi CORS khi dev)
    proxy: { '/api': 'http://localhost:8080' },
  },
})
