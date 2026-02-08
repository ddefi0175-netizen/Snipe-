
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUniversalWallet } from '../lib/walletConnect';
import UniversalWalletModal from './UniversalWalletModal';

// Debug reference for linter
const _debugUnused_Header = (ctx) => { if (typeof console !== 'undefined') console.debug('header-unused', ctx); };
_debugUnused_Header({ Link, UniversalWalletModal });

export default function Header() {
    const { isConnected, address, disconnectWallet } = useUniversalWallet();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConnect = () => {
        setIsModalOpen(true);
    };

    const handleDisconnect = () => {
        disconnectWallet();
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <header className="header">
            <div className="logo">
                <Link to="/">Snipe</Link>
            </div>
            <nav className="nav-links">
                <Link to="/trade">Trade</Link>
                <Link to="/wallet">Wallet</Link>
                <Link to="/admin">Admin</Link>
            </nav>
            <div className="wallet-connector">
                {isConnected ? (
                    <div className="wallet-info">
                        <span className="address">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                        <button onClick={handleDisconnect} className="disconnect-btn">Disconnect</button>
                    </div>
                ) : (
                    <button onClick={handleConnect} className="connect-btn">Connect Wallet</button>
                )}
            </div>
            {isModalOpen && <UniversalWalletModal isOpen={isModalOpen} onClose={closeModal} />}
        </header>
    );
}
