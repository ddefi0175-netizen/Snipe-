import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Base path - use '/' for custom domain or Vercel/Netlify
  base: '/',
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and smaller bundles
        manualChunks: {
          // React core libraries
          'vendor-react': ['react', 'react-dom'],
          // Firebase
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // WalletConnect
          'wallet': ['@walletconnect/universal-provider'],
        },
        // Asset file names for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(extType)) {
            extType = 'img'
          } else if (/woff|woff2|ttf|otf|eot/i.test(extType)) {
            extType = 'fonts'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Increase chunk size warning limit (default is 500kB)
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
})
