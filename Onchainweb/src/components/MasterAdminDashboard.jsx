import React, { useState, useEffect, useCallback, useMemo } from 'react'

// Lazy localStorage helper to avoid blocking initial render
const getFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (e) {
    return defaultValue
  }
}

export default function MasterAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [activeSection, setActiveSection] = useState('user-agents')
  const [searchQuery, setSearchQuery] = useState('')

  // User Management States - lazy loaded after auth
  const [users, setUsers] = useState([])

  // User Agents/Sessions tracking - lazy loaded
  const [userAgents, setUserAgents] = useState([])

  // Deposits data - lazy loaded
  const [deposits, setDeposits] = useState([])

  // Withdrawals data - lazy loaded
  const [withdrawals, setWithdrawals] = useState([])

  // Trade History - lazy loaded
  const [tradeHistory, setTradeHistory] = useState([])

  // Staking Plans - lazy loaded
  const [stakingPlans, setStakingPlans] = useState([])

  // Bonus Programs - lazy loaded
  const [bonusPrograms, setBonusPrograms] = useState({})

  // Live Chat Management - lazy loaded
  const [activeChats, setActiveChats] = useState([])

  const [chatLogs, setChatLogs] = useState([])

  const [selectedChat, setSelectedChat] = useState(null)
  const [adminReplyMessage, setAdminReplyMessage] = useState('')
  const [newMessageAlert, setNewMessageAlert] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)

  // Currencies Management - lazy loaded
  const [currencies, setCurrencies] = useState([])

  // Networks Management - lazy loaded
  const [networks, setNetworks] = useState([])

  // Deposit Wallets/Addresses - lazy loaded
  const [depositWallets, setDepositWallets] = useState([])

  // Exchange Rates - lazy loaded
  const [exchangeRates, setExchangeRates] = useState([])

  // Trading Levels - lazy loaded
  const [tradingLevels, setTradingLevels] = useState([])

  // Form states for creating new items
  const [newCurrency, setNewCurrency] = useState({ name: '', symbol: '', icon: '' })
  const [newNetwork, setNewNetwork] = useState({ name: '', symbol: '', chainId: '', confirmations: 12 })
  const [newWallet, setNewWallet] = useState({ network: '', address: '', label: '' })
  const [newExchangeRate, setNewExchangeRate] = useState({ from: '', to: 'USDT', rate: 0 })
  const [newTradingLevel, setNewTradingLevel] = useState({ name: '', countdown: 180, profitPercent: 18, minCapital: 100, maxCapital: 10000 })
  const [editingTradingLevel, setEditingTradingLevel] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(null)

  // User Activity Logs - lazy loaded
  const [userActivityLogs, setUserActivityLogs] = useState([])

  // Admin Audit Logs - lazy loaded
  const [adminAuditLogs, setAdminAuditLogs] = useState([])

  // Admin Roles Management - lazy loaded
  const [adminRoles, setAdminRoles] = useState([])

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: []
  })

  const [activityFilter, setActivityFilter] = useState('all')

  // Site Settings - lazy loaded
  const [siteSettings, setSiteSettings] = useState({})

  // Trade Options Settings - lazy loaded
  const [tradeOptions, setTradeOptions] = useState({})

  // Active Trades - for real-time trade control
  const [activeTrades, setActiveTrades] = useState([])

  // Default data for initial load
  const defaultData = useMemo(() => ({
    userAgents: [
      { uid: '310738586', email: 'moonmoon17652@gmail.com', active: true, device: 'Windows', ip: '154.222.5.198', lastSeen: new Date().toISOString() },
      { uid: '800746508', email: 'mcpathang18@gmail.com', active: true, device: 'iOS', ip: '72.135.7.50', lastSeen: new Date().toISOString() },
    ],
    stakingPlans: [
      { id: 1, name: 'Starter', minAmount: 100, maxAmount: 1000, duration: 30, apy: 8, active: true },
      { id: 2, name: 'Growth', minAmount: 1000, maxAmount: 10000, duration: 60, apy: 12, active: true },
      { id: 3, name: 'Premium', minAmount: 10000, maxAmount: 100000, duration: 90, apy: 18, active: true },
      { id: 4, name: 'VIP', minAmount: 100000, maxAmount: 1000000, duration: 180, apy: 25, active: true },
    ],
    bonusPrograms: {
      welcomeBonus: { enabled: true, amount: 100, description: 'Sign up and complete KYC' },
      referralBonus: { enabled: true, amount: 50, description: 'Per successful referral' },
      tradingCashback: { enabled: true, percentage: 20, minTrades: 10, description: 'Up to 20% on trading fees' },
      stakingBonus: { enabled: true, percentage: 12, description: 'APY on staking' },
      vipBonus: {
        enabled: true,
        levels: [
          { level: 1, minDeposit: 0, bonus: 0, cashback: 5 },
          { level: 2, minDeposit: 1000, bonus: 50, cashback: 10 },
          { level: 3, minDeposit: 5000, bonus: 100, cashback: 15 },
          { level: 4, minDeposit: 10000, bonus: 200, cashback: 20 },
          { level: 5, minDeposit: 50000, bonus: 500, cashback: 25 },
        ]
      },
      promotionEndDate: '2025-01-31'
    },
    currencies: [
      { id: 1, name: 'Bitcoin', symbol: 'BTC', icon: '₿', status: 'active', createdAt: '2024-01-01' },
      { id: 2, name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', status: 'active', createdAt: '2024-01-01' },
      { id: 3, name: 'Tether', symbol: 'USDT', icon: '₮', status: 'active', createdAt: '2024-01-01' },
      { id: 4, name: 'BNB', symbol: 'BNB', icon: '⬡', status: 'active', createdAt: '2024-01-01' },
      { id: 5, name: 'Solana', symbol: 'SOL', icon: '◎', status: 'active', createdAt: '2024-01-01' },
    ],
    networks: [
      { id: 1, name: 'Bitcoin Network', symbol: 'BTC', chainId: '-', confirmations: 3, status: 'active' },
      { id: 2, name: 'Ethereum (ERC-20)', symbol: 'ETH', chainId: '1', confirmations: 12, status: 'active' },
      { id: 3, name: 'BNB Smart Chain (BEP-20)', symbol: 'BSC', chainId: '56', confirmations: 15, status: 'active' },
      { id: 4, name: 'Tron (TRC-20)', symbol: 'TRC20', chainId: '-', confirmations: 20, status: 'active' },
      { id: 5, name: 'Solana', symbol: 'SOL', chainId: '-', confirmations: 32, status: 'active' },
      { id: 6, name: 'Polygon', symbol: 'MATIC', chainId: '137', confirmations: 128, status: 'active' },
    ],
    depositWallets: [
      { id: 1, network: 'BTC', address: '', label: 'Bitcoin Wallet', status: 'active' },
      { id: 2, network: 'ETH', address: '', label: 'Ethereum Wallet', status: 'active' },
      { id: 3, network: 'BSC', address: '', label: 'BNB Smart Chain Wallet', status: 'active' },
      { id: 4, network: 'TRC20', address: '', label: 'Tron Wallet', status: 'active' },
      { id: 5, network: 'SOL', address: '', label: 'Solana Wallet', status: 'active' },
    ],
    exchangeRates: [
      { id: 1, from: 'BTC', to: 'USDT', rate: 42500.00, status: 'active' },
      { id: 2, from: 'ETH', to: 'USDT', rate: 2250.00, status: 'active' },
      { id: 3, from: 'BNB', to: 'USDT', rate: 312.50, status: 'active' },
      { id: 4, from: 'SOL', to: 'USDT', rate: 98.75, status: 'active' },
      { id: 5, from: 'USDT', to: 'USD', rate: 1.00, status: 'active' },
    ],
    tradingLevels: [
      { id: 1, name: 'Level-1', countdown: 180, profitPercent: 18.00, minCapital: 200.00, maxCapital: 20000.00, status: 'active' },
      { id: 2, name: 'Level-2', countdown: 240, profitPercent: 23.00, minCapital: 20001.00, maxCapital: 50000.00, status: 'active' },
      { id: 3, name: 'Level-3', countdown: 360, profitPercent: 35.00, minCapital: 50001.00, maxCapital: 100000.00, status: 'active' },
      { id: 4, name: 'Level-4', countdown: 480, profitPercent: 50.00, minCapital: 100001.00, maxCapital: 300000.00, status: 'active' },
      { id: 5, name: 'Level-5', countdown: 600, profitPercent: 100.00, minCapital: 300001.00, maxCapital: 500000.00, status: 'active' },
    ],
    userActivityLogs: [
      { id: 1, userId: '310738586', userEmail: 'moonmoon17652@gmail.com', action: 'login', details: 'Logged in from Windows device', ip: '154.222.5.198', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, userId: '310738586', userEmail: 'moonmoon17652@gmail.com', action: 'deposit', details: 'Deposited $500 via Crypto', ip: '154.222.5.198', timestamp: new Date(Date.now() - 3000000).toISOString() },
    ],
    adminAuditLogs: [
      { id: 1, adminId: 'master', adminName: 'Master Admin', action: 'login', details: 'Admin logged into dashboard', ip: '192.168.1.1', timestamp: new Date(Date.now() - 7200000).toISOString() },
    ],
    adminRoles: [
      { id: 1, username: 'master', email: 'master@onchainweb.com', role: 'super_admin', permissions: ['all'], status: 'active', createdAt: '2024-01-01T00:00:00.000Z', lastLogin: new Date().toISOString() },
    ],
    siteSettings: {
      siteName: 'OnchainWeb',
      siteUrl: 'https://onchainweb.app',
      supportEmail: 'support@onchainweb.com',
      maintenanceMode: false,
      registrationEnabled: true,
      withdrawalEnabled: true,
      depositEnabled: true,
      tradingEnabled: true,
      minWithdrawal: 10,
      maxWithdrawal: 100000,
      withdrawalFee: 1,
      referralBonus: 50,
      welcomeBonus: 100,
    },
    tradeOptions: {
      minTrade: 10,
      maxTrade: 50000,
      defaultDuration: 60,
      winRate: 50,
      profitPercentage: 85,
    }
  }), [])

  // Load all data after authentication - single batch load
  const loadAllData = useCallback(() => {
    // Use requestAnimationFrame to not block UI
    requestAnimationFrame(() => {
      setUsers(getFromStorage('registeredUsers', []))
      setUserAgents(getFromStorage('userAgents', defaultData.userAgents))
      setDeposits(getFromStorage('adminDeposits', []))
      setWithdrawals(getFromStorage('adminWithdrawals', []))
      setTradeHistory(getFromStorage('tradeHistory', []))
      setStakingPlans(getFromStorage('stakingPlans', defaultData.stakingPlans))
      setBonusPrograms(getFromStorage('bonusPrograms', defaultData.bonusPrograms))
      setActiveChats(getFromStorage('activeChats', []))
      setChatLogs(getFromStorage('customerChatLogs', []))
      setCurrencies(getFromStorage('adminCurrencies', defaultData.currencies))
      setNetworks(getFromStorage('adminNetworks', defaultData.networks))
      setDepositWallets(getFromStorage('adminDepositWallets', defaultData.depositWallets))
      setExchangeRates(getFromStorage('adminExchangeRates', defaultData.exchangeRates))
      setTradingLevels(getFromStorage('adminTradingLevels', defaultData.tradingLevels))
      setUserActivityLogs(getFromStorage('userActivityLogs', defaultData.userActivityLogs))
      setAdminAuditLogs(getFromStorage('adminAuditLogs', defaultData.adminAuditLogs))

      // Load admin roles and migrate old roles to 'admin'
      const loadedAdminRoles = getFromStorage('adminRoles', defaultData.adminRoles)
      const migratedRoles = loadedAdminRoles.map(admin => {
        // Migrate old roles to 'admin'
        if (admin.role && !['admin', 'master', 'super_admin'].includes(admin.role)) {
          return { ...admin, role: 'admin' }
        }
        return admin
      })
      // Save migrated roles if any changes
      if (JSON.stringify(loadedAdminRoles) !== JSON.stringify(migratedRoles)) {
        localStorage.setItem('adminRoles', JSON.stringify(migratedRoles))
      }
      setAdminRoles(migratedRoles)

      setSiteSettings(getFromStorage('siteSettings', defaultData.siteSettings))
      setTradeOptions(getFromStorage('tradeOptions', defaultData.tradeOptions))
      setActiveTrades(getFromStorage('activeTrades', []))
      setIsDataLoaded(true)
    })
  }, [defaultData])

  // Refresh active trades in real-time
  useEffect(() => {
    if (!isAuthenticated || !isDataLoaded) return

    const refreshActiveTrades = () => {
      const trades = getFromStorage('activeTrades', [])
      // Filter out expired trades
      const now = Date.now()
      const validTrades = trades.filter(t => t.endTime > now || t.status === 'active')
      setActiveTrades(validTrades)
    }

    refreshActiveTrades()
    const interval = setInterval(refreshActiveTrades, 1000) // Real-time updates
    return () => clearInterval(interval)
  }, [isAuthenticated, isDataLoaded])

  // Check authentication on load - fast initial check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const adminSession = localStorage.getItem('masterAdminSession')
        if (adminSession) {
          const session = JSON.parse(adminSession)
          if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
            setIsAuthenticated(true)
          }
        }
      } catch (e) {
        console.error('Auth check error:', e)
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  // Load data only after successful authentication
  useEffect(() => {
    if (isAuthenticated && !isDataLoaded) {
      loadAllData()
    }
  }, [isAuthenticated, isDataLoaded, loadAllData])

  // Refresh chat data periodically - real-time updates (1 second)
  useEffect(() => {
    if (!isAuthenticated || !isDataLoaded) return

    const refreshChats = () => {
      const chats = getFromStorage('activeChats', [])
      const logs = getFromStorage('customerChatLogs', [])

      // Check for new messages and trigger notification
      const userMessages = logs.filter(l => l.type === 'user')
      if (userMessages.length > lastMessageCount && lastMessageCount > 0) {
        setNewMessageAlert(true)
        // Play notification sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQkAIHPQ3bF3HQkAgLTX15xQGBY=')
          audio.volume = 0.5
          audio.play().catch(() => { })
        } catch (e) { }

        // Show browser notification if permitted
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          const latestMsg = userMessages[userMessages.length - 1]
          new Notification('New Customer Message', {
            body: `${latestMsg.user}: ${latestMsg.message.substring(0, 50)}...`,
            icon: '💬'
          })
        }

        // Auto-clear alert after 5 seconds
        setTimeout(() => setNewMessageAlert(false), 5000)
      }
      setLastMessageCount(userMessages.length)

      setActiveChats(chats)
      setChatLogs(logs)
    }

    // Request notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    refreshChats()
    const interval = setInterval(refreshChats, 1000) // Real-time refresh every 1 second
    return () => clearInterval(interval)
  }, [isAuthenticated, isDataLoaded, lastMessageCount])

  // Save to localStorage - only when data is loaded and changed
  useEffect(() => {
    if (isDataLoaded && Object.keys(bonusPrograms).length > 0) {
      localStorage.setItem('bonusPrograms', JSON.stringify(bonusPrograms))
    }
  }, [bonusPrograms, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && userAgents.length > 0) {
      localStorage.setItem('userAgents', JSON.stringify(userAgents))
    }
  }, [userAgents, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && stakingPlans.length > 0) {
      localStorage.setItem('stakingPlans', JSON.stringify(stakingPlans))
    }
  }, [stakingPlans, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && Object.keys(siteSettings).length > 0) {
      localStorage.setItem('siteSettings', JSON.stringify(siteSettings))
    }
  }, [siteSettings, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && Object.keys(tradeOptions).length > 0) {
      localStorage.setItem('tradeOptions', JSON.stringify(tradeOptions))
    }
  }, [tradeOptions, isDataLoaded])

  // Save activity logs to localStorage
  useEffect(() => {
    if (isDataLoaded && userActivityLogs.length > 0) {
      localStorage.setItem('userActivityLogs', JSON.stringify(userActivityLogs))
    }
  }, [userActivityLogs, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && adminAuditLogs.length > 0) {
      localStorage.setItem('adminAuditLogs', JSON.stringify(adminAuditLogs))
    }
  }, [adminAuditLogs, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && adminRoles.length > 0) {
      localStorage.setItem('adminRoles', JSON.stringify(adminRoles))
    }
  }, [adminRoles, isDataLoaded])

  // Save new service management states
  useEffect(() => {
    if (isDataLoaded && currencies.length > 0) {
      localStorage.setItem('adminCurrencies', JSON.stringify(currencies))
    }
  }, [currencies, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && networks.length > 0) {
      localStorage.setItem('adminNetworks', JSON.stringify(networks))
    }
  }, [networks, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && depositWallets.length > 0) {
      localStorage.setItem('adminDepositWallets', JSON.stringify(depositWallets))
    }
  }, [depositWallets, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && exchangeRates.length > 0) {
      localStorage.setItem('adminExchangeRates', JSON.stringify(exchangeRates))
    }
  }, [exchangeRates, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && tradingLevels.length > 0) {
      localStorage.setItem('adminTradingLevels', JSON.stringify(tradingLevels))
    }
  }, [tradingLevels, isDataLoaded])

  const handleLogin = (e) => {
    e.preventDefault()
    // Master credentials
    if (loginData.username === 'master' && loginData.password === 'OnchainWeb2025!') {
      setIsAuthenticated(true)
      setIsDataLoaded(false) // Reset to trigger data load
      setLoginError('')
      localStorage.setItem('masterAdminSession', JSON.stringify({
        username: loginData.username,
        role: 'master',
        timestamp: Date.now()
      }))
      return
    }

    // Check admin accounts
    const savedAdminRoles = JSON.parse(localStorage.getItem('adminRoles') || '[]')
    console.log('Checking admin login for:', loginData.username)
    console.log('Available admins:', savedAdminRoles.map(a => ({ username: a.username, email: a.email, status: a.status, hasPassword: !!a.password })))

    const adminUser = savedAdminRoles.find(
      admin => {
        const usernameMatch = admin.username?.toLowerCase() === loginData.username?.toLowerCase()
        const emailMatch = admin.email?.toLowerCase() === loginData.username?.toLowerCase()
        const passwordMatch = admin.password === loginData.password
        const isActive = admin.status === 'active'
        console.log(`Checking admin ${admin.username}:`, { usernameMatch, emailMatch, passwordMatch, isActive })
        return (usernameMatch || emailMatch) && passwordMatch && isActive
      }
    )

    if (adminUser) {
      setIsAuthenticated(true)
      setIsDataLoaded(false)
      setLoginError('')
      // Update last login time
      const updatedAdmins = savedAdminRoles.map(admin =>
        admin.id === adminUser.id
          ? { ...admin, lastLogin: new Date().toISOString() }
          : admin
      )
      localStorage.setItem('adminRoles', JSON.stringify(updatedAdmins))
      localStorage.setItem('masterAdminSession', JSON.stringify({
        username: adminUser.username,
        role: adminUser.role,
        permissions: adminUser.permissions,
        timestamp: Date.now()
      }))
      return
    }

    setLoginError('Invalid credentials or account inactive')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setIsDataLoaded(false)
    localStorage.removeItem('masterAdminSession')
  }

  // Filter function for search
  const filterData = (data, query) => {
    if (!query) return data
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(query.toLowerCase())
      )
    )
  }

  // Update user balance
  const updateUserBalance = (userId, newBalance) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, balance: parseFloat(newBalance) } : user
    ))
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, balance: parseFloat(newBalance) } : user
    )
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))
  }

  // Approve/Reject withdrawal
  const handleWithdrawalAction = (id, action) => {
    setWithdrawals(prev => prev.map(w =>
      w.id === id ? { ...w, status: action } : w
    ))
    localStorage.setItem('adminWithdrawals', JSON.stringify(
      withdrawals.map(w => w.id === id ? { ...w, status: action } : w)
    ))
  }

  // Approve/Reject deposit
  const handleDepositAction = (id, action) => {
    setDeposits(prev => prev.map(d =>
      d.id === id ? { ...d, status: action } : d
    ))
    localStorage.setItem('adminDeposits', JSON.stringify(
      deposits.map(d => d.id === id ? { ...d, status: action } : d)
    ))
  }

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="master-admin-login">
        <div className="login-container">
          <div className="loading-spinner">
            <svg width="50" height="50" viewBox="0 0 50 50" className="spin-animation">
              <circle cx="25" cy="25" r="20" fill="none" stroke="#7c3aed" strokeWidth="4" strokeDasharray="80 40" />
            </svg>
          </div>
          <p style={{ color: '#9ca3af', marginTop: '16px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading after login while data loads
  if (isAuthenticated && !isDataLoaded) {
    return (
      <div className="master-admin-login">
        <div className="login-container">
          <div className="loading-spinner">
            <svg width="50" height="50" viewBox="0 0 50 50" className="spin-animation">
              <circle cx="25" cy="25" r="20" fill="none" stroke="#7c3aed" strokeWidth="4" strokeDasharray="80 40" />
            </svg>
          </div>
          <p style={{ color: '#9ca3af', marginTop: '16px' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="master-admin-login">
        <div className="login-container">
          <div className="login-logo">
            <svg width="60" height="60" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="admin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <rect width="24" height="24" rx="6" fill="url(#admin-gradient)" />
              <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1>Master Admin Portal</h1>
          <p>OnchainWeb Administration</p>
          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label>Username</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="login-btn">Login</button>
          </form>
        </div>
      </div>
    )
  }

  // Send admin reply to customer chat
  const sendAdminReply = (sessionId) => {
    if (!adminReplyMessage.trim()) return

    const adminReplies = JSON.parse(localStorage.getItem('adminChatReplies') || '[]')
    adminReplies.push({
      id: Date.now(),
      sessionId: sessionId,
      message: adminReplyMessage,
      agentName: 'Support Agent',
      timestamp: new Date().toISOString(),
      delivered: false
    })
    localStorage.setItem('adminChatReplies', JSON.stringify(adminReplies))

    // Also save to chat logs
    const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]')
    logs.push({
      id: Date.now(),
      sessionId: sessionId,
      type: 'admin',
      message: adminReplyMessage,
      agentName: 'Support Agent',
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('customerChatLogs', JSON.stringify(logs))

    setAdminReplyMessage('')

    // Refresh chat logs
    setChatLogs(logs)
  }

  return (
    <div className="master-admin-dashboard">
      {/* New Message Alert Banner */}
      {newMessageAlert && (
        <div className="new-message-alert" onClick={() => {
          setActiveSection('customer-services')
          setNewMessageAlert(false)
        }}>
          <span className="alert-icon">🔔</span>
          <span className="alert-text">New customer message received! Click to view.</span>
          <button className="alert-close" onClick={(e) => {
            e.stopPropagation()
            setNewMessageAlert(false)
          }}>✕</button>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="admin-top-nav">
        <div className="nav-logo">
          <svg width="32" height="32" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="nav-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <rect width="24" height="24" rx="6" fill="url(#nav-gradient)" />
            <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="nav-menu">
          <div className="nav-dropdown">
            <button className={activeSection.startsWith('user') ? 'active' : ''}>
              User Management ▾
            </button>
            <div className="dropdown-content">
              <a onClick={() => setActiveSection('user-agents')}>User Agents</a>
              <a onClick={() => setActiveSection('users')}>All Users</a>
              <a onClick={() => setActiveSection('kyc')}>KYC Verification</a>
            </div>
          </div>
          <div className="nav-dropdown">
            <button className={activeSection.startsWith('service') || activeSection === 'currency' || activeSection === 'create-currency' || activeSection === 'create-network' || activeSection === 'create-wallet' || activeSection === 'exchange-rate' ? 'active' : ''}>
              Service ▾
            </button>
            <div className="dropdown-content">
              <a onClick={() => setActiveSection('currency')}>Currency</a>
              <a onClick={() => setActiveSection('create-currency')}>Create Currency</a>
              <a onClick={() => setActiveSection('create-network')}>Create Network</a>
              <a onClick={() => setActiveSection('create-wallet')}>Create Wallet</a>
              <a onClick={() => setActiveSection('exchange-rate')}>Exchange Rate</a>
              <a onClick={() => setActiveSection('notifications')}>Notifications</a>
              <a onClick={() => setActiveSection('announcements')}>Announcements</a>
            </div>
          </div>
          <a onClick={() => setActiveSection('deposits')} className={activeSection === 'deposits' ? 'active' : ''}>Deposit</a>
          <a onClick={() => setActiveSection('withdrawals')} className={activeSection === 'withdrawals' ? 'active' : ''}>Withdraw</a>
          <a onClick={() => setActiveSection('live-trades')} className={activeSection === 'live-trades' ? 'active' : ''}>
            🔴 Live Trades
            {activeTrades.length > 0 && (
              <span className="nav-badge live">{activeTrades.length}</span>
            )}
          </a>
          <a onClick={() => setActiveSection('trade-options')} className={activeSection === 'trade-options' ? 'active' : ''}>Trade Options</a>
          <a onClick={() => setActiveSection('ai-arbitrage')} className={activeSection === 'ai-arbitrage' ? 'active' : ''}>AI Arbitrage</a>
          <a onClick={() => setActiveSection('bonus-programs')} className={activeSection === 'bonus-programs' ? 'active' : ''}>Bonus Programs</a>
          <a onClick={() => setActiveSection('staking-plans')} className={activeSection === 'staking-plans' ? 'active' : ''}>Staking Plans</a>
          <a onClick={() => setActiveSection('staking-history')} className={activeSection === 'staking-history' ? 'active' : ''}>Staking History</a>
          <a onClick={() => setActiveSection('trade-history')} className={activeSection === 'trade-history' ? 'active' : ''}>Trade History</a>
          <a onClick={() => setActiveSection('balance-history')} className={activeSection === 'balance-history' ? 'active' : ''}>Balance History</a>
          <a onClick={() => setActiveSection('site-settings')} className={activeSection === 'site-settings' ? 'active' : ''}>Site Settings</a>
          <a onClick={() => setActiveSection('customer-services')} className={activeSection === 'customer-services' ? 'active' : ''}>
            Customer Services
            {activeChats.filter(c => c.status === 'waiting_agent' || c.unread > 0).length > 0 && (
              <span className="nav-badge">{activeChats.filter(c => c.status === 'waiting_agent' || c.unread > 0).length}</span>
            )}
          </a>
          <div className="nav-dropdown">
            <button className={activeSection.includes('activity') || activeSection === 'admin-roles' ? 'active' : ''}>
              📊 Activity & Roles ▾
            </button>
            <div className="dropdown-content">
              <a onClick={() => setActiveSection('user-activity')}>User Activity Logs</a>
              <a onClick={() => setActiveSection('admin-activity')}>Admin Audit Logs</a>
              <a onClick={() => setActiveSection('admin-roles')}>Admin Roles</a>
            </div>
          </div>
          <a onClick={handleLogout} className="logout-link">Logout</a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* User Agents Section */}
        {activeSection === 'user-agents' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>User Agents</h1>
              <p>View and search user agent information</p>
            </div>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by UID, email, device, or IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>EMAIL</th>
                    <th>ACTIVE</th>
                    <th>DEVICE</th>
                    <th>IP ADDRESS</th>
                    <th>LAST SEEN</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(userAgents, searchQuery).map((agent, idx) => (
                    <tr key={idx}>
                      <td className="uid-cell">{agent.uid}</td>
                      <td className="email-cell">
                        <a href={`mailto:${agent.email}`}>{agent.email}</a>
                      </td>
                      <td>
                        <span className={`status-badge ${agent.active ? 'active' : 'inactive'}`}>
                          {agent.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{agent.device}</td>
                      <td className="ip-cell">{agent.ip}</td>
                      <td>{new Date(agent.lastSeen).toLocaleString()}</td>
                      <td>
                        <button className="action-btn view">View</button>
                        <button className="action-btn block">Block</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Users Section */}
        {activeSection === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>All Users</h1>
              <p>Manage user accounts and balances</p>
            </div>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>USERNAME</th>
                    <th>EMAIL</th>
                    <th>BALANCE</th>
                    <th>POINTS</th>
                    <th>VIP LEVEL</th>
                    <th>ROLE</th>
                    <th>KYC STATUS</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(users, searchQuery).map((user, idx) => (
                    <tr key={idx}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                      <td>${(user.balance || 0).toLocaleString()}</td>
                      <td>{user.points || 0}</td>
                      <td>Level {user.vipLevel || 1}</td>
                      <td>
                        <span className={`role-badge role-${user.role || 'user'}`}>
                          {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.kycStatus || 'pending'}`}>
                          {user.kycStatus || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                          {user.isActive !== false ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`action-btn ${user.role === 'admin' ? 'demote' : 'promote'}`}
                          onClick={() => {
                            const newRole = user.role === 'admin' ? 'user' : 'admin'
                            const updatedUsers = users.map(u =>
                              u.id === user.id ? { ...u, role: newRole } : u
                            )
                            setUsers(updatedUsers)
                            localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))

                            // Log the action
                            setAdminAuditLogs(prev => [...prev, {
                              id: Date.now(),
                              adminId: 'master',
                              adminName: 'Master Admin',
                              action: newRole === 'admin' ? 'promote_to_admin' : 'demote_to_user',
                              details: `${newRole === 'admin' ? 'Promoted' : 'Demoted'} user ${user.username} (${user.email}) to ${newRole}`,
                              targetUser: user.id,
                              ip: '192.168.1.1',
                              timestamp: new Date().toISOString()
                            }])

                            // If promoting to admin, also add to adminRoles
                            if (newRole === 'admin') {
                              const existingAdmin = adminRoles.find(a => a.email === user.email)
                              if (!existingAdmin) {
                                setAdminRoles(prev => [...prev, {
                                  id: Date.now(),
                                  username: user.username,
                                  email: user.email,
                                  role: 'support',
                                  permissions: ['view_users', 'manage_chats'],
                                  status: 'active',
                                  createdAt: new Date().toISOString(),
                                  lastLogin: null,
                                  promotedFrom: 'user'
                                }])
                              }
                            } else {
                              // If demoting, remove from adminRoles
                              setAdminRoles(prev => prev.filter(a => a.email !== user.email))
                            }
                          }}
                        >
                          {user.role === 'admin' ? '⬇️ Demote' : '⬆️ Promote'}
                        </button>
                        <button className="action-btn edit">Edit</button>
                        <button className="action-btn view">View</button>
                        <button
                          className="action-btn block"
                          onClick={() => {
                            const updatedUsers = users.map(u =>
                              u.id === user.id ? { ...u, isActive: u.isActive === false ? true : false } : u
                            )
                            setUsers(updatedUsers)
                            localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))
                          }}
                        >
                          {user.isActive !== false ? 'Block' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="10" className="no-data">No users registered yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KYC Verification Section */}
        {activeSection === 'kyc' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>KYC Verification</h1>
              <p>Review and approve user identity verification</p>
            </div>
            <div className="kyc-stats">
              <div className="stat-card">
                <span className="stat-number">{users.filter(u => u.kycStatus === 'pending').length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-card verified">
                <span className="stat-number">{users.filter(u => u.kycStatus === 'verified').length}</span>
                <span className="stat-label">Verified</span>
              </div>
              <div className="stat-card rejected">
                <span className="stat-number">{users.filter(u => u.kycStatus === 'rejected').length}</span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>EMAIL</th>
                    <th>SUBMITTED</th>
                    <th>DOCUMENTS</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.kycStatus === 'pending').map((user, idx) => (
                    <tr key={idx}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>
                        <button className="doc-btn">ID Card</button>
                        <button className="doc-btn">Selfie</button>
                      </td>
                      <td>
                        <span className="status-badge pending">Pending</span>
                      </td>
                      <td>
                        <button className="action-btn approve">Approve</button>
                        <button className="action-btn reject">Reject</button>
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => u.kycStatus === 'pending').length === 0 && (
                    <tr>
                      <td colSpan="6" className="no-data">No pending KYC requests</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Deposits Section */}
        {activeSection === 'deposits' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Deposits</h1>
              <p>Manage user deposit requests</p>
            </div>
            <div className="deposit-stats">
              <div className="stat-card">
                <span className="stat-number">{deposits.filter(d => d.status === 'pending').length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-card verified">
                <span className="stat-number">{deposits.filter(d => d.status === 'approved').length}</span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  ${deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}
                </span>
                <span className="stat-label">Total Deposited</span>
              </div>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>USER</th>
                    <th>AMOUNT</th>
                    <th>NETWORK</th>
                    <th>TX HASH</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit, idx) => (
                    <tr key={idx}>
                      <td>{deposit.id}</td>
                      <td>{deposit.user}</td>
                      <td>${deposit.amount?.toLocaleString()}</td>
                      <td>{deposit.network}</td>
                      <td className="hash-cell">{deposit.txHash?.slice(0, 10)}...</td>
                      <td>{new Date(deposit.date).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${deposit.status}`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td>
                        {deposit.status === 'pending' && (
                          <>
                            <button className="action-btn approve" onClick={() => handleDepositAction(deposit.id, 'approved')}>Approve</button>
                            <button className="action-btn reject" onClick={() => handleDepositAction(deposit.id, 'rejected')}>Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {deposits.length === 0 && (
                    <tr>
                      <td colSpan="8" className="no-data">No deposit requests</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawals Section */}
        {activeSection === 'withdrawals' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Withdrawals</h1>
              <p>Manage user withdrawal requests</p>
            </div>
            <div className="withdrawal-stats">
              <div className="stat-card pending">
                <span className="stat-number">{withdrawals.filter(w => w.status === 'pending').length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-card verified">
                <span className="stat-number">{withdrawals.filter(w => w.status === 'approved').length}</span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat-card rejected">
                <span className="stat-number">{withdrawals.filter(w => w.status === 'rejected').length}</span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>USER</th>
                    <th>AMOUNT</th>
                    <th>NETWORK</th>
                    <th>ADDRESS</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal, idx) => (
                    <tr key={idx}>
                      <td>{withdrawal.id}</td>
                      <td>{withdrawal.user}</td>
                      <td>${withdrawal.amount?.toLocaleString()}</td>
                      <td>{withdrawal.network}</td>
                      <td className="address-cell">{withdrawal.address?.slice(0, 12)}...</td>
                      <td>{new Date(withdrawal.date).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${withdrawal.status}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td>
                        {withdrawal.status === 'pending' && (
                          <>
                            <button className="action-btn approve" onClick={() => handleWithdrawalAction(withdrawal.id, 'approved')}>Approve</button>
                            <button className="action-btn reject" onClick={() => handleWithdrawalAction(withdrawal.id, 'rejected')}>Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr>
                      <td colSpan="8" className="no-data">No withdrawal requests</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trade Options Section - Detailed Table */}
        {activeSection === 'trade-options' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Trade Options</h1>
              <p>Configure trading levels and parameters</p>
              <button className="create-new-btn" onClick={() => setShowCreateModal('trading-level')}>
                + Create New
              </button>
            </div>

            <h3 className="subsection-title">Trade Options List</h3>
            <div className="data-table trade-options-table">
              <table>
                <thead>
                  <tr>
                    <th>OPTION #</th>
                    <th>NAME</th>
                    <th>COUNTDOWN (S)</th>
                    <th>PL %</th>
                    <th>MIN CAPITAL</th>
                    <th>MAX CAPITAL</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {tradingLevels.map((level, idx) => (
                    <tr key={level.id}>
                      <td>{idx + 1}</td>
                      <td className="level-name">{level.name}</td>
                      <td>{level.countdown}</td>
                      <td>{level.profitPercent.toFixed(2)}%</td>
                      <td>${level.minCapital.toLocaleString()}</td>
                      <td>${level.maxCapital.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${level.status}`}>
                          {level.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button
                          className="action-btn edit"
                          onClick={() => setEditingTradingLevel(level)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => {
                            if (confirm(`Delete ${level.name}?`)) {
                              setTradingLevels(prev => prev.filter(l => l.id !== level.id))
                            }
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Trading Level Modal */}
            {editingTradingLevel && (
              <div className="modal-overlay" onClick={() => setEditingTradingLevel(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>Edit {editingTradingLevel.name}</h2>
                  <div className="modal-form">
                    <div className="form-field">
                      <label>Name</label>
                      <input
                        type="text"
                        value={editingTradingLevel.name}
                        onChange={(e) => setEditingTradingLevel({ ...editingTradingLevel, name: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Countdown (Seconds)</label>
                      <input
                        type="number"
                        value={editingTradingLevel.countdown}
                        onChange={(e) => setEditingTradingLevel({ ...editingTradingLevel, countdown: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Profit Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingTradingLevel.profitPercent}
                        onChange={(e) => setEditingTradingLevel({ ...editingTradingLevel, profitPercent: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Min Capital ($)</label>
                      <input
                        type="number"
                        value={editingTradingLevel.minCapital}
                        onChange={(e) => setEditingTradingLevel({ ...editingTradingLevel, minCapital: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Max Capital ($)</label>
                      <input
                        type="number"
                        value={editingTradingLevel.maxCapital}
                        onChange={(e) => setEditingTradingLevel({ ...editingTradingLevel, maxCapital: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Status</label>
                      <select
                        value={editingTradingLevel.status}
                        onChange={(e) => setEditingTradingLevel({ ...editingTradingLevel, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button
                        className="save-btn"
                        onClick={() => {
                          setTradingLevels(prev => prev.map(l => l.id === editingTradingLevel.id ? editingTradingLevel : l))
                          setEditingTradingLevel(null)
                        }}
                      >
                        Save Changes
                      </button>
                      <button className="cancel-btn" onClick={() => setEditingTradingLevel(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Trading Level Modal */}
            {showCreateModal === 'trading-level' && (
              <div className="modal-overlay" onClick={() => setShowCreateModal(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>Create New Trading Level</h2>
                  <div className="modal-form">
                    <div className="form-field">
                      <label>Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Level-6"
                        value={newTradingLevel.name}
                        onChange={(e) => setNewTradingLevel({ ...newTradingLevel, name: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Countdown (Seconds)</label>
                      <input
                        type="number"
                        value={newTradingLevel.countdown}
                        onChange={(e) => setNewTradingLevel({ ...newTradingLevel, countdown: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Profit Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newTradingLevel.profitPercent}
                        onChange={(e) => setNewTradingLevel({ ...newTradingLevel, profitPercent: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Min Capital ($)</label>
                      <input
                        type="number"
                        value={newTradingLevel.minCapital}
                        onChange={(e) => setNewTradingLevel({ ...newTradingLevel, minCapital: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Max Capital ($)</label>
                      <input
                        type="number"
                        value={newTradingLevel.maxCapital}
                        onChange={(e) => setNewTradingLevel({ ...newTradingLevel, maxCapital: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="modal-actions">
                      <button
                        className="save-btn"
                        onClick={() => {
                          if (newTradingLevel.name) {
                            setTradingLevels(prev => [...prev, {
                              id: Date.now(),
                              ...newTradingLevel,
                              status: 'active'
                            }])
                            setNewTradingLevel({ name: '', countdown: 180, profitPercent: 18, minCapital: 100, maxCapital: 10000 })
                            setShowCreateModal(null)
                          }
                        }}
                      >
                        Create Level
                      </button>
                      <button className="cancel-btn" onClick={() => setShowCreateModal(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Currency List Section */}
        {activeSection === 'currency' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>💰 Currency Management</h1>
              <p>View and manage supported currencies</p>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>ICON</th>
                    <th>NAME</th>
                    <th>SYMBOL</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {currencies.map((currency, idx) => (
                    <tr key={currency.id}>
                      <td>{idx + 1}</td>
                      <td className="currency-icon">{currency.icon}</td>
                      <td>{currency.name}</td>
                      <td className="symbol-cell">{currency.symbol}</td>
                      <td>
                        <span className={`status-badge ${currency.status}`}>
                          {currency.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </td>
                      <td>{currency.createdAt}</td>
                      <td>
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            const newStatus = currency.status === 'active' ? 'inactive' : 'active'
                            setCurrencies(prev => prev.map(c => c.id === currency.id ? { ...c, status: newStatus } : c))
                          }}
                        >
                          {currency.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => {
                            if (confirm(`Delete ${currency.name}?`)) {
                              setCurrencies(prev => prev.filter(c => c.id !== currency.id))
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Currency Section */}
        {activeSection === 'create-currency' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>➕ Create Currency</h1>
              <p>Add a new cryptocurrency to the platform</p>
            </div>
            <div className="create-form">
              <div className="form-field">
                <label>Currency Name</label>
                <input
                  type="text"
                  placeholder="e.g., Bitcoin"
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Symbol</label>
                <input
                  type="text"
                  placeholder="e.g., BTC"
                  value={newCurrency.symbol}
                  onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-field">
                <label>Icon (Emoji or Symbol)</label>
                <input
                  type="text"
                  placeholder="e.g., ₿"
                  value={newCurrency.icon}
                  onChange={(e) => setNewCurrency({ ...newCurrency, icon: e.target.value })}
                />
              </div>
              <button
                className="save-btn"
                onClick={() => {
                  if (newCurrency.name && newCurrency.symbol) {
                    setCurrencies(prev => [...prev, {
                      id: Date.now(),
                      ...newCurrency,
                      status: 'active',
                      createdAt: new Date().toISOString().split('T')[0]
                    }])
                    setNewCurrency({ name: '', symbol: '', icon: '' })
                    alert('Currency created successfully!')
                  }
                }}
              >
                Create Currency
              </button>
            </div>
          </div>
        )}

        {/* Create Network Section */}
        {activeSection === 'create-network' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>🌐 Create Network</h1>
              <p>Add a new blockchain network</p>
            </div>
            <div className="create-form">
              <div className="form-field">
                <label>Network Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ethereum (ERC-20)"
                  value={newNetwork.name}
                  onChange={(e) => setNewNetwork({ ...newNetwork, name: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Symbol</label>
                <input
                  type="text"
                  placeholder="e.g., ETH"
                  value={newNetwork.symbol}
                  onChange={(e) => setNewNetwork({ ...newNetwork, symbol: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-field">
                <label>Chain ID</label>
                <input
                  type="text"
                  placeholder="e.g., 1 for Ethereum"
                  value={newNetwork.chainId}
                  onChange={(e) => setNewNetwork({ ...newNetwork, chainId: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Required Confirmations</label>
                <input
                  type="number"
                  value={newNetwork.confirmations}
                  onChange={(e) => setNewNetwork({ ...newNetwork, confirmations: parseInt(e.target.value) })}
                />
              </div>
              <button
                className="save-btn"
                onClick={() => {
                  if (newNetwork.name && newNetwork.symbol) {
                    setNetworks(prev => [...prev, {
                      id: Date.now(),
                      ...newNetwork,
                      status: 'active'
                    }])
                    setNewNetwork({ name: '', symbol: '', chainId: '', confirmations: 12 })
                    alert('Network created successfully!')
                  }
                }}
              >
                Create Network
              </button>
            </div>

            <h3 className="subsection-title">Existing Networks</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>NAME</th>
                    <th>SYMBOL</th>
                    <th>CHAIN ID</th>
                    <th>CONFIRMATIONS</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {networks.map((network, idx) => (
                    <tr key={network.id}>
                      <td>{idx + 1}</td>
                      <td>{network.name}</td>
                      <td className="symbol-cell">{network.symbol}</td>
                      <td>{network.chainId}</td>
                      <td>{network.confirmations}</td>
                      <td>
                        <span className={`status-badge ${network.status}`}>
                          {network.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            const newStatus = network.status === 'active' ? 'inactive' : 'active'
                            setNetworks(prev => prev.map(n => n.id === network.id ? { ...n, status: newStatus } : n))
                          }}
                        >
                          {network.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => {
                            if (confirm(`Delete ${network.name}?`)) {
                              setNetworks(prev => prev.filter(n => n.id !== network.id))
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Wallet / Deposit Address Section */}
        {activeSection === 'create-wallet' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>👛 Create Wallet / Deposit Address</h1>
              <p>Configure deposit wallet addresses for each network</p>
            </div>
            <div className="create-form">
              <div className="form-field">
                <label>Network</label>
                <select
                  value={newWallet.network}
                  onChange={(e) => setNewWallet({ ...newWallet, network: e.target.value })}
                >
                  <option value="">Select Network</option>
                  {networks.map(n => (
                    <option key={n.id} value={n.symbol}>{n.name} ({n.symbol})</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Wallet Address</label>
                <input
                  type="text"
                  placeholder="Enter deposit wallet address"
                  value={newWallet.address}
                  onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Label</label>
                <input
                  type="text"
                  placeholder="e.g., Main BTC Wallet"
                  value={newWallet.label}
                  onChange={(e) => setNewWallet({ ...newWallet, label: e.target.value })}
                />
              </div>
              <button
                className="save-btn"
                onClick={() => {
                  if (newWallet.network && newWallet.address) {
                    setDepositWallets(prev => [...prev, {
                      id: Date.now(),
                      ...newWallet,
                      status: 'active'
                    }])
                    setNewWallet({ network: '', address: '', label: '' })
                    alert('Wallet address added successfully!')
                  }
                }}
              >
                Add Wallet Address
              </button>
            </div>

            <h3 className="subsection-title">Deposit Wallet Addresses</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>NETWORK</th>
                    <th>LABEL</th>
                    <th>ADDRESS</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {depositWallets.map((wallet, idx) => (
                    <tr key={wallet.id}>
                      <td>{idx + 1}</td>
                      <td className="symbol-cell">{wallet.network}</td>
                      <td>{wallet.label}</td>
                      <td className="address-cell">
                        <input
                          type="text"
                          className="address-input"
                          value={wallet.address}
                          placeholder="Enter wallet address"
                          onChange={(e) => {
                            setDepositWallets(prev => prev.map(w =>
                              w.id === wallet.id ? { ...w, address: e.target.value } : w
                            ))
                          }}
                        />
                      </td>
                      <td>
                        <span className={`status-badge ${wallet.status}`}>
                          {wallet.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            const newStatus = wallet.status === 'active' ? 'inactive' : 'active'
                            setDepositWallets(prev => prev.map(w => w.id === wallet.id ? { ...w, status: newStatus } : w))
                          }}
                        >
                          {wallet.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => {
                            if (confirm('Delete this wallet?')) {
                              setDepositWallets(prev => prev.filter(w => w.id !== wallet.id))
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Exchange Rate Section */}
        {activeSection === 'exchange-rate' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>💱 Exchange Rates</h1>
              <p>Configure currency exchange rates</p>
            </div>
            <div className="create-form">
              <div className="form-row">
                <div className="form-field">
                  <label>From Currency</label>
                  <select
                    value={newExchangeRate.from}
                    onChange={(e) => setNewExchangeRate({ ...newExchangeRate, from: e.target.value })}
                  >
                    <option value="">Select Currency</option>
                    {currencies.map(c => (
                      <option key={c.id} value={c.symbol}>{c.name} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>To Currency</label>
                  <select
                    value={newExchangeRate.to}
                    onChange={(e) => setNewExchangeRate({ ...newExchangeRate, to: e.target.value })}
                  >
                    <option value="USDT">USDT</option>
                    <option value="USD">USD</option>
                    {currencies.map(c => (
                      <option key={c.id} value={c.symbol}>{c.symbol}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 42500.00"
                    value={newExchangeRate.rate}
                    onChange={(e) => setNewExchangeRate({ ...newExchangeRate, rate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <button
                className="save-btn"
                onClick={() => {
                  if (newExchangeRate.from && newExchangeRate.rate) {
                    setExchangeRates(prev => [...prev, {
                      id: Date.now(),
                      ...newExchangeRate,
                      status: 'active'
                    }])
                    setNewExchangeRate({ from: '', to: 'USDT', rate: 0 })
                    alert('Exchange rate added successfully!')
                  }
                }}
              >
                Add Exchange Rate
              </button>
            </div>

            <h3 className="subsection-title">Current Exchange Rates</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>FROM</th>
                    <th>TO</th>
                    <th>RATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {exchangeRates.map((rate, idx) => (
                    <tr key={rate.id}>
                      <td>{idx + 1}</td>
                      <td className="symbol-cell">{rate.from}</td>
                      <td className="symbol-cell">{rate.to}</td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="rate-input"
                          value={rate.rate}
                          onChange={(e) => {
                            setExchangeRates(prev => prev.map(r =>
                              r.id === rate.id ? { ...r, rate: parseFloat(e.target.value) } : r
                            ))
                          }}
                        />
                      </td>
                      <td>
                        <span className={`status-badge ${rate.status}`}>
                          {rate.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            const newStatus = rate.status === 'active' ? 'inactive' : 'active'
                            setExchangeRates(prev => prev.map(r => r.id === rate.id ? { ...r, status: newStatus } : r))
                          }}
                        >
                          {rate.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => {
                            if (confirm('Delete this rate?')) {
                              setExchangeRates(prev => prev.filter(r => r.id !== rate.id))
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Staking Plans Section */}
        {activeSection === 'staking-plans' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Staking Plans</h1>
              <p>Configure staking plans and APY rates</p>
            </div>
            <div className="staking-plans-grid">
              {stakingPlans.map((plan, idx) => (
                <div key={idx} className="staking-plan-card">
                  <h3>{plan.name}</h3>
                  <div className="plan-field">
                    <label>Min Amount</label>
                    <input
                      type="number"
                      value={plan.minAmount}
                      onChange={(e) => {
                        const updated = [...stakingPlans]
                        updated[idx].minAmount = parseFloat(e.target.value)
                        setStakingPlans(updated)
                      }}
                    />
                  </div>
                  <div className="plan-field">
                    <label>Max Amount</label>
                    <input
                      type="number"
                      value={plan.maxAmount}
                      onChange={(e) => {
                        const updated = [...stakingPlans]
                        updated[idx].maxAmount = parseFloat(e.target.value)
                        setStakingPlans(updated)
                      }}
                    />
                  </div>
                  <div className="plan-field">
                    <label>Duration (Days)</label>
                    <input
                      type="number"
                      value={plan.duration}
                      onChange={(e) => {
                        const updated = [...stakingPlans]
                        updated[idx].duration = parseInt(e.target.value)
                        setStakingPlans(updated)
                      }}
                    />
                  </div>
                  <div className="plan-field">
                    <label>APY (%)</label>
                    <input
                      type="number"
                      value={plan.apy}
                      onChange={(e) => {
                        const updated = [...stakingPlans]
                        updated[idx].apy = parseFloat(e.target.value)
                        setStakingPlans(updated)
                      }}
                    />
                  </div>
                  <div className="plan-toggle">
                    <label>Active</label>
                    <input
                      type="checkbox"
                      checked={plan.active}
                      onChange={(e) => {
                        const updated = [...stakingPlans]
                        updated[idx].active = e.target.checked
                        setStakingPlans(updated)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="add-plan-btn" onClick={() => {
              setStakingPlans([...stakingPlans, {
                id: stakingPlans.length + 1,
                name: 'New Plan',
                minAmount: 100,
                maxAmount: 1000,
                duration: 30,
                apy: 10,
                active: true
              }])
            }}>
              + Add New Plan
            </button>
          </div>
        )}

        {/* Staking History Section */}
        {activeSection === 'staking-history' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Staking History</h1>
              <p>View all staking transactions</p>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>USER</th>
                    <th>PLAN</th>
                    <th>AMOUNT</th>
                    <th>APY</th>
                    <th>START DATE</th>
                    <th>END DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="8" className="no-data">No staking history</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live Trades Control Section */}
        {activeSection === 'live-trades' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>🔴 Live Trades Control</h1>
              <p>Monitor and control active binary trades in real-time</p>
            </div>

            {activeTrades.length === 0 ? (
              <div className="no-active-trades">
                <div className="no-trades-icon">📊</div>
                <h3>No Active Trades</h3>
                <p>When users place binary trades, they will appear here in real-time.</p>
                <p>You can set win/lose outcomes for each trade before it expires.</p>
              </div>
            ) : (
              <div className="live-trades-grid">
                {activeTrades.map((trade) => {
                  const now = Date.now()
                  const timeLeft = Math.max(0, Math.floor((trade.endTime - now) / 1000))
                  const progress = Math.min(100, ((now - trade.startTime) / (trade.endTime - trade.startTime)) * 100)
                  const mins = Math.floor(timeLeft / 60)
                  const secs = timeLeft % 60

                  return (
                    <div key={trade.id} className={`live-trade-card ${trade.adminOutcome !== 'pending' ? 'decided' : ''}`}>
                      <div className="live-trade-header">
                        <div className="trade-user-info">
                          <span className="user-avatar">👤</span>
                          <div>
                            <div className="user-email">{trade.userEmail}</div>
                            <div className="user-id">ID: {trade.userId}</div>
                          </div>
                        </div>
                        <div className={`trade-direction-badge ${trade.direction}`}>
                          {trade.direction === 'up' ? '📈 UP' : '📉 DOWN'}
                        </div>
                      </div>

                      <div className="live-trade-details">
                        <div className="trade-detail">
                          <span className="detail-label">Pair</span>
                          <span className="detail-value">{trade.pair}</span>
                        </div>
                        <div className="trade-detail">
                          <span className="detail-label">Amount</span>
                          <span className="detail-value">${trade.amount?.toLocaleString()}</span>
                        </div>
                        <div className="trade-detail">
                          <span className="detail-label">Entry Price</span>
                          <span className="detail-value">${trade.entryPrice?.toFixed(2)}</span>
                        </div>
                        <div className="trade-detail">
                          <span className="detail-label">Level</span>
                          <span className="detail-value">Level {trade.level}</span>
                        </div>
                        <div className="trade-detail">
                          <span className="detail-label">Profit %</span>
                          <span className="detail-value positive">+{trade.profitPercent}%</span>
                        </div>
                        <div className="trade-detail">
                          <span className="detail-label">Potential Win</span>
                          <span className="detail-value positive">+${(trade.amount * trade.profitPercent / 100).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="live-trade-countdown">
                        <div className="countdown-bar">
                          <div className="countdown-fill" style={{ width: `${100 - progress}%` }}></div>
                        </div>
                        <div className="countdown-time">
                          <span className={timeLeft < 30 ? 'urgent' : ''}>
                            {mins}:{secs.toString().padStart(2, '0')}
                          </span>
                          <span className="countdown-label">remaining</span>
                        </div>
                      </div>

                      <div className="live-trade-actions">
                        {trade.adminOutcome === 'pending' ? (
                          <>
                            <button
                              className="outcome-btn win"
                              onClick={() => {
                                const trades = JSON.parse(localStorage.getItem('activeTrades') || '[]')
                                const updated = trades.map(t =>
                                  t.id === trade.id ? { ...t, adminOutcome: 'win' } : t
                                )
                                localStorage.setItem('activeTrades', JSON.stringify(updated))
                                setActiveTrades(updated)
                              }}
                            >
                              ✅ Set WIN
                            </button>
                            <button
                              className="outcome-btn lose"
                              onClick={() => {
                                const trades = JSON.parse(localStorage.getItem('activeTrades') || '[]')
                                const updated = trades.map(t =>
                                  t.id === trade.id ? { ...t, adminOutcome: 'lose' } : t
                                )
                                localStorage.setItem('activeTrades', JSON.stringify(updated))
                                setActiveTrades(updated)
                              }}
                            >
                              ❌ Set LOSE
                            </button>
                          </>
                        ) : (
                          <div className={`outcome-decided ${trade.adminOutcome}`}>
                            {trade.adminOutcome === 'win' ? '✅ Will WIN' : '❌ Will LOSE'}
                            <button
                              className="reset-outcome-btn"
                              onClick={() => {
                                const trades = JSON.parse(localStorage.getItem('activeTrades') || '[]')
                                const updated = trades.map(t =>
                                  t.id === trade.id ? { ...t, adminOutcome: 'pending' } : t
                                )
                                localStorage.setItem('activeTrades', JSON.stringify(updated))
                                setActiveTrades(updated)
                              }}
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* AI Arbitrage Control Section */}
        {activeSection === 'ai-arbitrage' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>🤖 AI Arbitrage Management</h1>
              <p>Manage AI arbitrage levels and monitor active investments</p>
            </div>

            <div className="ai-arbitrage-admin">
              <h3>📊 Arbitrage Levels Configuration</h3>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>LEVEL</th>
                      <th>MIN CAPITAL</th>
                      <th>MAX CAPITAL</th>
                      <th>PROFIT %</th>
                      <th>CYCLE DAYS</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { level: 1, minCapital: 1000, maxCapital: 30000, profit: 0.9, cycleDays: 2 },
                      { level: 2, minCapital: 30001, maxCapital: 50000, profit: 2, cycleDays: 5 },
                      { level: 3, minCapital: 50001, maxCapital: 300000, profit: 3.5, cycleDays: 7 },
                      { level: 4, minCapital: 300001, maxCapital: 500000, profit: 15, cycleDays: 15 },
                      { level: 5, minCapital: 500001, maxCapital: 999999999, profit: 20, cycleDays: 30 },
                    ].map((level) => (
                      <tr key={level.level}>
                        <td><span className="level-badge">Level {level.level}</span></td>
                        <td>${level.minCapital.toLocaleString()}</td>
                        <td>{level.maxCapital >= 999999999 ? '∞' : `$${level.maxCapital.toLocaleString()}`}</td>
                        <td className="positive">+{level.profit}%</td>
                        <td>{level.cycleDays} days</td>
                        <td><span className="status-badge active">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 style={{ marginTop: '30px' }}>📈 Active AI Investments</h3>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>USER</th>
                      <th>AMOUNT</th>
                      <th>LEVEL</th>
                      <th>PROFIT</th>
                      <th>START DATE</th>
                      <th>END DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const investments = JSON.parse(localStorage.getItem('aiArbitrageInvestments') || '[]')
                      if (investments.length === 0) {
                        return (
                          <tr>
                            <td colSpan="7" className="no-data">No active AI arbitrage investments</td>
                          </tr>
                        )
                      }
                      return investments.map((inv, idx) => (
                        <tr key={idx}>
                          <td>User</td>
                          <td>${inv.amount?.toLocaleString()}</td>
                          <td>Level {inv.level}</td>
                          <td className="positive">+{inv.profit}%</td>
                          <td>{new Date(inv.startTime).toLocaleDateString()}</td>
                          <td>{new Date(inv.endTime).toLocaleDateString()}</td>
                          <td><span className="status-badge active">Active</span></td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Trade History Section */}
        {activeSection === 'trade-history' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Trade History</h1>
              <p>View all trading transactions</p>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>USER</th>
                    <th>ASSET</th>
                    <th>DIRECTION</th>
                    <th>AMOUNT</th>
                    <th>RESULT</th>
                    <th>PROFIT/LOSS</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.map((trade, idx) => (
                    <tr key={idx}>
                      <td>{trade.id}</td>
                      <td>{trade.user}</td>
                      <td>{trade.asset}</td>
                      <td className={trade.direction === 'up' ? 'up' : 'down'}>
                        {trade.direction === 'up' ? '📈 Up' : '📉 Down'}
                      </td>
                      <td>${trade.amount?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${trade.result}`}>
                          {trade.result}
                        </span>
                      </td>
                      <td className={trade.profit >= 0 ? 'profit' : 'loss'}>
                        {trade.profit >= 0 ? '+' : ''}{trade.profit?.toLocaleString()}
                      </td>
                      <td>{new Date(trade.date).toLocaleString()}</td>
                    </tr>
                  ))}
                  {tradeHistory.length === 0 && (
                    <tr>
                      <td colSpan="8" className="no-data">No trade history</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Balance History Section */}
        {activeSection === 'balance-history' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Balance History</h1>
              <p>Track all balance changes</p>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>USER</th>
                    <th>TYPE</th>
                    <th>AMOUNT</th>
                    <th>BALANCE BEFORE</th>
                    <th>BALANCE AFTER</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="7" className="no-data">No balance history</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Site Settings Section */}
        {activeSection === 'site-settings' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Site Settings</h1>
              <p>Configure platform settings</p>
            </div>
            <div className="settings-form">
              <div className="settings-group">
                <h3>🌐 General Settings</h3>
                <div className="setting-row">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  />
                </div>
                <div className="setting-row">
                  <label>Site URL</label>
                  <input
                    type="text"
                    value={siteSettings.siteUrl}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteUrl: e.target.value })}
                  />
                </div>
                <div className="setting-row">
                  <label>Support Email</label>
                  <input
                    type="email"
                    value={siteSettings.supportEmail}
                    onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="settings-group">
                <h3>⚙️ Feature Toggles</h3>
                <div className="toggle-row">
                  <label>Maintenance Mode</label>
                  <input
                    type="checkbox"
                    checked={siteSettings.maintenanceMode}
                    onChange={(e) => setSiteSettings({ ...siteSettings, maintenanceMode: e.target.checked })}
                  />
                </div>
                <div className="toggle-row">
                  <label>Registration Enabled</label>
                  <input
                    type="checkbox"
                    checked={siteSettings.registrationEnabled}
                    onChange={(e) => setSiteSettings({ ...siteSettings, registrationEnabled: e.target.checked })}
                  />
                </div>
                <div className="toggle-row">
                  <label>Deposits Enabled</label>
                  <input
                    type="checkbox"
                    checked={siteSettings.depositEnabled}
                    onChange={(e) => setSiteSettings({ ...siteSettings, depositEnabled: e.target.checked })}
                  />
                </div>
                <div className="toggle-row">
                  <label>Withdrawals Enabled</label>
                  <input
                    type="checkbox"
                    checked={siteSettings.withdrawalEnabled}
                    onChange={(e) => setSiteSettings({ ...siteSettings, withdrawalEnabled: e.target.checked })}
                  />
                </div>
                <div className="toggle-row">
                  <label>Trading Enabled</label>
                  <input
                    type="checkbox"
                    checked={siteSettings.tradingEnabled}
                    onChange={(e) => setSiteSettings({ ...siteSettings, tradingEnabled: e.target.checked })}
                  />
                </div>
              </div>

              <div className="settings-group">
                <h3>💰 Financial Settings</h3>
                <div className="setting-row">
                  <label>Min Withdrawal</label>
                  <input
                    type="number"
                    value={siteSettings.minWithdrawal}
                    onChange={(e) => setSiteSettings({ ...siteSettings, minWithdrawal: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="setting-row">
                  <label>Max Withdrawal</label>
                  <input
                    type="number"
                    value={siteSettings.maxWithdrawal}
                    onChange={(e) => setSiteSettings({ ...siteSettings, maxWithdrawal: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="setting-row">
                  <label>Withdrawal Fee (%)</label>
                  <input
                    type="number"
                    value={siteSettings.withdrawalFee}
                    onChange={(e) => setSiteSettings({ ...siteSettings, withdrawalFee: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="settings-group">
                <h3>🎁 Bonus Settings</h3>
                <div className="setting-row">
                  <label>Welcome Bonus (USDT)</label>
                  <input
                    type="number"
                    value={siteSettings.welcomeBonus}
                    onChange={(e) => setSiteSettings({ ...siteSettings, welcomeBonus: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="setting-row">
                  <label>Referral Bonus (USDT)</label>
                  <input
                    type="number"
                    value={siteSettings.referralBonus}
                    onChange={(e) => setSiteSettings({ ...siteSettings, referralBonus: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <button className="save-settings-btn" onClick={() => alert('Site settings saved!')}>
              Save All Settings
            </button>
          </div>
        )}

        {/* Bonus Programs Section */}
        {activeSection === 'bonus-programs' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>🎁 Bonus Programs Management</h1>
              <p>Configure all bonus and reward programs</p>
            </div>

            <div className="bonus-programs-grid">
              {/* Welcome Bonus */}
              <div className="bonus-program-card">
                <div className="bonus-card-header">
                  <span className="bonus-emoji">🎉</span>
                  <h3>Welcome Bonus</h3>
                  <label className="toggle-switch-small">
                    <input
                      type="checkbox"
                      checked={bonusPrograms.welcomeBonus.enabled}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        welcomeBonus: { ...bonusPrograms.welcomeBonus, enabled: e.target.checked }
                      })}
                    />
                    <span className="toggle-slider-small"></span>
                  </label>
                </div>
                <div className="bonus-card-body">
                  <div className="bonus-field">
                    <label>Amount (USDT)</label>
                    <input
                      type="number"
                      value={bonusPrograms.welcomeBonus.amount}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        welcomeBonus: { ...bonusPrograms.welcomeBonus, amount: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="bonus-field">
                    <label>Description</label>
                    <input
                      type="text"
                      value={bonusPrograms.welcomeBonus.description}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        welcomeBonus: { ...bonusPrograms.welcomeBonus, description: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Referral Bonus */}
              <div className="bonus-program-card">
                <div className="bonus-card-header">
                  <span className="bonus-emoji">👥</span>
                  <h3>Referral Bonus</h3>
                  <label className="toggle-switch-small">
                    <input
                      type="checkbox"
                      checked={bonusPrograms.referralBonus.enabled}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        referralBonus: { ...bonusPrograms.referralBonus, enabled: e.target.checked }
                      })}
                    />
                    <span className="toggle-slider-small"></span>
                  </label>
                </div>
                <div className="bonus-card-body">
                  <div className="bonus-field">
                    <label>Amount per Referral (USDT)</label>
                    <input
                      type="number"
                      value={bonusPrograms.referralBonus.amount}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        referralBonus: { ...bonusPrograms.referralBonus, amount: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="bonus-field">
                    <label>Description</label>
                    <input
                      type="text"
                      value={bonusPrograms.referralBonus.description}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        referralBonus: { ...bonusPrograms.referralBonus, description: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Trading Cashback */}
              <div className="bonus-program-card">
                <div className="bonus-card-header">
                  <span className="bonus-emoji">💹</span>
                  <h3>Trading Cashback</h3>
                  <label className="toggle-switch-small">
                    <input
                      type="checkbox"
                      checked={bonusPrograms.tradingCashback.enabled}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        tradingCashback: { ...bonusPrograms.tradingCashback, enabled: e.target.checked }
                      })}
                    />
                    <span className="toggle-slider-small"></span>
                  </label>
                </div>
                <div className="bonus-card-body">
                  <div className="bonus-field">
                    <label>Cashback Percentage (%)</label>
                    <input
                      type="number"
                      value={bonusPrograms.tradingCashback.percentage}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        tradingCashback: { ...bonusPrograms.tradingCashback, percentage: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="bonus-field">
                    <label>Min Trades Required</label>
                    <input
                      type="number"
                      value={bonusPrograms.tradingCashback.minTrades}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        tradingCashback: { ...bonusPrograms.tradingCashback, minTrades: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Staking Bonus */}
              <div className="bonus-program-card">
                <div className="bonus-card-header">
                  <span className="bonus-emoji">🔒</span>
                  <h3>Staking Rewards</h3>
                  <label className="toggle-switch-small">
                    <input
                      type="checkbox"
                      checked={bonusPrograms.stakingBonus.enabled}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        stakingBonus: { ...bonusPrograms.stakingBonus, enabled: e.target.checked }
                      })}
                    />
                    <span className="toggle-slider-small"></span>
                  </label>
                </div>
                <div className="bonus-card-body">
                  <div className="bonus-field">
                    <label>APY Percentage (%)</label>
                    <input
                      type="number"
                      value={bonusPrograms.stakingBonus.percentage}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        stakingBonus: { ...bonusPrograms.stakingBonus, percentage: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="bonus-field">
                    <label>Description</label>
                    <input
                      type="text"
                      value={bonusPrograms.stakingBonus.description}
                      onChange={(e) => setBonusPrograms({
                        ...bonusPrograms,
                        stakingBonus: { ...bonusPrograms.stakingBonus, description: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* VIP Levels */}
            <div className="vip-levels-section">
              <h3>👑 VIP Level Bonuses</h3>
              <div className="vip-toggle">
                <label>Enable VIP Program</label>
                <label className="toggle-switch-small">
                  <input
                    type="checkbox"
                    checked={bonusPrograms.vipBonus.enabled}
                    onChange={(e) => setBonusPrograms({
                      ...bonusPrograms,
                      vipBonus: { ...bonusPrograms.vipBonus, enabled: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider-small"></span>
                </label>
              </div>
              <div className="vip-levels-table">
                <table>
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Min Deposit (USDT)</th>
                      <th>Bonus (USDT)</th>
                      <th>Cashback (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonusPrograms.vipBonus.levels.map((level, idx) => (
                      <tr key={idx}>
                        <td>Level {level.level}</td>
                        <td>
                          <input
                            type="number"
                            value={level.minDeposit}
                            onChange={(e) => {
                              const newLevels = [...bonusPrograms.vipBonus.levels]
                              newLevels[idx].minDeposit = parseFloat(e.target.value)
                              setBonusPrograms({
                                ...bonusPrograms,
                                vipBonus: { ...bonusPrograms.vipBonus, levels: newLevels }
                              })
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={level.bonus}
                            onChange={(e) => {
                              const newLevels = [...bonusPrograms.vipBonus.levels]
                              newLevels[idx].bonus = parseFloat(e.target.value)
                              setBonusPrograms({
                                ...bonusPrograms,
                                vipBonus: { ...bonusPrograms.vipBonus, levels: newLevels }
                              })
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={level.cashback}
                            onChange={(e) => {
                              const newLevels = [...bonusPrograms.vipBonus.levels]
                              newLevels[idx].cashback = parseFloat(e.target.value)
                              setBonusPrograms({
                                ...bonusPrograms,
                                vipBonus: { ...bonusPrograms.vipBonus, levels: newLevels }
                              })
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Promotion End Date */}
            <div className="promotion-date-section">
              <h3>📅 Promotion End Date</h3>
              <input
                type="date"
                value={bonusPrograms.promotionEndDate}
                onChange={(e) => setBonusPrograms({ ...bonusPrograms, promotionEndDate: e.target.value })}
              />
            </div>

            <button className="save-settings-btn" onClick={() => alert('Bonus programs saved!')}>
              💾 Save All Bonus Settings
            </button>
          </div>
        )}

        {/* Customer Services Section - Enhanced with Live Chat */}
        {activeSection === 'customer-services' && (
          <div className="admin-section customer-service-section">
            <div className="section-header">
              <h1>💬 Customer Services - Live Chat</h1>
              <p>Manage live chat sessions and support tickets</p>
            </div>

            <div className="support-stats">
              <div className="stat-card pending">
                <span className="stat-number">{activeChats.filter(c => c.status === 'waiting_agent').length}</span>
                <span className="stat-label">Waiting for Agent</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{activeChats.filter(c => c.status === 'connected').length}</span>
                <span className="stat-label">Active Chats</span>
              </div>
              <div className="stat-card verified">
                <span className="stat-number">{activeChats.filter(c => c.status === 'closed').length}</span>
                <span className="stat-label">Resolved</span>
              </div>
            </div>

            <div className="live-chat-container">
              {/* Chat List */}
              <div className="chat-list">
                <h3>Active Conversations</h3>
                {activeChats.length === 0 ? (
                  <div className="no-chats">No active conversations</div>
                ) : (
                  activeChats.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`chat-list-item ${selectedChat?.sessionId === chat.sessionId ? 'active' : ''} ${chat.status === 'waiting_agent' ? 'waiting' : ''}`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <div className="chat-user-info">
                        <span className="chat-avatar">👤</span>
                        <div className="chat-details">
                          <span className="chat-username">{chat.user}</span>
                          <span className="chat-email">{chat.email || 'No email'}</span>
                        </div>
                      </div>
                      <div className="chat-meta">
                        <span className={`chat-status-badge ${chat.status}`}>
                          {chat.status === 'waiting_agent' ? '⏳ Waiting' :
                            chat.status === 'connected' ? '🟢 Active' :
                              chat.status === 'active' ? '💬 Chat' : '✓ Closed'}
                        </span>
                        {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Window */}
              <div className="admin-chat-window">
                {selectedChat ? (
                  <>
                    <div className="chat-window-header">
                      <div className="chat-user-header">
                        <span className="chat-avatar-large">👤</span>
                        <div>
                          <h4>{selectedChat.user}</h4>
                          <span>{selectedChat.email || 'No email provided'}</span>
                        </div>
                      </div>
                      <div className="chat-actions">
                        <button className="chat-action-btn" onClick={() => {
                          const chats = [...activeChats]
                          const chat = chats.find(c => c.sessionId === selectedChat.sessionId)
                          if (chat) chat.status = 'closed'
                          setActiveChats(chats)
                          localStorage.setItem('activeChats', JSON.stringify(chats))
                        }}>Close Chat</button>
                      </div>
                    </div>
                    <div className="chat-messages-area">
                      {chatLogs
                        .filter(log => log.sessionId === selectedChat.sessionId)
                        .map((log, idx) => (
                          <div key={idx} className={`admin-chat-message ${log.type}`}>
                            <div className="message-content">
                              <span className="message-sender">
                                {log.type === 'user' ? selectedChat.user :
                                  log.type === 'admin' ? '🎧 Support Agent' :
                                    log.type === 'agent' ? `🎧 ${log.agentName || 'Agent'}` : '⚙️ System'}
                              </span>
                              <p>{log.message}</p>
                              <span className="message-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="admin-reply-area">
                      <input
                        type="text"
                        placeholder="Type your reply..."
                        value={adminReplyMessage}
                        onChange={(e) => setAdminReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendAdminReply(selectedChat.sessionId)}
                      />
                      <button onClick={() => sendAdminReply(selectedChat.sessionId)}>Send</button>
                    </div>
                  </>
                ) : (
                  <div className="no-chat-selected">
                    <span>💬</span>
                    <p>Select a conversation to view messages</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Send Notifications</h1>
              <p>Send push notifications to users</p>
            </div>
            <div className="notification-form">
              <div className="form-field">
                <label>Target Users</label>
                <select>
                  <option value="all">All Users</option>
                  <option value="vip">VIP Users Only</option>
                  <option value="verified">KYC Verified Only</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>
              <div className="form-field">
                <label>Notification Title</label>
                <input type="text" placeholder="Enter notification title..." />
              </div>
              <div className="form-field">
                <label>Message</label>
                <textarea placeholder="Enter notification message..." rows="4"></textarea>
              </div>
              <button className="send-notification-btn">📤 Send Notification</button>
            </div>
          </div>
        )}

        {/* Announcements Section */}
        {activeSection === 'announcements' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Announcements</h1>
              <p>Manage site-wide announcements</p>
            </div>
            <div className="announcement-form">
              <div className="form-field">
                <label>Announcement Title</label>
                <input type="text" placeholder="Enter announcement title..." />
              </div>
              <div className="form-field">
                <label>Content</label>
                <textarea placeholder="Enter announcement content..." rows="6"></textarea>
              </div>
              <div className="form-field">
                <label>Display Until</label>
                <input type="datetime-local" />
              </div>
              <div className="form-row">
                <label>
                  <input type="checkbox" /> Show as Banner
                </label>
                <label>
                  <input type="checkbox" /> Show as Popup
                </label>
              </div>
              <button className="publish-btn">📢 Publish Announcement</button>
            </div>
          </div>
        )}

        {/* User Activity Logs Section */}
        {activeSection === 'user-activity' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>📊 User Activity Logs</h1>
              <p>Track and monitor all user actions on the platform</p>
            </div>

            <div className="activity-stats">
              <div className="stat-card">
                <span className="stat-icon">🔐</span>
                <div className="stat-info">
                  <span className="stat-number">{userActivityLogs.filter(l => l.action === 'login').length}</span>
                  <span className="stat-label">Total Logins</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💰</span>
                <div className="stat-info">
                  <span className="stat-number">{userActivityLogs.filter(l => l.action === 'deposit').length}</span>
                  <span className="stat-label">Deposits</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📈</span>
                <div className="stat-info">
                  <span className="stat-number">{userActivityLogs.filter(l => l.action === 'trade').length}</span>
                  <span className="stat-label">Trades</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🏦</span>
                <div className="stat-info">
                  <span className="stat-number">{userActivityLogs.filter(l => l.action === 'withdrawal').length}</span>
                  <span className="stat-label">Withdrawals</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📋</span>
                <div className="stat-info">
                  <span className="stat-number">{userActivityLogs.filter(l => l.action === 'kyc_submit').length}</span>
                  <span className="stat-label">KYC Submissions</span>
                </div>
              </div>
            </div>

            <div className="filter-bar">
              <div className="filter-group">
                <label>Filter by Action:</label>
                <select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)}>
                  <option value="all">All Actions</option>
                  <option value="login">Logins</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="trade">Trades</option>
                  <option value="stake">Staking</option>
                  <option value="kyc_submit">KYC Submissions</option>
                  <option value="profile_update">Profile Updates</option>
                </select>
              </div>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by user ID or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="data-table activity-table">
              <table>
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>USER ID</th>
                    <th>EMAIL</th>
                    <th>ACTION</th>
                    <th>DETAILS</th>
                    <th>IP ADDRESS</th>
                  </tr>
                </thead>
                <tbody>
                  {userActivityLogs
                    .filter(log => activityFilter === 'all' || log.action === activityFilter)
                    .filter(log =>
                      searchQuery === '' ||
                      log.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((log, idx) => (
                      <tr key={idx}>
                        <td className="timestamp-cell">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="uid-cell">{log.userId}</td>
                        <td className="email-cell">
                          <a href={`mailto:${log.userEmail}`}>{log.userEmail}</a>
                        </td>
                        <td>
                          <span className={`action-badge action-${log.action}`}>
                            {log.action === 'login' && '🔐 Login'}
                            {log.action === 'deposit' && '💰 Deposit'}
                            {log.action === 'withdrawal' && '🏦 Withdrawal'}
                            {log.action === 'trade' && '📈 Trade'}
                            {log.action === 'stake' && '🔒 Stake'}
                            {log.action === 'kyc_submit' && '📋 KYC'}
                            {log.action === 'profile_update' && '👤 Profile'}
                          </span>
                        </td>
                        <td className="details-cell">{log.details}</td>
                        <td className="ip-cell">{log.ip}</td>
                      </tr>
                    ))}
                  {userActivityLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="no-data">No activity logs yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin Audit Logs Section */}
        {activeSection === 'admin-activity' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>🛡️ Admin Audit Logs</h1>
              <p>Track all administrative actions for security and compliance</p>
            </div>

            <div className="activity-stats">
              <div className="stat-card">
                <span className="stat-icon">🔐</span>
                <div className="stat-info">
                  <span className="stat-number">{adminAuditLogs.filter(l => l.action === 'login').length}</span>
                  <span className="stat-label">Admin Logins</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💵</span>
                <div className="stat-info">
                  <span className="stat-number">{adminAuditLogs.filter(l => l.action === 'balance_update').length}</span>
                  <span className="stat-label">Balance Updates</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✅</span>
                <div className="stat-info">
                  <span className="stat-number">{adminAuditLogs.filter(l => l.action.includes('approve')).length}</span>
                  <span className="stat-label">Approvals</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⚙️</span>
                <div className="stat-info">
                  <span className="stat-number">{adminAuditLogs.filter(l => l.action === 'settings_update').length}</span>
                  <span className="stat-label">Settings Changes</span>
                </div>
              </div>
            </div>

            <div className="filter-bar">
              <div className="filter-group">
                <label>Filter by Action:</label>
                <select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)}>
                  <option value="all">All Actions</option>
                  <option value="login">Admin Logins</option>
                  <option value="balance_update">Balance Updates</option>
                  <option value="kyc_approve">KYC Approvals</option>
                  <option value="withdrawal_approve">Withdrawal Approvals</option>
                  <option value="deposit_approve">Deposit Approvals</option>
                  <option value="settings_update">Settings Changes</option>
                  <option value="user_block">User Blocks</option>
                </select>
              </div>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by admin name or target user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="data-table audit-table">
              <table>
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>ADMIN</th>
                    <th>ACTION</th>
                    <th>DETAILS</th>
                    <th>TARGET USER</th>
                    <th>IP ADDRESS</th>
                  </tr>
                </thead>
                <tbody>
                  {adminAuditLogs
                    .filter(log => activityFilter === 'all' || log.action === activityFilter)
                    .filter(log =>
                      searchQuery === '' ||
                      log.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      log.targetUser?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((log, idx) => (
                      <tr key={idx}>
                        <td className="timestamp-cell">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="admin-cell">
                          <span className="admin-badge">👤 {log.adminName}</span>
                        </td>
                        <td>
                          <span className={`audit-action-badge audit-${log.action}`}>
                            {log.action === 'login' && '🔐 Login'}
                            {log.action === 'balance_update' && '💵 Balance Update'}
                            {log.action === 'kyc_approve' && '✅ KYC Approve'}
                            {log.action === 'kyc_reject' && '❌ KYC Reject'}
                            {log.action === 'withdrawal_approve' && '✅ Withdrawal Approve'}
                            {log.action === 'withdrawal_reject' && '❌ Withdrawal Reject'}
                            {log.action === 'deposit_approve' && '✅ Deposit Approve'}
                            {log.action === 'settings_update' && '⚙️ Settings Update'}
                            {log.action === 'user_block' && '🚫 User Block'}
                            {log.action === 'user_unblock' && '✅ User Unblock'}
                          </span>
                        </td>
                        <td className="details-cell">{log.details}</td>
                        <td className="target-cell">{log.targetUser || '-'}</td>
                        <td className="ip-cell">{log.ip}</td>
                      </tr>
                    ))}
                  {adminAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="no-data">No audit logs yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin Roles Management Section */}
        {activeSection === 'admin-roles' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>👥 Admin Roles Management</h1>
              <p>Manage administrator accounts and permissions</p>
            </div>

            <div className="roles-overview">
              <div className="stat-card">
                <span className="stat-icon">👑</span>
                <div className="stat-info">
                  <span className="stat-number">1</span>
                  <span className="stat-label">Master Account</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">👤</span>
                <div className="stat-info">
                  <span className="stat-number">{adminRoles.filter(r => r.role === 'admin' && r.status === 'active').length}</span>
                  <span className="stat-label">Active Admins</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🔴</span>
                <div className="stat-info">
                  <span className="stat-number">{adminRoles.filter(r => r.status === 'inactive').length}</span>
                  <span className="stat-label">Inactive Admins</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <div className="stat-info">
                  <span className="stat-number">{adminRoles.length}</span>
                  <span className="stat-label">Total Admins</span>
                </div>
              </div>
            </div>

            <div className="add-admin-section">
              <h3>➕ Add New Admin</h3>
              <div className="add-admin-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Username</label>
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Role</label>
                    <div className="role-info">
                      <span className="role-badge role-admin">👤 Admin</span>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>Admins can access the dashboard. Use permissions below to control what they can manage.</p>
                    </div>
                  </div>
                </div>
                <div className="permissions-section">
                  <label>Admin Permissions (Select what this admin can manage):</label>
                  <div className="permissions-grid">
                    {[
                      { key: 'dashboard', label: '📊 View Dashboard' },
                      { key: 'users', label: '👥 Manage Users' },
                      { key: 'deposits', label: '💰 Manage Deposits' },
                      { key: 'withdrawals', label: '🏦 Manage Withdrawals' },
                      { key: 'kyc', label: '📋 Manage KYC' },
                      { key: 'live_trades', label: '🔴 Control Live Trades' },
                      { key: 'ai_arbitrage', label: '🤖 Manage AI Arbitrage' },
                      { key: 'balances', label: '💵 Edit User Balances' },
                      { key: 'customer_service', label: '💬 Customer Service Chat' },
                      { key: 'staking', label: '🔒 Manage Staking' },
                      { key: 'settings', label: '⚙️ Site Settings' },
                      { key: 'logs', label: '📝 View Activity Logs' },
                    ].map(perm => (
                      <label key={perm.key} className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={newAdmin.permissions.includes(perm.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAdmin({ ...newAdmin, permissions: [...newAdmin.permissions, perm.key] })
                            } else {
                              setNewAdmin({ ...newAdmin, permissions: newAdmin.permissions.filter(p => p !== perm.key) })
                            }
                          }}
                        />
                        <span>{perm.label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="select-all-btn"
                    onClick={() => setNewAdmin({ ...newAdmin, permissions: ['dashboard', 'users', 'deposits', 'withdrawals', 'kyc', 'live_trades', 'ai_arbitrage', 'balances', 'customer_service', 'staking', 'settings', 'logs'] })}
                    style={{ marginTop: '10px', padding: '8px 16px', background: 'rgba(124, 58, 237, 0.3)', border: '1px solid #7c3aed', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
                  >
                    Select All Permissions
                  </button>
                </div>
                <button
                  className="add-admin-btn"
                  onClick={() => {
                    if (newAdmin.username && newAdmin.email && newAdmin.password) {
                      if (newAdmin.permissions.length === 0) {
                        alert('Please select at least one permission for the admin')
                        return
                      }
                      const newAdminEntry = {
                        id: Date.now(),
                        username: newAdmin.username,
                        email: newAdmin.email,
                        password: newAdmin.password,
                        role: 'admin',
                        permissions: newAdmin.permissions,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        lastLogin: null
                      }
                      const updatedAdmins = [...adminRoles, newAdminEntry]
                      setAdminRoles(updatedAdmins)
                      // Save immediately to localStorage
                      localStorage.setItem('adminRoles', JSON.stringify(updatedAdmins))
                      setNewAdmin({
                        username: '',
                        email: '',
                        password: '',
                        role: 'admin',
                        permissions: []
                      })
                      // Log admin action
                      setAdminAuditLogs(prev => [...prev, {
                        id: Date.now(),
                        adminId: 'master',
                        adminName: 'Master Admin',
                        action: 'admin_create',
                        details: `Created new admin: ${newAdmin.username} with permissions: ${newAdmin.permissions.join(', ')}`,
                        ip: '192.168.1.1',
                        timestamp: new Date().toISOString()
                      }])
                      alert(`Admin account "${newAdmin.username}" created successfully!\n\nLogin credentials:\nUsername: ${newAdmin.username}\nPassword: (the password you entered)`)
                    } else {
                      alert('Please fill in username, email, and password')
                    }
                  }}
                >
                  ➕ Create Admin Account
                </button>
              </div>
            </div>

            <div className="existing-admins">
              <h3>📋 Existing Administrators</h3>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>USERNAME</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>PERMISSIONS</th>
                      <th>STATUS</th>
                      <th>LAST LOGIN</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminRoles.map((admin, idx) => (
                      <tr key={idx}>
                        <td className="username-cell">
                          {admin.role === 'super_admin' && <span className="crown">👑</span>}
                          {admin.username}
                        </td>
                        <td className="email-cell">
                          <a href={`mailto:${admin.email}`}>{admin.email}</a>
                        </td>
                        <td>
                          <span className={`role-badge role-${admin.role}`}>
                            {admin.role === 'admin' && '👤 Admin'}
                            {admin.role === 'super_admin' && '👑 Super Admin'}
                            {!['admin', 'super_admin'].includes(admin.role) && `👤 ${admin.role}`}
                          </span>
                        </td>
                        <td className="permissions-cell">
                          {admin.permissions?.length === 12 ? (
                            <span className="perm-badge all">Full Access</span>
                          ) : !admin.permissions || admin.permissions.length === 0 ? (
                            <span className="perm-badge none">No Permissions</span>
                          ) : (
                            <div className="perm-list">
                              {admin.permissions.slice(0, 3).map((perm, i) => (
                                <span key={i} className="perm-badge">{perm}</span>
                              ))}
                              {admin.permissions.length > 3 && (
                                <span className="perm-more">+{admin.permissions.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${admin.status}`}>
                            {admin.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </td>
                        <td className="timestamp-cell">
                          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td>
                          <button
                            className="action-btn view"
                            onClick={() => {
                              alert(`Admin: ${admin.username}\nEmail: ${admin.email}\nPassword: ${admin.password || '(not set)'}\nRole: ${admin.role}\nStatus: ${admin.status}`)
                            }}
                            style={{ background: '#3b82f6' }}
                          >
                            View
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => {
                              const newPassword = prompt(`Enter new password for ${admin.username}:`, '')
                              if (newPassword && newPassword.trim()) {
                                const updated = adminRoles.map(a =>
                                  a.id === admin.id
                                    ? { ...a, password: newPassword.trim(), role: 'admin' }
                                    : a
                                )
                                setAdminRoles(updated)
                                localStorage.setItem('adminRoles', JSON.stringify(updated))
                                alert(`Password updated for ${admin.username}`)
                              }
                            }}
                            style={{ background: '#f59e0b' }}
                          >
                            Reset PW
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => {
                              // Toggle status
                              const updated = adminRoles.map(a =>
                                a.id === admin.id
                                  ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' }
                                  : a
                              )
                              setAdminRoles(updated)
                              localStorage.setItem('adminRoles', JSON.stringify(updated))
                              // Log action
                              setAdminAuditLogs(prev => [...prev, {
                                id: Date.now(),
                                adminId: 'master',
                                adminName: 'Master Admin',
                                action: admin.status === 'active' ? 'admin_deactivate' : 'admin_activate',
                                details: `${admin.status === 'active' ? 'Deactivated' : 'Activated'} admin: ${admin.username}`,
                                ip: '192.168.1.1',
                                timestamp: new Date().toISOString()
                              }])
                            }}
                          >
                            {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="action-btn block"
                            onClick={() => {
                              if (confirm(`Delete admin ${admin.username}?`)) {
                                const updated = adminRoles.filter(a => a.id !== admin.id)
                                setAdminRoles(updated)
                                localStorage.setItem('adminRoles', JSON.stringify(updated))
                                // Log action
                                setAdminAuditLogs(prev => [...prev, {
                                  id: Date.now(),
                                  adminId: 'master',
                                  adminName: 'Master Admin',
                                  action: 'admin_delete',
                                  details: `Deleted admin: ${admin.username}`,
                                  ip: '192.168.1.1',
                                  timestamp: new Date().toISOString()
                                }])
                              }
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="role-permissions-legend">
              <h3>📖 Role Hierarchy</h3>
              <div className="legend-grid">
                <div className="legend-item">
                  <span className="role-badge role-master">👑 Master</span>
                  <p>Full system access - can manage all features, create admins, and control all settings. Only one master account exists.</p>
                </div>
                <div className="legend-item">
                  <span className="role-badge role-admin">👤 Admin</span>
                  <p>Access to dashboard features based on permissions assigned by Master. Can manage users, trades, and other functions as permitted.</p>
                </div>
                <div className="legend-item">
                  <span className="role-badge role-user">👤 User</span>
                  <p>Regular platform users who can trade, deposit, withdraw, and use platform features.</p>
                </div>
              </div>
              <div className="permissions-reference" style={{ marginTop: '20px' }}>
                <h4>Available Permissions:</h4>
                <div className="perm-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  <span className="perm-badge">📊 Dashboard</span>
                  <span className="perm-badge">👥 Users</span>
                  <span className="perm-badge">💰 Deposits</span>
                  <span className="perm-badge">🏦 Withdrawals</span>
                  <span className="perm-badge">📋 KYC</span>
                  <span className="perm-badge">🔴 Live Trades</span>
                  <span className="perm-badge">🤖 AI Arbitrage</span>
                  <span className="perm-badge">💵 Balances</span>
                  <span className="perm-badge">💬 Customer Service</span>
                  <span className="perm-badge">🔒 Staking</span>
                  <span className="perm-badge">⚙️ Settings</span>
                  <span className="perm-badge">📝 Logs</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
