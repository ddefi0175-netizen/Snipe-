/**
 * Firebase Data Connect Service Layer
 * Unified API for accessing Firestore data through Data Connect
 * Provides type-safe queries and mutations with automatic caching
 */

import { db, isFirebaseAvailable } from '../lib/firebase'
import type {
  User,
  Trade,
  ChatMessage,
  Notification,
  Deposit,
  GetUserInput,
  GetUserOutput,
  ListUsersInput,
  ListUsersOutput,
  CreateTradeInput,
  CreateTradeOutput,
  CompleteTradeInput,
  CompleteTradeOutput,
  GetTradeInput,
  GetTradeOutput,
  ListUserTradesInput,
  ListUserTradesOutput,
  GetActiveTradesInput,
  GetActiveTradesOutput,
} from '../types/dataconnect.types'

// Cache for storing query results
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes default

// ========================================
// USERS SERVICE
// ========================================

export const usersService = {
  /**
   * Get single user by ID
   * @param userId - User ID (wallet address or doc ID)
   * @returns User data with all fields
   */
  async getUser(userId: string): Promise<User | null> {
    if (!isFirebaseAvailable()) {
      const cached = localStorage.getItem(`user_${userId}`)
      return cached ? JSON.parse(cached) : null
    }

    const cacheKey = `user_${userId}`
    const cached = getFromCache(cacheKey)
    if (cached) return cached as User

    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const userDoc = await getDoc(doc(db, 'users', userId))

      if (!userDoc.exists()) return null

      const userData = { id: userDoc.id, ...userDoc.data() } as User
      setInCache(cacheKey, userData)
      return userData
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  },

  /**
   * List users with pagination
   * @param limit - Number of users to fetch
   * @param offset - Number of users to skip
   * @returns List of users
   */
  async listUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    if (!isFirebaseAvailable()) return []

    const cacheKey = `users_list_${limit}_${offset}`
    const cached = getFromCache(cacheKey)
    if (cached) return cached as User[]

    try {
      const { collection, query, orderBy, limit: fbLimit, getDocs } = await import('firebase/firestore')
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        fbLimit(limit)
      )

      const snapshot = await getDocs(q)
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
      setInCache(cacheKey, users)
      return users
    } catch (error) {
      console.error('Error listing users:', error)
      return []
    }
  },

  /**
   * Search users by wallet or email
   * @param searchTerm - Search term (wallet address or email)
   * @returns Matching users
   */
  async searchUsers(searchTerm: string): Promise<User[]> {
    if (!isFirebaseAvailable()) return []

    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore')
      const q = query(
        collection(db, 'users'),
        where('wallet', '>=', searchTerm),
        where('wallet', '<=', searchTerm + '\uf8ff')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  },

  /**
   * Create new user
   * @param wallet - Wallet address
   * @param email - Optional email
   * @returns User ID
   */
  async createUser(wallet: string, email?: string): Promise<string | null> {
    if (!isFirebaseAvailable()) {
      const id = `user_${Date.now()}`
      const user = {
        id,
        wallet,
        email,
        balance: 0,
        vipLevel: 1,
        status: 'active' as const,
        points: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      localStorage.setItem(`user_${id}`, JSON.stringify(user))
      return id
    }

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const docRef = await addDoc(collection(db, 'users'), {
        wallet,
        email,
        balance: 0,
        vipLevel: 1,
        status: 'active',
        points: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      clearCachePattern('users_list_')
      return docRef.id
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  },

  /**
   * Update user balance
   * @param userId - User ID
   * @param newBalance - New balance amount
   * @returns Success indicator
   */
  async updateUserBalance(userId: string, newBalance: number): Promise<boolean> {
    if (!isFirebaseAvailable()) {
      const user = localStorage.getItem(`user_${userId}`)
      if (user) {
        const userData = JSON.parse(user)
        userData.balance = newBalance
        userData.updatedAt = new Date()
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData))
      }
      return true
    }

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      await updateDoc(doc(db, 'users', userId), {
        balance: newBalance,
        updatedAt: serverTimestamp(),
      })

      clearCachePattern(`user_${userId}`)
      return true
    } catch (error) {
      console.error('Error updating balance:', error)
      return false
    }
  },
}

// ========================================
// TRADES SERVICE
// ========================================

export const tradesService = {
  /**
   * Get single trade
   * @param tradeId - Trade ID
   * @returns Trade data
   */
  async getTrade(tradeId: string): Promise<Trade | null> {
    if (!isFirebaseAvailable()) return null

    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const tradeDoc = await getDoc(doc(db, 'trades', tradeId))

      if (!tradeDoc.exists()) return null
      return { id: tradeDoc.id, ...tradeDoc.data() } as Trade
    } catch (error) {
      console.error('Error fetching trade:', error)
      return null
    }
  },

  /**
   * List user trades with pagination
   * @param userId - User ID
   * @param limit - Number of trades
   * @param offset - Pagination offset
   * @returns User's trades
   */
  async listUserTrades(userId: string, limit: number = 50, offset: number = 0): Promise<Trade[]> {
    if (!isFirebaseAvailable()) return []

    try {
      const { collection, query, where, orderBy, limit: fbLimit, getDocs } = await import('firebase/firestore')
      const q = query(
        collection(db, 'trades'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        fbLimit(limit)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade))
    } catch (error) {
      console.error('Error listing trades:', error)
      return []
    }
  },

  /**
   * Get active trades
   * @param limit - Max number of active trades
   * @returns Active trades across all users
   */
  async getActiveTrades(limit: number = 100): Promise<Trade[]> {
    if (!isFirebaseAvailable()) return []

    const cacheKey = `active_trades_${limit}`
    const cached = getFromCache(cacheKey)
    if (cached) return cached as Trade[]

    try {
      const { collection, query, where, limit: fbLimit, getDocs } = await import('firebase/firestore')
      const q = query(
        collection(db, 'trades'),
        where('status', '==', 'active'),
        fbLimit(limit)
      )

      const snapshot = await getDocs(q)
      const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade))
      setInCache(cacheKey, trades, 1 * 60 * 1000) // 1 minute cache
      return trades
    } catch (error) {
      console.error('Error fetching active trades:', error)
      return []
    }
  },

  /**
   * Create new trade
   * @param input - Trade creation input
   * @returns Trade ID
   */
  async createTrade(input: CreateTradeInput): Promise<string | null> {
    if (!isFirebaseAvailable()) return null

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const docRef = await addDoc(collection(db, 'trades'), {
        userId: input.userId,
        pair: input.pair,
        direction: input.direction,
        entryPrice: input.entryPrice,
        amount: input.amount,
        status: 'active',
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      clearCachePattern('active_trades_')
      return docRef.id
    } catch (error) {
      console.error('Error creating trade:', error)
      return null
    }
  },

  /**
   * Complete trade
   * @param input - Trade completion input
   * @returns Success indicator
   */
  async completeTrade(input: CompleteTradeInput): Promise<boolean> {
    if (!isFirebaseAvailable()) return false

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      await updateDoc(doc(db, 'trades', input.tradeId), {
        exitPrice: input.exitPrice,
        profit: input.profit,
        payout: input.payout,
        result: input.result,
        status: 'completed',
        updatedAt: serverTimestamp(),
      })

      clearCachePattern('active_trades_')
      return true
    } catch (error) {
      console.error('Error completing trade:', error)
      return false
    }
  },
}

// ========================================
// CHAT SERVICE
// ========================================

export const chatService = {
  /**
   * Get messages for a chat session
   * @param sessionId - Chat session ID
   * @param limit - Number of messages to fetch
   * @returns Chat messages
   */
  async getChatMessages(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    if (!isFirebaseAvailable()) {
      const cached = localStorage.getItem(`chat_${sessionId}`)
      return cached ? JSON.parse(cached) : []
    }

    try {
      const { collection, query, where, orderBy, limit: fbLimit, getDocs } = await import('firebase/firestore')
      const q = query(
        collection(db, 'chatMessages'),
        where('sessionId', '==', sessionId),
        orderBy('createdAt', 'desc'),
        fbLimit(limit)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  },

  /**
   * Send message
   * @param sessionId - Chat session ID
   * @param message - Message text
   * @param senderName - Sender name
   * @param senderWallet - Sender wallet
   * @param sender - Sender type (user or admin)
   * @returns Message ID
   */
  async sendMessage(
    sessionId: string,
    message: string,
    senderName: string,
    senderWallet: string,
    sender: 'user' | 'admin' = 'user'
  ): Promise<string | null> {
    if (!isFirebaseAvailable()) {
      const id = `msg_${Date.now()}`
      const msg = {
        id,
        sessionId,
        message,
        senderName,
        senderWallet,
        sender,
        createdAt: new Date(),
        delivered: false,
      }
      const cached = localStorage.getItem(`chat_${sessionId}`)
      const messages = cached ? JSON.parse(cached) : []
      messages.push(msg)
      localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages))
      return id
    }

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const docRef = await addDoc(collection(db, 'chatMessages'), {
        sessionId,
        message,
        senderName,
        senderWallet,
        sender,
        createdAt: serverTimestamp(),
        delivered: false,
      })

      return docRef.id
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  },
}

// ========================================
// NOTIFICATIONS SERVICE
// ========================================

export const notificationsService = {
  /**
   * Get user notifications
   * @param userId - User ID
   * @param limit - Number of notifications
   * @returns User notifications
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    if (!isFirebaseAvailable()) return []

    try {
      const { collection, query, where, orderBy, limit: fbLimit, getDocs } = await import('firebase/firestore')
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        fbLimit(limit)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  },

  /**
   * Get unread notifications count
   * @param userId - User ID
   * @returns Number of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    if (!isFirebaseAvailable()) return 0

    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore')
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      )

      const snapshot = await getDocs(q)
      return snapshot.size
    } catch (error) {
      console.error('Error counting notifications:', error)
      return 0
    }
  },

  /**
   * Create notification
   * @param userId - User ID
   * @param title - Notification title
   * @param message - Notification message
   * @param type - Notification type
   * @param actionUrl - Optional action URL
   * @returns Notification ID
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'trade' | 'deposit' | 'system' | 'alert',
    actionUrl?: string
  ): Promise<string | null> {
    if (!isFirebaseAvailable()) return null

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const docRef = await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        actionUrl,
        read: false,
        createdAt: serverTimestamp(),
      })

      return docRef.id
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  },

  /**
   * Mark notification as read
   * @param notificationId - Notification ID
   * @returns Success indicator
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    if (!isFirebaseAvailable()) return false

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp(),
      })

      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  },
}

// ========================================
// CACHE UTILITIES
// ========================================

function getFromCache(key: string): unknown | null {
  const item = cache.get(key)
  if (!item) return null

  if (Date.now() - item.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return item.data
}

function setInCache(key: string, data: unknown, duration: number = CACHE_DURATION): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

function clearCachePattern(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

// Clear old cache entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, item] of cache.entries()) {
    if (now - item.timestamp > CACHE_DURATION) {
      cache.delete(key)
    }
  }
}, 60 * 1000) // Every minute
