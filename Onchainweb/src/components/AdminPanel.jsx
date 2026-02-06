
import React, { useState, useEffect } from 'react';
import { formatApiError } from '../lib/errorHandling';
import { firebaseSignIn, firebaseSignOut, subscribeToUsers, subscribeToDeposits, isFirebaseEnabled } from '../lib/firebase';
import { updateUserKYC, processDeposit } from '../services/adminService';
import { handleAdminLogin, hasPermission } from '../lib/adminAuth'; // Import hasPermission
import Toast from './Toast.jsx';

export default function AdminPanel({ isOpen = true, onClose }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userPermissions, setUserPermissions] = useState([]); // Store user permissions
    const [isLoggingIn, setIsLoggingIn] = useState(false);
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

    const onLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const { permissions } = await handleAdminLogin(loginUsername, loginPassword, firebaseSignIn);
            setIsAuthenticated(true);
            setUserPermissions(permissions); // Set permissions on login
        } catch (error) {
            showToast(formatApiError(error), 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    // ... (useEffect and other functions)

    return (
        <div className={`admin-modal-overlay ...`}>
            {/* ... */}
            <div className="admin-modal master-admin" onClick={e => e.stopPropagation()}>
                {!isAuthenticated ? (
                     <div className="admin-login">{/* ... */}</div>
                ) : (
                    <div className="admin-dashboard">
                        {/* ... */}
                        <div className="admin-content">
                            {activeTab === 'users' && (
                                <div className="users-section">
                                    {hasPermission(userPermissions, 'manageKYC') && (
                                        <div className="pending-kyc">
                                            <h3>Pending KYC ({pendingKYC.length})</h3>
                                            {/* ... KYC mapping ... */}
                                        </div>
                                    )}
                                    {/* ... Deposits section ... */}
                                </div>
                            )}
                             {/* Other Tabs */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
