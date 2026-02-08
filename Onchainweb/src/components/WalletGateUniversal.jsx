/**
 * Universal Web3 Wallet Gate
 *
 * Integrates with UniversalWalletProvider for:
 * - Multiple wallet strategies (injected + WalletConnect)
 * - Mobile/Desktop/In-app browser support
 * - Graceful fallback when no provider
 * - Open access option (browse before connect)
 * - Cross-platform session consistency
 */

/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { useUniversalWallet, WALLET_CONNECTORS, detectEnvironment, detectAvailableWallets } from '../lib/walletConnect.jsx'
import { userAPI } from '../lib/api'
import { autoRegisterUser } from '../services/userService.js'

export default function WalletGate({ onConnect, children, allowOpenAccess = false }) {
    const wallet = useUniversalWallet()
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState('')
    const [selectedWallet, setSelectedWallet] = useState(null)
    const [showAllWallets, setShowAllWallets] = useState(false)
    const [environment, setEnvironment] = useState(null)
    const [availableWallets, setAvailableWallets] = useState([])
    const [skipGate, setSkipGate] = useState(false)

    // Detect environment and available wallets
    useEffect(() => {
        const env = detectEnvironment()
        const wallets = detectAvailableWallets()
        setEnvironment(env)
        setAvailableWallets(wallets)

        // Check for open access flag
        if (allowOpenAccess && localStorage.getItem('openAccessMode') === 'true') {
            setSkipGate(true)
        }
    }, [allowOpenAccess])

    // Register user in backend and Firebase
    const registerUserInBackend = async (address, walletType) => {
        try {
            console.log('Registering user in backend:', address, walletType)
            const existingProfile = localStorage.getItem('userProfile')
            const profileData = existingProfile ? JSON.parse(existingProfile) : {}

            // Register in Firebase (primary)
            const firebaseUser = await autoRegisterUser(address, {
                username: profileData.username || `User_${address.substring(2, 8)}`,
                email: profileData.email || null,
                walletType: walletType
            })

            console.log('User registered in Firebase:', firebaseUser)

            // Also register in legacy backend (if available)
            // Legacy API backend is the deprecated MongoDB/Express system
            try {
                const user = await userAPI.loginByWallet(
                    address,
                    profileData.username || `User_${address.substring(2, 8)}`,
                    profileData.email || '',
                    walletType
                )

                if (user) {
                    console.log('User registered in legacy backend:', user)
                    localStorage.setItem('backendUserId', user._id)
                    localStorage.setItem('backendUser', JSON.stringify(user))
                    if (user.userId) {
                        localStorage.setItem('realAccountId', user.userId)
                        const updatedProfile = { ...profileData, userId: user.userId, wallet: address, walletType }
                        localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
                    }
                }
            } catch (legacyError) {
                console.warn('Legacy API backend registration failed (non-critical):', legacyError.message)
            }

            return firebaseUser
        } catch (error) {
            console.error('Failed to register user:', error)
            return null
        }
    }

    // Handle wallet connection
    const handleConnect = async (walletId) => {
        setSelectedWallet(walletId)
        setIsConnecting(true)
        setError('')

        try {
            const result = await wallet.connect(walletId)

            // Register in backend
            await registerUserInBackend(result.address, walletId)

            if (onConnect) {
                onConnect(result.address)
            }

            // Connection successful - wallet state will update and children will render
            // No need to reload, React will re-render automatically
            console.log('[WalletGate] Connection successful:', result.address)

        } catch (err) {
            if (err.message !== 'REDIRECT_TO_WALLET') {
                setError(err.message || 'Connection failed. Please try again.')
            }
        } finally {
            setIsConnecting(false)
            setSelectedWallet(null)
        }
    }

    // Enable open access mode
    const enableOpenAccess = () => {
        localStorage.setItem('openAccessMode', 'true')
        setSkipGate(true)
    }

    const popularWallets = availableWallets.filter(w => w.popular)
    const otherWallets = availableWallets.filter(w => !w.popular)

    // If connected or in open access mode, show app
    if (wallet.isConnected || skipGate) {
        return children
    }

    return (
        <div className="wg-container">
            <div className="wg-bg-overlay" />

            <div className="wg-content">
                {/* Logo & Branding */}
                <div className="wg-logo">
                    <div className="wg-logo-glow" />
                    <span className="wg-logo-icon">🔗</span>
                    <h1>OnchainWeb</h1>
                    <p className="wg-tagline">Decentralized Trading Platform</p>
                </div>

                {/* Connection Box */}
                <div className="wg-box">
                    <div className="wg-header">
                        <span className="wg-lock">🔒</span>
                        <h2>Connect Your Wallet</h2>
                        <p>
                            {environment?.isMobile
                                ? 'Tap your wallet to connect'
                                : 'Choose your preferred wallet'}
                        </p>
                    </div>

                    {/* Environment Info */}
                    {environment && (
                        <div className="wg-env-badge">
                            {environment.isMobile ? '📱' : '💻'}
                            {environment.isWalletBrowser && ' In-App Browser'}
                            {!environment.hasInjectedProvider && !environment.isMobile && ' No wallet detected'}
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="wg-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Wallet List */}
                    <div className="wg-wallets">
                        <div className="wg-section">
                            <h3>Popular</h3>
                            <div className="wg-grid">
                                {popularWallets.map(w => (
                                    <button
                                        key={w.id}
                                        className={`wg-wallet-btn ${selectedWallet === w.id ? 'connecting' : ''}`}
                                        onClick={() => handleConnect(w.id)}
                                        disabled={isConnecting}
                                        style={{ '--wallet-color': w.color }}
                                    >
                                        <span className="wg-wallet-icon">{w.icon}</span>
                                        <span className="wg-wallet-name">{w.name}</span>
                                        <span className={`wg-wallet-status ${w.installed ? 'installed' : ''}`}>
                                            {w.type === 'walletconnect' ? 'QR Code' : (w.installed ? '✓ Installed' : (environment?.isMobile ? 'Open App' : 'Get'))}
                                        </span>
                                        {selectedWallet === w.id && isConnecting && <div className="wg-spinner" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* More Wallets */}
                        {showAllWallets && (
                            <div className="wg-section">
                                <h3>More Wallets</h3>
                                <div className="wg-grid small">
                                    {otherWallets.map(w => (
                                        <button
                                            key={w.id}
                                            className={`wg-wallet-btn small ${selectedWallet === w.id ? 'connecting' : ''}`}
                                            onClick={() => handleConnect(w.id)}
                                            disabled={isConnecting}
                                            style={{ '--wallet-color': w.color }}
                                        >
                                            <span className="wg-wallet-icon">{w.icon}</span>
                                            <span className="wg-wallet-name">{w.name}</span>
                                            {selectedWallet === w.id && isConnecting && <div className="wg-spinner" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!showAllWallets && otherWallets.length > 0 && (
                            <button className="wg-show-more" onClick={() => setShowAllWallets(true)}>
                                Show {otherWallets.length} more wallets
                            </button>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="wg-footer">
                        <p>🔐 Your keys, your crypto. Non-custodial & secure.</p>
                        <div className="wg-badges">
                            <span>🛡️ Non-Custodial</span>
                            <span>🔒 Encrypted</span>
                            <span>✓ Audited</span>
                        </div>
                    </div>
                </div>

                {/* Open Access Link */}
                {allowOpenAccess && (
                    <div className="wg-open-access">
                        <button onClick={enableOpenAccess}>
                            Browse without wallet →
                        </button>
                    </div>
                )}

                {/* Help Link */}
                <div className="wg-help">
                    <p>
                        New to Web3?{' '}
                        <a href="https://ethereum.org/wallets/find-wallet" target="_blank" rel="noopener noreferrer">
                            Learn about wallets →
                        </a>
                    </p>
                </div>
            </div>

            <style>{`
        .wg-container {
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

        .wg-bg-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 20%, rgba(0, 255, 136, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(136, 0, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 136, 255, 0.05) 0%, transparent 70%);
          animation: wg-pulse 8s ease-in-out infinite;
        }

        @keyframes wg-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .wg-content {
          position: relative;
          z-index: 1;
          max-width: 480px;
          width: 100%;
          text-align: center;
        }

        .wg-logo {
          margin-bottom: 30px;
          position: relative;
        }

        .wg-logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: wg-glow 2s ease-in-out infinite;
        }

        @keyframes wg-glow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }

        .wg-logo-icon {
          font-size: 64px;
          display: block;
          margin-bottom: 15px;
          filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.5));
          position: relative;
          z-index: 1;
        }

        .wg-logo h1 {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: 2px;
        }

        .wg-tagline {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin-top: 8px;
        }

        .wg-box {
          background: rgba(20, 20, 35, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 30px;
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .wg-header {
          margin-bottom: 24px;
        }

        .wg-lock {
          font-size: 32px;
          display: block;
          margin-bottom: 12px;
        }

        .wg-header h2 {
          margin: 0 0 8px;
          font-size: 1.5rem;
          color: #fff;
        }

        .wg-header p {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .wg-env-badge {
          padding: 8px 16px;
          background: rgba(59, 153, 252, 0.1);
          border-radius: 8px;
          color: #3B99FC;
          font-size: 12px;
          margin-bottom: 16px;
        }

        .wg-error {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #f87171;
          font-size: 14px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wg-wallets {
          margin-bottom: 20px;
        }

        .wg-section {
          margin-bottom: 16px;
        }

        .wg-section h3 {
          font-size: 11px;
          font-weight: 500;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 10px 4px;
          text-align: left;
        }

        .wg-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .wg-grid.small {
          grid-template-columns: repeat(3, 1fr);
        }

        .wg-wallet-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .wg-wallet-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--wallet-color, rgba(255, 255, 255, 0.2));
          transform: translateY(-2px);
        }

        .wg-wallet-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wg-wallet-btn.small {
          padding: 10px 8px;
          gap: 4px;
        }

        .wg-wallet-btn.connecting {
          border-color: var(--wallet-color);
          background: rgba(var(--wallet-color), 0.1);
        }

        .wg-wallet-icon {
          font-size: 28px;
        }

        .wg-wallet-btn.small .wg-wallet-icon {
          font-size: 20px;
        }

        .wg-wallet-name {
          font-size: 12px;
          color: #fff;
          font-weight: 500;
        }

        .wg-wallet-btn.small .wg-wallet-name {
          font-size: 10px;
        }

        .wg-wallet-status {
          font-size: 9px;
          color: #666;
        }

        .wg-wallet-status.installed {
          color: #10b981;
        }

        .wg-spinner {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: var(--wallet-color, #fff);
          border-radius: 50%;
          animation: wg-spin 0.8s linear infinite;
        }

        @keyframes wg-spin {
          to { transform: rotate(360deg); }
        }

        .wg-show-more {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1px dashed rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          color: #888;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .wg-show-more:hover {
          border-color: rgba(255, 255, 255, 0.3);
          color: #fff;
        }

        .wg-footer {
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .wg-footer p {
          margin: 0 0 12px;
          font-size: 12px;
          color: #888;
        }

        .wg-badges {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .wg-badges span {
          font-size: 11px;
          color: #666;
        }

        .wg-open-access {
          margin-top: 20px;
        }

        .wg-open-access button {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          cursor: pointer;
          padding: 8px 16px;
          transition: color 0.2s;
        }

        .wg-open-access button:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .wg-help {
          margin-top: 16px;
        }

        .wg-help p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }

        .wg-help a {
          color: #3B99FC;
          text-decoration: none;
        }

        .wg-help a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .wg-grid.small {
            grid-template-columns: repeat(2, 1fr);
          }

          .wg-box {
            padding: 24px 20px;
          }

          .wg-logo h1 {
            font-size: 2rem;
          }
        }
      `}</style>
        </div>
    )
}
