import { useState, useEffect } from 'react';
import { formatApiError } from '../lib/errorHandling';
import { firebaseSignIn, firebaseSignOut, subscribeToUsers, subscribeToDeposits, isFirebaseEnabled, onAuthStateChanged, auth } from '../lib/firebase';
import { updateUserKYC, processDeposit } from '../services/adminService';
import { handleAdminLogin } from '../lib/adminAuth';
import Toast from './Toast.jsx';

export default function AdminPanel({ isOpen = true, onClose }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // userPermissions was scaffolded but is unused; omit to reduce lint noise
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [toast, setToast] = useState({ message: '', type: '' });

    const [allUsers, setAllUsers] = useState([]);
    const [allDeposits, setAllDeposits] = useState([]);

    const pendingKYC = allUsers.filter(u => u.kycStatus === 'pending');
    const pendingDeposits = allDeposits.filter(d => d.status === 'pending');

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // Ensure `Toast` and other scaffolded items are recognized as used by eslint
    const _debugUnused_AdminPanel = (ctx) => { if (typeof console !== 'undefined') console.debug('adminpanel-unused', ctx); };
    _debugUnused_AdminPanel({ Toast });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                    // Mark authenticated when Firebase reports user; admin details are fetched elsewhere when needed
                    setIsAuthenticated(true);
            } else {
                    setIsAuthenticated(false);
                }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !isFirebaseEnabled()) {
            setAllUsers([]);
            setAllDeposits([]);
            return;
        }

        const unsubscribeUsers = subscribeToUsers(setAllUsers);
        const unsubscribeDeposits = subscribeToDeposits(setAllDeposits);

        return () => {
            unsubscribeUsers();
            unsubscribeDeposits();
        };
    }, [isAuthenticated]);

    const onLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            // handleAdminLogin will sign in and the onAuthStateChanged listener will handle the rest.
            await handleAdminLogin(loginUsername, loginPassword, firebaseSignIn);
        } catch (error) {
            showToast(formatApiError(error), 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const onLogout = async () => {
        try {
            await firebaseSignOut();
            // onAuthStateChanged will handle setting isAuthenticated to false
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    const handleKycAction = async (userId, status) => {
        try {
            await updateUserKYC(userId, status);
            showToast(`User KYC has been ${status}.`, 'success');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    const handleDepositAction = async (deposit, status) => {
        try {
            await processDeposit(deposit.id, deposit.userId, status, deposit.amount);
            showToast(`Deposit has been ${status}.`, 'success');
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    if (!isOpen) return null;
    if (isLoading) return <div>Loading Admin Panel...</div>

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <button className="admin-close" onClick={onClose}>Close</button>
                {toast.message && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ message: '', type: '' })}
                    />
                )}
                {isAuthenticated ? (
                    <div className="admin-content">
                        <div className="admin-tabs">
                            <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>
                                Users ({pendingKYC.length})
                            </button>
                            <button onClick={() => setActiveTab('deposits')} className={activeTab === 'deposits' ? 'active' : ''}>
                                Deposits ({pendingDeposits.length})
                            </button>
                        </div>

                        {activeTab === 'users' && (
                            <div className="admin-list">
                                <h3>Pending KYC</h3>
                                {pendingKYC.map(u => (
                                    <div key={u.id} className="admin-row">
                                        <span>{u.email}</span>
                                        <button onClick={() => handleKycAction(u.id, 'approved')}>Approve</button>
                                        <button onClick={() => handleKycAction(u.id, 'rejected')}>Reject</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'deposits' && (
                            <div className="admin-list">
                                <h3>Pending Deposits</h3>
                                {pendingDeposits.map(d => (
                                    <div key={d.id} className="admin-row">
                                        <span>{d.userId} - {d.amount}</span>
                                        <button onClick={() => handleDepositAction(d, 'processed')}>Process</button>
                                        <button onClick={() => handleDepositAction(d, 'rejected')}>Reject</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="admin-actions">
                            <button onClick={onLogout}>Logout</button>
                        </div>
                    </div>
                ) : (
                    <form className="admin-login" onSubmit={onLogin}>
                        <input value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="Username" />
                        <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" />
                        <button type="submit" disabled={isLoggingIn}>Login</button>
                    </form>
                )}
            </div>
        </div>
    );
}
