
import { useState, useEffect, useRef, useCallback } from 'react';
import CandlestickChart from './CandlestickChart';
import { formatApiError } from '../lib/errorHandling';
import { subscribeToTradeUpdates, saveTradeHistory } from '../lib/firebase';
import Toast from './Toast.jsx';

// ... constants

export default function Trade({ isOpen, onClose }) {
    const [currentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser') || '{}'));
    const [toast, setToast] = useState({ message: '', type: '' });
    // ... other state variables

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // ... useEffect hooks

    const startTrade = (direction) => {
        try {
            const amount = parseFloat(tradeAmount);
            if (!selectedLevel || !amount || amount <= 0) {
                showToast('Please enter a valid trade amount for the selected level.', 'error');
                return;
            }

            // Assuming a balance check would happen here
            // if (amount > currentUser.balance) {
            //     showToast('Insufficient balance.', 'error');
            //     return;
            // }

            const tradeId = 'trade_' + Date.now();
            setActiveTradeId(tradeId);
            setIsTrading(true);
            setTradeDirection(direction);
            setEntryPrice(currentPrice);
            setTradeResult(null); // Clear previous result
            showToast('Trade started! Good luck!', 'success');

        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    const handleTradeComplete = useCallback(async () => {
        try {
            if (!isTrading || entryPrice === null) return;

            let result;
            const finalPrice = currentPrice;

            if (forcedOutcome) {
                result = forcedOutcome === 'win';
            } else {
                if (tradeDirection === 'up') {
                    result = finalPrice > entryPrice;
                } else {
                    result = finalPrice < entryPrice;
                }
            }

            const profit = result ? (selectedLevel.profit / 100) * parseFloat(tradeAmount) : -parseFloat(tradeAmount);

            const tradeRecord = {
                userId: currentUser.id,
                tradeId: activeTradeId,
                pair: selectedPair.symbol,
                amount: parseFloat(tradeAmount),
                profit,
                won: result,
                entryPrice,
                finalPrice,
                timestamp: Date.now(),
            };

            await saveTradeHistory(tradeRecord);

            setTradeResult({ won: result, profit });
            showToast(result ? `You won $${profit.toFixed(2)}!` : 'Trade lost.', result ? 'success' : 'error');

        } catch (error) {
            showToast(formatApiError(error), 'error');
        } finally {
            setIsTrading(false);
            setActiveTradeId(null);
            setForcedOutcome(null);
            setEntryPrice(null);
            setTradeDirection(null);
        }
    }, [isTrading, entryPrice, currentPrice, forcedOutcome, tradeDirection, selectedLevel, tradeAmount, activeTradeId, currentUser, selectedPair]);

    if (!isOpen) return null;

    return (
        <div className="trade-modal-overlay" onClick={onClose}>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            <div className="trade-modal" onClick={e => e.stopPropagation()}>
                {/* ... rest of the component ... */}
            </div>
        </div>
    );
}
