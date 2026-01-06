import React, { useState, useEffect } from 'react'
import { userAPI } from '../lib/api'

// Web3 Wallet Gate - User MUST connect wallet to see any content
export default function WalletGate({ onConnect, children }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const [selectedWallet, setSelectedWallet] = useState(null)

  // Check if already connected
  const isConnected = localStorage.getItem('walletConnected') === 'true'
  const connectedAddress = localStorage.getItem('walletAddress') || ''

  // Register user in backend
  const registerUserInBackend = async (address) => {
    try {
      const user = await userAPI.loginByWallet(address)
      // Store user data from backend
      if (user) {
        localStorage.setItem('backendUserId', user._id)
        localStorage.setItem('backendUser', JSON.stringify(user))
        // Sync userId
        if (user.userId) {
          localStorage.setItem('realAccountId', user.userId)
        }
      }
      return user
    } catch (error) {
      console.error('Failed to register user in backend:', error)
      return null
    }
  }

  // Supported wallets
  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#E2761B', popular: true },
    { id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️', color: '#3375BB', popular: true },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', color: '#0052FF', popular: true },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', color: '#3B99FC', popular: true },
    { id: 'tokenpocket', name: 'TokenPocket', icon: '💎', color: '#2980FE' },
    { id: 'imtoken', name: 'imToken', icon: '📱', color: '#11C4D1' },
    { id: 'okx', name: 'OKX Wallet', icon: '⚫', color: '#000000' },
    { id: 'phantom', name: 'Phantom', icon: '👻', color: '#AB9FF2' },
    { id: 'bitget', name: 'Bitget Wallet', icon: '🅱️', color: '#00C8B0' },
    { id: 'safepal', name: 'SafePal', icon: '🔐', color: '#4A6BFF' },
  ]

  // Simulate wallet connection
  const connectWallet = async (walletId) => {
    setIsConnecting(true)
    setError('')
    setSelectedWallet(walletId)

    try {
      let address = ''
      
      // Check if MetaMask or other Web3 provider exists
      if (walletId === 'metamask' && typeof window.ethereum !== 'undefined') {
        // Real MetaMask connection
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length > 0) {
          address = accounts[0]
        }
      } else {
        // For other wallets or if no Web3 provider, simulate connection
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Generate a simulated address
        address = '0x' + Array.from({length: 40}, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')
      }
      
      if (address) {
        localStorage.setItem('walletConnected', 'true')
        localStorage.setItem('walletAddress', address)
        localStorage.setItem('walletType', walletId)
        
        // Register user in backend database
        await registerUserInBackend(address)
        
        if (onConnect) onConnect(address)
        window.location.reload()
      }

    } catch (err) {
      setError('Connection failed. Please try again or use a different wallet.')
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  // If already connected, show the app
  if (isConnected && connectedAddress) {
    return children
  }

  // Show wallet connection gate
  return (
    <div className="wallet-gate">
      <div className="wallet-gate-overlay" />
      <div className="wallet-gate-content">
        <div className="wallet-gate-logo">
          <div className="logo-glow" />
          <span className="logo-icon">🔗</span>
          <h1>OnchainWeb</h1>
          <p className="tagline">Decentralized Trading Platform</p>
        </div>

        <div className="wallet-gate-box">
          <div className="gate-header">
            <span className="lock-icon">🔒</span>
            <h2>Connect Your Wallet</h2>
            <p>Access requires a Web3 wallet connection</p>
          </div>

          {error && (
            <div className="gate-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="wallet-list">
            <div className="wallet-section">
              <h3>Popular</h3>
              <div className="wallet-grid">
                {wallets.filter(w => w.popular).map(wallet => (
                  <button
                    key={wallet.id}
                    className={`wallet-btn ${selectedWallet === wallet.id ? 'connecting' : ''}`}
                    onClick={() => connectWallet(wallet.id)}
                    disabled={isConnecting}
                    style={{ '--wallet-color': wallet.color }}
                  >
                    <span className="wallet-icon">{wallet.icon}</span>
                    <span className="wallet-name">{wallet.name}</span>
                    {selectedWallet === wallet.id && isConnecting && (
                      <span className="connecting-spinner">⟳</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="wallet-section">
              <h3>More Wallets</h3>
              <div className="wallet-grid small">
                {wallets.filter(w => !w.popular).map(wallet => (
                  <button
                    key={wallet.id}
                    className={`wallet-btn small ${selectedWallet === wallet.id ? 'connecting' : ''}`}
                    onClick={() => connectWallet(wallet.id)}
                    disabled={isConnecting}
                    style={{ '--wallet-color': wallet.color }}
                  >
                    <span className="wallet-icon">{wallet.icon}</span>
                    <span className="wallet-name">{wallet.name}</span>
                    {selectedWallet === wallet.id && isConnecting && (
                      <span className="connecting-spinner">⟳</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="gate-footer">
            <p>🔐 Your keys, your crypto. We never have access to your funds.</p>
            <div className="security-badges">
              <span>🛡️ Non-Custodial</span>
              <span>🔒 Encrypted</span>
              <span>✓ Audited</span>
            </div>
          </div>
        </div>

        <div className="gate-info">
          <p>Don't have a wallet? <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Get MetaMask →</a></p>
        </div>
      </div>

      <style>{`
        .wallet-gate {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%);
          overflow-y: auto;
          padding: 20px;
        }

        .wallet-gate-overlay {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 20%, rgba(0, 255, 136, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(136, 0, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 136, 255, 0.05) 0%, transparent 70%);
          animation: pulse-bg 8s ease-in-out infinite;
        }

        @keyframes pulse-bg {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .wallet-gate-content {
          position: relative;
          z-index: 1;
          max-width: 480px;
          width: 100%;
          text-align: center;
        }

        .wallet-gate-logo {
          margin-bottom: 30px;
          position: relative;
        }

        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: glow-pulse 2s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }

        .logo-icon {
          font-size: 64px;
          display: block;
          margin-bottom: 15px;
          filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.5));
          position: relative;
          z-index: 1;
        }

        .wallet-gate-logo h1 {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: 2px;
        }

        .tagline {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin-top: 8px;
        }

        .wallet-gate-box {
          background: rgba(20, 20, 35, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 30px;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .gate-header {
          margin-bottom: 25px;
        }

        .lock-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 15px;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .gate-header h2 {
          font-size: 1.5rem;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .gate-header p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          margin: 0;
        }

        .gate-error {
          background: rgba(255, 77, 77, 0.15);
          border: 1px solid rgba(255, 77, 77, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          color: #ff6b6b;
          font-size: 0.85rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wallet-section {
          margin-bottom: 20px;
        }

        .wallet-section h3 {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 12px 0;
          text-align: left;
        }

        .wallet-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .wallet-grid.small {
          grid-template-columns: repeat(3, 1fr);
        }

        .wallet-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .wallet-btn.small {
          padding: 12px 8px;
        }

        .wallet-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--wallet-color, #00ff88) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .wallet-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: var(--wallet-color, #00ff88);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .wallet-btn:hover:not(:disabled)::before {
          opacity: 0.1;
        }

        .wallet-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wallet-btn.connecting {
          border-color: var(--wallet-color, #00ff88);
          animation: pulse-border 1s ease-in-out infinite;
        }

        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(0, 255, 136, 0); }
        }

        .wallet-icon {
          font-size: 32px;
          position: relative;
          z-index: 1;
        }

        .wallet-btn.small .wallet-icon {
          font-size: 24px;
        }

        .wallet-name {
          font-size: 0.85rem;
          color: #fff;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }

        .wallet-btn.small .wallet-name {
          font-size: 0.75rem;
        }

        .connecting-spinner {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 16px;
          animation: spin 1s linear infinite;
          color: var(--wallet-color, #00ff88);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .gate-footer {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .gate-footer p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
          margin: 0 0 12px 0;
        }

        .security-badges {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .security-badges span {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 12px;
          border-radius: 20px;
        }

        .gate-info {
          margin-top: 25px;
        }

        .gate-info p {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
        }

        .gate-info a {
          color: #00ff88;
          text-decoration: none;
          font-weight: 500;
        }

        .gate-info a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .wallet-gate {
            padding: 15px;
          }

          .wallet-gate-box {
            padding: 20px;
          }

          .wallet-gate-logo h1 {
            font-size: 2rem;
          }

          .logo-icon {
            font-size: 48px;
          }

          .lock-icon {
            font-size: 36px;
          }

          .gate-header h2 {
            font-size: 1.25rem;
          }

          .wallet-grid {
            grid-template-columns: 1fr 1fr;
          }

          .wallet-grid.small {
            grid-template-columns: repeat(2, 1fr);
          }

          .wallet-btn {
            padding: 14px 10px;
          }

          .wallet-icon {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  )
}
