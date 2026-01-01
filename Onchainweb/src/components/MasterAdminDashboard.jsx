import React, { useState, useEffect } from 'react'

export default function MasterAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [activeSection, setActiveSection] = useState('user-agents')
  const [searchQuery, setSearchQuery] = useState('')
  
  // User Management States
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('registeredUsers')
    return saved ? JSON.parse(saved) : []
  })
  
  // User Agents/Sessions tracking
  const [userAgents, setUserAgents] = useState(() => {
    const saved = localStorage.getItem('userAgents')
    return saved ? JSON.parse(saved) : [
      { uid: '310738586', email: 'moonmoon17652@gmail.com', active: true, device: 'Windows', ip: '154.222.5.198', lastSeen: new Date().toISOString() },
      { uid: '800746508', email: 'mcpathang18@gmail.com', active: true, device: 'iOS', ip: '72.135.7.50', lastSeen: new Date().toISOString() },
      { uid: '800746508', email: 'mcpathang18@gmail.com', active: true, device: 'iOS', ip: '72.135.7.50', lastSeen: new Date().toISOString() },
      { uid: '310738586', email: 'moonmoon17652@gmail.com', active: true, device: 'Windows', ip: '103.240.240.85', lastSeen: new Date().toISOString() },
    ]
  })

  // Deposits data
  const [deposits, setDeposits] = useState(() => {
    const saved = localStorage.getItem('adminDeposits')
    return saved ? JSON.parse(saved) : []
  })

  // Withdrawals data
  const [withdrawals, setWithdrawals] = useState(() => {
    const saved = localStorage.getItem('adminWithdrawals')
    return saved ? JSON.parse(saved) : []
  })

  // Trade History
  const [tradeHistory, setTradeHistory] = useState(() => {
    const saved = localStorage.getItem('tradeHistory')
    return saved ? JSON.parse(saved) : []
  })

  // Staking Plans
  const [stakingPlans, setStakingPlans] = useState(() => {
    const saved = localStorage.getItem('stakingPlans')
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Starter', minAmount: 100, maxAmount: 1000, duration: 30, apy: 8, active: true },
      { id: 2, name: 'Growth', minAmount: 1000, maxAmount: 10000, duration: 60, apy: 12, active: true },
      { id: 3, name: 'Premium', minAmount: 10000, maxAmount: 100000, duration: 90, apy: 18, active: true },
      { id: 4, name: 'VIP', minAmount: 100000, maxAmount: 1000000, duration: 180, apy: 25, active: true },
    ]
  })

  // Bonus Programs
  const [bonusPrograms, setBonusPrograms] = useState(() => {
    const saved = localStorage.getItem('bonusPrograms')
    return saved ? JSON.parse(saved) : {
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
    }
  })

  // Live Chat Management
  const [activeChats, setActiveChats] = useState(() => {
    const saved = localStorage.getItem('activeChats')
    return saved ? JSON.parse(saved) : []
  })

  const [chatLogs, setChatLogs] = useState(() => {
    const saved = localStorage.getItem('customerChatLogs')
    return saved ? JSON.parse(saved) : []
  })

  const [selectedChat, setSelectedChat] = useState(null)
  const [adminReplyMessage, setAdminReplyMessage] = useState('')
  const [newMessageAlert, setNewMessageAlert] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)

  // User Activity Logs - track user actions
  const [userActivityLogs, setUserActivityLogs] = useState(() => {
    const saved = localStorage.getItem('userActivityLogs')
    return saved ? JSON.parse(saved) : [
      { id: 1, userId: '310738586', userEmail: 'moonmoon17652@gmail.com', action: 'login', details: 'Logged in from Windows device', ip: '154.222.5.198', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, userId: '310738586', userEmail: 'moonmoon17652@gmail.com', action: 'deposit', details: 'Deposited $500 via Crypto', ip: '154.222.5.198', timestamp: new Date(Date.now() - 3000000).toISOString() },
      { id: 3, userId: '800746508', userEmail: 'mcpathang18@gmail.com', action: 'kyc_submit', details: 'Submitted KYC documents', ip: '72.135.7.50', timestamp: new Date(Date.now() - 2400000).toISOString() },
      { id: 4, userId: '800746508', userEmail: 'mcpathang18@gmail.com', action: 'trade', details: 'Placed BTC/USDT trade - $200 UP', ip: '72.135.7.50', timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: 5, userId: '310738586', userEmail: 'moonmoon17652@gmail.com', action: 'withdrawal', details: 'Requested withdrawal $300 to wallet', ip: '154.222.5.198', timestamp: new Date(Date.now() - 1200000).toISOString() },
      { id: 6, userId: '800746508', userEmail: 'mcpathang18@gmail.com', action: 'stake', details: 'Staked $1000 in Growth plan', ip: '72.135.7.50', timestamp: new Date(Date.now() - 600000).toISOString() },
      { id: 7, userId: '310738586', userEmail: 'moonmoon17652@gmail.com', action: 'profile_update', details: 'Updated profile information', ip: '103.240.240.85', timestamp: new Date().toISOString() },
    ]
  })

  // Admin Audit Logs - track admin actions
  const [adminAuditLogs, setAdminAuditLogs] = useState(() => {
    const saved = localStorage.getItem('adminAuditLogs')
    return saved ? JSON.parse(saved) : [
      { id: 1, adminId: 'master', adminName: 'Master Admin', action: 'login', details: 'Admin logged into dashboard', ip: '192.168.1.1', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 2, adminId: 'master', adminName: 'Master Admin', action: 'balance_update', details: 'Updated user 310738586 balance from $0 to $1000', targetUser: '310738586', ip: '192.168.1.1', timestamp: new Date(Date.now() - 5400000).toISOString() },
      { id: 3, adminId: 'master', adminName: 'Master Admin', action: 'kyc_approve', details: 'Approved KYC for user 800746508', targetUser: '800746508', ip: '192.168.1.1', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 4, adminId: 'master', adminName: 'Master Admin', action: 'withdrawal_approve', details: 'Approved withdrawal #W001 for $300', targetUser: '310738586', ip: '192.168.1.1', timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: 5, adminId: 'master', adminName: 'Master Admin', action: 'settings_update', details: 'Updated site settings - Trading enabled', ip: '192.168.1.1', timestamp: new Date().toISOString() },
    ]
  })

  // Admin Roles Management
  const [adminRoles, setAdminRoles] = useState(() => {
    const saved = localStorage.getItem('adminRoles')
    return saved ? JSON.parse(saved) : [
      { 
        id: 1, 
        username: 'master', 
        email: 'master@onchainweb.com', 
        role: 'super_admin', 
        permissions: ['all'],
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLogin: new Date().toISOString()
      },
      { 
        id: 2, 
        username: 'support_admin', 
        email: 'support@onchainweb.com', 
        role: 'support', 
        permissions: ['view_users', 'manage_chats', 'view_deposits', 'view_withdrawals'],
        status: 'active',
        createdAt: '2024-06-01T00:00:00.000Z',
        lastLogin: new Date(Date.now() - 86400000).toISOString()
      },
      { 
        id: 3, 
        username: 'finance_admin', 
        email: 'finance@onchainweb.com', 
        role: 'finance', 
        permissions: ['view_users', 'manage_deposits', 'manage_withdrawals', 'view_balance'],
        status: 'active',
        createdAt: '2024-06-15T00:00:00.000Z',
        lastLogin: new Date(Date.now() - 172800000).toISOString()
      },
      { 
        id: 4, 
        username: 'kyc_admin', 
        email: 'kyc@onchainweb.com', 
        role: 'kyc_manager', 
        permissions: ['view_users', 'manage_kyc'],
        status: 'inactive',
        createdAt: '2024-07-01T00:00:00.000Z',
        lastLogin: null
      },
    ]
  })

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    role: 'support',
    permissions: []
  })

  const [activityFilter, setActivityFilter] = useState('all')

  // Site Settings
  const [siteSettings, setSiteSettings] = useState(() => {
    const saved = localStorage.getItem('siteSettings')
    return saved ? JSON.parse(saved) : {
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
    }
  })

  // Trade Options Settings
  const [tradeOptions, setTradeOptions] = useState(() => {
    const saved = localStorage.getItem('tradeOptions')
    return saved ? JSON.parse(saved) : {
      minTrade: 10,
      maxTrade: 50000,
      defaultDuration: 60,
      winRate: 50,
      profitPercentage: 85,
    }
  })

  // Refresh chat data periodically
  // Refresh chat data periodically with notification system
  useEffect(() => {
    const refreshChats = () => {
      const chats = JSON.parse(localStorage.getItem('activeChats') || '[]')
      const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]')
      
      // Check for new messages and trigger notification
      const userMessages = logs.filter(l => l.type === 'user')
      if (userMessages.length > lastMessageCount && lastMessageCount > 0 && isAuthenticated) {
        setNewMessageAlert(true)
        // Play notification sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQkAIHPQ3bF3HQkAgLTX15xQGBY=')
          audio.volume = 0.5
          audio.play().catch(() => {})
        } catch (e) {}
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
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
    if (isAuthenticated && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    refreshChats()
    const interval = setInterval(refreshChats, 2000) // Faster refresh for real-time feel
    return () => clearInterval(interval)
  }, [isAuthenticated, lastMessageCount])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bonusPrograms', JSON.stringify(bonusPrograms))
  }, [bonusPrograms])

  useEffect(() => {
    localStorage.setItem('userAgents', JSON.stringify(userAgents))
  }, [userAgents])

  useEffect(() => {
    localStorage.setItem('stakingPlans', JSON.stringify(stakingPlans))
  }, [stakingPlans])

  useEffect(() => {
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings))
  }, [siteSettings])

  useEffect(() => {
    localStorage.setItem('tradeOptions', JSON.stringify(tradeOptions))
  }, [tradeOptions])

  // Save activity logs to localStorage
  useEffect(() => {
    localStorage.setItem('userActivityLogs', JSON.stringify(userActivityLogs))
  }, [userActivityLogs])

  useEffect(() => {
    localStorage.setItem('adminAuditLogs', JSON.stringify(adminAuditLogs))
  }, [adminAuditLogs])

  useEffect(() => {
    localStorage.setItem('adminRoles', JSON.stringify(adminRoles))
  }, [adminRoles])

  // Check authentication on load
  useEffect(() => {
    const adminSession = localStorage.getItem('masterAdminSession')
    if (adminSession) {
      const session = JSON.parse(adminSession)
      if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
        setIsAuthenticated(true)
      }
    }
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    // Master credentials
    if (loginData.username === 'master' && loginData.password === 'OnchainWeb2025!') {
      setIsAuthenticated(true)
      setLoginError('')
      localStorage.setItem('masterAdminSession', JSON.stringify({
        username: loginData.username,
        timestamp: Date.now()
      }))
    } else {
      setLoginError('Invalid credentials')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
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
            <button className={activeSection === 'service' ? 'active' : ''}>
              Service ▾
            </button>
            <div className="dropdown-content">
              <a onClick={() => setActiveSection('notifications')}>Notifications</a>
              <a onClick={() => setActiveSection('announcements')}>Announcements</a>
            </div>
          </div>
          <a onClick={() => setActiveSection('deposits')} className={activeSection === 'deposits' ? 'active' : ''}>Deposit</a>
          <a onClick={() => setActiveSection('withdrawals')} className={activeSection === 'withdrawals' ? 'active' : ''}>Withdraw</a>
          <a onClick={() => setActiveSection('trade-options')} className={activeSection === 'trade-options' ? 'active' : ''}>Trade Options</a>
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
                        <button className="action-btn edit">Edit</button>
                        <button className="action-btn view">View</button>
                        <button className="action-btn block">Block</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="9" className="no-data">No users registered yet</td>
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

        {/* Trade Options Section */}
        {activeSection === 'trade-options' && (
          <div className="admin-section">
            <div className="section-header">
              <h1>Trade Options</h1>
              <p>Configure trading parameters and settings</p>
            </div>
            <div className="settings-grid">
              <div className="setting-card">
                <h3>Minimum Trade Amount</h3>
                <input
                  type="number"
                  value={tradeOptions.minTrade}
                  onChange={(e) => setTradeOptions({...tradeOptions, minTrade: parseFloat(e.target.value)})}
                />
                <span className="unit">USDT</span>
              </div>
              <div className="setting-card">
                <h3>Maximum Trade Amount</h3>
                <input
                  type="number"
                  value={tradeOptions.maxTrade}
                  onChange={(e) => setTradeOptions({...tradeOptions, maxTrade: parseFloat(e.target.value)})}
                />
                <span className="unit">USDT</span>
              </div>
              <div className="setting-card">
                <h3>Default Duration</h3>
                <input
                  type="number"
                  value={tradeOptions.defaultDuration}
                  onChange={(e) => setTradeOptions({...tradeOptions, defaultDuration: parseInt(e.target.value)})}
                />
                <span className="unit">seconds</span>
              </div>
              <div className="setting-card">
                <h3>Win Rate</h3>
                <input
                  type="number"
                  value={tradeOptions.winRate}
                  onChange={(e) => setTradeOptions({...tradeOptions, winRate: parseFloat(e.target.value)})}
                />
                <span className="unit">%</span>
              </div>
              <div className="setting-card">
                <h3>Profit Percentage</h3>
                <input
                  type="number"
                  value={tradeOptions.profitPercentage}
                  onChange={(e) => setTradeOptions({...tradeOptions, profitPercentage: parseFloat(e.target.value)})}
                />
                <span className="unit">%</span>
              </div>
            </div>
            <button className="save-settings-btn" onClick={() => alert('Trade options saved!')}>
              Save Settings
            </button>
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
                    onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                  />
                </div>
                <div className="setting-row">
                  <label>Site URL</label>
                  <input
                    type="text"
                    value={siteSettings.siteUrl}
                    onChange={(e) => setSiteSettings({...siteSettings, siteUrl: e.target.value})}
                  />
                </div>
                <div className="setting-row">
                  <label>Support Email</label>
                  <input
                    type="email"
                    value={siteSettings.supportEmail}
                    onChange={(e) => setSiteSettings({...siteSettings, supportEmail: e.target.value})}
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
                    onChange={(e) => setSiteSettings({...siteSettings, maintenanceMode: e.target.checked})}
                  />
                </div>
                <div className="toggle-row">
                  <label>Registration Enabled</label>
                  <input
                    type="checkbox"
                    checked={siteSettings.registrationEnabled}
                    onChange={(e) => setSiteSettings({...siteSettings, registrationEnabled: e.target.checked})}
                  />
                </div>
                <div className="toggle-row">
                  <label>Deposits Enabled</label>
                  <input
                    type="checkbox"
                    checked={siteSettings.depositEnabled}
                    onChange={(e) => setSiteSettings({...siteSettings, depositEnabled: e.target.checked})}
                  />
                </div>
                <div className="toggle-row">
                  <label>Withdrawals Enabled</label>
                  <input
                    type="checkbox"
                    checked={siteSettings.withdrawalEnabled}
                    onChange={(e) => setSiteSettings({...siteSettings, withdrawalEnabled: e.target.checked})}
                  />
                </div>
                <div className="toggle-row">
                  <label>Trading Enabled</label>
                  <input
                    type="checkbox"
                    checked={siteSettings.tradingEnabled}
                    onChange={(e) => setSiteSettings({...siteSettings, tradingEnabled: e.target.checked})}
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
                    onChange={(e) => setSiteSettings({...siteSettings, minWithdrawal: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="setting-row">
                  <label>Max Withdrawal</label>
                  <input
                    type="number"
                    value={siteSettings.maxWithdrawal}
                    onChange={(e) => setSiteSettings({...siteSettings, maxWithdrawal: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="setting-row">
                  <label>Withdrawal Fee (%)</label>
                  <input
                    type="number"
                    value={siteSettings.withdrawalFee}
                    onChange={(e) => setSiteSettings({...siteSettings, withdrawalFee: parseFloat(e.target.value)})}
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
                    onChange={(e) => setSiteSettings({...siteSettings, welcomeBonus: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="setting-row">
                  <label>Referral Bonus (USDT)</label>
                  <input
                    type="number"
                    value={siteSettings.referralBonus}
                    onChange={(e) => setSiteSettings({...siteSettings, referralBonus: parseFloat(e.target.value)})}
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
                        welcomeBonus: {...bonusPrograms.welcomeBonus, enabled: e.target.checked}
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
                        welcomeBonus: {...bonusPrograms.welcomeBonus, amount: parseFloat(e.target.value)}
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
                        welcomeBonus: {...bonusPrograms.welcomeBonus, description: e.target.value}
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
                        referralBonus: {...bonusPrograms.referralBonus, enabled: e.target.checked}
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
                        referralBonus: {...bonusPrograms.referralBonus, amount: parseFloat(e.target.value)}
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
                        referralBonus: {...bonusPrograms.referralBonus, description: e.target.value}
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
                        tradingCashback: {...bonusPrograms.tradingCashback, enabled: e.target.checked}
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
                        tradingCashback: {...bonusPrograms.tradingCashback, percentage: parseFloat(e.target.value)}
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
                        tradingCashback: {...bonusPrograms.tradingCashback, minTrades: parseInt(e.target.value)}
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
                        stakingBonus: {...bonusPrograms.stakingBonus, enabled: e.target.checked}
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
                        stakingBonus: {...bonusPrograms.stakingBonus, percentage: parseFloat(e.target.value)}
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
                        stakingBonus: {...bonusPrograms.stakingBonus, description: e.target.value}
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
                      vipBonus: {...bonusPrograms.vipBonus, enabled: e.target.checked}
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
                                vipBonus: {...bonusPrograms.vipBonus, levels: newLevels}
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
                                vipBonus: {...bonusPrograms.vipBonus, levels: newLevels}
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
                                vipBonus: {...bonusPrograms.vipBonus, levels: newLevels}
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
                onChange={(e) => setBonusPrograms({...bonusPrograms, promotionEndDate: e.target.value})}
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
                  <span className="stat-number">{adminRoles.filter(r => r.role === 'super_admin').length}</span>
                  <span className="stat-label">Super Admins</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💼</span>
                <div className="stat-info">
                  <span className="stat-number">{adminRoles.filter(r => r.status === 'active').length}</span>
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
                      onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                    />
                  </div>
                  <div className="form-field">
                    <label>Email</label>
                    <input 
                      type="email" 
                      placeholder="Enter email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    />
                  </div>
                  <div className="form-field">
                    <label>Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Role</label>
                    <select 
                      value={newAdmin.role}
                      onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                    >
                      <option value="super_admin">Super Admin (Full Access)</option>
                      <option value="finance">Finance Manager</option>
                      <option value="support">Support Agent</option>
                      <option value="kyc_manager">KYC Manager</option>
                      <option value="trade_manager">Trade Manager</option>
                      <option value="viewer">Viewer (Read Only)</option>
                    </select>
                  </div>
                </div>
                <div className="permissions-section">
                  <label>Permissions:</label>
                  <div className="permissions-grid">
                    {['view_users', 'manage_users', 'view_deposits', 'manage_deposits', 'view_withdrawals', 'manage_withdrawals', 'manage_kyc', 'manage_chats', 'view_balance', 'edit_balance', 'manage_settings', 'view_logs'].map(perm => (
                      <label key={perm} className="permission-checkbox">
                        <input 
                          type="checkbox"
                          checked={newAdmin.permissions.includes(perm)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAdmin({...newAdmin, permissions: [...newAdmin.permissions, perm]})
                            } else {
                              setNewAdmin({...newAdmin, permissions: newAdmin.permissions.filter(p => p !== perm)})
                            }
                          }}
                        />
                        <span>{perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button 
                  className="add-admin-btn"
                  onClick={() => {
                    if (newAdmin.username && newAdmin.email && newAdmin.password) {
                      const newAdminEntry = {
                        id: Date.now(),
                        ...newAdmin,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        lastLogin: null
                      }
                      setAdminRoles([...adminRoles, newAdminEntry])
                      setNewAdmin({
                        username: '',
                        email: '',
                        password: '',
                        role: 'support',
                        permissions: []
                      })
                      // Log admin action
                      setAdminAuditLogs(prev => [...prev, {
                        id: Date.now(),
                        adminId: 'master',
                        adminName: 'Master Admin',
                        action: 'admin_create',
                        details: `Created new admin: ${newAdmin.username} with role ${newAdmin.role}`,
                        ip: '192.168.1.1',
                        timestamp: new Date().toISOString()
                      }])
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
                            {admin.role === 'super_admin' && '👑 Super Admin'}
                            {admin.role === 'finance' && '💰 Finance'}
                            {admin.role === 'support' && '🎧 Support'}
                            {admin.role === 'kyc_manager' && '📋 KYC Manager'}
                            {admin.role === 'trade_manager' && '📈 Trade Manager'}
                            {admin.role === 'viewer' && '👁️ Viewer'}
                          </span>
                        </td>
                        <td className="permissions-cell">
                          {admin.permissions.includes('all') ? (
                            <span className="perm-badge all">Full Access</span>
                          ) : (
                            <div className="perm-list">
                              {admin.permissions.slice(0, 3).map((perm, i) => (
                                <span key={i} className="perm-badge">{perm.split('_')[0]}</span>
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
                          {admin.role !== 'super_admin' && (
                            <>
                              <button 
                                className="action-btn edit"
                                onClick={() => {
                                  // Toggle status
                                  setAdminRoles(prev => prev.map(a => 
                                    a.id === admin.id 
                                      ? {...a, status: a.status === 'active' ? 'inactive' : 'active'}
                                      : a
                                  ))
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
                                    setAdminRoles(prev => prev.filter(a => a.id !== admin.id))
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
                            </>
                          )}
                          {admin.role === 'super_admin' && (
                            <span className="protected-badge">🔒 Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="role-permissions-legend">
              <h3>📖 Role Permissions Reference</h3>
              <div className="legend-grid">
                <div className="legend-item">
                  <span className="role-badge role-super_admin">👑 Super Admin</span>
                  <p>Full system access - can manage all features, users, and settings</p>
                </div>
                <div className="legend-item">
                  <span className="role-badge role-finance">💰 Finance</span>
                  <p>Manage deposits, withdrawals, and user balances</p>
                </div>
                <div className="legend-item">
                  <span className="role-badge role-support">🎧 Support</span>
                  <p>Handle customer chats and view user information</p>
                </div>
                <div className="legend-item">
                  <span className="role-badge role-kyc_manager">📋 KYC Manager</span>
                  <p>Review and approve/reject KYC verification requests</p>
                </div>
                <div className="legend-item">
                  <span className="role-badge role-trade_manager">📈 Trade Manager</span>
                  <p>Manage trade options and monitor trading activity</p>
                </div>
                <div className="legend-item">
                  <span className="role-badge role-viewer">👁️ Viewer</span>
                  <p>Read-only access to dashboard and reports</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
