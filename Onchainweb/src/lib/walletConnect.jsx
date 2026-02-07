
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi';
import { mainnet, bsc, polygon, arbitrum, optimism, avalanche, fantom } from 'wagmi/chains';
import { WALLET_CONNECTORS, SUPPORTED_CHAINS } from '../config/constants';
import { formatApiError } from './errorHandling';
import { saveWalletState, loadWalletState, clearWalletState } from '../services/walletStateService';
import Toast from '../components/Toast';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const metadata = {
  name: 'OnchainWeb',
  description: 'Web3 Trading Platform',
  url: 'https://onchainweb.app',
  icons: ['https://onchainweb.app/logo.png']
};

const chains = [mainnet, bsc, polygon, arbitrum, optimism, avalanche, fantom];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });

const UniversalWalletContext = createContext();

const WalletProvider = ({ children }) => {
    // Get chain directly from useAccount
    const { address, isConnected, connector, isReconnecting, chain } = useAccount();
    const [toast, setToast] = useState({ message: '', type: '' });

    const showToast = (message, type = 'info') => setToast({ message, type });

    const { connect, connectors, isLoading: isConnecting } = useConnect({
        onSuccess: () => showToast('Wallet connected!', 'success'),
        onError: (error) => showToast(formatApiError(error), 'error'),
    });

    const { disconnect, isLoading: isDisconnecting } = useDisconnect({
        onSuccess: () => showToast('Wallet disconnected.', 'info'),
        onError: (error) => showToast(formatApiError(error), 'error'),
    });

    // Auto-reconnect on initial load
    useEffect(() => {
        const autoConnect = async () => {
            const savedState = loadWalletState();
            if (savedState?.connectorId && !isConnected) {
                const connector = connectors.find(c => c.id === savedState.connectorId);
                if (connector) {
                    try {
                        await connect({ connector });
                    } catch (e) {
                        // If auto-connect fails, clear state to prevent loops
                        clearWalletState();
                    }
                }
            }
        };
        autoConnect();
        // We only want this to run once on mount, connectors might change but initial check is enough.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectors, isConnected]);

    // Persist or clear connection state
    useEffect(() => {
        if (isConnected && address && chain && connector) {
            saveWalletState({ address, chainId: chain.id, connectorId: connector.id });
        } else {
            clearWalletState();
        }
    }, [isConnected, address, chain, connector]);

    const contextValue = useMemo(() => ({
        isConnected,
        address,
        chainId: chain?.id,
        connectorType: connector?.id,
        loading: isConnecting || isDisconnecting || isReconnecting,
        connectWallet: connect, // Directly pass the connect function
        disconnectWallet: disconnect, // Directly pass the disconnect function
        supportedChains: SUPPORTED_CHAINS,
        availableWallets: connectors.map(c => ({
            id: c.id,
            name: c.name,
            icon: WALLET_CONNECTORS[c.id.toUpperCase()]?.icon || '/default-wallet.svg',
            type: c.id === 'walletConnect' ? 'walletconnect' : 'injected'
        }))
    }), [isConnected, address, chain, connector, isConnecting, isDisconnecting, isReconnecting, connect, disconnect, connectors]);

    return (
        <UniversalWalletContext.Provider value={contextValue}>
            {children}
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
        </UniversalWalletContext.Provider>
    );
}

export const UniversalWalletProvider = ({ children }) => (
    <WagmiProvider config={wagmiConfig}>
        <WalletProvider>
            {children}
        </WalletProvider>
    </WagmiProvider>
);

export const useUniversalWallet = () => React.useContext(UniversalWalletContext);
