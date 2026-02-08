
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { formatApiError } from '../lib/errorHandling';
import Toast from './Toast.jsx';

export default function BorrowLending({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('borrow');
    const [collateralBalance, setCollateralBalance] = useState({});
    const [borrowForm, setBorrowForm] = useState({ collateralCoin: 'BTC', collateralAmount: '', borrowCoin: 'USDT', duration: 7 });
    const [lendForm, setLendForm] = useState({ coin: 'USDT', amount: '', duration: 7 });
    const [myLoans, setMyLoans] = useState([]);
    const [myLending, setMyLending] = useState([]);
    const [toast, setToast] = useState({ message: '', type: '' });

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const createBorrow = () => {
        try {
            if (!borrowForm.collateralAmount) {
                showToast('Please enter collateral amount', 'error');
                return;
            }
            // ... rest of borrow logic
            showToast('Loan Created Successfully!', 'success');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    const createLend = () => {
        try {
            if (!lendForm.amount || parseFloat(lendForm.amount) <= 0) {
                showToast('Please enter amount to lend', 'error');
                return;
            }
            // ... rest of lend logic
            showToast('Lending Position Created!', 'success');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    const repayLoan = (loanId) => {
        // ... repay logic
        showToast('Loan Repaid!', 'success');
    };

    const withdrawLending = (lendingId) => {
        // ... withdraw logic
        showToast('Withdrawn Successfully!', 'success');
    };

    if (!isOpen) return null;

    return (
        <div className="borrow-modal">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            {/* ... rest of the component */}
        </div>
    );
}
