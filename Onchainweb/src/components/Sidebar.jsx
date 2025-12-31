import React, { useState, useEffect } from 'react'

export default function Sidebar({ isOpen, onClose }) {
  const [activeModal, setActiveModal] = useState(null)
  
  // Generate random 5-digit UserID
  const generateUserId = () => {
    return Math.floor(10000 + Math.random() * 90000).toString()
  }

  // Profile & Settings state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Ensure userId exists for existing profiles
      if (!parsed.userId) {
        parsed.userId = generateUserId()
      }
      // Ensure KYC name fields exist
      if (!parsed.firstName) parsed.firstName = ''
      if (!parsed.lastName) parsed.lastName = ''
      if (!parsed.country) parsed.country = ''
      if (!parsed.dateOfBirth) parsed.dateOfBirth = ''
      if (!parsed.gender) parsed.gender = ''
      if (!parsed.address) parsed.address = ''
      if (!parsed.city) parsed.city = ''
      if (!parsed.postalCode) parsed.postalCode = ''
      return parsed
    }
    return {
      userId: generateUserId(),
      username: 'User_' + Math.random().toString(36).substr(2, 6),
      firstName: '',
      lastName: '',
      avatar: '👤',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      country: '',
      city: '',
      address: '',
      postalCode: '',
      kycStatus: 'pending',
      vipLevel: 1,
      joinDate: new Date().toISOString().split('T')[0],
      totalTrades: 0,
      totalProfit: 0,
      referralCode: 'OCW' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      referralCount: 0
    }
  })

  // Get display name (KYC name if available, otherwise username)
  const getDisplayName = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`
    }
    return profile.username
  }

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings')
    return saved ? JSON.parse(saved) : {
      notifications: true,
      priceAlerts: true,
      emailNotifications: false,
      soundEffects: true,
      vibration: true,
      darkMode: true,
      language: 'en',
      currency: 'USD',
      biometricAuth: false,
      hideBalances: false,
      autoLock: '5min'
    }
  })

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
  }, [settings])

  const openModal = (modalName) => {
    setActiveModal(modalName)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  // Avatar options
  const avatarOptions = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🦸', '🧙', '🤖', '👽', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯']

  // Language options
  const languageOptions = [
    { code: 'en', name: 'English', flag: '��🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
  ]

  // Currency options
  const currencyOptions = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'THB', 'VND', 'SGD', 'AUD']

  // Country options
  const countryOptions = [
    'United States', 'United Kingdom', 'China', 'Japan', 'South Korea',
    'Singapore', 'Thailand', 'Vietnam', 'Malaysia', 'Indonesia',
    'Philippines', 'India', 'Australia', 'Germany', 'France',
    'Canada', 'Brazil', 'Mexico', 'Russia', 'United Arab Emirates'
  ]

  // Gender options
  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say']

  // Admin-configurable bonus data
  const bonusData = {
    welcomeBonus: '100 USDT',
    referralBonus: '50 USDT per referral',
    tradingBonus: 'Up to 20% cashback',
    stakingRewards: '12% APY on staking',
    promotionEnd: 'January 31, 2025'
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  const getVIPBadge = (level) => {
    const badges = ['🥉', '🥈', '🥇', '💎', '👑']
    return badges[Math.min(level - 1, 4)]
  }

  const getKYCStatusColor = (status) => {
    switch(status) {
      case 'verified': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'rejected': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Navigation menu">
        {/* Profile Header Section */}
        <div className="sidebar-profile-header" onClick={() => openModal('profile')}>
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              <span>{profile.avatar}</span>
              <span className="profile-vip-badge">{getVIPBadge(profile.vipLevel)}</span>
            </div>
            <div className="profile-info">
              <h3 className="profile-username">{getDisplayName()}</h3>
              <span className="profile-user-id">ID: {profile.userId}</span>
              <div className="profile-status">
                <span 
                  className="kyc-dot" 
                  style={{ background: getKYCStatusColor(profile.kycStatus) }}
                ></span>
                <span className="kyc-text">
                  {profile.kycStatus === 'verified' ? 'Verified' : 
                   profile.kycStatus === 'pending' ? 'Pending KYC' : 'Not Verified'}
                </span>
              </div>
              <span className="profile-vip-level">VIP Level {profile.vipLevel}</span>
            </div>
          </div>
          <span className="profile-edit-icon">✏️</span>
        </div>

        <div className="sidebar-header">
          <h2>Menu</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#dashboard" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </a>
          <a href="#crypto" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.5 9.5c0-1.1.9-2 2-2H14c1.1 0 2 .9 2 2s-.9 2-2 2h-4c-1.1 0-2 .9-2 2s.9 2 2 2h2.5c1.1 0 2-.9 2-2" />
              <path d="M12 6v2m0 8v2" />
            </svg>
            Crypto Prices
          </a>
          <a href="#stocks" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            Stock Market
          </a>
          <a href="#news" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z" />
              <path d="M4 9h16M9 4v16" />
            </svg>
            News Feed
          </a>

          <div className="sidebar-divider"></div>
          <span className="sidebar-section-title">Account</span>

          <button onClick={() => openModal('profile')} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </button>

          <button onClick={() => openModal('kyc')} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <path d="M20 8v6M23 11h-6" />
            </svg>
            KYC Verification
          </button>

          <button onClick={() => openModal('bonus')} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 12v10H4V12" />
              <path d="M2 7h20v5H2z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
            Bonus & Rewards
            <span className="sidebar-badge">New</span>
          </button>

          <button onClick={() => openModal('settings')} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>

          <button onClick={() => openModal('security')} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Security
          </button>

          <div className="sidebar-divider"></div>
          <span className="sidebar-section-title">Information</span>

          <button onClick={() => openModal('about')} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            About Us
          </button>

          <button onClick={() => openModal('whitepaper')} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            White Paper
          </button>

          <button onClick={() => openModal('howto')} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            How It Works
          </button>

          <button onClick={() => openModal('help')} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Help Center
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>Version 2.0.0</p>
          <p>© 2025 OnchainWeb</p>
        </div>
      </aside>

      {/* Profile Modal */}
      {activeModal === 'profile' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>👤 My Profile</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              {/* User ID Display */}
              <div className="profile-id-banner">
                <span className="id-label">User ID</span>
                <span className="id-value">{profile.userId}</span>
                <button 
                  className="copy-id-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(profile.userId)
                    alert('User ID copied!')
                  }}
                >
                  📋
                </button>
              </div>

              <div className="profile-section">
                <h4>Avatar</h4>
                <div className="avatar-grid">
                  {avatarOptions.map((avatar, idx) => (
                    <button 
                      key={idx}
                      className={`avatar-option ${profile.avatar === avatar ? 'selected' : ''}`}
                      onClick={() => handleProfileChange('avatar', avatar)}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="profile-group">
                <h4 className="profile-group-title">📋 Personal Information</h4>
                
                <div className="profile-row">
                  <div className="profile-field">
                    <label>First Name (KYC)</label>
                    <input 
                      type="text"
                      className="profile-input"
                      value={profile.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      placeholder="Legal first name"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Last Name (KYC)</label>
                    <input 
                      type="text"
                      className="profile-input"
                      value={profile.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      placeholder="Legal last name"
                    />
                  </div>
                </div>

                <div className="profile-section">
                  <label>Username</label>
                  <input 
                    type="text"
                    className="profile-input"
                    value={profile.username}
                    onChange={(e) => handleProfileChange('username', e.target.value)}
                    placeholder="Enter username"
                  />
                </div>

                <div className="profile-row">
                  <div className="profile-field">
                    <label>Date of Birth</label>
                    <input 
                      type="date"
                      className="profile-input"
                      value={profile.dateOfBirth}
                      onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Gender</label>
                    <select 
                      className="profile-select"
                      value={profile.gender}
                      onChange={(e) => handleProfileChange('gender', e.target.value)}
                    >
                      <option value="">Select gender</option>
                      {genderOptions.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="profile-group">
                <h4 className="profile-group-title">📞 Contact Information</h4>
                
                <div className="profile-section">
                  <label>Email Address</label>
                  <input 
                    type="email"
                    className="profile-input"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="profile-section">
                  <label>Phone Number</label>
                  <input 
                    type="tel"
                    className="profile-input"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="profile-group">
                <h4 className="profile-group-title">🏠 Address</h4>
                
                <div className="profile-section">
                  <label>Country</label>
                  <select 
                    className="profile-select"
                    value={profile.country}
                    onChange={(e) => handleProfileChange('country', e.target.value)}
                  >
                    <option value="">Select country</option>
                    {countryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="profile-row">
                  <div className="profile-field">
                    <label>City</label>
                    <input 
                      type="text"
                      className="profile-input"
                      value={profile.city}
                      onChange={(e) => handleProfileChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Postal Code</label>
                    <input 
                      type="text"
                      className="profile-input"
                      value={profile.postalCode}
                      onChange={(e) => handleProfileChange('postalCode', e.target.value)}
                      placeholder="Postal code"
                    />
                  </div>
                </div>

                <div className="profile-section">
                  <label>Street Address</label>
                  <input 
                    type="text"
                    className="profile-input"
                    value={profile.address}
                    onChange={(e) => handleProfileChange('address', e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>
              </div>

              {/* Account Stats Section */}
              <div className="profile-group">
                <h4 className="profile-group-title">📊 Account Statistics</h4>
                <div className="profile-stats-grid">
                  <div className="profile-stat-card">
                    <span className="stat-icon">🏆</span>
                    <span className="stat-value">{getVIPBadge(profile.vipLevel)} Level {profile.vipLevel}</span>
                    <span className="stat-label">VIP Status</span>
                  </div>
                  <div className="profile-stat-card">
                    <span className="stat-icon">📅</span>
                    <span className="stat-value">{profile.joinDate}</span>
                    <span className="stat-label">Member Since</span>
                  </div>
                  <div className="profile-stat-card">
                    <span className="stat-icon">📈</span>
                    <span className="stat-value">{profile.totalTrades || 0}</span>
                    <span className="stat-label">Total Trades</span>
                  </div>
                  <div className="profile-stat-card">
                    <span className="stat-icon">👥</span>
                    <span className="stat-value">{profile.referralCount || 0}</span>
                    <span className="stat-label">Referrals</span>
                  </div>
                </div>
              </div>

              {/* KYC Status */}
              <div className="profile-kyc-status">
                <div className="kyc-status-display">
                  <span 
                    className="kyc-status-dot" 
                    style={{ background: getKYCStatusColor(profile.kycStatus) }}
                  ></span>
                  <span className="kyc-status-text">
                    KYC Status: {profile.kycStatus.charAt(0).toUpperCase() + profile.kycStatus.slice(1)}
                  </span>
                </div>
                {profile.kycStatus !== 'verified' && (
                  <button 
                    className="complete-kyc-btn"
                    onClick={() => {
                      closeModal()
                      setTimeout(() => openModal('kyc'), 100)
                    }}
                  >
                    Complete KYC →
                  </button>
                )}
              </div>

              {/* Referral Code */}
              <div className="profile-referral">
                <h4>🎁 Your Referral Code</h4>
                <div className="referral-box">
                  <span className="referral-code-text">{profile.referralCode}</span>
                  <button 
                    className="copy-btn-small"
                    onClick={() => {
                      navigator.clipboard.writeText(profile.referralCode)
                      alert('Referral code copied!')
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="referral-hint">Share your code to earn bonus rewards!</p>
              </div>

              <button className="save-profile-btn" onClick={closeModal}>
                💾 Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>⚙️ Settings</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              <div className="settings-group">
                <h4>🔔 Notifications</h4>
                <div className="setting-item">
                  <span>Push Notifications</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <span>Price Alerts</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.priceAlerts}
                      onChange={(e) => handleSettingChange('priceAlerts', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <span>Email Notifications</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h4>🔊 Sounds & Haptics</h4>
                <div className="setting-item">
                  <span>Sound Effects</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.soundEffects}
                      onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <span>Vibration</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.vibration}
                      onChange={(e) => handleSettingChange('vibration', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h4>🎨 Display</h4>
                <div className="setting-item">
                  <span>Dark Mode</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.darkMode}
                      onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <span>Hide Balances</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.hideBalances}
                      onChange={(e) => handleSettingChange('hideBalances', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h4>🌐 Language</h4>
                <div className="language-grid">
                  {languageOptions.map((lang) => (
                    <button 
                      key={lang.code}
                      className={`language-btn ${settings.language === lang.code ? 'selected' : ''}`}
                      onClick={() => handleSettingChange('language', lang.code)}
                    >
                      <span className="lang-flag">{lang.flag}</span>
                      <span className="lang-name">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <h4>💰 Display Currency</h4>
                <select 
                  className="settings-select"
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                >
                  {currencyOptions.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <button className="save-settings-btn" onClick={closeModal}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {activeModal === 'security' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>🔒 Security</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              <div className="security-status">
                <div className="security-score">
                  <span className="score-value">75%</span>
                  <span className="score-label">Security Score</span>
                </div>
                <p>Complete more security features to improve your account protection.</p>
              </div>

              <div className="security-items">
                <div className="security-item completed">
                  <div className="security-icon">✓</div>
                  <div className="security-info">
                    <h4>Password</h4>
                    <p>Strong password set</p>
                  </div>
                  <button className="security-btn">Change</button>
                </div>

                <div className="security-item">
                  <div className="security-icon">📱</div>
                  <div className="security-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security</p>
                  </div>
                  <button className="security-btn primary">Enable</button>
                </div>

                <div className="security-item">
                  <div className="security-icon">👆</div>
                  <div className="security-info">
                    <h4>Biometric Login</h4>
                    <p>Use fingerprint or Face ID</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.biometricAuth}
                      onChange={(e) => handleSettingChange('biometricAuth', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="security-item">
                  <div className="security-icon">⏱️</div>
                  <div className="security-info">
                    <h4>Auto-Lock</h4>
                    <p>Lock app after inactivity</p>
                  </div>
                  <select 
                    className="security-select"
                    value={settings.autoLock}
                    onChange={(e) => handleSettingChange('autoLock', e.target.value)}
                  >
                    <option value="1min">1 minute</option>
                    <option value="5min">5 minutes</option>
                    <option value="15min">15 minutes</option>
                    <option value="30min">30 minutes</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>

              <div className="security-actions">
                <button className="security-action-btn danger">
                  🚪 Log Out All Devices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Center Modal */}
      {activeModal === 'help' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>❓ Help Center</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              <div className="help-search">
                <input type="text" placeholder="Search for help..." className="help-search-input" />
              </div>

              <div className="help-categories">
                <div className="help-category">
                  <span className="help-icon">📱</span>
                  <h4>Getting Started</h4>
                  <p>Learn the basics</p>
                </div>
                <div className="help-category">
                  <span className="help-icon">💰</span>
                  <h4>Deposits & Withdrawals</h4>
                  <p>Fund your account</p>
                </div>
                <div className="help-category">
                  <span className="help-icon">📊</span>
                  <h4>Trading</h4>
                  <p>Buy, sell & trade</p>
                </div>
                <div className="help-category">
                  <span className="help-icon">🔒</span>
                  <h4>Security</h4>
                  <p>Protect your account</p>
                </div>
              </div>

              <div className="help-faqs">
                <h4>Frequently Asked Questions</h4>
                <div className="faq-item">
                  <details>
                    <summary>How do I deposit funds?</summary>
                    <p>Go to Wallet → Deposit → Select your preferred cryptocurrency and copy the deposit address.</p>
                  </details>
                </div>
                <div className="faq-item">
                  <details>
                    <summary>How long do withdrawals take?</summary>
                    <p>Withdrawals are typically processed within 24 hours after approval.</p>
                  </details>
                </div>
                <div className="faq-item">
                  <details>
                    <summary>How do I complete KYC verification?</summary>
                    <p>Go to Menu → KYC Verification and follow the step-by-step process.</p>
                  </details>
                </div>
                <div className="faq-item">
                  <details>
                    <summary>What is AI Arbitrage?</summary>
                    <p>AI Arbitrage uses advanced algorithms to find profitable trading opportunities automatically.</p>
                  </details>
                </div>
              </div>

              <div className="help-contact">
                <h4>Still need help?</h4>
                <p>Our support team is available 24/7</p>
                <button className="contact-support-btn" onClick={closeModal}>
                  💬 Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC Modal */}
      {activeModal === 'kyc' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>🔐 KYC Verification</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              <div className="kyc-status">
                <span className={`kyc-badge ${profile.kycStatus}`}>
                  {profile.kycStatus === 'verified' ? '✓ Verified' : 
                   profile.kycStatus === 'pending' ? '⏳ Pending Verification' : '! Not Verified'}
                </span>
              </div>
              
              <p className="kyc-intro">Complete KYC verification to unlock all features including higher withdrawal limits, bonus rewards, and premium features.</p>

              <div className="kyc-steps">
                <div className="kyc-step completed">
                  <div className="step-number">✓</div>
                  <div className="step-content">
                    <h4>Step 1: Email Verification</h4>
                    <p>Verify your email address</p>
                  </div>
                </div>
                <div className="kyc-step active">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Step 2: Identity Verification</h4>
                    <p>Upload government-issued ID</p>
                  </div>
                </div>
                <div className="kyc-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Step 3: Selfie Verification</h4>
                    <p>Take a selfie holding your ID</p>
                  </div>
                </div>
                <div className="kyc-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Step 4: Address Verification</h4>
                    <p>Upload proof of address</p>
                  </div>
                </div>
              </div>

              <div className="kyc-upload">
                <h4>Upload Documents</h4>
                <div className="upload-area">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p>Drag & drop files here or click to upload</p>
                  <span>Supported: JPG, PNG, PDF (Max 10MB)</span>
                </div>
              </div>

              <button className="kyc-submit-btn">Start Verification</button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Modal */}
      {activeModal === 'bonus' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>🎁 Bonus & Rewards</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              <div className="bonus-banner">
                <span className="bonus-tag">LIMITED TIME OFFER</span>
                <h3>Welcome Bonus Package</h3>
                <p>New users get up to <strong>{bonusData.welcomeBonus}</strong> in rewards!</p>
                <p className="bonus-expires">Offer ends: {bonusData.promotionEnd}</p>
              </div>

              <div className="bonus-grid">
                <div className="bonus-card">
                  <span className="bonus-icon">🎉</span>
                  <h4>Welcome Bonus</h4>
                  <p className="bonus-value">{bonusData.welcomeBonus}</p>
                  <p>Sign up and complete KYC</p>
                </div>
                <div className="bonus-card">
                  <span className="bonus-icon">👥</span>
                  <h4>Referral Bonus</h4>
                  <p className="bonus-value">{bonusData.referralBonus}</p>
                  <p>Invite friends to earn</p>
                </div>
                <div className="bonus-card">
                  <span className="bonus-icon">💹</span>
                  <h4>Trading Rewards</h4>
                  <p className="bonus-value">{bonusData.tradingBonus}</p>
                  <p>On all trading fees</p>
                </div>
                <div className="bonus-card">
                  <span className="bonus-icon">🔒</span>
                  <h4>Staking Rewards</h4>
                  <p className="bonus-value">{bonusData.stakingRewards}</p>
                  <p>Earn passive income</p>
                </div>
              </div>

              <div className="referral-section">
                <h4>Your Referral Code</h4>
                <div className="referral-code">
                  <span>{profile.referralCode}</span>
                  <button onClick={() => { navigator.clipboard.writeText(profile.referralCode); alert('Copied!'); }}>Copy</button>
                </div>
                <p>Share your code and earn rewards when friends sign up!</p>
              </div>

              <button className="claim-bonus-btn">Claim Your Bonus</button>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {activeModal === 'about' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>About OnchainWeb</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              <div className="about-hero">
                <div className="about-logo">
                  <svg width="60" height="60" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="about-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" rx="12" fill="url(#about-gradient)" />
                    <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3>The Future of Decentralized Finance</h3>
                <p>OnchainWeb is a leading cryptocurrency and stock trading platform trusted by millions worldwide.</p>
              </div>

              <div className="about-stats">
                <div className="stat-item">
                  <span className="stat-value">10M+</span>
                  <span className="stat-label">Users Worldwide</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">$50B+</span>
                  <span className="stat-label">Trading Volume</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">100+</span>
                  <span className="stat-label">Countries</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">500+</span>
                  <span className="stat-label">Assets</span>
                </div>
              </div>

              <div className="about-section">
                <h4>🎯 Our Mission</h4>
                <p>To accelerate the world's transition to cryptocurrency by making it easy for everyone to buy, sell, and manage digital assets securely.</p>
              </div>

              <div className="about-section">
                <h4>🔒 Security First</h4>
                <p>Your security is our top priority. We employ industry-leading security measures including cold storage, 2FA, biometric authentication, and insurance coverage for digital assets.</p>
              </div>

              <div className="about-partners">
                <h4>Backed By</h4>
                <div className="partner-logos">
                  <span>Sequoia Capital</span>
                  <span>Andreessen Horowitz</span>
                  <span>Coinbase Ventures</span>
                  <span>Binance Labs</span>
                </div>
              </div>

              <div className="about-contact">
                <h4>Contact Us</h4>
                <p>📧 support@onchainweb.com</p>
                <p>🌐 www.onchainweb.com</p>
                <p>📍 Singapore | London | New York</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* White Paper Modal */}
      {activeModal === 'whitepaper' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>📄 White Paper</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              <div className="whitepaper-cover">
                <h3>OnchainWeb Protocol</h3>
                <p>Technical White Paper v2.0</p>
                <span>December 2024</span>
              </div>

              <div className="whitepaper-toc">
                <h4>Table of Contents</h4>
                <ol>
                  <li>Executive Summary</li>
                  <li>Introduction</li>
                  <li>Problem Statement</li>
                  <li>Tokenomics</li>
                  <li>Roadmap</li>
                </ol>
              </div>

              <div className="whitepaper-section">
                <h4>1. Executive Summary</h4>
                <p>OnchainWeb is a next-generation decentralized finance platform that bridges traditional finance with blockchain technology.</p>
              </div>

              <div className="whitepaper-section">
                <h4>2. Tokenomics</h4>
                <div className="tokenomics-table">
                  <div className="token-row">
                    <span>Total Supply</span>
                    <span>1,000,000,000 OCW</span>
                  </div>
                  <div className="token-row">
                    <span>Circulating Supply</span>
                    <span>350,000,000 OCW</span>
                  </div>
                  <div className="token-row">
                    <span>Community Rewards</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>

              <div className="whitepaper-download">
                <button className="download-btn">
                  📥 Download Full White Paper (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      {activeModal === 'howto' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>🎬 How OnchainWeb Works</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              <div className="howto-section">
                <h3>Getting Started in 4 Easy Steps</h3>
                
                <div className="howto-steps">
                  <div className="howto-step">
                    <div className="howto-step-number">1</div>
                    <div className="howto-step-content">
                      <h4>Create Your Account</h4>
                      <p>Sign up with your email address and create a secure password.</p>
                    </div>
                  </div>
                  
                  <div className="howto-step">
                    <div className="howto-step-number">2</div>
                    <div className="howto-step-content">
                      <h4>Complete KYC Verification</h4>
                      <p>Verify your identity by uploading required documents.</p>
                    </div>
                  </div>
                  
                  <div className="howto-step">
                    <div className="howto-step-number">3</div>
                    <div className="howto-step-content">
                      <h4>Fund Your Account</h4>
                      <p>Deposit cryptocurrency using various payment methods.</p>
                    </div>
                  </div>
                  
                  <div className="howto-step">
                    <div className="howto-step-number">4</div>
                    <div className="howto-step-content">
                      <h4>Start Trading</h4>
                      <p>Buy, sell, and trade cryptocurrencies and stocks.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="features-highlight">
                <h3>Key Features</h3>
                <div className="features-grid">
                  <div className="feature-item">
                    <span className="feature-emoji">📊</span>
                    <h4>Real-Time Data</h4>
                  </div>
                  <div className="feature-item">
                    <span className="feature-emoji">🔒</span>
                    <h4>Bank-Grade Security</h4>
                  </div>
                  <div className="feature-item">
                    <span className="feature-emoji">💳</span>
                    <h4>Easy Deposits</h4>
                  </div>
                  <div className="feature-item">
                    <span className="feature-emoji">📱</span>
                    <h4>Mobile Ready</h4>
                  </div>
                </div>
              </div>

              <div className="cta-section">
                <h3>Ready to Start?</h3>
                <button className="cta-btn" onClick={closeModal}>Get Started Now</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
