import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cloudflarePages from '@hono/vite-cloudflare-pages'
import path from 'path'

export default defineConfig({
  plugins: [
    cloudflarePages(),
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@server': path.resolve(__dirname, './server')
    }
  },
  build: {
    outDir: 'dist'
  }
})
