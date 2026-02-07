// Service Index - Central export point for all services
// This provides a clean interface for importing services throughout the app

// Firebase Services
export * from '../lib/firebase.js';

// Legacy API Service (for backward compatibility)
export * from './api.service.js';

// TURN Server Service
export * from './turn.service.js';

// Re-export commonly used functions with cleaner names
export {
  isFirebaseAvailable,
  // Auth
  firebaseSignIn as signIn,
  firebaseSignOut as signOut,
  onAuthStateChanged,
  // Users
  saveUser as createUser,
  saveUser as updateUser,
  getUser as getUserById,
  subscribeToUsers,
  // Trades
  subscribeToTradeUpdates as subscribeToTrades,
  // Deposits & Withdrawals
  subscribeToDeposits,
  subscribeToWithdrawals,
  // Admin
  // createAdmin,
  // updateAdmin,
  // getAdmin,
  // getAllAdmins,
  // Notifications
  // createNotification,
  // markNotificationAsRead,
  // getUserNotifications,
  // subscribeToNotifications,
  // Settings
  // getSettings,
  // updateSettings,
  // Chat
  saveChatMessage,
  subscribeToChatMessages,
  saveActiveChat,
  updateActiveChat,
  subscribeToActiveChats,
  saveAdminReply,
  // subscribeToAdminReplies,
  // markReplyDelivered,
  // subscribeToAllAdminReplies,
  // cleanupChatPolling
} from '../lib/firebase.js';
