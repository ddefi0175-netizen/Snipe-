
import { useState, useEffect } from 'react';
// ... other imports
import { formatApiError } from '../lib/errorHandling';
import Toast from './Toast.jsx'; // Assuming Toast component exists

// ... component implementation

export default function AIArbitrage({ isOpen, onClose }) {
  // ... states and other functions
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'info') => {
      setToast({ message, type });
  };

  // ... other code

  // Start investment
  const startInvestment = async () => {
    const amount = parseFloat(investAmount);
    if (!selectedLevel || amount > userBalance || !userId) return;

    setIsInvesting(true);

    try {
        // ... investment logic

        // Save investment to Firestore
        await saveAiArbitrageInvestment(newInvestment);

        // Deduct from balance
        const newBalance = userBalance - amount;
        if (isFirebaseAvailable()) {
            await saveUser({ id: userId, balance: newBalance });
        } else {
            localStorage.setItem('aiArbitrageBalance', newBalance.toString());
        }
        setUserBalance(newBalance);

        setInvestAmount('');
        showToast('Investment started successfully!', 'success'); // Success toast

    } catch (error) {
        showToast(formatApiError(error), 'error'); // Use showToast with formatApiError
    } finally {
        setIsInvesting(false);
    }
  };

  // ... rest of the component

  if (!isOpen) return null;

  return (
    <div className="ai-arbitrage-overlay" onClick={onClose}>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
        {/* ... rest of the JSX */}
    </div>
  );
}
