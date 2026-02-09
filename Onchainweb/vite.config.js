
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    base: '/',
    resolve: {
        alias: {
            '@wagmi/core': path.resolve(__dirname, 'node_modules/@wagmi/core'),
            '@wagmi/connectors': path.resolve(__dirname, 'node_modules/@wagmi/connectors'),
        },
    },
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
        exclude: [],
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    optimizeDeps: {
        include: ['@web3modal/ethers', 'ethers', 'ethers/lib/utils', '@wagmi/core', '@wagmi/connectors'],
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
    build: {
        target: 'es2020',
        minify: 'esbuild',
        esbuildOptions: {
            drop: ['console', 'debugger'],
            legalComments: 'none',
        },
        rollupOptions: {
            // No externals - bundle everything for browser
        },
        chunkSizeWarningLimit: 3000,
        sourcemap: false,
    },
    server: {
        port: 5173,
    },
});
