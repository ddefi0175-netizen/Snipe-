
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/',
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
        exclude: [],
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    optimizeDeps: {
        exclude: ['@wagmi/core', '@wagmi/connectors', '@walletconnect/ethereum-provider'], // Add @walletconnect/ethereum-provider
        include: ['@web3modal/ethers', 'ethers', 'ethers/lib/utils'],
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
            external: ['@wagmi/core', '@wagmi/connectors', '@walletconnect/ethereum-provider'], // Add @walletconnect/ethereum-provider
            output: {
                globals: {
                    '@wagmi/core': 'WagmiCore',
                    '@wagmi/connectors': 'WagmiConnectors',
                    '@walletconnect/ethereum-provider': 'WalletConnectEthereumProvider', // Add this line
                },
                // ... manualChunks and other output options
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false,
    },
    server: {
        port: 5173,
    },
});
