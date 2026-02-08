import { useState, useEffect } from 'react'
import { userAPI, uploadAPI } from '../lib/api'

export default function Sidebar({ isOpen, onClose, onFuturesClick, onBinaryClick, onDemoClick, onC2CClick, onBorrowClick, onWalletActionsClick }) {
  const [activeModal, setActiveModal] = useState(null)

  // Gmail Registration States
  const [registerStep, setRegisterStep] = useState('email') // 'email', 'verify', 'complete'
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerUsername, setRegisterUsername] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('isRegistered') === 'true'
  })

  // KYC Document States
  const [kycFullName, setKycFullName] = useState('')
  const [kycDocType, setKycDocType] = useState('')
  const [kycDocNumber, setKycDocNumber] = useState('')
  const [kycFrontPhoto, setKycFrontPhoto] = useState(null)
  const [kycBackPhoto, setKycBackPhoto] = useState(null)
  const [kycFrontPreview, setKycFrontPreview] = useState('')
  const [kycBackPreview, setKycBackPreview] = useState('')

  // Upload Deposit Proof States
  const [uploadAmount, setUploadAmount] = useState('')
  const [uploadNetwork, setUploadNetwork] = useState('')
  const [uploadTxHash, setUploadTxHash] = useState('')
  const [uploadScreenshot, setUploadScreenshot] = useState(null)
  const [uploadScreenshotPreview, setUploadScreenshotPreview] = useState('')
  const [uploadHistory, setUploadHistory] = useState(() => {
    const saved = localStorage.getItem('uploadHistory')
    return saved ? JSON.parse(saved) : []
  })

  // Generate random 5-digit UserID (numbers only)
  const generateUserId = () => {
    return Math.floor(10000 + Math.random() * 90000).toString()
  }

  // Generate 6-digit verification code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Profile & Settings state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Ensure userId exists and is 5-digit numeric for existing profiles
      if (!parsed.userId || !/^\d{5}$/.test(parsed.userId)) {
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
      // KYC document fields
      if (!parsed.kycFullName) parsed.kycFullName = ''
      if (!parsed.kycDocType) parsed.kycDocType = ''
      if (!parsed.kycDocNumber) parsed.kycDocNumber = ''
      if (!parsed.kycFrontPhoto) parsed.kycFrontPhoto = ''
      if (!parsed.kycBackPhoto) parsed.kycBackPhoto = ''
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
      kycFullName: '',
      kycDocType: '',
      kycDocNumber: '',
      kycFrontPhoto: '',
      kycBackPhoto: '',
      joinDate: new Date().toISOString().split('T')[0],
      totalTrades: 0,
      totalProfit: 0
    }
  })

  // Also sync userId with realAccountId in localStorage
  useEffect(() => {
    const realAccountId = localStorage.getItem('realAccountId')
    if (realAccountId && realAccountId !== profile.userId) {
      // Sync profile userId with realAccountId (backend takes precedence)
      setProfile(prev => ({ ...prev, userId: realAccountId }))
    } else if (profile.userId) {
      // Set realAccountId from profile userId
      localStorage.setItem('realAccountId', profile.userId)
    }
  }, [profile.userId])

  // Sync with backend when wallet is connected
  useEffect(() => {
    const syncWithBackend = async () => {
      const wallet = localStorage.getItem('walletAddress')
      if (!wallet) return

      try {
        const user = await userAPI.getByWallet(wallet)
        if (user && user.userId) {
          console.log('Synced with backend user:', user.userId)
          localStorage.setItem('realAccountId', user.userId)
          localStorage.setItem('backendUserId', user._id)
          localStorage.setItem('backendUser', JSON.stringify(user))

          // Update profile with backend userId
          setProfile(prev => ({
            ...prev,
            userId: user.userId,
            kycStatus: user.kycStatus || prev.kycStatus,
            balance: user.balance || prev.balance
          }))
        }
      } catch (error) {
        console.log('Backend sync skipped:', error.message)
      }
    }

    syncWithBackend()
  }, []) // Run once on mount

  // Get display name (KYC name if available, otherwise username)
  const getDisplayName = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`
    }
    return profile.username
  }
  // Reference callback props to avoid lint warnings when they are optional and unused in some builds
  const _debugProps = () => { if (typeof console !== 'undefined') console.debug('sidebar-props', { onBinaryClick, onDemoClick, onWalletActionsClick }) }
  _debugProps()

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings')
    return saved ? JSON.parse(saved) : {
      notifications: true,
      newsAlerts: true,
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



  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }



  const getKYCStatusColor = (status) => {
    switch(status) {
      case 'verified': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'rejected': return '#ef4444'
      default: return '#6b7280'
    }
  }

  // Document type options
  const documentTypes = [
    { value: 'id', label: 'National ID Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'driver', label: "Driver's License" }
  ]

  // Handle Gmail Registration
  const handleSendVerificationCode = () => {
    if (!registerEmail || !registerEmail.includes('@')) {
      setRegisterError('Please enter a valid email address')
      return
    }
    if (!registerUsername || registerUsername.length < 3) {
      setRegisterError('Username must be at least 3 characters')
      return
    }

    // Generate and "send" verification code
    const code = generateVerificationCode()
    setGeneratedCode(code)
    setRegisterError('')
    setRegisterStep('verify')

    // In production, this would call an email API
    // For demo, code is stored and shown to user
    console.log(`Verification code ${code} sent to ${registerEmail}`)
  }

  const handleVerifyCode = () => {
    if (verificationCode === generatedCode) {
      // Registration successful
      setProfile(prev => ({
        ...prev,
        email: registerEmail,
        username: registerUsername
      }))
      setIsRegistered(true)
      localStorage.setItem('isRegistered', 'true')
      setRegisterStep('complete')
      setRegisterError('')
    } else {
      setRegisterError('Invalid verification code. Please try again.')
    }
  }

  const handleResendCode = () => {
    const code = generateVerificationCode()
    setGeneratedCode(code)
  }

  // Handle KYC Photo Upload
  const handlePhotoUpload = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'front') {
          setKycFrontPhoto(file)
          setKycFrontPreview(reader.result)
        } else {
          setKycBackPhoto(file)
          setKycBackPreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleKycSubmit = async () => {
    // If already verified, don't allow changes
    if (profile.kycStatus === 'verified') {
      alert('Your KYC is already verified. You cannot modify your information.')
      return
    }

    if (!kycFullName || !kycDocType || !kycDocNumber) {
      alert('Please fill in all required fields')
      return
    }
    if (!kycFrontPhoto || !kycBackPhoto) {
      alert('Please upload both front and back photos of your document')
      return
    }

    let backendSuccess = false
    try {
      // Get wallet address for user identification
      const wallet = localStorage.getItem('walletAddress')
      if (wallet) {
        // First try to get existing user, if not found create one
        let user = await userAPI.getByWallet(wallet).catch(() => null)

        if (!user) {
          // User doesn't exist in backend, create them first
          console.log('User not found in backend, creating...')
          user = await userAPI.loginByWallet(wallet, profile.username, profile.email)
        }

        if (user && user._id) {
          // Submit KYC to backend
          await userAPI.submitKYC(user._id, {
            fullName: kycFullName,
            docType: kycDocType,
            docNumber: kycDocNumber,
            frontPhoto: kycFrontPreview,
            backPhoto: kycBackPreview
          })
          backendSuccess = true
          console.log('KYC submitted to backend successfully')
        }
      }
    } catch (error) {
      console.error('Failed to submit KYC to backend:', error)
    }

    // Also save locally for immediate UI update
    setProfile(prev => ({
      ...prev,
      kycFullName,
      kycDocType,
      kycDocNumber,
      kycFrontPhoto: kycFrontPreview,
      kycBackPhoto: kycBackPreview,
      kycStatus: 'pending',
      kycSubmittedAt: new Date().toISOString()
    }))

    if (backendSuccess) {
      alert('✅ KYC documents submitted successfully!\n\nYour verification is pending review.\nThis is now visible to admin in any browser.')
    } else {
      alert('⚠️ KYC saved locally.\n\nNote: Could not sync to server. Admin may not see this submission.')
    }
  }

  // Handle Screenshot Upload
  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB')
        return
      }
      setUploadScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadScreenshotPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Deposit Proof Submission
  const handleUploadSubmit = async () => {
    if (!uploadAmount || parseFloat(uploadAmount) <= 0) {
      alert('Please enter a valid deposit amount')
      return
    }
    if (!uploadNetwork) {
      alert('Please select the network used for transfer')
      return
    }
    if (!uploadScreenshot) {
      alert('Please upload a screenshot of your transfer')
      return
    }

    const wallet = localStorage.getItem('walletAddress')

    try {
      // Submit to backend
      await uploadAPI.create({
        userId: wallet || profile.userId,
        imageUrl: uploadScreenshotPreview,
        amount: parseFloat(uploadAmount),
        network: uploadNetwork,
        txHash: uploadTxHash || ''
      })
    } catch (error) {
      console.error('Failed to submit upload to backend:', error)
    }

    const newUpload = {
      id: Date.now(),
      userId: profile.userId,
      amount: parseFloat(uploadAmount),
      network: uploadNetwork,
      txHash: uploadTxHash || '',
      screenshot: uploadScreenshotPreview,
      status: 'pending',
      submittedAt: new Date().toISOString()
    }

    // Save to user's upload history locally
    const newHistory = [newUpload, ...uploadHistory]
    setUploadHistory(newHistory)
    localStorage.setItem('uploadHistory', JSON.stringify(newHistory))

    // Reset form
    setUploadAmount('')
    setUploadNetwork('')
    setUploadTxHash('')
    setUploadScreenshot(null)
    setUploadScreenshotPreview('')

    alert('Deposit proof uploaded successfully!\n\nYour deposit is pending admin review. Points will be added once approved.')
  }

  // Network options for upload
  const networkOptions = [
    { value: 'eth', label: 'Ethereum (ETH)' },
    { value: 'bsc', label: 'BNB Smart Chain (BSC)' },
    { value: 'polygon', label: 'Polygon (MATIC)' },
    { value: 'tron', label: 'Tron (TRX)' },
    { value: 'solana', label: 'Solana (SOL)' },
    { value: 'arbitrum', label: 'Arbitrum' },
    { value: 'optimism', label: 'Optimism' },
    { value: 'base', label: 'Base' },
    { value: 'other', label: 'Other' }
  ]

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
          <div className="sidebar-divider"></div>


          <button onClick={onFuturesClick} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            Futures Trading
          </button>

          <button onClick={onC2CClick} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            P2P Trading
          </button>

          <button onClick={onBorrowClick} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Borrow & Lend
          </button>

          <div className="sidebar-divider"></div>

          {/* Gmail Registration Button */}
          {!isRegistered && (
            <button onClick={() => openModal('register')} className="sidebar-btn register-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Register with Gmail
            </button>
          )}

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
          </button>

          <button onClick={() => openModal('upload')} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Deposit Proof
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
                  <span>Customer Service Messages</span>
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
                  <span>News & Announcements</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.newsAlerts}
                      onChange={(e) => handleSettingChange('newsAlerts', e.target.checked)}
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
          <div className="sidebar-modal large" onClick={(e) => e.stopPropagation()}>
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

              {/* Show different content based on KYC status */}
              {profile.kycStatus === 'verified' ? (
                <div className="kyc-verified-view">
                  <div className="kyc-success-icon">✓</div>
                  <h3>KYC Verification Complete</h3>
                  <p>Your identity has been verified successfully. You now have full access to all platform features.</p>

                  <div className="kyc-verified-details">
                    <div className="kyc-detail-item">
                      <span className="detail-label">Full Name:</span>
                      <span className="detail-value">{profile.kycFullName || kycFullName}</span>
                    </div>
                    <div className="kyc-detail-item">
                      <span className="detail-label">Document Type:</span>
                      <span className="detail-value">{documentTypes.find(d => d.value === (profile.kycDocType || kycDocType))?.label || profile.kycDocType}</span>
                    </div>
                    <div className="kyc-detail-item">
                      <span className="detail-label">Document Number:</span>
                      <span className="detail-value">{profile.kycDocNumber || kycDocNumber}</span>
                    </div>
                    <div className="kyc-detail-item">
                      <span className="detail-label">Verified On:</span>
                      <span className="detail-value">{profile.kycVerifiedAt ? new Date(profile.kycVerifiedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  <button className="kyc-close-btn" onClick={closeModal}>
                    Close
                  </button>
                </div>
              ) : profile.kycStatus === 'pending' ? (
                <div className="kyc-pending-view">
                  <div className="kyc-pending-icon">⏳</div>
                  <h3>Verification In Progress</h3>
                  <p>Your KYC documents are being reviewed by our team. This usually takes 1-3 business days.</p>
                  <p className="kyc-pending-note">You can still edit your information below until your verification is approved.</p>

                  {/* Editable Form for Pending Status */}
                  <div className="kyc-form-section">
                    <h4>📋 Personal Information</h4>
                    <div className="kyc-field">
                      <label>Full Name (as shown on ID) *</label>
                      <input
                        type="text"
                        className="kyc-input"
                        value={kycFullName}
                        onChange={(e) => setKycFullName(e.target.value)}
                        placeholder="Enter your full legal name"
                      />
                    </div>
                  </div>

                  <div className="kyc-form-section">
                    <h4>📄 Document Information</h4>
                    <div className="kyc-field">
                      <label>Document Type *</label>
                      <select
                        className="kyc-select"
                        value={kycDocType}
                        onChange={(e) => setKycDocType(e.target.value)}
                      >
                        <option value="">Select document type</option>
                        {documentTypes.map((doc) => (
                          <option key={doc.value} value={doc.value}>{doc.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="kyc-field">
                      <label>Document ID Number *</label>
                      <input
                        type="text"
                        className="kyc-input"
                        value={kycDocNumber}
                        onChange={(e) => setKycDocNumber(e.target.value)}
                        placeholder="Enter your document ID number"
                      />
                    </div>
                  </div>

                  <div className="kyc-form-section">
                    <h4>📸 Document Photos</h4>
                    <div className="kyc-upload-grid">
                      <div className="kyc-upload-box">
                        <label className="kyc-upload-label">
                          <span className="upload-title">Front Side *</span>
                          <div className={`upload-area ${kycFrontPreview ? 'has-image' : ''}`}>
                            {kycFrontPreview ? (
                              <img src={kycFrontPreview} alt="Front of document" className="upload-preview" />
                            ) : (
                              <>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <p>Click to upload front</p>
                              </>
                            )}
                          </div>
                          <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'front')} style={{ display: 'none' }} />
                        </label>
                        {kycFrontPreview && <button className="remove-photo-btn" onClick={() => { setKycFrontPhoto(null); setKycFrontPreview(''); }}>✕ Remove</button>}
                      </div>
                      <div className="kyc-upload-box">
                        <label className="kyc-upload-label">
                          <span className="upload-title">Back Side *</span>
                          <div className={`upload-area ${kycBackPreview ? 'has-image' : ''}`}>
                            {kycBackPreview ? (
                              <img src={kycBackPreview} alt="Back of document" className="upload-preview" />
                            ) : (
                              <>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <p>Click to upload back</p>
                              </>
                            )}
                          </div>
                          <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'back')} style={{ display: 'none' }} />
                        </label>
                        {kycBackPreview && <button className="remove-photo-btn" onClick={() => { setKycBackPhoto(null); setKycBackPreview(''); }}>✕ Remove</button>}
                      </div>
                    </div>
                  </div>

                  <button className="kyc-submit-btn" onClick={handleKycSubmit}>
                    📝 Update Submission
                  </button>
                </div>
              ) : (
                <>
                  <p className="kyc-intro">Complete KYC verification to unlock all features including higher withdrawal limits, bonus rewards, and premium features.</p>

                  {/* Personal Information Section */}
                  <div className="kyc-form-section">
                    <h4>📋 Personal Information</h4>

                    <div className="kyc-field">
                      <label>Full Name (as shown on ID) *</label>
                      <input
                        type="text"
                        className="kyc-input"
                        value={kycFullName}
                        onChange={(e) => setKycFullName(e.target.value)}
                        placeholder="Enter your full legal name"
                      />
                    </div>
                  </div>

                  {/* Document Information Section */}
                  <div className="kyc-form-section">
                    <h4>📄 Document Information</h4>

                    <div className="kyc-field">
                      <label>Document Type *</label>
                      <select
                        className="kyc-select"
                        value={kycDocType}
                        onChange={(e) => setKycDocType(e.target.value)}
                      >
                        <option value="">Select document type</option>
                        {documentTypes.map((doc) => (
                          <option key={doc.value} value={doc.value}>{doc.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="kyc-field">
                      <label>Document ID Number *</label>
                      <input
                        type="text"
                        className="kyc-input"
                        value={kycDocNumber}
                        onChange={(e) => setKycDocNumber(e.target.value)}
                        placeholder="Enter your document ID number"
                      />
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="kyc-form-section">
                    <h4>📸 Document Photos</h4>
                    <p className="kyc-upload-hint">Please upload clear photos of your document. Make sure all details are visible.</p>

                    <div className="kyc-upload-grid">
                      {/* Front Photo Upload */}
                      <div className="kyc-upload-box">
                        <label className="kyc-upload-label">
                          <span className="upload-title">Front Side *</span>
                          <div className={`upload-area ${kycFrontPreview ? 'has-image' : ''}`}>
                            {kycFrontPreview ? (
                              <img src={kycFrontPreview} alt="Front of document" className="upload-preview" />
                            ) : (
                              <>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <p>Click to upload front</p>
                                <span>JPG, PNG (Max 10MB)</span>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e, 'front')}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {kycFrontPreview && (
                          <button
                            className="remove-photo-btn"
                            onClick={() => { setKycFrontPhoto(null); setKycFrontPreview(''); }}
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>

                      {/* Back Photo Upload */}
                      <div className="kyc-upload-box">
                        <label className="kyc-upload-label">
                          <span className="upload-title">Back Side *</span>
                          <div className={`upload-area ${kycBackPreview ? 'has-image' : ''}`}>
                            {kycBackPreview ? (
                              <img src={kycBackPreview} alt="Back of document" className="upload-preview" />
                            ) : (
                              <>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <p>Click to upload back</p>
                                <span>JPG, PNG (Max 10MB)</span>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e, 'back')}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {kycBackPreview && (
                          <button
                            className="remove-photo-btn"
                            onClick={() => { setKycBackPhoto(null); setKycBackPreview(''); }}
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="kyc-terms">
                    <p>By submitting, you confirm that the information provided is accurate and the documents are genuine.</p>
                  </div>

                  <button className="kyc-submit-btn" onClick={handleKycSubmit}>
                    ✓ Submit for Verification
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Deposit Proof Modal */}
      {activeModal === 'upload' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>📤 Upload Deposit Proof</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              <p className="upload-intro">Upload a screenshot of your successful crypto transfer. Once verified by admin, points will be added to your account.</p>

              <div className="upload-form-section">
                <h4>💰 Deposit Details</h4>

                <div className="upload-field">
                  <label>Deposit Amount (USDT) *</label>
                  <input
                    type="number"
                    className="upload-input"
                    value={uploadAmount}
                    onChange={(e) => setUploadAmount(e.target.value)}
                    placeholder="Enter the amount you deposited"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="upload-field">
                  <label>Network Used *</label>
                  <select
                    className="upload-select"
                    value={uploadNetwork}
                    onChange={(e) => setUploadNetwork(e.target.value)}
                  >
                    <option value="">Select network</option>
                    {networkOptions.map((net) => (
                      <option key={net.value} value={net.value}>{net.label}</option>
                    ))}
                  </select>
                </div>

                <div className="upload-field">
                  <label>Transaction Hash (Optional)</label>
                  <input
                    type="text"
                    className="upload-input"
                    value={uploadTxHash}
                    onChange={(e) => setUploadTxHash(e.target.value)}
                    placeholder="Enter transaction hash for faster verification"
                  />
                </div>
              </div>

              <div className="upload-form-section">
                <h4>📸 Transfer Screenshot *</h4>
                <p className="upload-hint">Please upload a clear screenshot showing the successful transfer with amount and transaction details visible.</p>

                <div className="upload-screenshot-box">
                  <label className="upload-screenshot-label">
                    <div className={`upload-area ${uploadScreenshotPreview ? 'has-image' : ''}`}>
                      {uploadScreenshotPreview ? (
                        <img src={uploadScreenshotPreview} alt="Transfer screenshot" className="upload-preview" />
                      ) : (
                        <>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <p>Click to upload screenshot</p>
                          <span>JPG, PNG (Max 10MB)</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {uploadScreenshotPreview && (
                    <button
                      className="remove-photo-btn"
                      onClick={() => { setUploadScreenshot(null); setUploadScreenshotPreview(''); }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              </div>

              <button className="upload-submit-btn" onClick={handleUploadSubmit}>
                📤 Submit Deposit Proof
              </button>

              {/* Upload History */}
              {uploadHistory.length > 0 && (
                <div className="upload-history-section">
                  <h4>📋 Your Upload History</h4>
                  <div className="upload-history-list">
                    {uploadHistory.map((upload) => (
                      <div key={upload.id} className="upload-history-item">
                        <div className="upload-history-info">
                          <span className="upload-amount">${upload.amount} USDT</span>
                          <span className="upload-network">{networkOptions.find(n => n.value === upload.network)?.label || upload.network}</span>
                        </div>
                        <div className="upload-history-status">
                          <span className={`upload-status-badge ${upload.status}`}>
                            {upload.status === 'approved' ? '✓ Approved' :
                             upload.status === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                          </span>
                          <span className="upload-date">{new Date(upload.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Gmail Registration Modal */}
      {activeModal === 'register' && (
        <div className="sidebar-modal-overlay" onClick={closeModal}>
          <div className="sidebar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <h2>📧 Register with Gmail</h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            <div className="sidebar-modal-content">
              {/* Registration Logo */}
              <div className="register-logo">
                <svg width="80" height="80" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="reg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#002D72" />
                      <stop offset="50%" stopColor="#0052CC" />
                      <stop offset="100%" stopColor="#00C2FF" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" fill="url(#reg-gradient)" />
                  <path d="M25 35 L50 50 L75 35" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M25 35 L25 65 L75 65 L75 35" stroke="white" strokeWidth="4" fill="none" strokeLinejoin="round" />
                  <circle cx="50" cy="50" r="8" fill="white" />
                </svg>
                <h3>OnchainWeb</h3>
                <p>Create your account to start trading</p>
              </div>

              {registerStep === 'email' && (
                <div className="register-form">
                  <div className="register-field">
                    <label>Username</label>
                    <input
                      type="text"
                      className="register-input"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      placeholder="Choose a username"
                    />
                  </div>

                  <div className="register-field">
                    <label>Gmail Address</label>
                    <div className="gmail-input-wrapper">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <input
                        type="email"
                        className="register-input"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="your.email@gmail.com"
                      />
                    </div>
                  </div>

                  {registerError && (
                    <div className="register-error">
                      <span>⚠️ {registerError}</span>
                    </div>
                  )}

                  <button className="register-btn-primary" onClick={handleSendVerificationCode}>
                    📤 Send Verification Code
                  </button>

                  <p className="register-terms">
                    By registering, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              )}

              {registerStep === 'verify' && (
                <div className="verify-form">
                  <div className="verify-sent-info">
                    <span className="verify-icon">📨</span>
                    <p>Verification code sent to:</p>
                    <strong>{registerEmail}</strong>
                  </div>

                  {/* Demo: Show the verification code */}
                  <div className="demo-code-box">
                    <span className="demo-label">📱 Your Verification Code:</span>
                    <span className="demo-code">{generatedCode}</span>
                    <span className="demo-note">(In production, this would be sent to your email)</span>
                  </div>

                  <div className="verify-field">
                    <label>Enter 6-digit verification code</label>
                    <input
                      type="text"
                      className="verify-input"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  {registerError && (
                    <div className="register-error">
                      <span>⚠️ {registerError}</span>
                    </div>
                  )}

                  <button className="register-btn-primary" onClick={handleVerifyCode}>
                    ✓ Verify & Complete Registration
                  </button>

                  <button className="resend-btn" onClick={handleResendCode}>
                    📤 Get New Code
                  </button>

                  <button className="back-btn" onClick={() => { setRegisterStep('email'); setRegisterError(''); }}>
                    ← Back to Email
                  </button>
                </div>
              )}

              {registerStep === 'complete' && (
                <div className="register-complete">
                  <div className="success-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#10b981" />
                      <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3>Registration Successful!</h3>
                  <p>Welcome to OnchainWeb, <strong>{registerUsername}</strong>!</p>
                  <p className="success-email">Your account is now linked to {registerEmail}</p>

                  <div className="success-actions">
                    <button className="register-btn-primary" onClick={() => { closeModal(); setTimeout(() => openModal('kyc'), 100); }}>
                      Complete KYC →
                    </button>
                    <button className="success-close-btn" onClick={closeModal}>
                      Start Exploring
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
