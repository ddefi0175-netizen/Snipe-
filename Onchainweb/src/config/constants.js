
// Application Constants
// Central location for all app-wide constants

const normalizeRoute = (value, fallback) => {
  const candidate = (value || '').trim();
  if (!candidate) return fallback;
  return candidate.startsWith('/') ? candidate : `/${candidate}`;
};

const ADMIN_FEATURE_ENABLED = import.meta.env?.VITE_ENABLE_ADMIN === 'true';
const ADMIN_ROUTE = normalizeRoute(import.meta.env?.VITE_ADMIN_ROUTE, '/admin');
const MASTER_ADMIN_ROUTE = normalizeRoute(import.meta.env?.VITE_MASTER_ADMIN_ROUTE, '/master-admin');
const ADMIN_ALLOWLIST = (import.meta.env?.VITE_ADMIN_ALLOWLIST || '')
  .split(',')
  .map(entry => entry.trim().toLowerCase())
  .filter(Boolean);

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'OnchainWeb',
  URL: import.meta.env.VITE_APP_URL || 'https://onchainweb.app',
  VERSION: '2.0.0', // Updated to 2.0 for Firebase migration
  DESCRIPTION: 'Real-Time Trading Platform with Firebase'
};

// API Configuration (Disabled - using Firebase only)
export const API_CONFIG = {
  BASE_URL: '', // No legacy API - Firebase only
  TIMEOUT: 30000
  // BACKEND_AUTH_URL removed - Firebase Auth is used for all authentication
  // See FIREBASE_VS_BACKEND_JWT_CLARIFICATION.md for details
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

export const SUPPORTED_CHAINS = [
    { id: 1, name: 'Ethereum' },
    { id: 56, name: 'BNB Smart Chain' },
    { id: 137, name: 'Polygon' },
];

export const WALLET_CONNECTORS = {
    METAMASK: { name: 'MetaMask', icon: '/wallets/metamask.svg' },
    TRUSTWALLET: { name: 'Trust Wallet', icon: '/wallets/trustwallet.svg' },
    COINBASE: { name: 'Coinbase Wallet', icon: '/wallets/coinbase.svg' },
};

// Cloudflare TURN Server Configuration
export const TURN_SERVER_CONFIG = {
  SERVER_NAME: import.meta.env.VITE_CLOUDFLARE_TURN_SERVER_NAME || '',
  TOKEN_ID: import.meta.env.VITE_CLOUDFLARE_TURN_TOKEN_ID || '',
  API_TOKEN: import.meta.env.VITE_CLOUDFLARE_TURN_API_TOKEN || '',
  API_ENDPOINT: 'https://rtc.live.cloudflare.com/v1/turn/keys',
  TTL: 86400 // 24 hours
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
  ENABLE_LEGACY_API: false, // Disabled - Firebase only
  ENABLE_ADMIN: ADMIN_FEATURE_ENABLED
};

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TRADE: '/trade',
  WALLET: '/wallet',
  ADMIN: ADMIN_ROUTE,
  MASTER_ADMIN: MASTER_ADMIN_ROUTE,
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

// Storage Keys
export const STORAGE_KEYS = {
    WALLET_CONNECTED: 'wallet_connected',
    WALLET_ADDRESS: 'wallet_address',
    WALLET_CHAIN_ID: 'wallet_chainId',
    WALLET_CONNECTOR_TYPE: 'wallet_connector_type',
};

// Admin guard configuration
export const ADMIN_GUARD = {
  ENABLED: ADMIN_FEATURE_ENABLED,
  ROUTE: ADMIN_ROUTE,
  MASTER_ROUTE: MASTER_ADMIN_ROUTE,
  ALLOWLIST: ADMIN_ALLOWLIST
};
