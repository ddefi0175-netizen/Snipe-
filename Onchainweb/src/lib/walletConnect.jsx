
/**
 * Universal & Legacy Wallet Connection System
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatWalletError } from './errorHandling';
import { autoRegisterUser } from '../services/walletService';
import { isFirebaseAvailable } from './firebase';

// ================= LEGACY IMPLEMENTATION =================

const STORAGE_KEYS = {
    CONNECTED: 'wallet_connected',
    ADDRESS: 'wallet_address',
    CHAIN_ID: 'wallet_chainId',
    CONNECTOR_TYPE: 'wallet_connector_type',
    SESSION: 'wallet_session',
    LAST_CONNECTED: 'wallet_last_connected',
};

const CHAIN_CONFIG = {
    1: { name: 'Ethereum Mainnet', symbol: 'ETH', explorer: 'https://etherscan.io' },
    56: { name: 'BNB Smart Chain', symbol: 'BNB', explorer: 'https://bscscan.com' },
    137: { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
    42161: { name: 'Arbitrum', symbol: 'ETH', explorer: 'https://arbiscan.io' },
    10: { name: 'Optimism', symbol: 'ETH', explorer: 'https://optimistic.etherscan.io' },
    43114: { name: 'Avalanche', symbol: 'AVAX', explorer: 'https://snowtrace.io' },
    250: { name: 'Fantom', symbol: 'FTM', explorer: 'https://ftmscan.com' },
};

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [wallet, setWallet] = useState(null);
    const [address, setAddress] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [connector, setConnector] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleConnect = useCallback(async (connector) => {
        try {
            setError(null);
            setLoading(true);
            const { address, chainId } = await connector.connect();
            if (isFirebaseAvailable) {
                await autoRegisterUser(address);
            }
            setWallet(connector.getProvider());
            setAddress(address);
            setChainId(chainId);
            setConnector(connector);
            localStorage.setItem(STORAGE_KEYS.CONNECTED, 'true');
            localStorage.setItem(STORAGE_KEYS.ADDRESS, address);
            localStorage.setItem(STORAGE_KEYS.CHAIN_ID, chainId);
            localStorage.setItem(STORAGE_KEYS.CONNECTOR_TYPE, connector.type);
        } catch (err) {
            setError(formatWalletError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDisconnect = useCallback(async () => {
        try {
            if (connector) {
                await connector.disconnect();
            }
        } catch (err) {
            console.error("Error during disconnect:", err);
        } finally {
            setWallet(null);
            setAddress(null);
            setChainId(null);
            setConnector(null);
            Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        }
    }, [connector]);

    useEffect(() => {
        const autoConnect = async () => {
            const wasConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === 'true';
            const connectorType = localStorage.getItem(STORAGE_KEYS.CONNECTOR_TYPE);
            if (wasConnected && connectorType) {
                // Dynamic connector import would go here
            }
            setLoading(false);
        };
        autoConnect();
    }, []);

    const contextValue = {
        wallet,
        address,
        chainId,
        connector,
        error,
        loading,
        connect: handleConnect,
        disconnect: handleDisconnect,
        chainConfig: CHAIN_CONFIG,
    };

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

// ================= UNIVERSAL IMPLEMENTATION =================

export const WALLET_CONNECTORS = {
  METAMASK: { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#E8831D' },
  WALLETCONNECT: { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', color: '#3B99FC' },
  COINBASE: { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', color: '#0052FF' },
  TRUST: { id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️', color: '#3375BB' },
  // Add other wallets here
};

export const detectEnvironment = () => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);
    const hasInjectedProvider = typeof window.ethereum !== 'undefined';
    const isWalletBrowser = hasInjectedProvider && (window.ethereum.isMetaMask || window.ethereum.isCoinbaseWallet || window.ethereum.isTrust);
    return { isMobile, hasInjectedProvider, isWalletBrowser, ua };
};

export const detectAvailableWallets = () => {
    const { hasInjectedProvider } = detectEnvironment();
    const wallets = [];
    if (hasInjectedProvider) {
        if (window.ethereum.isMetaMask) {
            wallets.push({ ...WALLET_CONNECTORS.METAMASK, installed: true, popular: true });
        }
        if (window.ethereum.isCoinbaseWallet) {
            wallets.push({ ...WALLET_CONNECTORS.COINBASE, installed: true, popular: true });
        }
         if (window.ethereum.isTrust) {
            wallets.push({ ...WALLET_CONNECTORS.TRUST, installed: true, popular: true });
        }
    }
    // Always add WalletConnect as a fallback
    wallets.push({ ...WALLET_CONNECTORS.WALLETCONNECT, type: 'walletconnect', popular: true });

    return wallets;
};

const UniversalWalletContext = createContext();

export const UniversalWalletProvider = ({ children }) => {
    // This would contain the logic for the universal wallet
    // For now, we'll provide a mock implementation
    const [isConnected, setIsConnected] = useState(false);

    const connect = async (walletId) => {
        console.log(`Connecting with ${walletId}`);
        // Mock connection logic
        return new Promise(resolve => {
            setTimeout(() => {
                setIsConnected(true);
                resolve({ address: '0x1234...5678' });
            }, 1000);
        });
    };
    
    const value = {
      isConnected,
      connect,
    }

    return (
        <UniversalWalletContext.Provider value={value}>
            {children}
        </UniversalWalletContext.Provider>
    );
};

export const useUniversalWallet = () => {
    const context = useContext(UniversalWalletContext);
    if (!context) {
        throw new Error('useUniversalWallet must be used within a UniversalWalletProvider');
    }
    return context;
};

