import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    onAuthStateChanged, // Import onAuthStateChanged
    subscribeToChatMessages,
    subscribeToActiveChats,
    saveAdminReply,
    updateActiveChat,
    saveChatMessage,
    isFirebaseEnabled,
    subscribeToUsers,
    subscribeToDeposits,
    subscribeToWithdrawals,
    subscribeToTrades,
    subscribeToAiArbitrageInvestments,
    firebaseSignIn,
    firebaseSignOut
} from '../lib/firebase.js';
import { userAPI, uploadAPI, authAPI, tradeAPI, stakingAPI, settingsAPI, tradingLevelsAPI, bonusesAPI, currenciesAPI, networksAPI, ratesAPI, depositWalletsAPI } from '../lib/api.js';
import { formatApiError, validatePassword, isLocalStorageAvailable } from '../lib/errorHandling.js';
import { handleAdminLogin, formatFirebaseAuthError } from '../lib/adminAuth.js';
import { createAdminAccount, subscribeToAdmins, updateAdminAccount, deleteAdminAccount } from '../services/adminService.js';
import Toast from './Toast.jsx';

export default function MasterAdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [activeSection, setActiveSection] = useState('user-agents');
    const [isMasterAccount, setIsMasterAccount] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    // ... other state variables

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                // You might want to fetch user role here and set isMasterAccount
                // For now, we'll assume the role is stored in a claim or another session object
                const session = JSON.parse(localStorage.getItem('masterAdminSession'));
                if (session) {
                    setIsMasterAccount(session.role === 'master');
                }
            } else {
                setIsAuthenticated(false);
                setIsMasterAccount(false);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // ... data subscriptions useEffect ...

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginData.username || !loginData.password) {
            showToast('Please enter username and password', 'error');
            return;
        }
        const passwordValidation = validatePassword(loginData.password, 8);
        if (!passwordValidation.valid) {
            showToast(passwordValidation.error, 'error');
            return;
        }
        setIsLoggingIn(true);
        try {
            const result = await handleAdminLogin(loginData.username, loginData.password, firebaseSignIn);
            localStorage.setItem('masterAdminSession', JSON.stringify({ ...result, timestamp: Date.now() }));
            setIsAuthenticated(true); // This will be handled by onAuthStateChanged, but good for immediate feedback
            setIsMasterAccount(result.role === 'master');
            showToast('Login successful!', 'success');
        } catch (error) {
            showToast(formatFirebaseAuthError(error), 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        try {
            await firebaseSignOut();
            localStorage.removeItem('masterAdminSession');
        } catch (err) {
            showToast(formatApiError(err), 'error');
        }
    };

    const handleCreateAdmin = async () => {
        try {
            // ... validation ...
            const createdBy = JSON.parse(localStorage.getItem('masterAdminSession') || '{}').email || 'master';
            await createAdminAccount({ ...newAdmin, createdBy });
            showToast('Admin account created successfully!', 'success');
            // ... reset form
        } catch (error) {
            showToast(formatApiError(error), 'error');
        } 
    };

    // ... other handlers using showToast ...

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="master-admin-login">
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
                {/* Login Form */}
                 <form onSubmit={handleLogin}>
                    {/* ... form inputs ... */}
                     <button type="submit" disabled={isLoggingIn}>
                         {isLoggingIn ? 'Logging in...' : 'Login'}
                     </button>
                 </form>
            </div>
        );
    }

    return (
        <div className="master-admin-dashboard">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            {/* Dashboard Content */}
        </div>
    );
}
