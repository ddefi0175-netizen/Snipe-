import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages - change 'Snipe' to your repo name
  // For custom domain or Vercel/Netlify, use '/'
  base: '/Snipe/',
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    // Increase chunk size warning limit (default is 500kB)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and smaller bundles
        manualChunks: {
          // React core libraries
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
})
