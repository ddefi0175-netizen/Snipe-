
import { useState, useEffect } from 'react';
import CandlestickChart from './CandlestickChart';
import { isFirebaseAvailable, getUser, saveUser, subscribeToFuturesPositions, saveFuturesPosition, closeFuturesPosition, subscribeToFuturesHistory } from '../lib/firebase';
import { formatApiError } from '../lib/errorHandling';
import Toast from './Toast.jsx';

// ...

export default function FuturesTrading({ isOpen, onClose }) {
    // ...
    const [toast, setToast] = useState({ message: '', type: '' });

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // ...

    if (!isOpen) return null;

    return (
        <div className="futures-modal">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            {/* ... */}
        </div>
    );
}

const OpenPositionForm = ({ userId, balance, prices, setBalance, showToast }) => {
    // Minimal state for open position form
    const [amount, setAmount] = useState('');

    const handleOpenPosition = async () => {
        try {
            const margin = parseFloat(amount);
            if (!margin || margin <= 0 || margin > balance) {
                showToast('Invalid margin amount', 'error');
                return;
            }

            // ...

            const newPosition = {
                id: 'pos_' + Date.now(),
                userId,
                margin,
                createdAt: Date.now(),
                status: 'open'
            };
            await saveFuturesPosition(userId, newPosition);
            const newBalance = balance - margin;
            await saveUser(userId, { balance: newBalance });
            setBalance(newBalance);
            setAmount('');
            showToast('Position opened successfully', 'success');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    // ...
};

const PositionsList = ({ positions, prices, userId, showToast }) => {
    // ...
        const calculatePnL = (pos) => {
            if (!pos) return 0;
            const current = pos.currentPrice || (prices?.[pos.pair] || 0);
            const entry = pos.entryPrice || pos.price || 0;
            return (current - entry) * (pos.size || 1);
        };

    const handleClosePosition = async (pos, pnl) => {
        try {
            await closeFuturesPosition(userId, pos, pnl);
            showToast('Position closed successfully', 'success');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    return (
        <div className="positions-list">
            {positions.map(pos => {
                const pnl = calculatePnL(pos);
                return (
                    <div key={pos.id} className="position-card">
                        {/* ... */}
                        <button onClick={() => handleClosePosition(pos, pnl)}>Close</button>
                    </div>
                );
            })}
        </div>
    );
};

// ...
