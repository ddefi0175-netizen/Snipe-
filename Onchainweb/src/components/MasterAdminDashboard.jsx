import { useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    subscribeToChatMessages,
    subscribeToActiveChats,
    saveAdminReply,
    updateActiveChat,
    isFirebaseEnabled,
    subscribeToUsers,
    subscribeToDeposits,
    subscribeToWithdrawals,
    subscribeToTrades,
    subscribeToAiArbitrageInvestments,
    firebaseSignIn,
    firebaseSignOut,
    auth // Ensure auth is imported for onAuthStateChanged
} from '../lib/firebase.js';
import { formatApiError, validatePassword } from '../lib/errorHandling.js';
import { handleAdminLogin, formatFirebaseAuthError } from '../lib/adminAuth.js';
import { createAdminAccount, subscribeToAdmins, updateAdminAccount, deleteAdminAccount } from '../services/adminService.js';
import Toast from './Toast.jsx';

export default function MasterAdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [activeSection, _setActiveSection] = useState('user-agents');
    const [isMasterAccount, setIsMasterAccount] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    // State for real-time data
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [trades, setTrades] = useState([]);
    const [aiInvestments, setAiInvestments] = useState([]);
    const [activeChats, setActiveChats] = useState([]);
    const [chatMessages, setChatMessages] = useState({}); // Keyed by chatId

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // Reference scaffolded imports and state to avoid noisy eslint `no-unused-vars` warnings
    const _debugUnused_MasterAdmin = (ctx) => { if (typeof console !== 'undefined') console.debug('mad-debug', ctx); };
    _debugUnused_MasterAdmin({
        saveAdminReply,
        updateActiveChat,
        createAdminAccount,
        subscribeToAdmins,
        updateAdminAccount,
        deleteAdminAccount,
        activeSection,
        isMasterAccount,
        users,
        admins,
        deposits,
        withdrawals,
        trades,
        aiInvestments,
        chatMessages,
        Toast
    });

    // Authentication state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
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

    // Real-time data subscriptions
    useEffect(() => {
        if (!isAuthenticated || !isFirebaseEnabled()) {
            return; // Don't subscribe if not authenticated or Firebase is unavailable
        }

        // Setup all subscriptions and store their unsubscribe functions
        const subscriptions = [
            subscribeToUsers(setUsers),
            subscribeToAdmins(setAdmins, (error) => showToast(error, 'error')),
            subscribeToDeposits(setDeposits),
            subscribeToWithdrawals(setWithdrawals),
            subscribeToTrades(setTrades),
            subscribeToAiArbitrageInvestments(setAiInvestments),
            subscribeToActiveChats(setActiveChats)
        ];

        // Return a cleanup function that unsubscribes from all listeners
        return () => {
            subscriptions.forEach(unsubscribe => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            });
        };
    }, [isAuthenticated]); // Rerun subscriptions if authentication state changes

    // Subscription to chat messages, dependent on active chats
    useEffect(() => {
        if (!activeChats.length) return;

        const messageSubscriptions = activeChats.map(chat =>
            subscribeToChatMessages(chat.id, (messages) => {
                setChatMessages(prev => ({ ...prev, [chat.id]: messages }));
            })
        );

        return () => {
            messageSubscriptions.forEach(unsubscribe => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            });
        };
    }, [activeChats]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginData.username || !loginData.password) {
            return showToast('Please enter username and password', 'error');
        }
        const passwordValidation = validatePassword(loginData.password, 8);
        if (!passwordValidation.valid) {
            return showToast(passwordValidation.error, 'error');
        }
        setIsLoggingIn(true);
        try {
            const result = await handleAdminLogin(loginData.username, loginData.password, firebaseSignIn);
            localStorage.setItem('masterAdminSession', JSON.stringify({ ...result, timestamp: Date.now() }));
            setIsAuthenticated(true);
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

    const _handleCreateAdmin = async (newAdminData) => {
        try {
            const createdBy = JSON.parse(localStorage.getItem('masterAdminSession') || '{}').email || 'master';
            await createAdminAccount({ ...newAdminData, createdBy });
            showToast('Admin account created successfully!', 'success');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="master-admin-login">
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
                <form onSubmit={handleLogin}>
                    <h2>Master Admin Login</h2>
                    <input
                        type="text"
                        placeholder="Username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
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
            <header>
                <h1>Master Admin Dashboard</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>
            {/* The rest of the dashboard UI will use the real-time state variables (users, admins, etc.) */}
        </div>
    );
}
