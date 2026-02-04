/**
 * Example: Using Data Connect Service in a React Component
 * Copy this pattern to integrate into your components
 */

import React, { useState, useEffect } from 'react'
import { usersService, tradesService, notificationsService } from '@/services/dataconnect.service'
import type { User, Trade, Notification } from '@/types/dataconnect.types'

// ========================================
// Example 1: User Profile Component
// ========================================

export function UserProfileExample({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const userData = await usersService.getUser(userId)
        setUser(userData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!user) return <div>User not found</div>

  return (
    <div className="user-profile">
      <h1>{user.email}</h1>
      <div>Wallet: {user.wallet}</div>
      <div>Balance: ${user.balance.toFixed(2)}</div>
      <div>VIP Level: {user.vipLevel}</div>
      <div>Status: {user.status}</div>
      <div>Points: {user.points}</div>
    </div>
  )
}

// ========================================
// Example 2: User Trades History Component
// ========================================

export function TradeHistoryExample({ userId }: { userId: string }) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)

  const TRADES_PER_PAGE = 20

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true)
      const offset = page * TRADES_PER_PAGE
      const userTrades = await tradesService.listUserTrades(
        userId,
        TRADES_PER_PAGE,
        offset
      )
      setTrades(userTrades)
      setLoading(false)
    }

    fetchTrades()
  }, [userId, page])

  return (
    <div className="trade-history">
      <h2>Trade History</h2>

      {loading && <div>Loading trades...</div>}

      {trades.length === 0 ? (
        <div>No trades found</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Pair</th>
              <th>Direction</th>
              <th>Entry Price</th>
              <th>Exit Price</th>
              <th>Amount</th>
              <th>Profit</th>
              <th>Result</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <tr key={trade.id}>
                <td>{trade.pair}</td>
                <td>{trade.direction.toUpperCase()}</td>
                <td>${trade.entryPrice}</td>
                <td>{trade.exitPrice ? `$${trade.exitPrice}` : '-'}</td>
                <td>{trade.amount}</td>
                <td>{trade.profit ? `$${trade.profit.toFixed(2)}` : '-'}</td>
                <td>{trade.result || '-'}</td>
                <td>{trade.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button onClick={() => setPage(page + 1)} disabled={trades.length < TRADES_PER_PAGE}>
          Next
        </button>
      </div>
    </div>
  )
}

// ========================================
// Example 3: Notifications Component
// ========================================

export function NotificationsExample({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch all notifications
    notificationsService.getUserNotifications(userId, 20).then(setNotifications)

    // Get unread count
    notificationsService.getUnreadCount(userId).then(setUnreadCount)

    // Set up polling for new notifications (update every 30 seconds)
    const interval = setInterval(() => {
      notificationsService.getUserNotifications(userId, 20).then(setNotifications)
      notificationsService.getUnreadCount(userId).then(setUnreadCount)
    }, 30000)

    return () => clearInterval(interval)
  }, [userId])

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationsService.markAsRead(notificationId)
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    )
    setUnreadCount(Math.max(0, unreadCount - 1))
  }

  return (
    <div className="notifications">
      <h2>Notifications ({unreadCount} unread)</h2>

      {notifications.length === 0 ? (
        <div>No notifications</div>
      ) : (
        <div className="notification-list">
          {notifications.map(notif => (
            <div key={notif.id} className={`notification ${notif.read ? 'read' : 'unread'}`}>
              <div className="notification-header">
                <span className="title">{notif.title}</span>
                <span className="type">{notif.type}</span>
              </div>
              <div className="message">{notif.message}</div>
              <div className="meta">
                <span className="time">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
                {!notif.read && (
                  <button onClick={() => handleMarkAsRead(notif.id)}>
                    Mark as read
                  </button>
                )}
                {notif.actionUrl && (
                  <a href={notif.actionUrl} className="action-link">
                    View Details →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ========================================
// Example 4: Create Trade Component
// ========================================

export function CreateTradeExample({ userId }: { userId: string }) {
  const [formData, setFormData] = useState({
    pair: 'BTC/USD',
    direction: 'up' as const,
    entryPrice: 0,
    amount: 0,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tradeId = await tradesService.createTrade({
        userId,
        pair: formData.pair,
        direction: formData.direction,
        entryPrice: formData.entryPrice,
        amount: formData.amount,
      })

      if (tradeId) {
        setMessage(`✅ Trade created: ${tradeId}`)
        setFormData({ pair: 'BTC/USD', direction: 'up', entryPrice: 0, amount: 0 })

        // Create notification
        await notificationsService.createNotification(
          userId,
          'Trade Opened',
          `${formData.direction.toUpperCase()} trade on ${formData.pair}`,
          'trade'
        )
      } else {
        setMessage('❌ Failed to create trade')
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-trade">
      <h2>Open Trade</h2>

      {message && <div className="message">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Pair:</label>
          <select
            value={formData.pair}
            onChange={e => setFormData({ ...formData, pair: e.target.value })}
          >
            <option>BTC/USD</option>
            <option>ETH/USD</option>
            <option>XRP/USD</option>
            <option>SOL/USD</option>
          </select>
        </div>

        <div>
          <label>Direction:</label>
          <select
            value={formData.direction}
            onChange={e => setFormData({
              ...formData,
              direction: e.target.value as 'up' | 'down'
            })}
          >
            <option value="up">UP ↑</option>
            <option value="down">DOWN ↓</option>
          </select>
        </div>

        <div>
          <label>Entry Price ($):</label>
          <input
            type="number"
            step="0.01"
            value={formData.entryPrice}
            onChange={e => setFormData({
              ...formData,
              entryPrice: parseFloat(e.target.value)
            })}
          />
        </div>

        <div>
          <label>Amount ($):</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={e => setFormData({
              ...formData,
              amount: parseFloat(e.target.value)
            })}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Opening...' : 'Open Trade'}
        </button>
      </form>
    </div>
  )
}

// ========================================
// Example 5: Admin User Management
// ========================================

export function AdminUserManagementExample() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newBalance, setNewBalance] = useState<number>(0)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const userList = await usersService.listUsers(50, 0)
      setUsers(userList)
      setLoading(false)
    }

    fetchUsers()
  }, [])

  const handleUpdateBalance = async (userId: string) => {
    const success = await usersService.updateUserBalance(userId, newBalance)
    if (success) {
      setUsers(users.map(u => (u.id === userId ? { ...u, balance: newBalance } : u)))
      setMessage('✅ Balance updated')
    }
  }

  return (
    <div className="admin-users">
      <h2>Manage Users</h2>

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Wallet</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.wallet.slice(0, 10)}...</td>
                  <td>${user.balance.toFixed(2)}</td>
                  <td>{user.status}</td>
                  <td>
                    <button onClick={() => setSelectedUser(user)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedUser && (
            <div className="edit-user">
              <h3>Edit {selectedUser.email}</h3>
              <div>
                <label>New Balance:</label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={e => setNewBalance(parseFloat(e.target.value))}
                />
              </div>
              <button onClick={() => handleUpdateBalance(selectedUser.id)}>
                Update Balance
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default {
  UserProfileExample,
  TradeHistoryExample,
  NotificationsExample,
  CreateTradeExample,
  AdminUserManagementExample,
}
