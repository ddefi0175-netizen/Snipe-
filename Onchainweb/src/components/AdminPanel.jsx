import React, { useState, useEffect } from 'react'
import { userAPI, uploadAPI, authAPI, tradingLevelsAPI, currenciesAPI, networksAPI, depositWalletsAPI, ratesAPI, settingsAPI } from '../lib/api'
import { formatApiError } from '../lib/errorHandling'
import { isEmailAllowed } from '../lib/adminAuth'
import { handleAdminLogin, handleAdminLogout } from '../lib/adminLoginHelper'
import { DEFAULT_TRADING_LEVELS, DEFAULT_ARBITRAGE_LEVELS, DEFAULT_DEPOSIT_ADDRESSES } from '../config/trading-config.js'

export default function AdminPanel({ isOpen = true, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
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
  const [globalSettings, setGlobalSettings] = useState({
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
  })

  // Trade outcome control
  const [tradeControl, setTradeControl] = useState({
    mode: 'auto', // 'auto', 'win', 'lose'
    winRate: 50,
    targetUserId: ''
  })

  // Binary Trading Levels
  const [tradingLevels, setTradingLevels] = useState(DEFAULT_TRADING_LEVELS)

  // AI Arbitrage Levels
  const [arbitrageLevels, setArbitrageLevels] = useState(DEFAULT_ARBITRAGE_LEVELS)

  // Bonus Programs
  const [bonusPrograms, setBonusPrograms] = useState({
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
  })

  // Deposit Addresses
  const [depositAddresses, setDepositAddresses] = useState(DEFAULT_DEPOSIT_ADDRESSES)

  // Load current user data
  useEffect(() => {
    if (isOpen) {
      loadAllUsers()
    }
  }, [isOpen])

  // Load config from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadConfigFromBackend()
    }
  }, [isAuthenticated])

  // Periodic refresh of backend data (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return

    const refreshBackendData = async () => {
      try {
        // Refresh users from backend
        const response = await userAPI.getAll()
        const users = Array.isArray(response) ? response : (response?.users || [])
        if (Array.isArray(users)) {
          setAllUsers(users)
        }

        // Refresh trading levels
        const levels = await tradingLevelsAPI.getAll()
        if (Array.isArray(levels)) {
          const mappedLevels = levels.map((l, idx) => ({
            level: l.level || idx + 1,
            minCapital: l.minCapital,
            maxCapital: l.maxCapital,
            profit: l.profitPercent,
            duration: l.countdown
          }))
          setTradingLevels(mappedLevels)
        }
      } catch (error) {
        console.log('Background refresh error:', error)
      }
    }

    // Start immediately without delay
    refreshBackendData()

    // Set up periodic refresh every 30 seconds
    const intervalId = setInterval(refreshBackendData, 30000)

    // Cleanup: clear interval on unmount or when isAuthenticated changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isAuthenticated])

  const loadConfigFromBackend = async () => {
    try {
      // Load all settings from backend
      const settings = await settingsAPI.get()
      
      if (settings && settings.success && settings.settings) {
        const s = settings.settings
        
        // Update global settings
        if (s.globalSettings) {
          setGlobalSettings({
            welcomeBonus: s.welcomeBonus || 100,
            referralBonus: s.referralBonus || 50,
            tradingFee: s.globalSettings.tradingFee || 0.1,
            withdrawalFee: s.withdrawalFee || 1,
            minDeposit: s.globalSettings.minDeposit || 10,
            minWithdrawal: s.minWithdrawal || 20,
            maxWithdrawal: s.maxWithdrawal || 10000,
            kycRequired: s.globalSettings.kycRequired !== undefined ? s.globalSettings.kycRequired : true,
            maintenanceMode: s.maintenanceMode || false,
            announcement: s.globalSettings.announcement || ''
          })
        }
        
        // Update trade control (master only)
        if (s.tradeControl) {
          setTradeControl(s.tradeControl)
        }
        
        // Update trading levels
        if (s.tradingLevels && Array.isArray(s.tradingLevels) && s.tradingLevels.length > 0) {
          setTradingLevels(s.tradingLevels)
        }
        
        // Update AI arbitrage levels
        if (s.aiArbitrageLevels && Array.isArray(s.aiArbitrageLevels) && s.aiArbitrageLevels.length > 0) {
          setArbitrageLevels(s.aiArbitrageLevels)
        }
        
        // Update bonus programs
        if (s.bonusPrograms) {
          setBonusPrograms(s.bonusPrograms)
        }
        
        // Update deposit addresses
        if (s.depositAddresses && Array.isArray(s.depositAddresses) && s.depositAddresses.length > 0) {
          setDepositAddresses(s.depositAddresses)
        }
        
        console.log('Admin: Loaded all settings from backend')
      }
    } catch (error) {
      console.error('Failed to load settings from backend:', error)
    }
  }

  const loadAllUsers = async () => {
    try {
      // Fetch all users from backend database
      const response = await userAPI.getAll()
      // Backend returns { users: [...], pagination: {...} } - extract users array
      const users = Array.isArray(response) ? response : (response?.users || [])
      setAllUsers(users)
    } catch (error) {
      console.error('Failed to load users:', error)
      // Fallback to empty array
      setAllUsers([])
    }
  }

  // Load pending uploads from backend
  const loadPendingUploads = async () => {
    try {
      const uploads = await uploadAPI.getPending()
      return uploads
    } catch (error) {
      console.error('Failed to load pending uploads:', error)
      return []
    }
  }

  // Load pending KYC from backend
  const loadPendingKYC = async () => {
    try {
      const users = await userAPI.getPendingKYC()
      return users
    } catch (error) {
      console.error('Failed to load pending KYC:', error)
      return []
    }
  }

  // Handle login via backend API
  const handleLogin = async () => {
    setLoginError('')

    setIsLoggingIn(true)

    try {
      console.log('[AdminPanel] Attempting login for:', loginUsername)

      // Use shared admin login helper with allowlist checking
      const result = await handleAdminLogin(loginUsername, loginPassword, {
        checkAllowlist: true,
        isEmailAllowed
      })
      
      if (!result.success) {
        setLoginError(`❌ ${result.error}`)
        setLoginUsername('')
        setLoginPassword('')
        return
      }

      // Store auth data
      const { data } = result
      const adminUser = {
        username: data.username,
        email: data.email,
        uid: data.uid,
        role: data.role,
        permissions: data.permissions
      }

      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('firebaseAdminUid', data.uid)
      localStorage.setItem('adminUser', JSON.stringify(adminUser))

      setLoginError('')
      setIsAuthenticated(true)
      setCurrentAdmin(adminUser)
      setLoginUsername('')
      setLoginPassword('')
      console.log('[AdminPanel] Login successful! Role:', data.role)
      
      // Load data asynchronously in the background (non-blocking)
      loadConfigFromBackend()
      loadAllUsers()
    } catch (error) {
      console.error('[AdminPanel] Unexpected error:', error)
      setLoginError(`❌ Login failed: ${error.message}`)
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    await handleAdminLogout()
    setIsAuthenticated(false)
    setCurrentAdmin(null)
    setLoginUsername('')
    setLoginPassword('')
  }

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')

    if (token && user) {
      // Token exists and user data exists - restore session without backend verification
      // This avoids CORS issues on cold starts
      try {
        const userData = JSON.parse(user)
        setIsAuthenticated(true)
        setCurrentAdmin(userData)
        console.log('[AdminPanel] Session restored from localStorage')
      } catch (e) {
        console.error('[AdminPanel] Failed to parse user data:', e)
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
      }
    }
  }, [])

  // Create new admin via backend API
  const createAdmin = async () => {
    if (!newAdminForm.username || !newAdminForm.password) {
      alert('Please fill in username and password')
      return
    }

    try {
      // Use centralized authAPI with automatic retry logic
      const data = await authAPI.createAdmin(newAdminForm)

      if (data.success) {
        // Also add to local state for display
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
      } else {
        alert(data.error || 'Failed to create admin')
      }
    } catch (error) {
      console.error('Create admin error:', error)
      alert(formatApiError(error, { isColdStartAware: true }))
    }
  }

  // Delete admin via backend API
  const deleteAdmin = async (adminId, username) => {
    if (confirm('Are you sure you want to delete this admin account?')) {
      try {
        // Use centralized authAPI with automatic retry logic
        const data = await authAPI.deleteAdmin(username)

        if (data.success) {
          setAdminAccounts(adminAccounts.filter(a => a.id !== adminId))
          alert('Admin deleted successfully')
        } else {
          alert(data.error || 'Failed to delete admin')
        }
      } catch (error) {
        console.error('Delete admin error:', error)
        alert(formatApiError(error, { isColdStartAware: true }))
      }
    }
  }

  // Update user balance (using backend API)
  const updateUserBalance = async (userId, amount, type) => {
    try {
      const user = allUsers.find(u => u._id === userId || u.userId === userId)
      if (!user) {
        alert('User not found')
        return
      }

      let newBalance = user.balance || 0
      if (type === 'add') {
        newBalance += parseFloat(amount)
      } else if (type === 'subtract') {
        newBalance = Math.max(0, newBalance - parseFloat(amount))
      } else if (type === 'set') {
        newBalance = parseFloat(amount)
      }

      await userAPI.update(user._id, { balance: newBalance })
      await loadAllUsers()
      alert(`Balance updated successfully! New balance: $${newBalance.toFixed(2)}`)
    } catch (error) {
      console.error('Failed to update balance:', error)
      alert('Failed to update balance')
    }
  }

  // Update user KYC status (using backend API)
  const updateUserKYC = async (userId, status) => {
    try {
      const user = allUsers.find(u => u._id === userId || u.userId === userId)
      if (!user) return

      await userAPI.reviewKYC(user._id, status)
      await loadAllUsers()
      alert(`KYC status updated to: ${status}`)
    } catch (error) {
      console.error('Failed to update KYC:', error)
      alert('Failed to update KYC status')
    }
  }

  // Update user VIP level (using backend API)
  const updateUserVIP = async (userId, level) => {
    try {
      const user = allUsers.find(u => u._id === userId || u.userId === userId)
      if (!user) return

      await userAPI.update(user._id, { vipLevel: parseInt(level) })
      await loadAllUsers()
      alert(`VIP level updated to: ${level}`)
    } catch (error) {
      console.error('Failed to update VIP:', error)
      alert('Failed to update VIP level')
    }
  }

  // Update user points (using backend API)
  const updateUserPoints = async (userId, points, type) => {
    try {
      const user = allUsers.find(u => u._id === userId || u.userId === userId)
      if (!user) return

      await userAPI.updatePoints(user._id, parseInt(points), type)
      await loadAllUsers()
      alert(`Points updated successfully!`)
    } catch (error) {
      console.error('Failed to update points:', error)
      alert('Failed to update points')
    }
  }

  // Update trade control (using backend API)
  const updateTradeControl = async (userId, mode) => {
    try {
      const user = allUsers.find(u => u._id === userId || u.userId === userId)
      if (!user) return

      await userAPI.setTradeMode(user._id, mode)
      await loadAllUsers()
      alert(`Trade mode set to ${mode} for user ${user.userId}`)
    } catch (error) {
      console.error('Failed to update trade mode:', error)
      alert('Failed to update trade mode')
    }
  }

  // Freeze/unfreeze user (using backend API)
  const toggleFreezeUser = async (userId, frozen) => {
    try {
      const user = allUsers.find(u => u._id === userId || u.userId === userId)
      if (!user) return

      await userAPI.setFrozen(user._id, frozen)
      await loadAllUsers()
      alert(`User ${frozen ? 'frozen' : 'unfrozen'} successfully`)
    } catch (error) {
      console.error('Failed to freeze/unfreeze user:', error)
      alert('Failed to update user status')
    }
  }

  // Delete user (using backend API)
  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const user = allUsers.find(u => u._id === userId || u.userId === userId)
      if (!user) return

      await userAPI.delete(user._id)
      await loadAllUsers()
      alert('User deleted successfully')
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    }
  }

  // Update trading level allowed (using backend API)
  const updateAllowedTradingLevel = async (userId, level) => {
    try {
      const user = allUsers.find(u => u._id === userId || u.userId === userId)
      if (!user) return

      await userAPI.update(user._id, { allowedTradingLevel: parseInt(level) })
      await loadAllUsers()
      alert(`Trading level set to ${level} for user ${user.userId}`)
    } catch (error) {
      console.error('Failed to update trading level:', error)
      alert('Failed to update trading level')
    }
  }

  // Approve deposit upload (using backend API)
  const approveDeposit = async (uploadId, amount) => {
    try {
      await uploadAPI.approve(uploadId, amount)
      alert(`Deposit of $${amount} approved!`)
      await loadAllUsers()
    } catch (error) {
      console.error('Failed to approve deposit:', error)
      alert('Failed to approve deposit')
    }
  }

  // Reject deposit upload (using backend API)
  const rejectDeposit = async (uploadId) => {
    try {
      await uploadAPI.reject(uploadId, 'Rejected by admin')
      alert('Deposit rejected')
    } catch (error) {
      console.error('Failed to reject deposit:', error)
      alert('Failed to reject deposit')
    }
  }

  // Update trading level config (local storage for now)
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

  // Save settings to backend
  const saveSettingsToBackend = async () => {
    try {
      // Prepare settings data
      const settingsUpdate = {
        welcomeBonus: globalSettings.welcomeBonus,
        referralBonus: globalSettings.referralBonus,
        withdrawalFee: globalSettings.withdrawalFee,
        minWithdrawal: globalSettings.minWithdrawal,
        maxWithdrawal: globalSettings.maxWithdrawal,
        maintenanceMode: globalSettings.maintenanceMode,
        globalSettings: {
          tradingFee: globalSettings.tradingFee,
          minDeposit: globalSettings.minDeposit,
          kycRequired: globalSettings.kycRequired,
          announcement: globalSettings.announcement
        },
        tradingLevels,
        aiArbitrageLevels: arbitrageLevels,
        bonusPrograms,
        depositAddresses
      }
      
      await settingsAPI.patch(settingsUpdate)
      alert('Settings saved successfully to backend!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert(`Failed to save settings: ${error.message}`)
    }
  }

  // Save trade control to backend (master only)
  const saveTradeControl = async () => {
    try {
      await settingsAPI.updateTradeControl(tradeControl)
      alert('Trade control saved successfully!')
    } catch (error) {
      console.error('Failed to save trade control:', error)
      alert(`Failed to save trade control: ${error.message}`)
    }
  }

  // Save trading levels to backend
  const saveTradingLevels = async () => {
    try {
      await settingsAPI.updateTradingLevels(tradingLevels)
      alert('Trading levels saved successfully!')
    } catch (error) {
      console.error('Failed to save trading levels:', error)
      alert(`Failed to save trading levels: ${error.message}`)
    }
  }

  // Save arbitrage levels to backend
  const saveArbitrageLevels = async () => {
    try {
      await settingsAPI.updateArbitrageLevels(arbitrageLevels)
      alert('Arbitrage levels saved successfully!')
    } catch (error) {
      console.error('Failed to save arbitrage levels:', error)
      alert(`Failed to save arbitrage levels: ${error.message}`)
    }
  }

  // Save bonus programs to backend
  const saveBonusPrograms = async () => {
    try {
      await settingsAPI.updateBonusPrograms(bonusPrograms)
      alert('Bonus programs saved successfully!')
    } catch (error) {
      console.error('Failed to save bonus programs:', error)
      alert(`Failed to save bonus programs: ${error.message}`)
    }
  }

  // Save deposit addresses to backend
  const saveDepositAddresses = async () => {
    try {
      await settingsAPI.updateDepositAddresses(depositAddresses)
      alert('Deposit addresses saved successfully!')
    } catch (error) {
      console.error('Failed to save deposit addresses:', error)
      alert(`Failed to save deposit addresses: ${error.message}`)
    }
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

  // Determine if running as standalone page or modal
  const isStandalone = typeof onClose === 'function' ? false : true

  if (!isOpen && !isStandalone) return null

  return (
    <div className={`admin-modal-overlay ${isStandalone ? 'standalone' : ''}`} onClick={!isStandalone ? onClose : undefined}>
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

              <button className="admin-login-btn" onClick={handleLogin} disabled={isLoggingIn}>
                {isLoggingIn ? 'Connecting...' : 'Login'}
              </button>

              {isLoggingIn && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  fontSize: '13px',
                  textAlign: 'center'
                }}>
                  🔄 Connecting to server... This may take up to 60 seconds if the server is waking up.
                </div>
              )}

              {!isLoggingIn && !loginError && (
                <div style={{
                  marginTop: '15px',
                  padding: '15px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  fontSize: '12px'
                }}>
                  <h4 style={{ color: '#4ade80', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>✨ Features:</h4>
                  <ul style={{
                    color: '#94a3b8',
                    lineHeight: '1.8',
                    paddingLeft: '20px',
                    margin: 0
                  }}>
                    <li>✅ <strong>Easy Login</strong> - Automatic session restoration</li>
                    <li>✅ <strong>Real-Time Data</strong> - Auto-refresh every 30 seconds</li>
                    <li>✅ <strong>Smart Retry</strong> - Automatic retry on connection issues</li>
                    <li>⏱️ <strong>Login Time</strong> - Usually {'<'}2s (up to 60s on cold start)</li>
                  </ul>
                </div>
              )}
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

                  {/* Pending Deposit Uploads */}
                  {(() => {
                    const pendingUploads = JSON.parse(localStorage.getItem('adminDepositUploads') || '[]').filter(u => u.status === 'pending')
                    return pendingUploads.length > 0 && (
                      <div className="pending-uploads-section">
                        <h4>📤 Pending Deposit Uploads ({pendingUploads.length})</h4>
                        <div className="uploads-list">
                          {pendingUploads.map(upload => (
                            <div key={upload.id} className="upload-item">
                              <div className="upload-info">
                                <span className="user-id-tag">User ID: {upload.userId}</span>
                                <span className="upload-amount">${upload.amount} USDT</span>
                                <span className="upload-network">{upload.network}</span>
                                {upload.txHash && <span className="upload-txhash">TX: {upload.txHash.slice(0, 15)}...</span>}
                              </div>
                              <div className="upload-screenshot">
                                <img src={upload.screenshot} alt="Transfer proof" />
                              </div>
                              <div className="upload-actions">
                                <button className="approve-btn" onClick={() => {
                                  const uploads = JSON.parse(localStorage.getItem('adminDepositUploads') || '[]')
                                  const idx = uploads.findIndex(u => u.id === upload.id)
                                  if (idx >= 0) {
                                    uploads[idx].status = 'approved'
                                    uploads[idx].reviewedAt = new Date().toISOString()
                                    localStorage.setItem('adminDepositUploads', JSON.stringify(uploads))
                                    // Add points to user
                                    localStorage.setItem('userPoints', upload.amount.toString())
                                    alert(`Approved! ${upload.amount} points added to user ${upload.userId}`)
                                    loadAllUsers()
                                  }
                                }}>✓ Approve</button>
                                <button className="reject-btn" onClick={() => {
                                  const uploads = JSON.parse(localStorage.getItem('adminDepositUploads') || '[]')
                                  const idx = uploads.findIndex(u => u.id === upload.id)
                                  if (idx >= 0) {
                                    uploads[idx].status = 'rejected'
                                    uploads[idx].reviewedAt = new Date().toISOString()
                                    localStorage.setItem('adminDepositUploads', JSON.stringify(uploads))
                                    alert(`Rejected deposit from user ${upload.userId}`)
                                    loadAllUsers()
                                  }
                                }}>✕ Reject</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Pending KYC Requests */}
                  {(() => {
                    const pendingKYC = JSON.parse(localStorage.getItem('adminKYCRequests') || '[]').filter(k => k.status === 'pending')
                    return pendingKYC.length > 0 && (
                      <div className="pending-kyc-section">
                        <h4>🔐 Pending KYC Requests ({pendingKYC.length})</h4>
                        <div className="kyc-list">
                          {pendingKYC.map(kyc => (
                            <div key={kyc.id} className="kyc-item">
                              <div className="kyc-info">
                                <span className="user-id-tag">User ID: {kyc.userId}</span>
                                <span className="kyc-name">{kyc.fullName}</span>
                                <span className="kyc-doc">{kyc.docType}: {kyc.docNumber}</span>
                              </div>
                              <div className="kyc-photos">
                                {kyc.frontPhoto && <img src={kyc.frontPhoto} alt="Front" />}
                                {kyc.backPhoto && <img src={kyc.backPhoto} alt="Back" />}
                              </div>
                              <div className="kyc-actions">
                                <button className="approve-btn" onClick={() => {
                                  const requests = JSON.parse(localStorage.getItem('adminKYCRequests') || '[]')
                                  const idx = requests.findIndex(k => k.id === kyc.id)
                                  if (idx >= 0) {
                                    requests[idx].status = 'approved'
                                    localStorage.setItem('adminKYCRequests', JSON.stringify(requests))
                                    // Update user profile
                                    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
                                    profile.kycStatus = 'verified'
                                    profile.kycVerifiedAt = new Date().toISOString()
                                    localStorage.setItem('userProfile', JSON.stringify(profile))
                                    alert(`KYC approved for user ${kyc.userId}`)
                                    loadAllUsers()
                                  }
                                }}>✓ Approve</button>
                                <button className="reject-btn" onClick={() => {
                                  const requests = JSON.parse(localStorage.getItem('adminKYCRequests') || '[]')
                                  const idx = requests.findIndex(k => k.id === kyc.id)
                                  if (idx >= 0) {
                                    requests[idx].status = 'rejected'
                                    localStorage.setItem('adminKYCRequests', JSON.stringify(requests))
                                    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
                                    profile.kycStatus = 'rejected'
                                    localStorage.setItem('userProfile', JSON.stringify(profile))
                                    alert(`KYC rejected for user ${kyc.userId}`)
                                    loadAllUsers()
                                  }
                                }}>✕ Reject</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {allUsers.length === 0 ? (
                    <p className="no-data">No users found</p>
                  ) : (
                    <div className="users-list">
                      {allUsers.map(user => (
                        <div key={user.id} className={`user-card ${user.isFrozen ? 'frozen' : ''}`}>
                          <div className="user-info">
                            <div className="user-avatar">{user.avatar || '👤'}</div>
                            <div className="user-details">
                              <h4>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</h4>
                              <span className="user-id">ID: {user.id || user.userId}</span>
                              <span className={`kyc-badge ${user.kycStatus}`}>
                                {user.kycStatus === 'verified' ? '✓ Verified' :
                                  user.kycStatus === 'pending' ? '⏳ Pending' : '✗ Not Verified'}
                              </span>
                              {user.isFrozen && <span className="frozen-badge">🔒 Frozen</span>}
                            </div>
                          </div>

                          <div className="user-stats">
                            <div className="stat">
                              <span className="label">Balance</span>
                              <span className="value">${(user.balance || 0).toFixed(2)}</span>
                            </div>
                            <div className="stat">
                              <span className="label">Points</span>
                              <span className="value">{localStorage.getItem('userPoints') || 0}</span>
                            </div>
                            <div className="stat">
                              <span className="label">Credit Score</span>
                              <span className="value">{user.creditScore || 100}</span>
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
                              <label>Points:</label>
                              <input
                                type="number"
                                id={`points-${user.id}`}
                                placeholder="Points"
                                className="small-input"
                              />
                              <button onClick={() => {
                                const points = document.getElementById(`points-${user.id}`).value
                                if (points) {
                                  const current = parseFloat(localStorage.getItem('userPoints') || '0')
                                  localStorage.setItem('userPoints', (current + parseFloat(points)).toString())
                                  alert(`Added ${points} points. New total: ${current + parseFloat(points)}`)
                                  loadAllUsers()
                                }
                              }}>+ Add</button>
                              <button onClick={() => {
                                const points = document.getElementById(`points-${user.id}`).value
                                if (points) {
                                  const current = parseFloat(localStorage.getItem('userPoints') || '0')
                                  const newTotal = Math.max(0, current - parseFloat(points))
                                  localStorage.setItem('userPoints', newTotal.toString())
                                  alert(`Removed ${points} points. New total: ${newTotal}`)
                                  loadAllUsers()
                                }
                              }}>- Sub</button>
                              <button onClick={() => {
                                const points = document.getElementById(`points-${user.id}`).value
                                if (points) {
                                  localStorage.setItem('userPoints', points)
                                  alert(`Set points to ${points}`)
                                  loadAllUsers()
                                }
                              }}>= Set</button>
                            </div>

                            <div className="action-group">
                              <label>Credit Score:</label>
                              <input
                                type="number"
                                id={`credit-${user.id}`}
                                placeholder="Score"
                                className="small-input"
                                min="0"
                                max="100"
                              />
                              <button onClick={() => {
                                const score = document.getElementById(`credit-${user.id}`).value
                                if (score) {
                                  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
                                  profile.creditScore = Math.min(100, Math.max(0, parseInt(score)))
                                  localStorage.setItem('userProfile', JSON.stringify(profile))
                                  alert(`Credit score set to ${profile.creditScore}`)
                                  loadAllUsers()
                                }
                              }}>Set</button>
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

                            <div className="action-group">
                              <label>Trading Level:</label>
                              <select onChange={e => {
                                const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
                                profile.allowedTradingLevel = parseInt(e.target.value)
                                localStorage.setItem('userProfile', JSON.stringify(profile))
                                alert(`Trading level set to ${e.target.value} for user ${user.id}`)
                                loadAllUsers()
                              }} defaultValue={user.allowedTradingLevel || 1}>
                                <option value="1">Level 1 ($100-$19,999)</option>
                                <option value="2">Level 2 ($20,000-$30,000)</option>
                                <option value="3">Level 3 ($30,001-$50,000)</option>
                                <option value="4">Level 4 ($50,001-$100,000)</option>
                                <option value="5">Level 5 ($100,001+)</option>
                              </select>
                            </div>

                            <div className="action-group">
                              <label>Win/Lose:</label>
                              <select onChange={e => {
                                const control = JSON.parse(localStorage.getItem('adminTradeControl') || '{}')
                                control.mode = e.target.value
                                control.targetUserId = user.id
                                localStorage.setItem('adminTradeControl', JSON.stringify(control))
                                alert(`Trade mode set to ${e.target.value} for user ${user.id}`)
                              }} defaultValue={tradeControl.targetUserId === user.id ? tradeControl.mode : 'auto'}>
                                <option value="auto">Auto</option>
                                <option value="win">Always Win</option>
                                <option value="lose">Always Lose</option>
                              </select>
                            </div>
                          </div>

                          <div className="user-actions-row">
                            <button className="action-btn freeze-btn" onClick={() => {
                              const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
                              profile.isFrozen = !profile.isFrozen
                              localStorage.setItem('userProfile', JSON.stringify(profile))
                              alert(profile.isFrozen ? 'User account frozen!' : 'User account unfrozen!')
                              loadAllUsers()
                            }}>
                              {user.isFrozen ? '🔓 Unfreeze' : '🔒 Freeze'}
                            </button>
                            <button className="action-btn message-btn" onClick={() => {
                              const message = prompt('Enter message to send to user:')
                              if (message) {
                                sendNotification(message)
                              }
                            }}>💬 Message</button>
                            <button className="action-btn delete-btn" onClick={() => {
                              if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                                localStorage.removeItem('userProfile')
                                localStorage.removeItem('userPoints')
                                localStorage.removeItem('walletData')
                                localStorage.removeItem('isRegistered')
                                alert('User deleted successfully')
                                loadAllUsers()
                              }
                            }}>🗑️ Delete</button>
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
                    <div className="level-actions">
                      <button className="save-settings-btn" onClick={saveTradingLevels}>
                        💾 Save Trading Levels
                      </button>
                      <button className="reset-btn" onClick={resetTradingLevels}>
                        🔄 Reset to Defaults
                      </button>
                    </div>
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
                    <div className="level-actions">
                      <button className="save-settings-btn" onClick={saveArbitrageLevels}>
                        💾 Save Arbitrage Levels
                      </button>
                      <button className="reset-btn" onClick={resetArbitrageLevels}>
                        🔄 Reset to Defaults
                      </button>
                    </div>
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
                  
                  <button className="save-settings-btn" onClick={saveBonusPrograms}>
                    💾 Save Bonus Programs
                  </button>
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
                  
                  <button className="save-settings-btn" onClick={saveDepositAddresses}>
                    💾 Save Deposit Addresses
                  </button>
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

                  <button className="save-settings-btn" onClick={saveSettingsToBackend}>
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
                          onChange={e => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                          placeholder="Admin username"
                        />
                      </div>

                      <div className="form-group">
                        <label>Password</label>
                        <input
                          type="password"
                          value={newAdminForm.password}
                          onChange={e => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
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
                              permissions: { ...newAdminForm.permissions, [key]: e.target.checked }
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
                          onClick={() => deleteAdmin(admin.id, admin.username)}
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
