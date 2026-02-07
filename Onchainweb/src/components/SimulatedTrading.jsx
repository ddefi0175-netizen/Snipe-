
import { useState, useEffect } from 'react';
import { formatApiError } from '../lib/errorHandling';
import Toast from './Toast.jsx';

// Simulated/Demo Trading - Practice with Virtual Money
export default function SimulatedTrading({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('trade');
    // ... other state variables
    const [toast, setToast] = useState({ message: '', type: '' });

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // ... other functions

    const executeTrade = () => {
        try {
            if (!amount || parseFloat(amount) <= 0) {
                showToast('Please enter a valid amount', 'error');
                return;
            }

            const tradeAmount = parseFloat(amount);
            // ... trade logic

            if (orderType === 'buy') {
                if (tradeAmount > demoBalance) {
                    showToast('Insufficient demo balance', 'error');
                    return;
                }
                // ... buy logic
                showToast('Demo Buy Executed!', 'success');
            } else {
                // Sell
                const holding = portfolio[coin];
                if (!holding || holding.amount < coinAmount) {
                    showToast('Insufficient holdings', 'error');
                    return;
                }
                // ... sell logic
                showToast('Demo Sell Executed!', 'success');
            }

            setAmount('');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    const resetDemo = () => {
        if (window.confirm('Reset demo account? This will restore $100,000 and clear all positions.')) {
            try {
                setDemoBalance(100000);
                setPortfolio({});
                setTradeHistory([]);
                localStorage.removeItem('demoBalance');
                localStorage.removeItem('demoPortfolio');
                localStorage.removeItem('demoTradeHistory');
                showToast('Demo account reset successfully', 'success');
            } catch (error) {
                showToast(formatApiError(error), 'error');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="sim-modal">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            {/* ... rest of the component */}
        </div>
    );
}
