// Service Index - Central export point for all services
// This provides a clean interface for importing services throughout the app

// Firebase Services
export * from './firebase.service.js';
export * from './database.service.js';

// Legacy API Service (for backward compatibility)
export * from './api.service.js';

// TURN Server Service
export * from './turn.service.js';

// Re-export commonly used functions with cleaner names
export {
  isFirebaseAvailable,
  // Auth
  firebaseSignIn as signIn,
  firebaseSignUp as signUp,
  firebaseSignOut as signOut,
  onAuthChange,
  // Users
  createUser,
  updateUser,
  getUserById,
  getAllUsers,
  deleteUser,
  subscribeToUsers,
  // Trades
  createTrade,
  updateTrade,
  getTrade,
  getUserTrades,
  subscribeToTrades,
  // Deposits & Withdrawals
  createDeposit,
  createWithdrawal,
  updateDeposit,
  updateWithdrawal,
  getUserDeposits,
  getUserWithdrawals,
  // Admin
  createAdmin,
  updateAdmin,
  getAdmin,
  getAllAdmins,
  // Notifications
  createNotification,
  markNotificationAsRead,
  getUserNotifications,
  subscribeToNotifications,
  // Settings
  getSettings,
  updateSettings,
  // Chat
  saveChatMessage,
  subscribeToChatMessages,
  saveActiveChat,
  updateActiveChat,
  subscribeToActiveChats,
  saveAdminReply,
  subscribeToAdminReplies,
  markReplyDelivered,
  subscribeToAllAdminReplies,
  cleanupChatPolling
} from './database.service.js';
