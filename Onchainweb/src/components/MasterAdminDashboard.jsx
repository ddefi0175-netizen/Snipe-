import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  subscribeToChatMessages,
  subscribeToActiveChats,
  saveAdminReply,
  updateActiveChat,
  saveChatMessage,
  isFirebaseEnabled
} from '../lib/firebase.js'
import { userAPI, uploadAPI, authAPI, tradeAPI, stakingAPI, settingsAPI, tradingLevelsAPI, bonusesAPI, currenciesAPI, networksAPI, ratesAPI, depositWalletsAPI } from '../lib/api.js'

// Lazy localStorage helper to avoid blocking initial render
const getFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (e) {
    return defaultValue
  }
}

// Backend sync helper - saves to backend and falls back to localStorage
const syncToBackend = async (api, method, data, fallbackKey) => {
  try {
    const result = await api[method](data)
    console.log(`Backend sync success: ${method}`, result)
    return result
  } catch (error) {
    console.error(`Backend sync failed: ${method}`, error.message)
    // Fallback to localStorage
    if (fallbackKey) {
      const current = getFromStorage(fallbackKey, [])
      localStorage.setItem(fallbackKey, JSON.stringify([...current, data]))
    }
    return null
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
  const [isMasterAccount, setIsMasterAccount] = useState(false)

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

  // User Edit Modal
  const [editingUser, setEditingUser] = useState(null)
  const [editUserForm, setEditUserForm] = useState({ balance: '', points: '', vipLevel: '', email: '', role: '', withdrawEnabled: true })

  // User Detail View Modal
  const [viewingUser, setViewingUser] = useState(null)
  const [userDetailTab, setUserDetailTab] = useState('overview')
  const [showActivityHistory, setShowActivityHistory] = useState(false)
  const [userActivities, setUserActivities] = useState([])

  // Admin Detail View Modal
  const [viewingAdmin, setViewingAdmin] = useState(null)

  // User Activity Logs - lazy loaded
  const [userActivityLogs, setUserActivityLogs] = useState([])

  // Admin Audit Logs - lazy loaded
  const [adminAuditLogs, setAdminAuditLogs] = useState([])

  // VIP Unlock Requests - lazy loaded
  const [vipRequests, setVipRequests] = useState([])

  // Pending Deposits from WalletActions
  const [pendingDeposits, setPendingDeposits] = useState([])

  // Admin Roles Management - lazy loaded
  const [adminRoles, setAdminRoles] = useState([])

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: [],
    userAccessMode: 'all',
    assignedUsers: []
  })

  const [activityFilter, setActivityFilter] = useState('all')

  // Site Settings - lazy loaded
  const [siteSettings, setSiteSettings] = useState({})

  // Trade Options Settings - lazy loaded
  const [tradeOptions, setTradeOptions] = useState({})

  // Active Trades - for real-time trade control
  const [activeTrades, setActiveTrades] = useState([])

  // AI Arbitrage Investments - for real-time updates
  const [aiInvestments, setAiInvestments] = useState([])

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
  const loadAllData = useCallback(async () => {
    console.log('Loading all data...')

    // Helper for timeout-protected API calls
    const withTimeout = (promise, ms = 10000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
      ])
    }

    // Fetch users from backend database
    try {
      const backendUsers = await withTimeout(userAPI.getAll())
      if (Array.isArray(backendUsers) && backendUsers.length > 0) {
        setUsers(backendUsers)
        console.log('Loaded users from backend:', backendUsers.length)
      } else {
        setUsers(getFromStorage('registeredUsers', []))
        console.log('No users in backend, using localStorage')
      }
    } catch (error) {
      console.error('Failed to load users from backend:', error.message)
      setUsers(getFromStorage('registeredUsers', []))
    }

    // Fetch pending uploads from backend
    try {
      const backendUploads = await withTimeout(uploadAPI.getAll())
      if (Array.isArray(backendUploads)) {
        setPendingDeposits(backendUploads.filter(u => u.status === 'pending'))
        setDeposits(backendUploads)
        console.log('Loaded uploads from backend:', backendUploads.length)
      }
    } catch (error) {
      console.error('Failed to load uploads from backend:', error.message)
      setDeposits(getFromStorage('adminDeposits', []))
      setPendingDeposits([])
    }

    // Fetch admin accounts from backend
    try {
      // Make sure we have a token before calling
      const token = localStorage.getItem('adminToken')
      if (!token) {
        console.warn('No admin token found, skipping admin load')
        setAdminRoles(getFromStorage('adminRoles', defaultData.adminRoles))
        return
      }
      const adminsResponse = await withTimeout(authAPI.getAdmins())
      if (adminsResponse && adminsResponse.success && Array.isArray(adminsResponse.admins)) {
        const masterAdmin = { id: 1, username: 'master', email: 'master@onchainweb.com', role: 'super_admin', permissions: ['all'], status: 'active' }
        const processedAdmins = adminsResponse.admins.map(a => {
          let permArray = []
          if (a.permissions && typeof a.permissions === 'object' && !Array.isArray(a.permissions)) {
            if (a.permissions.manageUsers) permArray.push('users')
            if (a.permissions.manageBalances) permArray.push('balances')
            if (a.permissions.manageKYC) permArray.push('kyc')
            if (a.permissions.manageTrades) permArray.push('live_trades')
            if (a.permissions.viewReports) permArray.push('dashboard')
            if (a.permissions.createAdmins) permArray.push('create_admins')
          } else if (Array.isArray(a.permissions)) {
            permArray = a.permissions
          }
          return { ...a, role: 'admin', status: 'active', permissions: permArray }
        })
        setAdminRoles([masterAdmin, ...processedAdmins])
        console.log('Loaded admins from backend:', adminsResponse.admins.length)
      } else {
        setAdminRoles(getFromStorage('adminRoles', defaultData.adminRoles))
      }
    } catch (error) {
      console.error('Failed to load admins from backend:', error.message)
      setAdminRoles(getFromStorage('adminRoles', defaultData.adminRoles))
    }

    // Fetch trades from backend
    try {
      const backendTrades = await withTimeout(tradeAPI.getAll())
      if (Array.isArray(backendTrades) && backendTrades.length > 0) {
        const active = backendTrades.filter(t => t.status === 'active' || t.status === 'pending')
        const history = backendTrades.filter(t => t.status !== 'active' && t.status !== 'pending')
        setActiveTrades(active)
        setTradeHistory(history)
        console.log('Loaded trades from backend:', backendTrades.length)
      } else {
        setActiveTrades(getFromStorage('activeTrades', []))
        setTradeHistory(getFromStorage('tradeHistory', []))
      }
    } catch (error) {
      console.error('Failed to load trades from backend:', error.message)
      setActiveTrades(getFromStorage('activeTrades', []))
      setTradeHistory(getFromStorage('tradeHistory', []))
    }

    // Fetch staking from backend
    try {
      const backendStakes = await withTimeout(stakingAPI.getAll())
      if (Array.isArray(backendStakes)) {
        console.log('Loaded stakes from backend:', backendStakes.length)
      }
    } catch (error) {
      console.error('Failed to load staking from backend:', error.message)
    }

    // Load config items from backend (real-time data)
    // Settings
    try {
      const backendSettings = await withTimeout(settingsAPI.get())
      if (backendSettings && backendSettings.siteName) {
        setSiteSettings(backendSettings)
        console.log('Loaded settings from backend')
      } else {
        setSiteSettings(getFromStorage('siteSettings', defaultData.siteSettings))
      }
    } catch (error) {
      console.error('Failed to load settings from backend:', error.message)
      setSiteSettings(getFromStorage('siteSettings', defaultData.siteSettings))
    }

    // Trading Levels
    try {
      const backendLevels = await withTimeout(tradingLevelsAPI.getAll())
      if (Array.isArray(backendLevels) && backendLevels.length > 0) {
        const mappedLevels = backendLevels.map(l => ({
          id: l._id,
          name: l.name,
          countdown: l.countdown,
          profitPercent: l.profitPercent,
          minCapital: l.minCapital,
          maxCapital: l.maxCapital,
          status: l.status
        }))
        setTradingLevels(mappedLevels)
        console.log('Loaded trading levels from backend:', mappedLevels.length)
      } else {
        setTradingLevels(getFromStorage('adminTradingLevels', defaultData.tradingLevels))
      }
    } catch (error) {
      console.error('Failed to load trading levels from backend:', error.message)
      setTradingLevels(getFromStorage('adminTradingLevels', defaultData.tradingLevels))
    }

    // Currencies
    try {
      const backendCurrencies = await withTimeout(currenciesAPI.getAll())
      if (Array.isArray(backendCurrencies) && backendCurrencies.length > 0) {
        const mappedCurrencies = backendCurrencies.map(c => ({
          id: c._id,
          name: c.name,
          symbol: c.symbol,
          icon: c.icon,
          status: c.status
        }))
        setCurrencies(mappedCurrencies)
        console.log('Loaded currencies from backend:', mappedCurrencies.length)
      } else {
        setCurrencies(getFromStorage('adminCurrencies', defaultData.currencies))
      }
    } catch (error) {
      console.error('Failed to load currencies from backend:', error.message)
      setCurrencies(getFromStorage('adminCurrencies', defaultData.currencies))
    }

    // Networks
    try {
      const backendNetworks = await withTimeout(networksAPI.getAll())
      if (Array.isArray(backendNetworks) && backendNetworks.length > 0) {
        const mappedNetworks = backendNetworks.map(n => ({
          id: n._id,
          name: n.name,
          symbol: n.symbol,
          chainId: n.chainId,
          confirmations: n.confirmations,
          status: n.status
        }))
        setNetworks(mappedNetworks)
        console.log('Loaded networks from backend:', mappedNetworks.length)
      } else {
        setNetworks(getFromStorage('adminNetworks', defaultData.networks))
      }
    } catch (error) {
      console.error('Failed to load networks from backend:', error.message)
      setNetworks(getFromStorage('adminNetworks', defaultData.networks))
    }

    // Exchange Rates
    try {
      const backendRates = await withTimeout(ratesAPI.getAll())
      if (Array.isArray(backendRates) && backendRates.length > 0) {
        const mappedRates = backendRates.map(r => ({
          id: r._id,
          from: r.from,
          to: r.to,
          rate: r.rate,
          status: r.status
        }))
        setExchangeRates(mappedRates)
        console.log('Loaded exchange rates from backend:', mappedRates.length)
      } else {
        setExchangeRates(getFromStorage('adminExchangeRates', defaultData.exchangeRates))
      }
    } catch (error) {
      console.error('Failed to load exchange rates from backend:', error.message)
      setExchangeRates(getFromStorage('adminExchangeRates', defaultData.exchangeRates))
    }

    // Deposit Wallets
    try {
      const backendWallets = await withTimeout(depositWalletsAPI.getAll())
      if (Array.isArray(backendWallets) && backendWallets.length > 0) {
        const mappedWallets = backendWallets.map(w => ({
          id: w._id,
          network: w.network,
          address: w.address,
          label: w.label,
          status: w.status
        }))
        setDepositWallets(mappedWallets)
        console.log('Loaded deposit wallets from backend:', mappedWallets.length)
      } else {
        setDepositWallets(getFromStorage('adminDepositWallets', defaultData.depositWallets))
      }
    } catch (error) {
      console.error('Failed to load deposit wallets from backend:', error.message)
      setDepositWallets(getFromStorage('adminDepositWallets', defaultData.depositWallets))
    }

    // Bonuses
    try {
      const backendBonuses = await withTimeout(bonusesAPI.getAll())
      if (Array.isArray(backendBonuses) && backendBonuses.length > 0) {
        // Convert array to object format expected by component
        const bonusObj = {}
        backendBonuses.forEach(b => {
          bonusObj[b.name] = {
            id: b._id,
            name: b.name,
            type: b.type,
            amount: b.amount,
            percentage: b.percentage,
            minDeposit: b.minDeposit,
            status: b.status
          }
        })
        setBonusPrograms(bonusObj)
        console.log('Loaded bonuses from backend:', backendBonuses.length)
      } else {
        setBonusPrograms(getFromStorage('bonusPrograms', defaultData.bonusPrograms))
      }
    } catch (error) {
      console.error('Failed to load bonuses from backend:', error.message)
      setBonusPrograms(getFromStorage('bonusPrograms', defaultData.bonusPrograms))
    }

    // These remain localStorage-based (non-critical config)
    setUserAgents(getFromStorage('userAgents', defaultData.userAgents))
    setWithdrawals(getFromStorage('adminWithdrawals', []))
    setStakingPlans(getFromStorage('stakingPlans', defaultData.stakingPlans))
    setActiveChats(getFromStorage('activeChats', []))
    setChatLogs(getFromStorage('customerChatLogs', []))
    setUserActivityLogs(getFromStorage('userActivityLogs', defaultData.userActivityLogs))
    setAdminAuditLogs(getFromStorage('adminAuditLogs', defaultData.adminAuditLogs))
    setTradeOptions(getFromStorage('tradeOptions', defaultData.tradeOptions))
    setVipRequests(getFromStorage('adminVIPRequests', []))

    // ALWAYS mark data as loaded
    console.log('Data loading complete')
    setIsDataLoaded(true)
  }, [defaultData])

  // Refresh active trades in real-time from backend
  useEffect(() => {
    if (!isAuthenticated || !isDataLoaded) return

    const refreshActiveTrades = async () => {
      try {
        // Try backend first for real-time data
        const backendTrades = await tradeAPI.getActive()
        if (Array.isArray(backendTrades)) {
          setActiveTrades(backendTrades)
          return
        }
      } catch (error) {
        // Fallback to localStorage for any trades that might be there
        console.log('Using localStorage for active trades fallback')
      }

      // Fallback to localStorage
      const trades = getFromStorage('activeTrades', [])
      const now = Date.now()
      const validTrades = trades.filter(t => t.endTime > now || t.status === 'active')
      setActiveTrades(validTrades)
    }

    refreshActiveTrades()
    const interval = setInterval(refreshActiveTrades, 3000) // Check backend every 3s
    return () => clearInterval(interval)
  }, [isAuthenticated, isDataLoaded])

  // Refresh AI investments in real-time
  useEffect(() => {
    if (!isAuthenticated || !isDataLoaded) return

    const refreshAiInvestments = () => {
      const investments = getFromStorage('aiArbitrageInvestments', [])
      setAiInvestments(investments)
    }

    refreshAiInvestments()
    const interval = setInterval(refreshAiInvestments, 2000) // Real-time updates every 2s
    return () => clearInterval(interval)
  }, [isAuthenticated, isDataLoaded])

  // Check authentication on load - fast initial check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const adminSession = localStorage.getItem('masterAdminSession')
        const adminToken = localStorage.getItem('adminToken')

        // Must have both session AND token to be authenticated
        if (adminSession && adminToken) {
          const session = JSON.parse(adminSession)
          if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
            setIsAuthenticated(true)
            setIsMasterAccount(session.role === 'master')
          } else {
            // Session expired, clear everything
            localStorage.removeItem('masterAdminSession')
            localStorage.removeItem('adminToken')
          }
        } else {
          // Missing token or session, clear both
          localStorage.removeItem('masterAdminSession')
          localStorage.removeItem('adminToken')
        }
      } catch (e) {
        console.error('Auth check error:', e)
        localStorage.removeItem('masterAdminSession')
        localStorage.removeItem('adminToken')
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

  // Periodic refresh of backend data (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated || !isDataLoaded) return

    const refreshBackendData = async () => {
      try {
        // Refresh users from backend
        const backendUsers = await userAPI.getAll()
        if (Array.isArray(backendUsers) && backendUsers.length > 0) {
          setUsers(backendUsers)
        }
        // Refresh uploads from backend
        const backendUploads = await uploadAPI.getAll()
        if (Array.isArray(backendUploads)) {
          setPendingDeposits(backendUploads.filter(u => u.status === 'pending'))
          setDeposits(backendUploads)
        }
      } catch (error) {
        console.log('Background refresh error:', error)
      }
    }

    const interval = setInterval(refreshBackendData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [isAuthenticated, isDataLoaded])

  // Subscribe to Firebase real-time chat data
  useEffect(() => {
    if (!isAuthenticated || !isDataLoaded) return

    let unsubscribeChats = () => { }
    let unsubscribeLogs = () => { }

    // Request notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Subscribe to active chats (real-time from Firebase)
    unsubscribeChats = subscribeToActiveChats((chats) => {
      setActiveChats(chats)

      // Auto-select chat if there's a waiting customer and no chat selected
      if (!selectedChat && chats.some(c => c.status === 'waiting_agent')) {
        const waitingChat = chats.find(c => c.status === 'waiting_agent')
        if (waitingChat) setSelectedChat(waitingChat)
      }
    })

    // Subscribe to chat logs (real-time from Firebase)
    unsubscribeLogs = subscribeToChatMessages((logs) => {
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
          new Notification('🔔 New Customer Message', {
            body: `${latestMsg.user}: ${latestMsg.message?.substring(0, 50) || ''}...`,
            icon: '💬',
            tag: 'customer-message',
            requireInteraction: true
          })
        }

        // Auto-clear alert after 10 seconds
        setTimeout(() => setNewMessageAlert(false), 10000)
      }
      setLastMessageCount(userMessages.length)
      setChatLogs(logs)
    })

    return () => {
      if (typeof unsubscribeChats === 'function') unsubscribeChats()
      if (typeof unsubscribeLogs === 'function') unsubscribeLogs()
    }
  }, [isAuthenticated, isDataLoaded, lastMessageCount, selectedChat])

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

  // Loading state for login
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')

    console.log('[LOGIN] Attempting login for:', loginData.username)

    // Validate inputs
    if (!loginData.username || !loginData.password) {
      setLoginError('Please enter username and password')
      return
    }

    // Check if localStorage is available
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
    } catch (storageError) {
      setLoginError('Storage access blocked. Please enable cookies/localStorage in your browser settings.')
      return
    }

    setIsLoggingIn(true)

    try {
      // Call backend API for authentication
      console.log('[LOGIN] Calling authAPI.login...')
      const response = await authAPI.login(loginData.username, loginData.password)

      console.log('[LOGIN] Backend response:', response)

      if (response.success && response.token) {
        // Store JWT token for API calls
        localStorage.setItem('adminToken', response.token)
        localStorage.setItem('masterAdminSession', JSON.stringify({
          username: response.user.username,
          role: response.user.role,
          permissions: response.user.permissions,
          timestamp: Date.now()
        }))

        setLoginError('') // Clear any loading message
        setIsAuthenticated(true)
        setIsDataLoaded(false) // Reset to trigger data load
        setIsMasterAccount(response.user.role === 'master')
        console.log('[LOGIN] Success! Role:', response.user.role, 'Token stored:', !!localStorage.getItem('adminToken'))
        return
      } else {
        console.log('[LOGIN] Response missing success or token:', response)
        setLoginError(response.error || 'Login failed - invalid response from server')
        return
      }
    } catch (error) {
      console.error('[LOGIN] Backend error:', error.message)
      // Fallback to hardcoded master credentials if backend fails
      if (loginData.username === 'master' && loginData.password === 'OnchainWeb2025!') {
        // Generate a fallback token for local operations
        const fallbackToken = 'fallback-master-' + Date.now()
        localStorage.setItem('adminToken', fallbackToken)
        localStorage.setItem('masterAdminSession', JSON.stringify({
          username: loginData.username,
          role: 'master',
          permissions: {
            manageUsers: true,
            manageBalances: true,
            manageKYC: true,
            manageTrades: true,
            viewReports: true,
            createAdmins: true
          },
          timestamp: Date.now()
        }))
        setLoginError('')
        setIsAuthenticated(true)
        setIsDataLoaded(false)
        setIsMasterAccount(true)
        console.log('[LOGIN] Fallback master login successful')
        return
      }
      setLoginError(error.message || 'Invalid credentials. Check username/password.')
      return
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setIsDataLoaded(false)
    localStorage.removeItem('masterAdminSession')
    localStorage.removeItem('adminToken')
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

  // Update user balance - now uses backend API
  const updateUserBalance = async (userId, newBalance) => {
    try {
      // Find user by userId or _id
      const user = users.find(u => u.id === userId || u._id === userId || u.userId === userId)
      if (user && user._id) {
        await userAPI.update(user._id, { balance: parseFloat(newBalance) })
      }
      setUsers(prev => prev.map(u =>
        (u.id === userId || u._id === userId || u.userId === userId)
          ? { ...u, balance: parseFloat(newBalance) }
          : u
      ))
    } catch (error) {
      console.error('Failed to update balance:', error)
      alert('Failed to update balance: ' + error.message)
    }
  }

  // Save edited user - now uses backend API
  const saveEditedUser = async () => {
    if (!editingUser) return

    const updates = {
      balance: parseFloat(editUserForm.balance) || editingUser.balance || 0,
      points: parseInt(editUserForm.points) || editingUser.points || 0,
      vipLevel: parseInt(editUserForm.vipLevel) || editingUser.vipLevel || 1,
      // Include all editable fields for complete backend sync
      withdrawEnabled: editUserForm.withdrawEnabled !== undefined ? editUserForm.withdrawEnabled : editingUser.withdrawEnabled,
      frozen: editUserForm.frozen !== undefined ? editUserForm.frozen : editingUser.frozen,
      creditScore: parseInt(editUserForm.creditScore) || editingUser.creditScore || 100,
      tradeMode: editUserForm.tradeMode || editingUser.tradeMode || 'auto',
      presetTradeResult: editUserForm.presetTradeResult || editingUser.presetTradeResult || '',
      allowedTradingLevel: parseInt(editUserForm.allowedTradingLevel) || editingUser.allowedTradingLevel || 1,
    }

    try {
      if (editingUser._id) {
        await userAPI.update(editingUser._id, updates)
        console.log('User updated in backend:', editingUser._id, updates)
      }
      setUsers(prev => prev.map(user =>
        (user.id === editingUser.id || user._id === editingUser._id) ? { ...user, ...updates } : user
      ))
    } catch (error) {
      console.error('Failed to save user:', error)
      alert('Failed to save user: ' + error.message)
      return
    }

    // Log the action
    setAdminAuditLogs(prev => [...prev, {
      id: Date.now(),
      adminId: 'master',
      adminName: 'Master Admin',
      action: 'balance_update',
      details: `Updated ${editingUser.username}: Balance $${updates.balance}, Points ${updates.points}, VIP Level ${updates.vipLevel}`,
      targetUser: editingUser.id,
      ip: '192.168.1.1',
      timestamp: new Date().toISOString()
    }])

    setEditingUser(null)
    setEditUserForm({ balance: '', points: '', vipLevel: '' })
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

  // Approve/Reject deposit - now uses backend API
  const handleDepositAction = async (id, action) => {
    try {
      // Use MongoDB _id for API call
      const deposit = deposits.find(d => d.id === id || d._id === id)
      const mongoId = deposit?._id || id

      await uploadAPI.updateStatus(mongoId, action)

      // Update local state
      setDeposits(prev => prev.map(d =>
        (d.id === id || d._id === id) ? { ...d, status: action } : d
      ))
      setPendingDeposits(prev => prev.map(d =>
        (d.id === id || d._id === id) ? { ...d, status: action } : d
      ))

      console.log(`Deposit ${id} ${action} via backend`)
    } catch (error) {
      console.error('Failed to update deposit:', error)
      alert('Failed to update deposit: ' + error.message)
    }
  }

  // Approve/Reject pending deposit proof - uses backend API
  const handlePendingDepositAction = async (deposit, action) => {
    try {
      const mongoId = deposit._id || deposit.id
      const amount = action === 'confirmed' ? (deposit.amount || 0) : 0

      if (action === 'confirmed') {
        await uploadAPI.approve(mongoId, amount)
      } else {
        await uploadAPI.reject(mongoId, 'Rejected by admin')
      }

      // Update local state
      setPendingDeposits(prev => prev.map(d =>
        (d.id === deposit.id || d._id === deposit._id) ? { ...d, status: action } : d
      ))

      // Refresh data from backend
      const backendUploads = await uploadAPI.getAll()
      if (Array.isArray(backendUploads)) {
        setPendingDeposits(backendUploads.filter(u => u.status === 'pending'))
        setDeposits(backendUploads)
      }

      alert(`Deposit ${action}!`)
    } catch (error) {
      console.error('Failed to update deposit:', error)
      alert('Failed to update deposit: ' + error.message)
    }
  }

  // Approve/Reject KYC - uses backend API
  const handleKYCAction = async (user, action) => {
    try {
      const mongoId = user._id || user.id
      await userAPI.reviewKYC(mongoId, action)

      // Update local state
      setUsers(prev => prev.map(u =>
        (u.id === user.id || u._id === user._id) ? { ...u, kycStatus: action } : u
      ))

      alert(`KYC ${action} for ${user.username}!`)
    } catch (error) {
      console.error('Failed to review KYC:', error)
      alert('Failed to review KYC: ' + error.message)
    }
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
    // Get stored admins for debugging
    const storedAdmins = JSON.parse(localStorage.getItem('adminRoles') || '[]')

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
            <button type="submit" className="login-btn" disabled={isLoggingIn}>
              {isLoggingIn ? 'Connecting to server...' : 'Login'}
            </button>
          </form>

          {/* Admin Account Info */}
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <p style={{ color: '#60a5fa', marginBottom: '8px', fontWeight: 'bold' }}>📋 Available Accounts:</p>
            <div style={{ color: '#94a3b8', lineHeight: '1.6' }}>
              <p>👑 <strong>Master:</strong> master</p>
              <p>👤 <strong>Admin:</strong> newadmin / NewAdmin2026!</p>
              <p>👤 <strong>Admin:</strong> admin2 / Admin123!</p>
            </div>
            <p style={{ color: '#64748b', marginTop: '10px', fontSize: '11px' }}>
              ℹ️ Admin accounts are stored in the cloud database.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Send admin reply to customer chat
  const sendAdminReply = async (sessionId) => {
    if (!adminReplyMessage.trim()) return

    const replyData = {
      id: Date.now(),
      sessionId: sessionId,
      message: adminReplyMessage,
      agentName: 'Support Agent',
      timestamp: new Date().toISOString(),
      delivered: false
    }

    // Save admin reply to Firebase (user will receive it via subscription)
    await saveAdminReply(replyData)

    // Also save to chat logs via Firebase
    const logEntry = {
      id: Date.now() + 1,
      sessionId: sessionId,
      type: 'admin',
      message: adminReplyMessage,
      agentName: 'Support Agent',
      timestamp: new Date().toISOString()
    }
    await saveChatMessage(logEntry)

    setAdminReplyMessage('')
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
          <a onClick={() => setActiveSection('vip-requests')} className={activeSection === 'vip-requests' ? 'active' : ''}>
            👑 VIP Requests
            {vipRequests.filter(v => v.status === 'pending').length > 0 && (
              <span className="nav-badge">{vipRequests.filter(v => v.status === 'pending').length}</span>
            )}
          </a>
          <a onClick={() => setActiveSection('pending-deposits')} className={activeSection === 'pending-deposits' ? 'active' : ''}>
            💰 Pending Deposits
            {pendingDeposits.filter(d => d.status === 'pending').length > 0 && (
              <span className="nav-badge">{pendingDeposits.filter(d => d.status === 'pending').length}</span>
            )}
          </a>
          <a onClick={() => setActiveSection('live-trades')} className={activeSection === 'live-trades' ? 'active' : ''}>
            🔴 Live Trades
            {activeTrades.length > 0 && (
              <span className="nav-badge live">{activeTrades.length}</span>
            )}
          </a>
          <a onClick={() => setActiveSection('trade-options')} className={activeSection === 'trade-options' ? 'active' : ''}>Trade Options</a>
          <a onClick={() => setActiveSection('ai-arbitrage')} className={activeSection === 'ai-arbitrage' ? 'active' : ''}>AI Arbitrage</a>
          <a onClick={() => setActiveSection('bonus-programs')} className={activeSection === 'bonus-programs' ? 'active' : ''}>Bonus Programs</a>
          <a onClick={() => setActiveSection('staking-plans')} className={activeSection === 'staking-plans' ? 'active' : ''}>AI Arbitrage Plans</a>
          <a onClick={() => setActiveSection('staking-history')} className={activeSection === 'staking-history' ? 'active' : ''}>AI Arbitrage History</a>
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

        {/* All Users Section - Enhanced User Management */}
        {activeSection === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>User Management</h1>
              <p>Manage and monitor all users in the system</p>
              <button
                onClick={async () => {
                  try {
                    const backendUsers = await userAPI.getAll()
                    if (Array.isArray(backendUsers)) {
                      setUsers(backendUsers)
                      alert(`✅ Refreshed! Found ${backendUsers.length} users`)
                    }
                  } catch (error) {
                    alert('Failed to refresh: ' + error.message)
                  }
                }}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔄 Refresh Users from Database
              </button>
            </div>

            {/* Search and Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#94a3b8', marginBottom: '8px', display: 'block' }}>Search Users</label>
                <div className="search-box" style={{ margin: 0 }}>
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by email, IP address, or UID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <label style={{ color: '#94a3b8', marginBottom: '8px' }}>Filter By</label>
                <button style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Active Users</button>
                <select style={{ padding: '10px 20px', background: '#374151', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  <option value="default">Default</option>
                  <option value="balance">By Balance</option>
                  <option value="recent">Recent</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="data-table" style={{ background: '#0f172a', borderRadius: '12px', overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>IP ADDRESS</th>
                    <th>ACTIVE</th>
                    <th>ROLE</th>
                    <th>REFERRAL</th>
                    <th>CREDIT SCORE</th>
                    <th>TRADING</th>
                    <th>WITHDRAW</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(users, searchQuery).map((user, idx) => (
                    <tr key={user._id || idx} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ fontWeight: 'bold' }}>{user.username || user.userId || 'N/A'}</td>
                      <td><a href={`mailto:${user.email}`} style={{ color: '#3b82f6' }}>{user.email || '-'}</a></td>
                      <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{user.ipAddress || '0.0.0.0'}</td>
                      <td>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          background: user.frozen ? '#dc2626' : '#10b981',
                          color: '#fff',
                          fontSize: '12px'
                        }}>
                          {user.frozen ? 'Frozen' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          background: user.role === 'admin' ? '#3b82f6' : '#374151',
                          color: '#fff',
                          fontSize: '12px'
                        }}>
                          {user.role || 'none'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{user.referralCode || '-'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{user.creditScore || 100}</td>
                      <td>
                        <button
                          style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            background: user.tradeMode === 'lose' ? '#dc2626' : '#10b981',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onClick={async () => {
                            const newMode = user.tradeMode === 'win' ? 'lose' : user.tradeMode === 'lose' ? 'auto' : 'win'
                            try {
                              if (user._id) await userAPI.setTradeMode(user._id, newMode)
                              setUsers(prev => prev.map(u => u._id === user._id ? { ...u, tradeMode: newMode } : u))
                            } catch (err) { alert('Error: ' + err.message) }
                          }}
                        >
                          {user.tradeMode === 'win' ? 'Win' : user.tradeMode === 'lose' ? 'Lose' : 'Enable'}
                        </button>
                      </td>
                      <td>
                        <button
                          style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            background: user.withdrawEnabled === false ? '#dc2626' : '#10b981',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onClick={async () => {
                            try {
                              const newVal = !user.withdrawEnabled
                              if (user._id) await userAPI.update(user._id, { withdrawEnabled: newVal })
                              setUsers(prev => prev.map(u => u._id === user._id ? { ...u, withdrawEnabled: newVal } : u))
                            } catch (err) { alert('Error: ' + err.message) }
                          }}
                        >
                          {user.withdrawEnabled === false ? 'Frozen' : 'Unfreeze'}
                        </button>
                      </td>
                      <td>
                        <button
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                          onClick={() => setViewingUser(user)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="10" className="no-data">
                        No users found. Users will appear here automatically when they connect their wallet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* User Detail View Modal */}
            {viewingUser && (
              <div className="modal-overlay" onClick={() => setViewingUser(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflow: 'auto' }}>
                <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', borderRadius: '16px', width: '100%', maxWidth: '1000px', marginTop: '20px' }}>

                  {/* User Header */}
                  <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '30px', borderRadius: '16px 16px 0 0', textAlign: 'center', position: 'relative' }}>
                    <button onClick={() => setViewingUser(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px' }}>×</button>
                    <h2 style={{ color: '#fff', fontSize: '28px', margin: 0 }}>{viewingUser.username || 'User'}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: '5px 0 0 0' }}>{viewingUser.email || '-'}</p>
                  </div>

                  {/* User Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#1e293b', margin: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: '#0f172a', padding: '20px' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>UID</div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{viewingUser.userId || viewingUser._id?.slice(-10) || '-'}</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '20px' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Withdrawable</div>
                      <div style={{ color: viewingUser.withdrawEnabled === false ? '#dc2626' : '#10b981', fontSize: '18px', fontWeight: 'bold' }}>{viewingUser.withdrawEnabled === false ? 'Frozen' : 'Unfreeze'}</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '20px' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Withdraw Times</div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{viewingUser.withdrawCount || 0}</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '20px' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Deposit Times</div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{viewingUser.depositCount || 0}</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '20px' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Trade Times</div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{viewingUser.tradeCount || 0}</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '20px' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Stake Times</div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{viewingUser.stakeCount || 0}</div>
                    </div>
                  </div>

                  {/* User Balance & Points */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', margin: '20px' }}>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>Balance</div>
                      <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>${(viewingUser.balance || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>Points</div>
                      <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>{(viewingUser.points || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>Credit Score</div>
                      <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>{viewingUser.creditScore || 100}</div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>Trade Mode</div>
                      <div style={{ color: viewingUser.tradeMode === 'win' ? '#10b981' : viewingUser.tradeMode === 'lose' ? '#dc2626' : '#f59e0b', fontSize: '18px', fontWeight: 'bold' }}>{(viewingUser.tradeMode || 'auto').toUpperCase()}</div>
                    </div>
                  </div>

                  {/* VIP Level Management */}
                  <div style={{ margin: '20px', background: '#1e293b', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>👑 VIP Level Management</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          onClick={async () => {
                            try {
                              if (viewingUser._id) await userAPI.update(viewingUser._id, { vipLevel: level })
                              setViewingUser(prev => ({ ...prev, vipLevel: level }))
                              setUsers(prev => prev.map(u => u._id === viewingUser._id ? { ...u, vipLevel: level } : u))
                              alert(`VIP Level set to ${level}!`)
                            } catch (err) { alert('Error: ' + err.message) }
                          }}
                          style={{
                            padding: '15px 25px',
                            background: viewingUser.vipLevel === level ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#374151',
                            color: '#fff',
                            border: viewingUser.vipLevel === level ? '2px solid #fbbf24' : '2px solid transparent',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            transition: 'all 0.2s'
                          }}
                        >
                          👑 VIP {level}
                        </button>
                      ))}
                    </div>
                    <p style={{ color: '#64748b', fontSize: '12px', marginTop: '10px' }}>
                      Current: VIP Level {viewingUser.vipLevel || 1} | Higher levels unlock more trading features and limits
                    </p>
                  </div>

                  {/* Deposit Address Section */}
                  <div style={{ margin: '20px', background: '#1e293b', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>💰 User Deposit Address</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                      <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                        <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>USDT (TRC20) Address</label>
                        <input
                          type="text"
                          value={viewingUser.depositAddressUSDT || ''}
                          placeholder="Enter USDT TRC20 address for this user"
                          onChange={async (e) => {
                            const val = e.target.value
                            setViewingUser(prev => ({ ...prev, depositAddressUSDT: val }))
                          }}
                          onBlur={async (e) => {
                            try {
                              if (viewingUser._id) await userAPI.update(viewingUser._id, { depositAddressUSDT: e.target.value })
                            } catch (err) { console.error(err) }
                          }}
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #374151', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                        <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>USDT (ERC20) Address</label>
                        <input
                          type="text"
                          value={viewingUser.depositAddressERC20 || ''}
                          placeholder="Enter USDT ERC20 address for this user"
                          onChange={async (e) => {
                            const val = e.target.value
                            setViewingUser(prev => ({ ...prev, depositAddressERC20: val }))
                          }}
                          onBlur={async (e) => {
                            try {
                              if (viewingUser._id) await userAPI.update(viewingUser._id, { depositAddressERC20: e.target.value })
                            } catch (err) { console.error(err) }
                          }}
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #374151', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                        <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>BTC Address</label>
                        <input
                          type="text"
                          value={viewingUser.depositAddressBTC || ''}
                          placeholder="Enter BTC address for this user"
                          onChange={async (e) => {
                            const val = e.target.value
                            setViewingUser(prev => ({ ...prev, depositAddressBTC: val }))
                          }}
                          onBlur={async (e) => {
                            try {
                              if (viewingUser._id) await userAPI.update(viewingUser._id, { depositAddressBTC: e.target.value })
                            } catch (err) { console.error(err) }
                          }}
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #374151', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                        <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>ETH Address</label>
                        <input
                          type="text"
                          value={viewingUser.depositAddressETH || ''}
                          placeholder="Enter ETH address for this user"
                          onChange={async (e) => {
                            const val = e.target.value
                            setViewingUser(prev => ({ ...prev, depositAddressETH: val }))
                          }}
                          onBlur={async (e) => {
                            try {
                              if (viewingUser._id) await userAPI.update(viewingUser._id, { depositAddressETH: e.target.value })
                            } catch (err) { console.error(err) }
                          }}
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #374151', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* User Actions */}
                  <div style={{ margin: '20px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>User Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                      <button onClick={() => {
                        setEditingUser(viewingUser)
                        setEditUserForm({ balance: viewingUser.balance || 0, points: viewingUser.points || 0, vipLevel: viewingUser.vipLevel || 1 })
                      }} style={{ padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        ✏️ Edit User
                      </button>
                      <button onClick={() => {
                        const msg = prompt('Enter message to send to user:')
                        if (msg) alert('Message sent: ' + msg)
                      }} style={{ padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        ✉️ Send Message
                      </button>
                      <button onClick={() => alert('Reset password feature')} style={{ padding: '12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        🔑 Reset Password
                      </button>
                      <button onClick={async () => {
                        const pass = prompt('Set withdrawal password for this user:')
                        if (pass) {
                          try {
                            if (viewingUser._id) await userAPI.update(viewingUser._id, { withdrawPassword: pass })
                            alert('Withdraw password set!')
                          } catch (err) { alert('Error: ' + err.message) }
                        }
                      }} style={{ padding: '12px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        🔒 Set Withdraw Pass
                      </button>
                      <button onClick={async () => {
                        const role = prompt('Enter new role (user/admin):', viewingUser.role || 'user')
                        if (role) {
                          try {
                            if (viewingUser._id) await userAPI.update(viewingUser._id, { role })
                            setViewingUser(prev => ({ ...prev, role }))
                            setUsers(prev => prev.map(u => u._id === viewingUser._id ? { ...u, role } : u))
                            alert('Role updated!')
                          } catch (err) { alert('Error: ' + err.message) }
                        }
                      }} style={{ padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        👤 Change Role
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '10px' }}>
                      <button onClick={async () => {
                        if (confirm('Delete this user permanently?')) {
                          try {
                            if (viewingUser._id) await userAPI.delete(viewingUser._id)
                            setUsers(prev => prev.filter(u => u._id !== viewingUser._id))
                            setViewingUser(null)
                            alert('User deleted!')
                          } catch (err) { alert('Error: ' + err.message) }
                        }
                      }} style={{ padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        🗑️ Delete User
                      </button>
                      <button onClick={async () => {
                        const score = prompt('Enter new credit score (0-100):', viewingUser.creditScore || 100)
                        if (score) {
                          try {
                            if (viewingUser._id) await userAPI.update(viewingUser._id, { creditScore: parseInt(score) })
                            setViewingUser(prev => ({ ...prev, creditScore: parseInt(score) }))
                            setUsers(prev => prev.map(u => u._id === viewingUser._id ? { ...u, creditScore: parseInt(score) } : u))
                            alert('Credit score updated!')
                          } catch (err) { alert('Error: ' + err.message) }
                        }
                      }} style={{ padding: '12px', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        ⭐ Credit Score
                      </button>
                      <button onClick={async () => {
                        const modes = ['auto', 'win', 'lose']
                        const currentIdx = modes.indexOf(viewingUser.tradeMode || 'auto')
                        const newMode = modes[(currentIdx + 1) % modes.length]
                        try {
                          if (viewingUser._id) await userAPI.setTradeMode(viewingUser._id, newMode)
                          setViewingUser(prev => ({ ...prev, tradeMode: newMode }))
                          setUsers(prev => prev.map(u => u._id === viewingUser._id ? { ...u, tradeMode: newMode } : u))
                          alert(`Trade mode set to: ${newMode}`)
                        } catch (err) { alert('Error: ' + err.message) }
                      }} style={{ padding: '12px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        📈 Trading ({viewingUser.tradeMode || 'auto'})
                      </button>
                      <button onClick={async () => {
                        const bal = prompt('Enter new balance:', viewingUser.balance || 0)
                        if (bal !== null) {
                          try {
                            if (viewingUser._id) await userAPI.update(viewingUser._id, { balance: parseFloat(bal) })
                            setViewingUser(prev => ({ ...prev, balance: parseFloat(bal) }))
                            setUsers(prev => prev.map(u => u._id === viewingUser._id ? { ...u, balance: parseFloat(bal) } : u))
                            alert('Balance updated!')
                          } catch (err) { alert('Error: ' + err.message) }
                        }
                      }} style={{ padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        💰 Balance
                      </button>
                      <button onClick={() => {
                        // Generate sample activity history for this user
                        const activities = [
                          { id: 1, action: 'Login', detail: 'User logged in via MetaMask', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), ip: viewingUser.ipAddress || '0.0.0.0' },
                          { id: 2, action: 'Deposit', detail: `Deposited $${(viewingUser.depositCount || 0) * 100} USDT`, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'completed' },
                          { id: 3, action: 'Trade', detail: `Binary Options - BTC/USDT - $50 - ${viewingUser.tradeMode === 'win' ? 'Won' : 'Lost'}`, timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: viewingUser.tradeMode === 'win' ? 'won' : 'lost' },
                          { id: 4, action: 'AI Arbitrage', detail: 'Started AI Arbitrage investment - $200', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'active' },
                          { id: 5, action: 'Staking', detail: 'Staked $500 in 30-day pool', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), status: 'locked' },
                          { id: 6, action: 'KYC', detail: `KYC ${viewingUser.kycStatus || 'not submitted'}`, timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), status: viewingUser.kycStatus || 'none' },
                          { id: 7, action: 'Withdrawal', detail: `Requested withdrawal - Status: ${viewingUser.withdrawEnabled ? 'Enabled' : 'Frozen'}`, timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), status: viewingUser.withdrawEnabled ? 'pending' : 'frozen' },
                          { id: 8, action: 'Profile Update', detail: 'Updated email address', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'completed' },
                        ]
                        setUserActivities(activities)
                        setShowActivityHistory(true)
                      }} style={{ padding: '12px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        📋 Activity History
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px', maxWidth: '410px' }}>
                      <button onClick={async () => {
                        const result = prompt('Preset next trade result (win/lose):', 'win')
                        if (result && ['win', 'lose'].includes(result)) {
                          try {
                            if (viewingUser._id) await userAPI.update(viewingUser._id, { presetTradeResult: result })
                            setViewingUser(prev => ({ ...prev, presetTradeResult: result }))
                            alert(`Next trade will ${result}!`)
                          } catch (err) { alert('Error: ' + err.message) }
                        }
                      }} style={{ padding: '12px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        📝 Preset Trade Order
                      </button>
                      <button onClick={async () => {
                        if (confirm('Reset trade count for this user?')) {
                          try {
                            if (viewingUser._id) await userAPI.update(viewingUser._id, { tradeCount: 0 })
                            setViewingUser(prev => ({ ...prev, tradeCount: 0 }))
                            alert('Trade count reset!')
                          } catch (err) { alert('Error: ' + err.message) }
                        }
                      }} style={{ padding: '12px', background: '#f43f5e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        🔄 Reset Trade Count
                      </button>
                    </div>
                  </div>

                  {/* KYC Verification Section */}
                  <div style={{ margin: '20px', background: '#1e293b', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>📋 KYC Verification</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                      {/* KYC Status */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                          <span style={{ color: '#64748b' }}>Current Status:</span>
                          <span style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            background: viewingUser.kycStatus === 'verified' ? '#10b981' :
                              viewingUser.kycStatus === 'pending' ? '#f59e0b' :
                                viewingUser.kycStatus === 'rejected' ? '#dc2626' : '#6b7280',
                            color: '#fff'
                          }}>
                            {viewingUser.kycStatus === 'verified' ? '✅ Verified' :
                              viewingUser.kycStatus === 'pending' ? '⏳ Pending Review' :
                                viewingUser.kycStatus === 'rejected' ? '❌ Rejected' : '⚪ Not Submitted'}
                          </span>
                        </div>
                      </div>

                      {/* KYC Details */}
                      {viewingUser.kycStatus && viewingUser.kycStatus !== 'none' && (
                        <>
                          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                            <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Full Name</label>
                            <div style={{ color: '#fff', fontSize: '16px' }}>{viewingUser.kycFullName || 'Not provided'}</div>
                          </div>
                          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                            <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Document Type</label>
                            <div style={{ color: '#fff', fontSize: '16px' }}>{viewingUser.kycDocType || 'Not provided'}</div>
                          </div>
                          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                            <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Document Number</label>
                            <div style={{ color: '#fff', fontSize: '16px' }}>{viewingUser.kycDocNumber || 'Not provided'}</div>
                          </div>
                          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                            <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Submitted At</label>
                            <div style={{ color: '#fff', fontSize: '14px' }}>{viewingUser.kycSubmittedAt ? new Date(viewingUser.kycSubmittedAt).toLocaleString() : 'N/A'}</div>
                          </div>

                          {/* Document Images */}
                          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                              <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>ID Front Photo</label>
                              {viewingUser.kycFrontPhoto ? (
                                <a href={viewingUser.kycFrontPhoto} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px', background: '#3b82f6', color: '#fff', borderRadius: '6px', textAlign: 'center', textDecoration: 'none' }}>
                                  📄 View Front Photo
                                </a>
                              ) : (
                                <div style={{ color: '#64748b', padding: '10px', background: '#374151', borderRadius: '6px', textAlign: 'center' }}>No photo uploaded</div>
                              )}
                            </div>
                            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                              <label style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>ID Back Photo</label>
                              {viewingUser.kycBackPhoto ? (
                                <a href={viewingUser.kycBackPhoto} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px', background: '#3b82f6', color: '#fff', borderRadius: '6px', textAlign: 'center', textDecoration: 'none' }}>
                                  📄 View Back Photo
                                </a>
                              ) : (
                                <div style={{ color: '#64748b', padding: '10px', background: '#374151', borderRadius: '6px', textAlign: 'center' }}>No photo uploaded</div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* KYC Action Buttons */}
                      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <button
                          onClick={async () => {
                            try {
                              if (viewingUser._id) {
                                await userAPI.reviewKYC(viewingUser._id, 'verified')
                                setViewingUser(prev => ({ ...prev, kycStatus: 'verified', kycVerifiedAt: new Date().toISOString() }))
                                setUsers(prev => prev.map(u => u._id === viewingUser._id ? { ...u, kycStatus: 'verified' } : u))
                                alert('✅ KYC Approved successfully!')
                              }
                            } catch (err) { alert('Error: ' + err.message) }
                          }}
                          disabled={viewingUser.kycStatus === 'verified' || viewingUser.kycStatus === 'none' || !viewingUser.kycStatus}
                          style={{
                            flex: 1,
                            padding: '15px',
                            background: viewingUser.kycStatus === 'verified' ? '#374151' : '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: viewingUser.kycStatus === 'verified' ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            opacity: viewingUser.kycStatus === 'verified' || viewingUser.kycStatus === 'none' || !viewingUser.kycStatus ? 0.5 : 1
                          }}
                        >
                          ✅ Approve KYC
                        </button>
                        <button
                          onClick={async () => {
                            const reason = prompt('Enter rejection reason (optional):')
                            try {
                              if (viewingUser._id) {
                                await userAPI.reviewKYC(viewingUser._id, 'rejected')
                                setViewingUser(prev => ({ ...prev, kycStatus: 'rejected' }))
                                setUsers(prev => prev.map(u => u._id === viewingUser._id ? { ...u, kycStatus: 'rejected' } : u))
                                alert('❌ KYC Rejected!' + (reason ? ` Reason: ${reason}` : ''))
                              }
                            } catch (err) { alert('Error: ' + err.message) }
                          }}
                          disabled={viewingUser.kycStatus === 'rejected' || viewingUser.kycStatus === 'none' || !viewingUser.kycStatus}
                          style={{
                            flex: 1,
                            padding: '15px',
                            background: viewingUser.kycStatus === 'rejected' ? '#374151' : '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: viewingUser.kycStatus === 'rejected' ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            opacity: viewingUser.kycStatus === 'rejected' || viewingUser.kycStatus === 'none' || !viewingUser.kycStatus ? 0.5 : 1
                          }}
                        >
                          ❌ Reject KYC
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              if (viewingUser._id) {
                                await userAPI.update(viewingUser._id, { kycStatus: 'none', kycFullName: '', kycDocType: '', kycDocNumber: '', kycFrontPhoto: '', kycBackPhoto: '' })
                                setViewingUser(prev => ({ ...prev, kycStatus: 'none', kycFullName: '', kycDocType: '', kycDocNumber: '', kycFrontPhoto: '', kycBackPhoto: '' }))
                                setUsers(prev => prev.map(u => u._id === viewingUser._id ? { ...u, kycStatus: 'none' } : u))
                                alert('🔄 KYC Reset to None!')
                              }
                            } catch (err) { alert('Error: ' + err.message) }
                          }}
                          style={{ padding: '15px 25px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          🔄 Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div style={{ margin: '20px', background: '#1e293b', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>Additional Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Wallet:</span>
                        <span style={{ color: '#fff', marginLeft: '10px', fontFamily: 'monospace' }}>{viewingUser.wallet || '-'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Wallet Type:</span>
                        <span style={{ color: '#fff', marginLeft: '10px' }}>{viewingUser.walletType || '-'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>KYC Status:</span>
                        <span style={{ color: viewingUser.kycStatus === 'verified' ? '#10b981' : '#f59e0b', marginLeft: '10px' }}>{viewingUser.kycStatus || 'none'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Created:</span>
                        <span style={{ color: '#fff', marginLeft: '10px' }}>{viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleString() : '-'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Last Login:</span>
                        <span style={{ color: '#fff', marginLeft: '10px' }}>{viewingUser.lastLogin ? new Date(viewingUser.lastLogin).toLocaleString() : '-'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>User Agent:</span>
                        <span style={{ color: '#fff', marginLeft: '10px', fontSize: '11px' }}>{viewingUser.userAgent?.substring(0, 50) || '-'}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity History Modal */}
            {showActivityHistory && viewingUser && (
              <div className="modal-overlay" onClick={() => setShowActivityHistory(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1002, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflow: 'auto' }}>
                <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', borderRadius: '16px', width: '100%', maxWidth: '900px', marginTop: '20px' }}>

                  {/* Header */}
                  <div style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', padding: '25px', borderRadius: '16px 16px 0 0', position: 'relative' }}>
                    <button onClick={() => setShowActivityHistory(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px' }}>×</button>
                    <h2 style={{ color: '#fff', fontSize: '24px', margin: 0 }}>📋 Activity History</h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: '5px 0 0 0' }}>User: {viewingUser.username || viewingUser.userId || viewingUser.email}</p>
                  </div>

                  {/* Activity List */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      <button style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>All</button>
                      <button style={{ padding: '8px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Trades</button>
                      <button style={{ padding: '8px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Deposits</button>
                      <button style={{ padding: '8px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Withdrawals</button>
                      <button style={{ padding: '8px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Staking</button>
                    </div>

                    <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#0f172a' }}>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px' }}>ACTION</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px' }}>DETAILS</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px' }}>STATUS</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px' }}>TIMESTAMP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userActivities.map((activity, idx) => (
                            <tr key={activity.id || idx} style={{ borderBottom: '1px solid #374151' }}>
                              <td style={{ padding: '15px', color: '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: activity.action === 'Login' ? '#3b82f6' :
                                      activity.action === 'Deposit' ? '#10b981' :
                                        activity.action === 'Trade' ? '#f59e0b' :
                                          activity.action === 'AI Arbitrage' ? '#8b5cf6' :
                                            activity.action === 'Staking' ? '#06b6d4' :
                                              activity.action === 'Withdrawal' ? '#dc2626' : '#6b7280'
                                  }}>
                                    {activity.action === 'Login' && '🔐'}
                                    {activity.action === 'Deposit' && '💰'}
                                    {activity.action === 'Trade' && '📈'}
                                    {activity.action === 'AI Arbitrage' && '🤖'}
                                    {activity.action === 'Staking' && '🔒'}
                                    {activity.action === 'KYC' && '📋'}
                                    {activity.action === 'Withdrawal' && '🏦'}
                                    {activity.action === 'Profile Update' && '👤'}
                                  </span>
                                  <span style={{ fontWeight: '600' }}>{activity.action}</span>
                                </div>
                              </td>
                              <td style={{ padding: '15px', color: '#94a3b8', fontSize: '14px' }}>{activity.detail}</td>
                              <td style={{ padding: '15px' }}>
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  background: activity.status === 'completed' || activity.status === 'won' || activity.status === 'verified' ? '#10b981' :
                                    activity.status === 'pending' || activity.status === 'active' || activity.status === 'locked' ? '#f59e0b' :
                                      activity.status === 'lost' || activity.status === 'frozen' || activity.status === 'rejected' ? '#dc2626' : '#6b7280',
                                  color: '#fff'
                                }}>
                                  {activity.status || 'N/A'}
                                </span>
                              </td>
                              <td style={{ padding: '15px', color: '#64748b', fontSize: '13px' }}>
                                {new Date(activity.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          {userActivities.length === 0 && (
                            <tr>
                              <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No activity records found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Activity Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '20px' }}>
                      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Total Trades</div>
                        <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>{viewingUser.tradeCount || 0}</div>
                      </div>
                      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Total Deposits</div>
                        <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>{viewingUser.depositCount || 0}</div>
                      </div>
                      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Total Withdrawals</div>
                        <div style={{ color: '#dc2626', fontSize: '24px', fontWeight: 'bold' }}>{viewingUser.withdrawCount || 0}</div>
                      </div>
                      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Total Stakes</div>
                        <div style={{ color: '#06b6d4', fontSize: '24px', fontWeight: 'bold' }}>{viewingUser.stakeCount || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit User Modal - Redesigned */}
            {editingUser && (
              <div className="modal-overlay" onClick={() => setEditingUser(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '450px', padding: '0', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                  {/* Modal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>Edit User</h2>
                    <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#9ca3af', cursor: 'pointer', padding: '0', lineHeight: '1' }}>×</button>
                  </div>

                  {/* Modal Body */}
                  <div style={{ padding: '25px' }}>
                    {/* Email Address */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Email address</label>
                      <input
                        type="email"
                        value={editUserForm.email || editingUser.email || ''}
                        onChange={e => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                        style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#1f2937', boxSizing: 'border-box' }}
                        placeholder="user@example.com"
                      />
                    </div>
                    {/* Role */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Role</label>
                      <select
                        value={editUserForm.role || editingUser.role || 'user'}
                        onChange={e => setEditUserForm(prev => ({ ...prev, role: e.target.value }))}
                        style={{ width: '100%', padding: '12px 16px', border: '2px solid #3b82f6', borderRadius: '8px', fontSize: '14px', color: '#1f2937', background: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Withdraw Effect */}
                    <div style={{ marginBottom: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '500', color: '#dc2626' }}>Withdraw Effect</label>
                      <div style={{ display: 'flex', gap: '30px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="withdrawEffect"
                            checked={editUserForm.withdrawEnabled === false || editingUser.withdrawEnabled === false}
                            onChange={() => setEditUserForm(prev => ({ ...prev, withdrawEnabled: false }))}
                            style={{ width: '18px', height: '18px', accentColor: '#6b7280' }}
                          />
                          <span style={{ color: '#374151', fontSize: '14px' }}>Freezed</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="withdrawEffect"
                            checked={editUserForm.withdrawEnabled !== false && editingUser.withdrawEnabled !== false}
                            onChange={() => setEditUserForm(prev => ({ ...prev, withdrawEnabled: true }))}
                            style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                          />
                          <span style={{ color: '#374151', fontSize: '14px' }}>Unfreeze</span>
                        </label>
                      </div>
                    </div>

                    {/* VIP Level */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>VIP Level</label>
                      <select
                        value={editUserForm.vipLevel || editingUser.vipLevel || 1}
                        onChange={e => setEditUserForm(prev => ({ ...prev, vipLevel: parseInt(e.target.value) }))}
                        style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#1f2937', background: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                      >
                        <option value={1}>VIP Level 1</option>
                        <option value={2}>VIP Level 2</option>
                        <option value={3}>VIP Level 3</option>
                        <option value={4}>VIP Level 4</option>
                        <option value={5}>VIP Level 5</option>
                      </select>
                    </div>

                    {/* Balance */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Balance (USD)</label>
                      <input
                        type="number"
                        value={editUserForm.balance}
                        onChange={e => setEditUserForm(prev => ({ ...prev, balance: e.target.value }))}
                        style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#1f2937', boxSizing: 'border-box' }}
                        placeholder="0.00"
                      />
                    </div>

                    {/* Points */}
                    <div style={{ marginBottom: '25px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Points</label>
                      <input
                        type="number"
                        value={editUserForm.points}
                        onChange={e => setEditUserForm(prev => ({ ...prev, points: e.target.value }))}
                        style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#1f2937', boxSizing: 'border-box' }}
                        placeholder="0"
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={async () => {
                        try {
                          const updates = {
                            email: editUserForm.email || editingUser.email,
                            role: editUserForm.role || editingUser.role,
                            withdrawEnabled: editUserForm.withdrawEnabled !== undefined ? editUserForm.withdrawEnabled : editingUser.withdrawEnabled,
                            vipLevel: editUserForm.vipLevel || editingUser.vipLevel,
                            balance: parseFloat(editUserForm.balance) || editingUser.balance,
                            points: parseInt(editUserForm.points) || editingUser.points
                          }
                          if (editingUser._id) {
                            await userAPI.update(editingUser._id, updates)
                          }
                          setUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, ...updates } : u))
                          if (viewingUser && viewingUser._id === editingUser._id) {
                            setViewingUser(prev => ({ ...prev, ...updates }))
                          }
                          setEditingUser(null)
                          alert('✅ User updated successfully!')
                        } catch (err) {
                          alert('Error: ' + err.message)
                        }
                      }}
                      style={{ width: '100%', padding: '14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                        {user.kycFrontPhoto && (
                          <a href={user.kycFrontPhoto} target="_blank" rel="noopener noreferrer" className="doc-btn">ID Front</a>
                        )}
                        {user.kycBackPhoto && (
                          <a href={user.kycBackPhoto} target="_blank" rel="noopener noreferrer" className="doc-btn">ID Back</a>
                        )}
                        {!user.kycFrontPhoto && !user.kycBackPhoto && (
                          <span style={{ color: '#666' }}>No docs</span>
                        )}
                      </td>
                      <td>
                        <span className="status-badge pending">Pending</span>
                      </td>
                      <td>
                        <button className="action-btn approve" onClick={() => handleKYCAction(user, 'verified')}>Approve</button>
                        <button className="action-btn reject" onClick={() => handleKYCAction(user, 'rejected')}>Reject</button>
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

        {/* VIP Requests Section */}
        {activeSection === 'vip-requests' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>👑 VIP Unlock Requests</h1>
              <p>Manage VIP access unlock fee payments</p>
            </div>
            <div className="withdrawal-stats">
              <div className="stat-card pending">
                <span className="stat-number">{vipRequests.filter(v => v.status === 'pending').length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-card verified">
                <span className="stat-number">{vipRequests.filter(v => v.status === 'approved').length}</span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat-card rejected">
                <span className="stat-number">{vipRequests.filter(v => v.status === 'rejected').length}</span>
                <span className="stat-label">Rejected</span>
              </div>
              <div className="stat-card total">
                <span className="stat-number">${vipRequests.filter(v => v.status === 'approved').reduce((sum, v) => sum + (v.fee || 0), 0).toLocaleString()}</span>
                <span className="stat-label">Total VIP Fees</span>
              </div>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>WALLET</th>
                    <th>FEE PAID</th>
                    <th>TX HASH</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {vipRequests.map((request, idx) => (
                    <tr key={idx}>
                      <td>{request.id}</td>
                      <td className="address-cell">{request.wallet?.slice(0, 10)}...{request.wallet?.slice(-6)}</td>
                      <td className="amount-cell">${request.fee?.toLocaleString()}</td>
                      <td className="address-cell">{request.txHash?.slice(0, 12)}...</td>
                      <td>{new Date(request.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${request.status}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        {request.status === 'pending' && (
                          <>
                            <button className="action-btn approve" onClick={() => {
                              setVipRequests(prev => prev.map(v =>
                                v.id === request.id ? { ...v, status: 'approved' } : v
                              ))
                              localStorage.setItem('adminVIPRequests', JSON.stringify(
                                vipRequests.map(v => v.id === request.id ? { ...v, status: 'approved' } : v)
                              ))
                              // Update user's VIP status
                              const vipStatus = { unlocked: true, feePaid: request.fee, pendingApproval: false }
                              localStorage.setItem('vipUnlockStatus', JSON.stringify(vipStatus))
                              alert('VIP access approved!')
                            }}>Approve</button>
                            <button className="action-btn reject" onClick={() => {
                              setVipRequests(prev => prev.map(v =>
                                v.id === request.id ? { ...v, status: 'rejected' } : v
                              ))
                              localStorage.setItem('adminVIPRequests', JSON.stringify(
                                vipRequests.map(v => v.id === request.id ? { ...v, status: 'rejected' } : v)
                              ))
                              alert('VIP request rejected')
                            }}>Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {vipRequests.length === 0 && (
                    <tr>
                      <td colSpan="7" className="no-data">No VIP unlock requests</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pending Deposits Section */}
        {activeSection === 'pending-deposits' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>💰 Pending Deposits</h1>
              <p>Approve or reject user deposit requests from wallet actions</p>
            </div>
            <div className="withdrawal-stats">
              <div className="stat-card pending">
                <span className="stat-number">{pendingDeposits.filter(d => d.status === 'pending').length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-card verified">
                <span className="stat-number">{pendingDeposits.filter(d => d.status === 'confirmed').length}</span>
                <span className="stat-label">Confirmed</span>
              </div>
              <div className="stat-card rejected">
                <span className="stat-number">{pendingDeposits.filter(d => d.status === 'rejected').length}</span>
                <span className="stat-label">Rejected</span>
              </div>
              <div className="stat-card total">
                <span className="stat-number">${pendingDeposits.filter(d => d.status === 'confirmed').reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}</span>
                <span className="stat-label">Total Confirmed</span>
              </div>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>TOKEN</th>
                    <th>AMOUNT</th>
                    <th>WALLET</th>
                    <th>TX HASH</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDeposits.map((deposit, idx) => (
                    <tr key={idx}>
                      <td>{deposit._id || deposit.id}</td>
                      <td>{deposit.network || deposit.token || 'USDT'}</td>
                      <td className="amount-cell">${(deposit.amount || 0).toLocaleString()}</td>
                      <td className="address-cell">{(deposit.userId || deposit.from)?.slice(0, 10)}...</td>
                      <td className="address-cell">{deposit.txHash?.slice(0, 12) || 'N/A'}...</td>
                      <td>{new Date(deposit.createdAt || deposit.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${deposit.status}`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td>
                        {deposit.status === 'pending' && (
                          <>
                            <button className="action-btn approve" onClick={() => handlePendingDepositAction(deposit, 'confirmed')}>Confirm</button>
                            <button className="action-btn reject" onClick={() => handlePendingDepositAction(deposit, 'rejected')}>Reject</button>
                          </>
                        )}
                        {deposit.imageUrl && (
                          <a href={deposit.imageUrl} target="_blank" rel="noopener noreferrer" className="doc-btn" style={{ marginLeft: '4px' }}>📷 View</a>
                        )}
                      </td>
                    </tr>
                  ))}
                  {pendingDeposits.length === 0 && (
                    <tr>
                      <td colSpan="8" className="no-data">No pending deposits</td>
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
                        onClick={async () => {
                          if (newTradingLevel.name) {
                            try {
                              const result = await tradingLevelsAPI.create({
                                name: newTradingLevel.name,
                                countdown: newTradingLevel.countdown,
                                profitPercent: newTradingLevel.profitPercent,
                                minCapital: newTradingLevel.minCapital,
                                maxCapital: newTradingLevel.maxCapital,
                                status: 'active'
                              })
                              if (result && result._id) {
                                setTradingLevels(prev => [...prev, {
                                  id: result._id,
                                  name: result.name,
                                  countdown: result.countdown,
                                  profitPercent: result.profitPercent,
                                  minCapital: result.minCapital,
                                  maxCapital: result.maxCapital,
                                  status: result.status
                                }])
                                setNewTradingLevel({ name: '', countdown: 180, profitPercent: 18, minCapital: 100, maxCapital: 10000 })
                                setShowCreateModal(null)
                              }
                            } catch (error) {
                              console.error('Failed to create trading level:', error)
                              alert('Failed to create trading level: ' + error.message)
                            }
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
                onClick={async () => {
                  if (newCurrency.name && newCurrency.symbol) {
                    try {
                      const result = await currenciesAPI.create({
                        name: newCurrency.name,
                        symbol: newCurrency.symbol,
                        icon: newCurrency.icon,
                        status: 'active'
                      })
                      if (result && result._id) {
                        setCurrencies(prev => [...prev, {
                          id: result._id,
                          name: result.name,
                          symbol: result.symbol,
                          icon: result.icon,
                          status: result.status,
                          createdAt: new Date().toISOString().split('T')[0]
                        }])
                        setNewCurrency({ name: '', symbol: '', icon: '' })
                        alert('Currency created successfully!')
                      }
                    } catch (error) {
                      console.error('Failed to create currency:', error)
                      alert('Failed to create currency: ' + error.message)
                    }
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
                onClick={async () => {
                  if (newNetwork.name && newNetwork.symbol) {
                    try {
                      const result = await networksAPI.create({
                        name: newNetwork.name,
                        symbol: newNetwork.symbol,
                        chainId: newNetwork.chainId,
                        confirmations: newNetwork.confirmations,
                        status: 'active'
                      })
                      if (result && result._id) {
                        setNetworks(prev => [...prev, {
                          id: result._id,
                          name: result.name,
                          symbol: result.symbol,
                          chainId: result.chainId,
                          confirmations: result.confirmations,
                          status: result.status
                        }])
                        setNewNetwork({ name: '', symbol: '', chainId: '', confirmations: 12 })
                        alert('Network created successfully!')
                      }
                    } catch (error) {
                      console.error('Failed to create network:', error)
                      alert('Failed to create network: ' + error.message)
                    }
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
                onClick={async () => {
                  if (newWallet.network && newWallet.address) {
                    try {
                      const result = await depositWalletsAPI.create({
                        network: newWallet.network,
                        address: newWallet.address,
                        label: newWallet.label,
                        status: 'active'
                      })
                      if (result && result._id) {
                        setDepositWallets(prev => [...prev, {
                          id: result._id,
                          network: result.network,
                          address: result.address,
                          label: result.label,
                          status: result.status
                        }])
                        setNewWallet({ network: '', address: '', label: '' })
                        alert('Wallet address added successfully!')
                      }
                    } catch (error) {
                      console.error('Failed to create wallet:', error)
                      alert('Failed to create wallet: ' + error.message)
                    }
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
                onClick={async () => {
                  if (newExchangeRate.from && newExchangeRate.rate) {
                    try {
                      const result = await ratesAPI.create({
                        from: newExchangeRate.from,
                        to: newExchangeRate.to,
                        rate: newExchangeRate.rate,
                        status: 'active'
                      })
                      if (result && result._id) {
                        setExchangeRates(prev => [...prev, {
                          id: result._id,
                          from: result.from,
                          to: result.to,
                          rate: result.rate,
                          status: result.status
                        }])
                        setNewExchangeRate({ from: '', to: 'USDT', rate: 0 })
                        alert('Exchange rate added successfully!')
                      }
                    } catch (error) {
                      console.error('Failed to create exchange rate:', error)
                      alert('Failed to create exchange rate: ' + error.message)
                    }
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
              <h1>AI Arbitrage Plans</h1>
              <p>Configure AI Arbitrage investment plans and profit rates</p>
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

        {/* AI Arbitrage History Section */}
        {activeSection === 'staking-history' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>AI Arbitrage History</h1>
              <p>View all AI Arbitrage investment transactions</p>
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
                              onClick={async () => {
                                try {
                                  // Call backend API to force result
                                  const tradeId = trade._id || trade.id
                                  if (trade._id) {
                                    await tradeAPI.forceResult(trade._id, 'win')
                                    console.log('Trade set to WIN via backend:', trade._id)
                                  }
                                  // Also update localStorage for compatibility
                                  const trades = JSON.parse(localStorage.getItem('activeTrades') || '[]')
                                  const updated = trades.map(t =>
                                    (t.id === trade.id || t._id === trade._id) ? { ...t, adminOutcome: 'win' } : t
                                  )
                                  localStorage.setItem('activeTrades', JSON.stringify(updated))
                                  setActiveTrades(prev => prev.map(t =>
                                    (t.id === trade.id || t._id === trade._id) ? { ...t, adminOutcome: 'win' } : t
                                  ))
                                } catch (error) {
                                  console.error('Failed to force win:', error)
                                  // Still update local state
                                  setActiveTrades(prev => prev.map(t =>
                                    (t.id === trade.id || t._id === trade._id) ? { ...t, adminOutcome: 'win' } : t
                                  ))
                                }
                              }}
                            >
                              ✅ Set WIN
                            </button>
                            <button
                              className="outcome-btn lose"
                              onClick={async () => {
                                try {
                                  // Call backend API to force result
                                  if (trade._id) {
                                    await tradeAPI.forceResult(trade._id, 'lose')
                                    console.log('Trade set to LOSE via backend:', trade._id)
                                  }
                                  // Also update localStorage for compatibility
                                  const trades = JSON.parse(localStorage.getItem('activeTrades') || '[]')
                                  const updated = trades.map(t =>
                                    (t.id === trade.id || t._id === trade._id) ? { ...t, adminOutcome: 'lose' } : t
                                  )
                                  localStorage.setItem('activeTrades', JSON.stringify(updated))
                                  setActiveTrades(prev => prev.map(t =>
                                    (t.id === trade.id || t._id === trade._id) ? { ...t, adminOutcome: 'lose' } : t
                                  ))
                                } catch (error) {
                                  console.error('Failed to force lose:', error)
                                  // Still update local state
                                  setActiveTrades(prev => prev.map(t =>
                                    (t.id === trade.id || t._id === trade._id) ? { ...t, adminOutcome: 'lose' } : t
                                  ))
                                }
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
                              onClick={async () => {
                                try {
                                  // Reset via backend
                                  if (trade._id) {
                                    await tradeAPI.forceResult(trade._id, 'pending')
                                    console.log('Trade outcome reset via backend:', trade._id)
                                  }
                                  const trades = JSON.parse(localStorage.getItem('activeTrades') || '[]')
                                  const updated = trades.map(t =>
                                    (t.id === trade.id || t._id === trade._id) ? { ...t, adminOutcome: 'pending' } : t
                                  )
                                  localStorage.setItem('activeTrades', JSON.stringify(updated))
                                  setActiveTrades(prev => prev.map(t =>
                                    (t.id === trade.id || t._id === trade._id) ? { ...t, adminOutcome: 'pending' } : t
                                  ))
                                } catch (error) {
                                  console.error('Failed to reset outcome:', error)
                                  setActiveTrades(prev => prev.map(t =>
                                    (t.id === trade.id || t._id === trade._id) ? { ...t, adminOutcome: 'pending' } : t
                                  ))
                                }
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
                    {aiInvestments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-data">No active AI arbitrage investments</td>
                      </tr>
                    ) : (
                      aiInvestments.map((inv, idx) => (
                        <tr key={idx}>
                          <td>{inv.userName || inv.userEmail || 'User'}</td>
                          <td>${inv.amount?.toLocaleString()}</td>
                          <td>Level {inv.level}</td>
                          <td className="positive">+{inv.profit}%</td>
                          <td>{new Date(inv.startTime).toLocaleDateString()}</td>
                          <td>{new Date(inv.endTime).toLocaleDateString()}</td>
                          <td><span className={`status-badge ${inv.completed ? 'completed' : 'active'}`}>
                            {inv.completed ? 'Completed' : 'Active'}
                          </span></td>
                        </tr>
                      ))
                    )}
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
              <p>Manage live chat sessions and support tickets in real-time</p>
              <div className="live-indicator">
                <span className="live-dot"></span>
                <span>Live - Auto-refreshing every 500ms</span>
              </div>
            </div>

            <div className="support-stats">
              <div className="stat-card pending">
                <span className="stat-number">{activeChats.filter(c => c.status === 'waiting_agent').length}</span>
                <span className="stat-label">⏳ Waiting for Agent</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{activeChats.filter(c => c.status === 'active' || c.status === 'connected').length}</span>
                <span className="stat-label">💬 Active Chats</span>
              </div>
              <div className="stat-card verified">
                <span className="stat-number">{activeChats.filter(c => c.status === 'closed').length}</span>
                <span className="stat-label">✓ Resolved</span>
              </div>
              <div className="stat-card total">
                <span className="stat-number">{chatLogs.filter(l => l.type === 'user').length}</span>
                <span className="stat-label">📨 Total Messages</span>
              </div>
            </div>

            <div className="live-chat-container">
              {/* Chat List */}
              <div className="chat-list">
                <h3>Active Conversations ({activeChats.length})</h3>
                {activeChats.length === 0 ? (
                  <div className="no-chats">
                    <span className="no-chats-icon">💬</span>
                    <p>No active conversations</p>
                    <small>Messages will appear here when users start chatting</small>
                  </div>
                ) : (
                  activeChats.sort((a, b) => {
                    // Sort by waiting first, then by last message time
                    if (a.status === 'waiting_agent' && b.status !== 'waiting_agent') return -1
                    if (b.status === 'waiting_agent' && a.status !== 'waiting_agent') return 1
                    return new Date(b.lastMessageTime || b.startTime) - new Date(a.lastMessageTime || a.startTime)
                  }).map((chat, idx) => (
                    <div
                      key={idx}
                      className={`chat-list-item ${selectedChat?.sessionId === chat.sessionId ? 'active' : ''} ${chat.status === 'waiting_agent' ? 'waiting' : ''} ${chat.unread > 0 ? 'has-unread' : ''}`}
                      onClick={() => {
                        setSelectedChat(chat)
                        // Mark as read
                        const chats = [...activeChats]
                        const c = chats.find(x => x.sessionId === chat.sessionId)
                        if (c) c.unread = 0
                        setActiveChats(chats)
                        localStorage.setItem('activeChats', JSON.stringify(chats))
                      }}
                    >
                      <div className="chat-user-info">
                        <span className="chat-avatar">👤</span>
                        <div className="chat-details">
                          <span className="chat-username">{chat.user}</span>
                          <span className="chat-email">{chat.email || chat.wallet?.slice(0, 10) + '...' || 'No email'}</span>
                          {chat.lastMessage && (
                            <span className="chat-preview">{chat.lastMessage.substring(0, 30)}...</span>
                          )}
                        </div>
                      </div>
                      <div className="chat-meta">
                        <span className={`chat-status-badge ${chat.status}`}>
                          {chat.status === 'waiting_agent' ? '⏳ Waiting' :
                            chat.status === 'connected' ? '🟢 Active' :
                              chat.status === 'active' ? '💬 Chat' : '✓ Closed'}
                        </span>
                        {chat.unread > 0 && <span className="unread-badge pulse">{chat.unread}</span>}
                        <span className="chat-time">{chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
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
                          <span>{selectedChat.email || selectedChat.wallet || 'No contact info'}</span>
                          <small>Session: {selectedChat.sessionId}</small>
                        </div>
                      </div>
                      <div className="chat-actions">
                        <button className="chat-action-btn connect" onClick={() => {
                          const chats = [...activeChats]
                          const chat = chats.find(c => c.sessionId === selectedChat.sessionId)
                          if (chat) chat.status = 'connected'
                          setActiveChats(chats)
                          localStorage.setItem('activeChats', JSON.stringify(chats))
                        }}>🟢 Connect</button>
                        <button className="chat-action-btn close" onClick={() => {
                          const chats = [...activeChats]
                          const chat = chats.find(c => c.sessionId === selectedChat.sessionId)
                          if (chat) chat.status = 'closed'
                          setActiveChats(chats)
                          localStorage.setItem('activeChats', JSON.stringify(chats))
                        }}>Close Chat</button>
                      </div>
                    </div>
                    <div className="chat-messages-area" id="admin-chat-messages">
                      {chatLogs
                        .filter(log => log.sessionId === selectedChat.sessionId)
                        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                        .map((log, idx) => (
                          <div key={idx} className={`admin-chat-message ${log.type}`}>
                            <div className="message-content">
                              <span className="message-sender">
                                {log.type === 'user' ? `👤 ${selectedChat.user}` :
                                  log.type === 'admin' ? '🎧 Support Agent' :
                                    log.type === 'agent' ? `🎧 ${log.agentName || 'Agent'}` : '⚙️ System'}
                              </span>
                              <p>{log.message}</p>
                              <span className="message-time">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                          </div>
                        ))}
                      <div id="chat-messages-end"></div>
                    </div>
                    <div className="admin-reply-area">
                      <input
                        type="text"
                        placeholder="Type your reply to customer..."
                        value={adminReplyMessage}
                        onChange={(e) => setAdminReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendAdminReply(selectedChat.sessionId)}
                        autoFocus
                      />
                      <button onClick={() => sendAdminReply(selectedChat.sessionId)} disabled={!adminReplyMessage.trim()}>
                        📤 Send
                      </button>
                    </div>
                    <div className="quick-replies-admin">
                      <span>Quick:</span>
                      <button onClick={() => setAdminReplyMessage('Hello! How can I help you today?')}>Greeting</button>
                      <button onClick={() => setAdminReplyMessage('Thank you for contacting us. Let me check that for you.')}>Checking</button>
                      <button onClick={() => setAdminReplyMessage('Your request has been processed. Is there anything else I can help with?')}>Done</button>
                      <button onClick={() => setAdminReplyMessage('Please provide more details so I can assist you better.')}>More Info</button>
                    </div>
                  </>
                ) : (
                  <div className="no-chat-selected">
                    <span>💬</span>
                    <p>Select a conversation to view messages</p>
                    <small>Click on a chat from the list to start responding</small>
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

            {/* Only Master account can create new admins */}
            {isMasterAccount && (
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
                    <div className="form-field">
                      <label>User Access Mode</label>
                      <select
                        value={newAdmin.userAccessMode || 'all'}
                        onChange={(e) => setNewAdmin({ ...newAdmin, userAccessMode: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                      >
                        <option value="all">🌐 All Users - Can manage any user</option>
                        <option value="assigned">🎯 Assigned Only - Can only manage assigned users</option>
                      </select>
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
                    onClick={async () => {
                      if (newAdmin.username && newAdmin.email && newAdmin.password) {
                        if (newAdmin.permissions.length === 0) {
                          alert('Please select at least one permission for the admin')
                          return
                        }

                        try {
                          // Create admin in backend database
                          const response = await authAPI.createAdmin({
                            username: newAdmin.username.trim(),
                            password: newAdmin.password.trim(),
                            email: newAdmin.email.trim().toLowerCase(),
                            userAccessMode: newAdmin.userAccessMode || 'all',
                            permissions: {
                              manageUsers: newAdmin.permissions.includes('users'),
                              manageBalances: newAdmin.permissions.includes('balances'),
                              manageKYC: newAdmin.permissions.includes('kyc'),
                              manageTrades: newAdmin.permissions.includes('live_trades'),
                              manageStaking: newAdmin.permissions.includes('staking'),
                              manageAIArbitrage: newAdmin.permissions.includes('ai_arbitrage'),
                              manageDeposits: newAdmin.permissions.includes('deposits'),
                              manageWithdrawals: newAdmin.permissions.includes('withdrawals'),
                              customerService: newAdmin.permissions.includes('customer_service'),
                              viewReports: newAdmin.permissions.includes('dashboard'),
                              viewLogs: newAdmin.permissions.includes('logs'),
                              siteSettings: newAdmin.permissions.includes('settings'),
                              createAdmins: false
                            }
                          })

                          if (response.success) {
                            const newAdminEntry = {
                              _id: response.admin._id,
                              username: response.admin.username,
                              email: newAdmin.email.trim().toLowerCase(),
                              role: 'admin',
                              permissions: newAdmin.permissions,
                              userAccessMode: newAdmin.userAccessMode || 'all',
                              assignedUsers: [],
                              status: 'active',
                              createdAt: response.admin.createdAt
                            }
                            setAdminRoles(prev => [...prev, newAdminEntry])

                            const savedPassword = newAdmin.password
                            setNewAdmin({
                              username: '',
                              email: '',
                              password: '',
                              role: 'admin',
                              permissions: [],
                              userAccessMode: 'all'
                            })

                            alert(`✅ Admin account created successfully!\n\n📝 Login Credentials:\n━━━━━━━━━━━━━━━━━━━━\nUsername: ${newAdminEntry.username}\nEmail: ${newAdminEntry.email}\nPassword: ${savedPassword}\nAccess Mode: ${newAdminEntry.userAccessMode === 'all' ? 'All Users' : 'Assigned Users Only'}\n━━━━━━━━━━━━━━━━━━━━\n\n✅ Account saved to database - can login from any browser!`)
                          }
                        } catch (error) {
                          console.error('Failed to create admin:', error)
                          alert(`❌ Failed to create admin: ${error.message}`)
                        }
                      } else {
                        alert('Please fill in username, email, and password')
                      }
                    }}
                  >
                    ➕ Create Admin Account
                  </button>
                </div>
              </div>
            )}

            <div className="existing-admins">
              <h3>📋 Existing Administrators</h3>

              {/* Search and Filter Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#1e293b', padding: '15px', borderRadius: '12px' }}>
                <div className="search-box" style={{ margin: 0, flex: 1, maxWidth: '400px' }}>
                  <span className="search-icon">🔍</span>
                  <input type="text" placeholder="Search admins by username or email..." />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={async () => {
                      try {
                        const response = await authAPI.getAdmins()
                        if (response.success && Array.isArray(response.admins)) {
                          const masterAdmin = { username: 'master', email: 'master@onchainweb.app', role: 'super_admin', permissions: ['all'], status: 'active' }
                          // Convert permissions object to array
                          const processedAdmins = response.admins.map(a => {
                            let permArray = []
                            if (a.permissions && typeof a.permissions === 'object' && !Array.isArray(a.permissions)) {
                              if (a.permissions.manageUsers) permArray.push('users')
                              if (a.permissions.manageBalances) permArray.push('balances')
                              if (a.permissions.manageKYC) permArray.push('kyc')
                              if (a.permissions.manageTrades) permArray.push('live_trades')
                              if (a.permissions.viewReports) permArray.push('dashboard')
                            } else if (Array.isArray(a.permissions)) {
                              permArray = a.permissions
                            }
                            return { ...a, role: 'admin', status: 'active', permissions: permArray }
                          })
                          setAdminRoles([masterAdmin, ...processedAdmins])
                          alert(`✅ Refreshed! Found ${response.admins.length} admin(s)`)
                        }
                      } catch (err) { alert('Error: ' + err.message) }
                    }}
                    style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              <div className="data-table" style={{ background: '#0f172a', borderRadius: '12px', overflow: 'hidden' }}>
                <table>
                  <thead>
                    <tr style={{ background: '#1e293b' }}>
                      <th>USERNAME</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>ASSIGNED USERS</th>
                      <th>PERMISSIONS</th>
                      <th>STATUS</th>
                      <th>LAST LOGIN</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminRoles.map((admin, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td className="username-cell" style={{ fontWeight: 'bold' }}>
                          {admin.role === 'super_admin' && <span className="crown">👑</span>}
                          {admin.username}
                        </td>
                        <td className="email-cell">
                          <a href={`mailto:${admin.email}`} style={{ color: '#3b82f6' }}>{admin.email || '-'}</a>
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: admin.role === 'super_admin' ? '#f59e0b' : '#3b82f6',
                            color: '#fff',
                            fontSize: '12px'
                          }}>
                            {admin.role === 'super_admin' ? '👑 Master' : '👤 Admin'}
                          </span>
                        </td>
                        <td className="assigned-users-cell">
                          {admin.role === 'super_admin' ? (
                            <span className="perm-badge all">All Users</span>
                          ) : (
                            <div className="assigned-users-list">
                              {(admin.assignedUsers && admin.assignedUsers.length > 0) ? (
                                <>
                                  {admin.assignedUsers.slice(0, 3).map((userId, i) => (
                                    <span key={i} className="user-id-badge">{userId}</span>
                                  ))}
                                  {admin.assignedUsers.length > 3 && (
                                    <span className="perm-more">+{admin.assignedUsers.length - 3} more</span>
                                  )}
                                </>
                              ) : (
                                <span className="perm-badge none">None</span>
                              )}
                              {isMasterAccount && (
                                <button
                                  className="assign-users-btn"
                                  onClick={async () => {
                                    const userIds = prompt(
                                      `Assign UserIDs to ${admin.username}\n\nCurrent: ${(admin.assignedUsers || []).join(', ') || 'None'}\n\nEnter UserIDs separated by commas (e.g., 12345, 67890):`
                                    )
                                    if (userIds !== null) {
                                      const newAssignedUsers = userIds.split(',').map(id => id.trim()).filter(id => id)

                                      // Call backend API to persist assignment
                                      try {
                                        if (admin._id) {
                                          await authAPI.assignUsersToAdmin(admin._id, newAssignedUsers)
                                          console.log('Users assigned to admin via backend:', admin.username, newAssignedUsers)
                                        }
                                      } catch (error) {
                                        console.error('Failed to assign users via backend:', error)
                                      }

                                      // Update local state
                                      const updatedAdmins = adminRoles.map(a =>
                                        a.username === admin.username
                                          ? { ...a, assignedUsers: newAssignedUsers }
                                          : a
                                      )
                                      setAdminRoles(updatedAdmins)
                                      localStorage.setItem('adminRoles', JSON.stringify(updatedAdmins))
                                      alert(`✅ Assigned ${newAssignedUsers.length} user(s) to ${admin.username}`)
                                    }
                                  }}
                                >
                                  ✏️
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="permissions-cell">
                          {admin.role === 'super_admin' ? (
                            <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#10b981', color: '#fff', fontSize: '12px' }}>Full Access</span>
                          ) : !admin.permissions || !Array.isArray(admin.permissions) || admin.permissions.length === 0 ? (
                            <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#6b7280', color: '#fff', fontSize: '12px' }}>No Permissions</span>
                          ) : admin.permissions.length >= 5 ? (
                            <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#10b981', color: '#fff', fontSize: '12px' }}>Full Access</span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {admin.permissions.slice(0, 2).map((perm, i) => (
                                <span key={i} style={{ padding: '2px 8px', borderRadius: '12px', background: '#374151', color: '#fff', fontSize: '10px' }}>{perm}</span>
                              ))}
                              {admin.permissions.length > 2 && (
                                <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#6366f1', color: '#fff', fontSize: '10px' }}>+{admin.permissions.length - 2}</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: admin.status === 'active' ? '#10b981' : '#dc2626',
                            color: '#fff',
                            fontSize: '12px'
                          }}>
                            {admin.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td>
                          <button
                            onClick={() => setViewingAdmin(admin)}
                            style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {adminRoles.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No admins found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admin Detail View Modal */}
            {viewingAdmin && (
              <div className="modal-overlay" onClick={() => setViewingAdmin(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflow: 'auto' }}>
                <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', borderRadius: '16px', width: '100%', maxWidth: '800px', marginTop: '20px' }}>

                  {/* Admin Header */}
                  <div style={{ background: viewingAdmin.role === 'super_admin' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '30px', borderRadius: '16px 16px 0 0', textAlign: 'center', position: 'relative' }}>
                    <button onClick={() => setViewingAdmin(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px' }}>×</button>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>{viewingAdmin.role === 'super_admin' ? '👑' : '👤'}</div>
                    <h2 style={{ color: '#fff', fontSize: '28px', margin: 0 }}>{viewingAdmin.username}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: '5px 0 0 0' }}>{viewingAdmin.email || 'No email set'}</p>
                    <span style={{ display: 'inline-block', marginTop: '10px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '14px' }}>
                      {viewingAdmin.role === 'super_admin' ? 'Master Admin' : 'Admin'}
                    </span>
                  </div>

                  {/* Admin Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#1e293b', margin: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: '#0f172a', padding: '20px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Status</div>
                      <div style={{ color: viewingAdmin.status === 'active' ? '#10b981' : '#dc2626', fontSize: '18px', fontWeight: 'bold' }}>{viewingAdmin.status === 'active' ? 'Active' : 'Inactive'}</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '20px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Assigned Users</div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{viewingAdmin.role === 'super_admin' ? 'All' : (viewingAdmin.assignedUsers?.length || 0)}</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '20px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Permissions</div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{viewingAdmin.role === 'super_admin' ? 'Full' : (viewingAdmin.permissions?.length || 0)}</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '20px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>Created</div>
                      <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{viewingAdmin.createdAt ? new Date(viewingAdmin.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>

                  {/* Permissions List */}
                  <div style={{ margin: '20px', background: '#1e293b', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>🔐 Permissions</h3>
                    {viewingAdmin.role === 'super_admin' ? (
                      <p style={{ color: '#10b981' }}>✅ Master account has full access to all features</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {[
                          { key: 'dashboard', label: '📊 Dashboard', icon: '📊' },
                          { key: 'users', label: '👥 Users', icon: '👥' },
                          { key: 'deposits', label: '💰 Deposits', icon: '💰' },
                          { key: 'withdrawals', label: '🏦 Withdrawals', icon: '🏦' },
                          { key: 'kyc', label: '📋 KYC', icon: '📋' },
                          { key: 'live_trades', label: '🔴 Live Trades', icon: '🔴' },
                          { key: 'ai_arbitrage', label: '🤖 AI Arbitrage', icon: '🤖' },
                          { key: 'balances', label: '💵 Balances', icon: '💵' },
                          { key: 'customer_service', label: '💬 Support', icon: '💬' },
                          { key: 'staking', label: '🔒 Staking', icon: '🔒' },
                          { key: 'settings', label: '⚙️ Settings', icon: '⚙️' },
                          { key: 'logs', label: '📝 Logs', icon: '📝' }
                        ].map(perm => (
                          <span key={perm.key} style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: viewingAdmin.permissions?.includes(perm.key) ? '#10b981' : '#374151',
                            color: '#fff',
                            fontSize: '12px',
                            opacity: viewingAdmin.permissions?.includes(perm.key) ? 1 : 0.5
                          }}>
                            {perm.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Admin Actions */}
                  <div style={{ margin: '20px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>Admin Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
                      <button
                        onClick={async () => {
                          const newPassword = prompt(`Enter new password for ${viewingAdmin.username} (min 6 characters):`)
                          if (newPassword && newPassword.trim().length >= 6) {
                            try {
                              await authAPI.resetAdminPassword(viewingAdmin.username, newPassword.trim())
                              alert(`✅ Password reset for ${viewingAdmin.username}!`)
                            } catch (err) { alert('Error: ' + err.message) }
                          } else if (newPassword) {
                            alert('Password must be at least 6 characters')
                          }
                        }}
                        style={{ padding: '12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        🔑 Reset Password
                      </button>
                      <button
                        onClick={async () => {
                          if (viewingAdmin.role === 'super_admin') return
                          const newStatus = viewingAdmin.status === 'active' ? 'inactive' : 'active'
                          try {
                            if (viewingAdmin._id) {
                              await authAPI.updateAdmin(viewingAdmin._id, { status: newStatus })
                            }
                          } catch (err) { console.error('Failed to update status:', err) }
                          const updated = adminRoles.map(a => a.username === viewingAdmin.username ? { ...a, status: newStatus } : a)
                          setAdminRoles(updated)
                          setViewingAdmin(prev => ({ ...prev, status: newStatus }))
                          alert(`Admin ${newStatus === 'active' ? 'activated' : 'deactivated'}!`)
                        }}
                        style={{ padding: '12px', background: viewingAdmin.status === 'active' ? '#dc2626' : '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {viewingAdmin.status === 'active' ? '🔴 Deactivate' : '🟢 Activate'}
                      </button>
                      <button
                        onClick={async () => {
                          if (viewingAdmin.role === 'super_admin') {
                            alert('Cannot delete master account!')
                            return
                          }
                          if (confirm(`Delete admin ${viewingAdmin.username}? This cannot be undone.`)) {
                            try {
                              await authAPI.deleteAdmin(viewingAdmin.username)
                              setAdminRoles(prev => prev.filter(a => a.username !== viewingAdmin.username))
                              setViewingAdmin(null)
                              alert('Admin deleted!')
                            } catch (err) { alert('Error: ' + err.message) }
                          }
                        }}
                        style={{ padding: '12px', background: viewingAdmin.role === 'super_admin' ? '#374151' : '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: viewingAdmin.role === 'super_admin' ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        disabled={viewingAdmin.role === 'super_admin'}
                      >
                        🗑️ Delete Admin
                      </button>
                    </div>

                    {/* User Assignment Section */}
                    {viewingAdmin.role !== 'super_admin' && (
                      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', marginTop: '15px' }}>
                        <h4 style={{ color: '#fff', marginBottom: '15px' }}>👥 Assign Users to This Admin</h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                          <select
                            value={viewingAdmin.userAccessMode || 'all'}
                            onChange={async (e) => {
                              const newMode = e.target.value
                              try {
                                if (viewingAdmin._id) {
                                  await authAPI.updateAdmin(viewingAdmin._id, { userAccessMode: newMode })
                                }
                              } catch (err) { console.error('Failed to update access mode:', err) }
                              const updated = adminRoles.map(a => a.username === viewingAdmin.username ? { ...a, userAccessMode: newMode } : a)
                              setAdminRoles(updated)
                              setViewingAdmin(prev => ({ ...prev, userAccessMode: newMode }))
                            }}
                            style={{ flex: 1, padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                          >
                            <option value="all">🌐 All Users - Can manage any user</option>
                            <option value="assigned">🎯 Assigned Only - Can only manage assigned users</option>
                          </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                            Currently Assigned Users ({(viewingAdmin.assignedUsers || []).length}):
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '40px', background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                            {(viewingAdmin.assignedUsers || []).length > 0 ? (
                              viewingAdmin.assignedUsers.map((userId, i) => (
                                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#3b82f6', borderRadius: '20px', fontSize: '12px', color: '#fff' }}>
                                  {userId}
                                  <button
                                    onClick={async () => {
                                      const newAssignedUsers = viewingAdmin.assignedUsers.filter(id => id !== userId)
                                      try {
                                        if (viewingAdmin._id) {
                                          await authAPI.assignUsersToAdmin(viewingAdmin._id, newAssignedUsers, viewingAdmin.userAccessMode || 'assigned')
                                        }
                                      } catch (err) { console.error('Failed to remove user:', err) }
                                      const updated = adminRoles.map(a => a.username === viewingAdmin.username ? { ...a, assignedUsers: newAssignedUsers } : a)
                                      setAdminRoles(updated)
                                      setViewingAdmin(prev => ({ ...prev, assignedUsers: newAssignedUsers }))
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                                  >×</button>
                                </span>
                              ))
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '12px' }}>No users assigned</span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="text"
                            placeholder="Enter User ID to assign..."
                            id="assignUserInput"
                            style={{ flex: 1, padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                          />
                          <button
                            onClick={async () => {
                              const input = document.getElementById('assignUserInput')
                              const userId = input.value.trim()
                              if (!userId) return alert('Please enter a User ID')
                              if ((viewingAdmin.assignedUsers || []).includes(userId)) return alert('User already assigned')

                              const newAssignedUsers = [...(viewingAdmin.assignedUsers || []), userId]
                              try {
                                if (viewingAdmin._id) {
                                  await authAPI.assignUsersToAdmin(viewingAdmin._id, newAssignedUsers, viewingAdmin.userAccessMode || 'assigned')
                                }
                              } catch (err) { console.error('Failed to assign user:', err) }
                              const updated = adminRoles.map(a => a.username === viewingAdmin.username ? { ...a, assignedUsers: newAssignedUsers } : a)
                              setAdminRoles(updated)
                              setViewingAdmin(prev => ({ ...prev, assignedUsers: newAssignedUsers }))
                              input.value = ''
                              alert(`✅ User ${userId} assigned to ${viewingAdmin.username}`)
                            }}
                            style={{ padding: '12px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            ➕ Add
                          </button>
                        </div>

                        <p style={{ color: '#64748b', fontSize: '11px', marginTop: '10px' }}>
                          💡 Tip: You can find User IDs in the Users section. When "Assigned Only" mode is enabled, this admin will only see and manage the users listed above.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Last Login Info */}
                  <div style={{ margin: '20px', background: '#1e293b', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>📊 Activity Info</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Last Login:</span>
                        <span style={{ color: '#fff', marginLeft: '10px' }}>{viewingAdmin.lastLogin ? new Date(viewingAdmin.lastLogin).toLocaleString() : 'Never'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Account Created:</span>
                        <span style={{ color: '#fff', marginLeft: '10px' }}>{viewingAdmin.createdAt ? new Date(viewingAdmin.createdAt).toLocaleString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
