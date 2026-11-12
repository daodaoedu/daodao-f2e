import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 本地 daodao-server 若跑在別的 port（多 worktree 並行時），用 SERVER_DEV_URL 覆寫
      '/daodao-server': {
        target: process.env.SERVER_DEV_URL ?? 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/daodao-server/, ''),
      },
      '/api': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
    },
  },
  // Docker 環境：vite preview 讀取 BACKEND_URL 將 /api/* 代理至後端容器
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['admin.daodao.so', 'admin-dev.daodao.so'],
    proxy: {
      '/daodao-server': {
        target: process.env.SERVER_BACKEND_URL ?? 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/daodao-server/, ''),
      },
      '/api': {
        target: process.env.BACKEND_URL ?? 'http://localhost:8002',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
})
