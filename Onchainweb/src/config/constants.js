// Application Constants
// Central location for all app-wide constants

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'OnchainWeb',
  URL: import.meta.env.VITE_APP_URL || 'https://onchainweb.app',
  VERSION: '2.0.0', // Updated to 2.0 for Firebase migration
  DESCRIPTION: 'Real-Time Trading Platform with Firebase'
};

// API Configuration (Legacy - for backward compatibility)
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE || '',
  TIMEOUT: 30000
};

// WalletConnect Configuration
export const WALLET_CONFIG = {
  PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  SUPPORTED_CHAINS: [1, 56, 137], // Ethereum, BSC, Polygon
  SUPPORTED_WALLETS: [
    'MetaMask',
    'Trust Wallet',
    'Coinbase Wallet',
    'OKX Wallet',
    'Phantom',
    'Binance Web3 Wallet',
    'TokenPocket',
    'Rainbow',
    'Ledger Live',
    'imToken',
    'WalletConnect'
  ]
};

// Trading Configuration
export const TRADING_CONFIG = {
  MIN_TRADE_AMOUNT: 0.001,
  MAX_TRADE_AMOUNT: 1000000,
  DEFAULT_LEVERAGE: 1,
  MAX_LEVERAGE: 100
};

// Real-time Update Intervals (for non-Firebase data)
export const UPDATE_INTERVALS = {
  PRICE_UPDATE: 3000,      // 3 seconds
  BALANCE_UPDATE: 5000,    // 5 seconds
  TRADE_STATUS: 2000       // 2 seconds
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500
};

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  ENABLE_FIREBASE: true,
  ENABLE_LEGACY_API: !!import.meta.env.VITE_API_BASE
};

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TRADE: '/trade',
  WALLET: '/wallet',
  ADMIN: '/admin',
  MASTER_ADMIN: '/master-admin',
  CUSTOMER_SERVICE: '/customer-service'
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MASTER: 'master'
};

// Transaction Types
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRADE: 'trade',
  BONUS: 'bonus',
  STAKING_REWARD: 'staking_reward'
};

// Trade Statuses
export const TRADE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed'
};
