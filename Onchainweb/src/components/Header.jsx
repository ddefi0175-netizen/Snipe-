import React, { useState, useEffect } from 'react'
import { useWallet } from '../lib/wallet.jsx'

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

export default function Header({ onMenuToggle }) {
  const { providerAvailable, connect, disconnect, address, balance } = useWallet()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [darkMode, setDarkMode] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null
  const customerId = generateCustomerId(address)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-container')) {
        setProfileOpen(false)
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleViewProfile = () => {
    alert(`Customer Profile\n\nID: ${customerId}\nWallet: ${address || 'Not connected'}\nBalance: ${balance ? Number(balance).toFixed(4) + ' ETH' : 'N/A'}`)
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
    if (address) {
      disconnect()
    }
    sessionStorage.removeItem('guestId')
    setProfileOpen(false)
    alert('You have been logged out.')
  }

  const clearNotifications = () => {
    setNotifications(0)
    setShowNotifications(false)
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

      {/* Brand - Crypto.com Style Logo */}
      <div className="brand" aria-label="OnchainWeb home">
        <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#002D72" />
              <stop offset="50%" stopColor="#0052CC" />
              <stop offset="100%" stopColor="#00C2FF" />
            </linearGradient>
          </defs>
          {/* Outer hexagon shape like crypto.com */}
          <polygon 
            points="50,2 93,25 93,75 50,98 7,75 7,25" 
            fill="url(#brand-gradient)"
            stroke="none"
          />
          {/* Inner geometric pattern */}
          <polygon 
            points="50,15 78,32 78,68 50,85 22,68 22,32" 
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          {/* Center O shape */}
          <circle cx="50" cy="50" r="18" fill="none" stroke="white" strokeWidth="4" />
          {/* Top accent */}
          <path d="M35 35 L50 20 L65 35" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Bottom accent */}
          <path d="M35 65 L50 80 L65 65" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>OnchainWeb</span>
      </div>

      {/* Right Side - Wallet & Profile */}
      <div className="header-right">
        {/* Wallet Connection */}
        <nav aria-label="Primary" className="wallet-nav">
          {!providerAvailable ? (
            <span className="sub wallet-status">No wallet</span>
          ) : address ? (
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

        {/* Notification Bell */}
        <button 
          className="notification-btn"
          onClick={handleNotifications}
          aria-label="Notifications"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notifications > 0 && <span className="notification-badge">{notifications}</span>}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h4>Notifications</h4>
              <button onClick={clearNotifications}>Clear all</button>
            </div>
            <div className="notifications-list">
              <div className="notification-item">
                <span className="notification-icon">📈</span>
                <div>
                  <p>BTC price up 2.5%</p>
                  <span className="notification-time">5 min ago</span>
                </div>
              </div>
              <div className="notification-item">
                <span className="notification-icon">🔔</span>
                <div>
                  <p>New feature: Stock tracking</p>
                  <span className="notification-time">1 hour ago</span>
                </div>
              </div>
              <div className="notification-item">
                <span className="notification-icon">💰</span>
                <div>
                  <p>Welcome to OnchainWeb!</p>
                  <span className="notification-time">Today</span>
                </div>
              </div>
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
              {/* Profile Header with Customer ID */}
              <div className="profile-header">
                <div className="profile-avatar">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                </div>
                <div className="profile-info">
                  <span className="profile-name">{address ? 'User' : 'Guest'}</span>
                  <span className="profile-customer-id">ID: {customerId}</span>
                  <span className="profile-address">{shortAddr || 'Wallet not connected'}</span>
                </div>
              </div>

              {/* Profile Menu Items */}
              <div className="profile-menu">
                <button onClick={handleViewProfile}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                  View Profile
                </button>
                
                <button onClick={handleEditProfile}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Profile
                </button>

                <button onClick={handleWatchlist}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  My Watchlist
                </button>

                <button onClick={handleTransactionHistory}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Transaction History
                </button>

                <div className="profile-divider"></div>

                <button onClick={handleSettings}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Settings
                </button>

                <button onClick={handleHelp}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Help & Support
                </button>

                <div className="profile-divider"></div>

                {address ? (
                  <button onClick={() => { disconnect(); setProfileOpen(false); }} className="disconnect-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                    Disconnect Wallet
                  </button>
                ) : (
                  <button onClick={() => { connect().catch(() => {}); setProfileOpen(false); }} className="connect-wallet-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 10H2" />
                    </svg>
                    Connect Wallet
                  </button>
                )}

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