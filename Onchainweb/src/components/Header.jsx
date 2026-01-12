import React, { useState, useEffect } from 'react'
import { useWallet } from '../lib/walletConnect.jsx'
// Note: Notifications now use Firebase Firestore real-time listeners
// For implementation, see src/services/firebase.service.js or src/lib/firebase.js
// TODO: Replace with Firebase notification subscription

// Generate a unique 5-digit numeric ID for Real account
function generateRealAccountId() {
  return Math.floor(10000 + Math.random() * 90000).toString()
}

// Generate a unique customer ID based on address or session
function generateCustomerId(address) {
  if (address) {
    return 'CUS-' + address.slice(2, 10).toUpperCase()
  }
  // For guests, use a session-based ID
  let guestId = sessionStorage.getItem('guestId')
  if (!guestId) {
    guestId = 'GUEST-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    sessionStorage.setItem('guestId', guestId)
  }
  return guestId
}

export default function Header({ onMenuToggle, onAboutClick, onWhitepaperClick, onHowItWorksClick }) {
  const { providerAvailable, connect, disconnect, address, balance } = useWallet()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [darkMode, setDarkMode] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null
  const customerId = generateCustomerId(address)

  // Real Account ID - auto-set on wallet connect, persist across sessions
  const [realAccountId] = useState(() => {
    // Check if user has existing real account ID
    const savedId = localStorage.getItem('realAccountId')
    if (savedId && /^\d{5}$/.test(savedId)) return savedId

    // Generate new 5-digit numeric ID
    const newId = generateRealAccountId()
    localStorage.setItem('realAccountId', newId)
    return newId
  })

  // Auto-set real account ID when wallet connects
  useEffect(() => {
    if (address) {
      // Store the wallet-associated real account ID
      const walletAccounts = JSON.parse(localStorage.getItem('walletAccounts') || '{}')
      if (!walletAccounts[address]) {
        walletAccounts[address] = realAccountId
        localStorage.setItem('walletAccounts', JSON.stringify(walletAccounts))
      }
    }
  }, [address, realAccountId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-container') && !e.target.closest('.notification-btn') && !e.target.closest('.notifications-dropdown')) {
        setProfileOpen(false)
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Fetch notifications from Firebase
  // TODO: Replace with Firebase Firestore real-time listener
  // For now, using fallback to prevent errors from deprecated API
  useEffect(() => {
    if (!address) {
      setNotifications([])
      return
    }
    
    // Fallback: Use localStorage for notifications until Firebase listener is implemented
    // In production, this should use: onSnapshot(query(collection(db, 'notifications'), where('userId', '==', address)))
    try {
      const storedNotifications = localStorage.getItem(`notifications_${address}`)
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications)
        // Validate that parsed data is an array
        if (Array.isArray(parsed)) {
          // Validate each notification has required fields
          const validated = parsed.filter(n => 
            n && typeof n === 'object' && 
            (n._id || n.id) && 
            n.message
          )
          setNotifications(validated)
        } else {
          setNotifications([])
        }
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      // Clear corrupted data
      localStorage.removeItem(`notifications_${address}`)
      setNotifications([])
    }
  }, [address, showNotifications])

  const handleViewProfile = () => {
    alert(`Customer Profile\n\nReal Account ID: ${realAccountId}\nWallet: ${address || 'Not connected'}\nBalance: ${balance ? Number(balance).toFixed(4) + ' ETH' : 'N/A'}`)
    setProfileOpen(false)
  }

  const handleAboutUs = () => {
    if (onAboutClick) onAboutClick()
    setProfileOpen(false)
  }

  const handleWhitepaper = () => {
    if (onWhitepaperClick) onWhitepaperClick()
    setProfileOpen(false)
  }

  const handleHowItWorks = () => {
    if (onHowItWorksClick) onHowItWorksClick()
    setProfileOpen(false)
  }

  const handleEditProfile = () => {
    alert('Edit Profile feature coming soon!')
    setProfileOpen(false)
  }

  const handleNotifications = () => {
    setShowNotifications(!showNotifications)
    setProfileOpen(false)
  }

  const handleWatchlist = () => {
    alert('Watchlist: BTC, ETH, SOL, XRP, DOGE\n\nManage your watchlist in Settings.')
    setProfileOpen(false)
  }

  const handleTransactionHistory = () => {
    alert(`Transaction History for ${customerId}\n\nNo recent transactions.`)
    setProfileOpen(false)
  }

  const handleSettings = () => {
    alert('Settings:\n• Notifications: ON\n• Dark Mode: ON\n• Currency: USD\n• Language: English')
    setProfileOpen(false)
  }

  const handleHelp = () => {
    alert('Help & Support\n\nEmail: support@onchainweb.com\nDocs: docs.onchainweb.com\n\nVersion: 1.0.0')
    setProfileOpen(false)
  }

  const handleLogout = () => {
    // Remove wallet connection info from localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    sessionStorage.removeItem('guestId');
    setProfileOpen(false);
    alert('You have been logged out.');
    window.location.reload();
  }

  // Mark all notifications as read
  // TODO: Implement Firebase Firestore update for marking notifications as read
  const clearNotifications = () => {
    try {
      // Update notifications to mark all as read
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }))
      setNotifications(updatedNotifications)
      
      // Store in localStorage
      if (address) {
        localStorage.setItem(`notifications_${address}`, JSON.stringify(updatedNotifications))
      }
      
      setShowNotifications(false)
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }

  return (
    <header className="site-header" role="banner" aria-label="Site header">
      {/* Hamburger Menu Button */}
      <button
        className="hamburger-btn"
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Brand - Image Logo with Fallbacks 
          To replace logo: Place your logo file in /Onchainweb/public/logo.png
          Recommended size: 192x192px or larger (will be displayed at 48x48px)
          Supported formats: PNG (with transparency recommended) or SVG
      */}
      <div className="brand" aria-label="OnchainWeb home">
        {/* Use custom logo */}
        <img
          src="/logo.png"
          alt="OnchainWeb Logo"
          className="brand-logo"
          onError={(e) => {
            // Fallback: Show inline SVG if PNG fails to load
            e.target.style.display = 'none';
            if (e.target.nextSibling?.style) {
              e.target.nextSibling.style.display = 'inline';
            }
          }}
        />

        {/* Fallback SVG - Shown if all image paths fail */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          className="brand-logo-fallback"
          style={{ display: 'none' }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#002D72" />
              <stop offset="50%" stopColor="#0052CC" />
              <stop offset="100%" stopColor="#00C2FF" />
            </linearGradient>
          </defs>
          <polygon
            points="50,2 93,25 93,75 50,98 7,75 7,25"
            fill="url(#brand-gradient)"
          />
          <polygon
            points="50,15 78,32 78,68 50,85 22,68 22,32"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <circle cx="50" cy="50" r="18" fill="none" stroke="white" strokeWidth="4" />
          <path
            d="M35 35 L50 20 L65 35"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M35 65 L50 80 L65 65"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Text Fallback */}
        <span className="brand-text">OnchainWeb</span>
      </div>

      {/* Right Side - Wallet & Profile */}
      <div className="header-right">
        {/* Wallet Connection */}
        <nav aria-label="Primary" className="wallet-nav">
          {address ? (
            <span className="sub wallet-status connected">{shortAddr}</span>
          ) : (
            <button
              className="connect-btn"
              onClick={() => connect().catch(() => {})}
              aria-label="Connect wallet"
            >
              Connect
            </button>
          )}
        </nav>

        {/* Notification Bell (only if unread notifications) */}
        {address && notifications.some(n => !n.read) && (
          <button
            className="notification-btn"
            onClick={handleNotifications}
            aria-label="Notifications"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h4>Notifications</h4>
              <button onClick={clearNotifications}>Clear all</button>
            </div>
            <div className="notifications-list">
              {notifications.length === 0 && <div className="notification-item">No notifications.</div>}
              {notifications.map((n) => (
                <div className={`notification-item${n.read ? ' read' : ''}`} key={n._id}>
                  <span className="notification-icon">🔔</span>
                  <div>
                    <p>{n.message}</p>
                    <span className="notification-time">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Icon */}
        <div className="profile-container">
          <button
            className="profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="profile-dropdown">
              {/* Profile Header with Real Account ID */}
              <div className="profile-header">
                <div className="profile-avatar">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                </div>
                <div className="profile-info">
                  <span className="profile-name">{address ? 'User' : 'Guest'}</span>
                  <span className="profile-customer-id">Real ID: {realAccountId}</span>
                  {shortAddr && <span className="profile-address">{shortAddr}</span>}
                </div>
              </div>

              {/* Profile Menu Items - Simplified */}
              <div className="profile-menu">
                <button onClick={handleAboutUs}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  About Us
                </button>

                <button onClick={handleWhitepaper}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  White Paper
                </button>

                <button onClick={handleHowItWorks}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  How It Works
                </button>

                <div className="profile-divider"></div>

                <button onClick={handleLogout} className="logout-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
