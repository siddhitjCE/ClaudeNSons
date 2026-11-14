import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../static/active-learning',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
  },
})
