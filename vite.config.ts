import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // GitHub Pagesでホストする場合は、リポジトリ名をbaseに設定
  // 例: https://username.github.io/compare-viz/ の場合は '/compare-viz/'
  const base = mode === 'production' ? '/compare-viz/' : '/'
  
  return {
    base,
    plugins: [react()],
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    publicDir: 'public',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // publicディレクトリの内容を確実にコピー
      copyPublicDir: true,
    },
  }
})