
import React, { useState, useEffect, useCallback } from 'react';
import { getProfileData, submitKycData } from '../services/userService';
import { getDepositAddresses } from '../services/depositService';
import { formatApiError } from '../lib/errorHandling';
import Toast from './Toast.jsx';

const COINS = [
    { id: 'BTC', name: 'Bitcoin', icon: '₿', color: '#f7931a', network: 'Bitcoin' },
    { id: 'USDT-TRC20', name: 'USDT', icon: '₮', color: '#26a17b', network: 'TRC20 (Tron)' },
    { id: 'USDT-ERC20', name: 'USDT', icon: '₮', color: '#26a17b', network: 'ERC20 (Ethereum)' },
];

const QRCode = ({ address }) => (
    <div className="qr-code-container">
        {/* QR Code implementation */}
    </div>
);

export default function Wallet({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('assets');
    const [balances, setBalances] = useState({});
    const [depositAddresses, setDepositAddresses] = useState({});
    const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);

    const [kycStep, setKycStep] = useState('personal');
    const [kycData, setKycData] = useState({ fullName: '', docType: 'passport', docNumber: '', frontPhoto: null, backPhoto: null });
    const [kycStatus, setKycStatus] = useState('not_submitted');

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const profile = await getProfileData();
            if (profile) {
                setBalances(profile.balances || {});
                setKycStatus(profile.kycStatus || 'not_submitted');
            }
            const addresses = await getDepositAddresses();
            setDepositAddresses(addresses);
        } catch (error) {
            showToast(formatApiError(error), 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen, loadInitialData]);

    const handleFileChange = (e, fileType) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setKycData(prev => ({ ...prev, [fileType]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKycSubmit = async () => {
        setLoading(true);
        try {
            await submitKycData(kycData);
            setKycStatus('pending');
            showToast('KYC documents submitted successfully!', 'success');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="wallet-overlay" onClick={onClose}>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            <div className="wallet-modal" onClick={e => e.stopPropagation()}>
                {/* ... Header and Tabs ... */}
                {activeTab === 'kyc' && (
                    <div className="wallet-kyc">
                         {/* ... KYC UI ... */}
                    </div>
                )}
                 {/* Other tabs */}
            </div>
        </div>
    );
}
