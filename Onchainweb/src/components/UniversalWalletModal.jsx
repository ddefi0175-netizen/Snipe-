
// React automatic JSX runtime in use — default import not required
import { useUniversalWallet } from '../lib/walletConnect';

export default function UniversalWalletModal({ isOpen, onClose }) {
    const { availableWallets, connectWallet, error } = useUniversalWallet();

    if (!isOpen) return null;

    const handleConnect = async (wallet) => {
        await connectWallet(wallet);
        if (!error) {
            onClose(); // Close modal on successful connection
        }
    };

    return (
        <div className="wallet-modal-overlay" onClick={onClose}>
            <div className="wallet-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Connect Wallet</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="wallet-list">
                    {availableWallets.map(wallet => (
                        <button key={wallet.id} onClick={() => handleConnect(wallet)} className="wallet-option">
                            <img src={wallet.icon} alt={`${wallet.name} logo`} width={40} height={40} />
                            <span>{wallet.name}</span>
                        </button>
                    ))}
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}
