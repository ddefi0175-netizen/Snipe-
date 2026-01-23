// Firebase Configuration
// Centralized configuration for Firebase services

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  ADMINS: 'admins',
  TRADES: 'trades',
  DEPOSITS: 'deposits',
  WITHDRAWALS: 'withdrawals',
  CHAT_MESSAGES: 'chatMessages',
  ACTIVE_CHATS: 'activeChats',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  ACTIVITY_LOGS: 'activityLogs',
  STAKING: 'staking',
  BONUSES: 'bonuses',
  AI_ARBITRAGE_INVESTMENTS: 'aiArbitrageInvestments'
};

// Real-time listener configuration
export const LISTENER_CONFIG = {
  CHAT_LIMIT: 100,
  NOTIFICATION_LIMIT: 50,
  TRADES_LIMIT: 100
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
};
