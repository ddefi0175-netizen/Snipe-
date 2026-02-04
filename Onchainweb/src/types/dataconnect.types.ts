/**
 * Firebase Data Connect - Generated Types
 * Auto-generated type definitions for all GraphQL operations
 * These provide full type safety when calling Firebase Data Connect APIs
 */

// ========================================
// USERS
// ========================================

export interface User {
  id: string;
  wallet: string;
  email?: string;
  balance: number;
  vipLevel: number;
  status: 'active' | 'suspended' | 'frozen';
  points: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
}

export interface GetUserInput {
  userId: string;
}

export interface GetUserOutput {
  users: {
    docs: User[];
  };
}

export interface ListUsersInput {
  limit: number;
  offset: number;
}

export interface ListUsersOutput {
  users: {
    docs: Omit<User, 'lastLogin'>[];
  };
}

export interface SearchUsersInput {
  searchTerm: string;
}

export interface SearchUsersOutput {
  users: {
    docs: Omit<User, 'lastLogin' | 'updatedAt'>[];
  };
}

export interface CreateUserInput {
  wallet: string;
  email?: string;
}

export interface CreateUserOutput {
  users_insert: {
    key: string;
  };
}

export interface UpdateUserBalanceInput {
  userId: string;
  newBalance: number;
}

export interface UpdateUserBalanceOutput {
  users_update: {
    modifiedCount: number;
  };
}

// ========================================
// TRADES
// ========================================

export interface Trade {
  id: string;
  userId: string;
  pair: string;
  direction: 'up' | 'down';
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  profit?: number;
  payout?: number;
  status: 'active' | 'completed' | 'cancelled';
  result?: 'win' | 'loss' | 'draw';
  timestamp: Timestamp;
  updatedAt: Timestamp;
}

export interface GetTradeInput {
  tradeId: string;
}

export interface GetTradeOutput {
  trades: {
    docs: Trade[];
  };
}

export interface ListUserTradesInput {
  userId: string;
  limit: number;
  offset: number;
}

export interface ListUserTradesOutput {
  trades: {
    docs: Omit<Trade, 'userId' | 'updatedAt'>[];
  };
}

export interface GetActiveTradesInput {
  limit: number;
}

export interface GetActiveTradesOutput {
  trades: {
    docs: Pick<Trade, 'id' | 'userId' | 'pair' | 'direction' | 'entryPrice' | 'amount' | 'status' | 'timestamp'>[];
  };
}

export interface GetTradeStatsInput {
  userId: string;
}

export interface GetTradeStatsOutput {
  trades: {
    docs: Pick<Trade, 'profit' | 'status' | 'result'>[];
  };
}

export interface CreateTradeInput {
  userId: string;
  pair: string;
  direction: 'up' | 'down';
  entryPrice: number;
  amount: number;
}

export interface CreateTradeOutput {
  trades_insert: {
    key: string;
  };
}

export interface CompleteTradeInput {
  tradeId: string;
  exitPrice: number;
  profit: number;
  payout: number;
  result: 'win' | 'loss' | 'draw';
}

export interface CompleteTradeOutput {
  trades_update: {
    modifiedCount: number;
  };
}

// ========================================
// CHAT & NOTIFICATIONS
// ========================================

export interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  senderName: string;
  senderWallet: string;
  sender: 'user' | 'admin';
  createdAt: Timestamp;
  delivered: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'trade' | 'deposit' | 'system' | 'alert';
  read: boolean;
  createdAt: Timestamp;
  readAt?: Timestamp;
  actionUrl?: string;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  network: string;
  transactionHash: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  approvedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedAt?: Timestamp;
}

// ========================================
// UTILITY TYPES
// ========================================

export type Timestamp = Date | {
  _seconds: number;
  _nanoseconds: number;
};

export interface QueryOptions {
  useCache?: boolean;
  cacheDuration?: number;
}
