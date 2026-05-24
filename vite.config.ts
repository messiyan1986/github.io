import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 相对路径，支持自定义域名
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
