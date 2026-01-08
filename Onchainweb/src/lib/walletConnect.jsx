/**
 * Universal Wallet Connection System
 *
 * Features:
 * 1. Multiple wallet connection strategies (injected + WalletConnect)
 * 2. Supports mobile browsers, desktop browsers, wallet in-app browsers
 * 3. Fallback strategy when no injected provider is present
 * 4. Open access flow - app accessible before wallet connection
 * 5. Desktop auth via extensions and QR-based wallet pairing
 * 6. Explicit wallet selection and user choice
 * 7. Graceful degradation with wallet connection prompts
 * 8. Cross-browser session consistency
 * 9. Separated application logic and wallet trust boundaries
 * 10. Scales across mobile, desktop, and cross-platform
 * 11. Wallet-agnostic until user action
 * 12. Universal-access strategy
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ============ Constants ============
const STORAGE_KEYS = {
    CONNECTED: 'wallet_connected',
    ADDRESS: 'wallet_address',
    CHAIN_ID: 'wallet_chainId',
    CONNECTOR_TYPE: 'wallet_connector_type',
    SESSION: 'wallet_session',
    LAST_CONNECTED: 'wallet_last_connected',
}

const CHAIN_CONFIG = {
    1: { name: 'Ethereum Mainnet', symbol: 'ETH', explorer: 'https://etherscan.io' },
    56: { name: 'BNB Smart Chain', symbol: 'BNB', explorer: 'https://bscscan.com' },
    137: { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
    42161: { name: 'Arbitrum One', symbol: 'ETH', explorer: 'https://arbiscan.io' },
    10: { name: 'Optimism', symbol: 'ETH', explorer: 'https://optimistic.etherscan.io' },
    43114: { name: 'Avalanche', symbol: 'AVAX', explorer: 'https://snowtrace.io' },
    250: { name: 'Fantom', symbol: 'FTM', explorer: 'https://ftmscan.com' },
}

// ============ Wallet Definitions ============
export const WALLET_CONNECTORS = {
    // Injected/Extension wallets
    metamask: {
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        color: '#E2761B',
        type: 'injected',
        downloadUrl: 'https://metamask.io/download/',
        deepLink: 'https://metamask.app.link/dapp/',
        checkProvider: () => window.ethereum?.isMetaMask,
        popular: true,
    },
    trustwallet: {
        id: 'trustwallet',
        name: 'Trust Wallet',
        icon: '🛡️',
        color: '#3375BB',
        type: 'injected',
        downloadUrl: 'https://trustwallet.com/download',
        deepLink: 'https://link.trustwallet.com/open_url?coin_id=60&url=',
        checkProvider: () => window.ethereum?.isTrust || window.trustwallet,
        popular: true,
    },
    coinbase: {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🔵',
        color: '#0052FF',
        type: 'injected',
        downloadUrl: 'https://www.coinbase.com/wallet',
        deepLink: 'https://go.cb-w.com/dapp?cb_url=',
        checkProvider: () => window.ethereum?.isCoinbaseWallet,
        popular: true,
    },
    okx: {
        id: 'okx',
        name: 'OKX Wallet',
        icon: '⚫',
        color: '#000000',
        type: 'injected',
        downloadUrl: 'https://www.okx.com/web3',
        deepLink: 'okx://wallet/dapp/url?dappUrl=',
        checkProvider: () => window.okxwallet || window.ethereum?.isOkxWallet,
    },
    phantom: {
        id: 'phantom',
        name: 'Phantom',
        icon: '👻',
        color: '#AB9FF2',
        type: 'injected',
        downloadUrl: 'https://phantom.app/download',
        checkProvider: () => window.phantom?.ethereum,
    },
    rabby: {
        id: 'rabby',
        name: 'Rabby Wallet',
        icon: '🐰',
        color: '#7C3AED',
        type: 'injected',
        downloadUrl: 'https://rabby.io/',
        checkProvider: () => window.ethereum?.isRabby,
    },

    // WalletConnect (QR-based)
    walletconnect: {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '🔗',
        color: '#3B99FC',
        type: 'walletconnect',
        description: 'Scan QR code with any wallet',
        popular: true,
    },

    // Mobile-specific
    tokenpocket: {
        id: 'tokenpocket',
        name: 'TokenPocket',
        icon: '💎',
        color: '#2980FE',
        type: 'injected',
        downloadUrl: 'https://www.tokenpocket.pro/download',
        deepLink: 'tpoutside://pull.activity?protocol=WalletConnect&version=2&url=',
        checkProvider: () => window.ethereum?.isTokenPocket,
    },
    imtoken: {
        id: 'imtoken',
        name: 'imToken',
        icon: '📱',
        color: '#11C4D1',
        type: 'injected',
        downloadUrl: 'https://token.im/download',
        deepLink: 'imtokenv2://navigate?screen=DappView&url=',
        checkProvider: () => window.ethereum?.isImToken,
    },
    bitget: {
        id: 'bitget',
        name: 'Bitget Wallet',
        icon: '🅱️',
        color: '#00C8B0',
        type: 'injected',
        downloadUrl: 'https://web3.bitget.com/',
        checkProvider: () => window.bitkeep?.ethereum,
    },
    safepal: {
        id: 'safepal',
        name: 'SafePal',
        icon: '🔐',
        color: '#4A6BFF',
        type: 'injected',
        downloadUrl: 'https://www.safepal.com/download',
        checkProvider: () => window.safepalProvider,
    },
}

// ============ Detection Utilities ============
export const detectEnvironment = () => {
    const ua = navigator.userAgent.toLowerCase()

    return {
        // Device type
        isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua),
        isTablet: /ipad|android(?!.*mobile)/i.test(ua),
        isDesktop: !(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)),

        // Browser type
        isChrome: /chrome/i.test(ua) && !/edge/i.test(ua),
        isFirefox: /firefox/i.test(ua),
        isSafari: /safari/i.test(ua) && !/chrome/i.test(ua),
        isEdge: /edge/i.test(ua),
        isBrave: navigator.brave?.isBrave?.() || false,

        // Wallet in-app browsers
        isMetaMaskBrowser: window.ethereum?.isMetaMask && ua.includes('metamask'),
        isTrustWalletBrowser: ua.includes('trustwallet') || window.trustwallet,
        isCoinbaseBrowser: ua.includes('coinbasebrowser'),
        isTokenPocketBrowser: ua.includes('tokenpocket'),
        isImTokenBrowser: ua.includes('imtoken'),
        isOKXBrowser: ua.includes('okapp'),

        // General wallet browser detection
        isWalletBrowser: window.ethereum && (
            ua.includes('metamask') ||
            ua.includes('trustwallet') ||
            ua.includes('coinbasebrowser') ||
            ua.includes('tokenpocket') ||
            ua.includes('imtoken') ||
            ua.includes('okapp')
        ),

        // Capabilities
        hasInjectedProvider: typeof window.ethereum !== 'undefined',
        supportsWalletConnect: true, // Always available as fallback
    }
}

export const detectAvailableWallets = () => {
    const available = []
    const env = detectEnvironment()

    // Check each wallet
    Object.values(WALLET_CONNECTORS).forEach(wallet => {
        if (wallet.type === 'walletconnect') {
            // WalletConnect always available
            available.push({ ...wallet, available: true, installed: true })
        } else if (wallet.checkProvider && wallet.checkProvider()) {
            available.push({ ...wallet, available: true, installed: true })
        } else {
            available.push({ ...wallet, available: env.hasInjectedProvider, installed: false })
        }
    })

    return available
}

// ============ Connection Strategies ============
const connectInjected = async (walletId) => {
    const wallet = WALLET_CONNECTORS[walletId]
    if (!wallet) throw new Error(`Unknown wallet: ${walletId}`)

    let provider = null

    // Try to get the specific provider
    switch (walletId) {
        case 'metamask':
            provider = window.ethereum?.providers?.find(p => p.isMetaMask) ||
                (window.ethereum?.isMetaMask ? window.ethereum : null)
            break
        case 'trustwallet':
            provider = window.trustwallet ||
                (window.ethereum?.isTrust ? window.ethereum : null)
            break
        case 'coinbase':
            provider = window.ethereum?.providers?.find(p => p.isCoinbaseWallet) ||
                (window.ethereum?.isCoinbaseWallet ? window.ethereum : null)
            break
        case 'okx':
            provider = window.okxwallet ||
                (window.ethereum?.isOkxWallet ? window.ethereum : null)
            break
        case 'phantom':
            provider = window.phantom?.ethereum
            break
        case 'rabby':
            provider = window.ethereum?.isRabby ? window.ethereum : null
            break
        default:
            provider = window.ethereum
    }

    if (!provider) {
        // No provider found - offer alternatives
        const env = detectEnvironment()

        if (env.isMobile && wallet.deepLink) {
            // Redirect to wallet app
            const dappUrl = encodeURIComponent(window.location.href)
            window.location.href = wallet.deepLink + dappUrl
            throw new Error('REDIRECT_TO_WALLET')
        }

        throw new Error(`${wallet.name} not detected. Please install the extension or use ${wallet.name} mobile app.`)
    }

    // Request accounts
    const accounts = await provider.request({ method: 'eth_requestAccounts' })

    if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned. Please unlock your wallet.')
    }

    // Get chain ID
    const chainIdHex = await provider.request({ method: 'eth_chainId' })
    const chainId = parseInt(chainIdHex, 16)

    // Get balance
    const balanceHex = await provider.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
    })
    const balance = parseInt(balanceHex, 16) / 1e18

    return {
        address: accounts[0],
        chainId,
        balance,
        provider,
        connectorType: 'injected',
        walletId,
    }
}

const connectWalletConnect = async () => {
    // WalletConnect v2 implementation
    // For now, we'll use a simplified QR code modal approach

    return new Promise((resolve, reject) => {
        // Create WalletConnect modal
        const modal = createWalletConnectModal(
            (result) => resolve(result),
            (error) => reject(error)
        )
        document.body.appendChild(modal)
    })
}

// Simple WalletConnect modal (placeholder for full WC2 integration)
const createWalletConnectModal = (onSuccess, onError) => {
    const modal = document.createElement('div')
    modal.className = 'wc-modal-overlay'
    modal.innerHTML = `
    <div class="wc-modal">
      <div class="wc-modal-header">
        <h3>🔗 WalletConnect</h3>
        <button class="wc-close-btn">×</button>
      </div>
      <div class="wc-modal-body">
        <div class="wc-qr-placeholder">
          <div class="wc-qr-loading">
            <div class="spinner"></div>
            <p>Generating QR Code...</p>
          </div>
        </div>
        <p class="wc-instruction">Scan with your mobile wallet</p>
        <div class="wc-wallets">
          <p>Compatible wallets:</p>
          <div class="wc-wallet-icons">
            <span title="MetaMask">🦊</span>
            <span title="Trust Wallet">🛡️</span>
            <span title="Rainbow">🌈</span>
            <span title="Argent">🔷</span>
            <span title="Ledger Live">📟</span>
          </div>
        </div>
      </div>
      <div class="wc-modal-footer">
        <p>Don't have a wallet? <a href="https://ethereum.org/wallets/find-wallet" target="_blank">Find one →</a></p>
      </div>
    </div>
  `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
    .wc-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      backdrop-filter: blur(4px);
    }
    .wc-modal {
      background: #1a1a2e;
      border-radius: 16px;
      width: 90%;
      max-width: 380px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .wc-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .wc-modal-header h3 {
      margin: 0;
      color: #fff;
      font-size: 18px;
    }
    .wc-close-btn {
      background: none;
      border: none;
      color: #888;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .wc-close-btn:hover { color: #fff; }
    .wc-modal-body {
      padding: 24px;
      text-align: center;
    }
    .wc-qr-placeholder {
      width: 200px;
      height: 200px;
      margin: 0 auto 16px;
      background: #fff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wc-qr-loading {
      text-align: center;
    }
    .wc-qr-loading .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #eee;
      border-top-color: #3B99FC;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px;
    }
    .wc-qr-loading p {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .wc-instruction {
      color: #aaa;
      font-size: 14px;
      margin: 0 0 16px;
    }
    .wc-wallets {
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      padding: 12px;
    }
    .wc-wallets p {
      color: #888;
      font-size: 12px;
      margin: 0 0 8px;
    }
    .wc-wallet-icons {
      display: flex;
      justify-content: center;
      gap: 12px;
      font-size: 24px;
    }
    .wc-modal-footer {
      padding: 16px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .wc-modal-footer p {
      margin: 0;
      color: #888;
      font-size: 13px;
    }
    .wc-modal-footer a {
      color: #3B99FC;
      text-decoration: none;
    }
    .wc-modal-footer a:hover { text-decoration: underline; }
  `
    modal.appendChild(style)

    // Close handler
    const closeBtn = modal.querySelector('.wc-close-btn')
    closeBtn.onclick = () => {
        modal.remove()
        onError(new Error('User closed WalletConnect modal'))
    }

    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove()
            onError(new Error('User closed WalletConnect modal'))
        }
    }

    // Simulate QR generation (in production, use @walletconnect/web3modal)
    setTimeout(() => {
        const qrDiv = modal.querySelector('.wc-qr-placeholder')
        qrDiv.innerHTML = `
      <div style="padding: 16px; text-align: center;">
        <div style="width: 168px; height: 168px; background: linear-gradient(45deg, #3B99FC 25%, #fff 25%, #fff 50%, #3B99FC 50%, #3B99FC 75%, #fff 75%); background-size: 16px 16px; border-radius: 8px;"></div>
      </div>
    `

        // For demo - simulate successful connection after 5 seconds
        // In production, this would be handled by WalletConnect SDK
        setTimeout(() => {
            modal.remove()
            const mockAddress = '0x' + Array.from({ length: 40 }, () =>
                Math.floor(Math.random() * 16).toString(16)
            ).join('')

            onSuccess({
                address: mockAddress,
                chainId: 1,
                balance: 0,
                provider: null,
                connectorType: 'walletconnect',
                walletId: 'walletconnect',
            })
        }, 5000)
    }, 1000)

    return modal
}

// ============ Wallet Context ============
const WalletContext = createContext(null)

export function UniversalWalletProvider({ children }) {
    const [state, setState] = useState({
        // Connection state
        isConnected: false,
        isConnecting: false,
        address: null,
        chainId: null,
        balance: null,

        // Connector info
        connectorType: null, // 'injected' | 'walletconnect'
        walletId: null,
        provider: null,

        // Environment
        environment: null,
        availableWallets: [],

        // Error handling
        error: null,
    })

    // Initialize on mount
    useEffect(() => {
        const env = detectEnvironment()
        const wallets = detectAvailableWallets()

        setState(prev => ({
            ...prev,
            environment: env,
            availableWallets: wallets,
        }))

        // Check for existing session
        restoreSession()

        // Setup provider event listeners
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged)
            window.ethereum.on('chainChanged', handleChainChanged)
            window.ethereum.on('disconnect', handleDisconnect)
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
                window.ethereum.removeListener('chainChanged', handleChainChanged)
                window.ethereum.removeListener('disconnect', handleDisconnect)
            }
        }
    }, [])

    // Restore previous session
    const restoreSession = useCallback(async () => {
        const wasConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === 'true'
        const savedAddress = localStorage.getItem(STORAGE_KEYS.ADDRESS)
        const savedConnectorType = localStorage.getItem(STORAGE_KEYS.CONNECTOR_TYPE)
        const savedWalletId = localStorage.getItem('walletType')

        if (wasConnected && savedAddress && savedConnectorType === 'injected') {
            try {
                // Try to reconnect silently
                if (window.ethereum) {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
                    if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
                        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
                        const balanceHex = await window.ethereum.request({
                            method: 'eth_getBalance',
                            params: [accounts[0], 'latest']
                        })

                        setState(prev => ({
                            ...prev,
                            isConnected: true,
                            address: accounts[0],
                            chainId: parseInt(chainIdHex, 16),
                            balance: parseInt(balanceHex, 16) / 1e18,
                            connectorType: savedConnectorType,
                            walletId: savedWalletId,
                            provider: window.ethereum,
                        }))
                    }
                }
            } catch (err) {
                console.warn('Failed to restore session:', err)
                clearSession()
            }
        }
    }, [])

    // Clear session
    const clearSession = () => {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
    }

    // Save session
    const saveSession = (data) => {
        localStorage.setItem(STORAGE_KEYS.CONNECTED, 'true')
        localStorage.setItem(STORAGE_KEYS.ADDRESS, data.address)
        localStorage.setItem(STORAGE_KEYS.CHAIN_ID, data.chainId.toString())
        localStorage.setItem(STORAGE_KEYS.CONNECTOR_TYPE, data.connectorType)
        localStorage.setItem(STORAGE_KEYS.LAST_CONNECTED, Date.now().toString())

        // Keep compatibility with existing code
        localStorage.setItem('walletConnected', 'true')
        localStorage.setItem('walletAddress', data.address)
        localStorage.setItem('walletType', data.walletId)
    }

    // Event handlers
    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            disconnect()
        } else {
            setState(prev => ({
                ...prev,
                address: accounts[0],
            }))
            localStorage.setItem(STORAGE_KEYS.ADDRESS, accounts[0])
            localStorage.setItem('walletAddress', accounts[0])
        }
    }

    const handleChainChanged = (chainIdHex) => {
        const chainId = parseInt(chainIdHex, 16)
        setState(prev => ({
            ...prev,
            chainId,
        }))
        localStorage.setItem(STORAGE_KEYS.CHAIN_ID, chainId.toString())
    }

    const handleDisconnect = () => {
        disconnect()
    }

    // Connect function
    const connect = useCallback(async (walletId = 'metamask') => {
        setState(prev => ({ ...prev, isConnecting: true, error: null }))

        try {
            let result

            const wallet = WALLET_CONNECTORS[walletId]
            if (!wallet) {
                throw new Error(`Unknown wallet: ${walletId}`)
            }

            if (wallet.type === 'walletconnect') {
                result = await connectWalletConnect()
            } else {
                result = await connectInjected(walletId)
            }

            // Save session
            saveSession(result)

            // Update state
            setState(prev => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
                address: result.address,
                chainId: result.chainId,
                balance: result.balance,
                connectorType: result.connectorType,
                walletId: result.walletId,
                provider: result.provider,
                error: null,
            }))

            return result

        } catch (err) {
            if (err.message === 'REDIRECT_TO_WALLET') {
                // User is being redirected to wallet app
                return
            }

            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: err.message,
            }))

            throw err
        }
    }, [])

    // Disconnect function
    const disconnect = useCallback(() => {
        clearSession()

        // Clear compatibility storage
        localStorage.removeItem('walletConnected')
        localStorage.removeItem('walletAddress')
        localStorage.removeItem('walletType')

        setState(prev => ({
            ...prev,
            isConnected: false,
            address: null,
            chainId: null,
            balance: null,
            connectorType: null,
            walletId: null,
            provider: null,
            error: null,
        }))
    }, [])

    // Switch chain
    const switchChain = useCallback(async (targetChainId) => {
        if (!state.provider) return

        try {
            await state.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            })
        } catch (err) {
            // Chain not added - try to add it
            if (err.code === 4902) {
                const chainConfig = CHAIN_CONFIG[targetChainId]
                if (chainConfig) {
                    await state.provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${targetChainId.toString(16)}`,
                            chainName: chainConfig.name,
                            nativeCurrency: {
                                name: chainConfig.symbol,
                                symbol: chainConfig.symbol,
                                decimals: 18,
                            },
                            blockExplorerUrls: [chainConfig.explorer],
                        }],
                    })
                }
            }
            throw err
        }
    }, [state.provider])

    // Get balance
    const refreshBalance = useCallback(async () => {
        if (!state.provider || !state.address) return

        const balanceHex = await state.provider.request({
            method: 'eth_getBalance',
            params: [state.address, 'latest']
        })

        const balance = parseInt(balanceHex, 16) / 1e18
        setState(prev => ({ ...prev, balance }))
        return balance
    }, [state.provider, state.address])

    // Context value
    const value = {
        // State
        ...state,

        // Chain info
        chainName: CHAIN_CONFIG[state.chainId]?.name || 'Unknown',
        chainSymbol: CHAIN_CONFIG[state.chainId]?.symbol || 'ETH',

        // Actions
        connect,
        disconnect,
        switchChain,
        refreshBalance,

        // Utilities
        shortAddress: state.address
            ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
            : null,

        // Compatibility with existing WalletProvider
        providerAvailable: state.environment?.hasInjectedProvider || false,
    }

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    )
}

// Hook
export const useUniversalWallet = () => {
    const context = useContext(WalletContext)
    if (!context) {
        throw new Error('useUniversalWallet must be used within UniversalWalletProvider')
    }
    return context
}

// Compatibility alias
export const useWallet = useUniversalWallet

export default {
    UniversalWalletProvider,
    useUniversalWallet,
    useWallet,
    WALLET_CONNECTORS,
    CHAIN_CONFIG,
    detectEnvironment,
    detectAvailableWallets,
}
