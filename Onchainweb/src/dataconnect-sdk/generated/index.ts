/**
 * Auto-generated Data Connect types
 * Update by running: firebase deploy --only dataconnect
 */

// User operations
export type CreateUserInput = {
  id: string
  email: string
  username: string
  walletAddress: string
  status: string
  createdAt: Date
}

// Trade operations
export type CreateTradeInput = {
  userId: string
  pair: string
  direction: string
  entryPrice: number
  amount: number
  status: string
}

// Chat operations
export type SendMessageInput = {
  sessionId: string
  userId: string
  message: string
  timestamp: Date
}

// Notification operations
export type CreateNotificationInput = {
  userId: string
  type: string
  title: string
  message: string
  read: boolean
}

// Deposit operations
export type CreateDepositInput = {
  userId: string
  amount: number
  status: string
  paymentMethod: string
}
