
import { useState, useEffect } from 'react';
import { formatApiError } from '../lib/errorHandling';
import Toast from './Toast.jsx';

// C2C/P2P Trading - Buy/Sell Crypto Directly with Other Users
export default function C2CTrading({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('buy');
    // ... other state variables
    const [toast, setToast] = useState({ message: '', type: '' });

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // ... other functions

    const createOrder = () => {
        try {
            if (!selectedOffer || !amount) {
                showToast('Please select an offer and enter amount', 'error');
                return;
            }

            const orderAmount = parseFloat(amount);
            if (orderAmount < selectedOffer.minLimit || orderAmount > selectedOffer.maxLimit) {
                showToast(`Amount must be between ${selectedOffer.minLimit} and ${selectedOffer.maxLimit}`, 'error');
                return;
            }

            // ... create order logic

            showToast('Order created!', 'success');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    const postAd = () => {
        try {
            if (!postForm.price || !postForm.amount || !postForm.minLimit || !postForm.maxLimit) {
                showToast('Please fill all required fields', 'error');
                return;
            }

            if (postForm.paymentMethods.length === 0) {
                showToast('Please select at least one payment method', 'error');
                return;
            }

            // ... post ad logic

            showToast('Advertisement posted successfully!', 'success');
            setActiveTab('orders');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    const cancelOrder = (orderId) => {
        setMyOrders(myOrders.map(order =>
            order.id === orderId ? { ...order, status: 'cancelled' } : order
        ));
        showToast('Order cancelled', 'info');
    };

    if (!isOpen) return null;

    return (
        <div className="c2c-modal">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            {/* ... rest of the component */}
        </div>
    );
}
