/**
 * Universal Wallet Connection Modal
 *
 * Features:
 * - Supports injected wallets + WalletConnect
 * - Works in mobile/desktop/in-app browsers
 * - Graceful fallback when no provider
 * - Open access - can browse app without wallet
 * - QR-based pairing for desktop
 * - Explicit wallet selection
 */

import React, { useState, useEffect } from 'react'
import { useUniversalWallet, WALLET_CONNECTORS, detectEnvironment, detectAvailableWallets } from '../lib/walletConnect.jsx'
import { userAPI } from '../lib/api'

export default function UniversalWalletModal({ isOpen, onClose, onConnect }) {
    const wallet = useUniversalWallet()
    const [selectedWallet, setSelectedWallet] = useState(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState('')
    const [showAllWallets, setShowAllWallets] = useState(false)
    const [environment, setEnvironment] = useState(null)
    const [availableWallets, setAvailableWallets] = useState([])

    useEffect(() => {
        if (isOpen) {
            const env = detectEnvironment()
            const wallets = detectAvailableWallets()
            setEnvironment(env)
            setAvailableWallets(wallets)
        }
    }, [isOpen])

    // Register user in backend
    const registerUserInBackend = async (address, walletType) => {
        try {
            const existingProfile = localStorage.getItem('userProfile')
            const profileData = existingProfile ? JSON.parse(existingProfile) : {}

            const user = await userAPI.loginByWallet(
                address,
                profileData.username || `User_${address.substring(2, 8)}`,
                profileData.email || '',
                walletType
            )

            if (user) {
                localStorage.setItem('backendUserId', user._id)
                localStorage.setItem('backendUser', JSON.stringify(user))
                if (user.userId) {
                    localStorage.setItem('realAccountId', user.userId)
                    const updatedProfile = { ...profileData, userId: user.userId, wallet: address, walletType }
                    localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
                }
            }
            return user
        } catch (error) {
            console.error('Failed to register user:', error)
            return null
        }
    }

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

            onClose()

        } catch (err) {
            if (err.message !== 'REDIRECT_TO_WALLET') {
                setError(err.message || 'Connection failed. Please try again.')
            }
        } finally {
            setIsConnecting(false)
            setSelectedWallet(null)
        }
    }

    const popularWallets = availableWallets.filter(w => w.popular)
    const otherWallets = availableWallets.filter(w => !w.popular)

    if (!isOpen) return null

    return (
        <div className="uwm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="uwm-modal">
                {/* Header */}
                <div className="uwm-header">
                    <div className="uwm-title">
                        <span className="uwm-icon">🔗</span>
                        <h2>Connect Wallet</h2>
                    </div>
                    <button className="uwm-close" onClick={onClose}>×</button>
                </div>

                {/* Environment Info */}
                {environment && (
                    <div className="uwm-env-info">
                        {environment.isMobile ? '📱 Mobile' : '💻 Desktop'}
                        {environment.isWalletBrowser && ' • In-App Browser'}
                        {!environment.hasInjectedProvider && !environment.isMobile && ' • No wallet detected'}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="uwm-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Wallet List */}
                <div className="uwm-wallets">
                    {/* Popular Wallets */}
                    <div className="uwm-section">
                        <h3>Popular</h3>
                        <div className="uwm-grid">
                            {popularWallets.map(w => (
                                <WalletButton
                                    key={w.id}
                                    wallet={w}
                                    isConnecting={isConnecting && selectedWallet === w.id}
                                    disabled={isConnecting}
                                    onClick={() => handleConnect(w.id)}
                                    environment={environment}
                                />
                            ))}
                        </div>
                    </div>

                    {/* More Wallets */}
                    {showAllWallets && (
                        <div className="uwm-section">
                            <h3>More Wallets</h3>
                            <div className="uwm-grid small">
                                {otherWallets.map(w => (
                                    <WalletButton
                                        key={w.id}
                                        wallet={w}
                                        isConnecting={isConnecting && selectedWallet === w.id}
                                        disabled={isConnecting}
                                        onClick={() => handleConnect(w.id)}
                                        environment={environment}
                                        small
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {!showAllWallets && otherWallets.length > 0 && (
                        <button className="uwm-show-more" onClick={() => setShowAllWallets(true)}>
                            Show {otherWallets.length} more wallets
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="uwm-footer">
                    <div className="uwm-security">
                        <span>🔐 Non-Custodial</span>
                        <span>🛡️ Secure</span>
                        <span>✓ No data stored</span>
                    </div>
                    <p>
                        New to Web3?{' '}
                        <a href="https://ethereum.org/wallets/find-wallet" target="_blank" rel="noopener noreferrer">
                            Learn about wallets →
                        </a>
                    </p>
                </div>
            </div>

            <style>{`
        .uwm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          padding: 20px;
        }

        .uwm-modal {
          background: linear-gradient(145deg, #1a1a2e 0%, #16162a 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .uwm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .uwm-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .uwm-icon {
          font-size: 24px;
        }

        .uwm-title h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #fff;
        }

        .uwm-close {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: #888;
          font-size: 24px;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .uwm-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .uwm-env-info {
          padding: 12px 24px;
          background: rgba(59, 153, 252, 0.1);
          color: #3B99FC;
          font-size: 13px;
          text-align: center;
        }

        .uwm-error {
          margin: 16px 24px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #f87171;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .uwm-wallets {
          padding: 16px 24px;
        }

        .uwm-section {
          margin-bottom: 20px;
        }

        .uwm-section h3 {
          font-size: 12px;
          font-weight: 500;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 12px 4px;
        }

        .uwm-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .uwm-grid.small {
          grid-template-columns: repeat(3, 1fr);
        }

        .uwm-wallet-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .uwm-wallet-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--wallet-color, rgba(255, 255, 255, 0.2));
          transform: translateY(-2px);
        }

        .uwm-wallet-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .uwm-wallet-btn.small {
          padding: 12px 8px;
          gap: 6px;
        }

        .uwm-wallet-btn.connecting {
          border-color: var(--wallet-color);
          background: rgba(var(--wallet-color-rgb), 0.1);
        }

        .uwm-wallet-icon {
          font-size: 28px;
          line-height: 1;
        }

        .uwm-wallet-btn.small .uwm-wallet-icon {
          font-size: 22px;
        }

        .uwm-wallet-name {
          font-size: 13px;
          color: #fff;
          font-weight: 500;
        }

        .uwm-wallet-btn.small .uwm-wallet-name {
          font-size: 11px;
        }

        .uwm-wallet-status {
          font-size: 10px;
          color: #888;
        }

        .uwm-wallet-status.installed {
          color: #10b981;
        }

        .uwm-spinner {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: var(--wallet-color, #fff);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .uwm-show-more {
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

        .uwm-show-more:hover {
          border-color: rgba(255, 255, 255, 0.3);
          color: #fff;
        }

        .uwm-footer {
          padding: 16px 24px 20px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .uwm-security {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .uwm-security span {
          font-size: 12px;
          color: #666;
        }

        .uwm-footer p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }

        .uwm-footer a {
          color: #3B99FC;
          text-decoration: none;
        }

        .uwm-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .uwm-modal {
            max-height: 85vh;
            border-radius: 20px 20px 0 0;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-width: none;
          }

          .uwm-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .uwm-grid.small {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
        </div>
    )
}

// Wallet Button Component
function WalletButton({ wallet, isConnecting, disabled, onClick, environment, small }) {
    const getStatus = () => {
        if (wallet.type === 'walletconnect') {
            return 'QR Code'
        }
        if (wallet.installed) {
            return 'Installed'
        }
        if (environment?.isMobile && wallet.deepLink) {
            return 'Open App'
        }
        return 'Not detected'
    }

    const status = getStatus()
    const statusClass = wallet.installed ? 'installed' : ''

    return (
        <button
            className={`uwm-wallet-btn ${small ? 'small' : ''} ${isConnecting ? 'connecting' : ''}`}
            onClick={onClick}
            disabled={disabled}
            style={{ '--wallet-color': wallet.color }}
        >
            <span className="uwm-wallet-icon">{wallet.icon}</span>
            <span className="uwm-wallet-name">{wallet.name}</span>
            <span className={`uwm-wallet-status ${statusClass}`}>{status}</span>
            {isConnecting && <div className="uwm-spinner" />}
        </button>
    )
}
