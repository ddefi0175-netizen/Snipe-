import React, { useState, useEffect } from 'react';
import { formatApiError } from '../lib/errorHandling';
import { firebaseSignIn, firebaseSignOut, subscribeToUsers, subscribeToDeposits, isFirebaseEnabled, onAuthStateChanged, auth } from '../lib/firebase';
import { updateUserKYC, processDeposit } from '../services/adminService';
import { handleAdminLogin, hasPermission, getAdminPermissions } from '../lib/adminAuth'; // Import hasPermission and getAdminPermissions
import Toast from './Toast.jsx';

export default function AdminPanel({ isOpen = true, onClose }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userPermissions, setUserPermissions] = useState([]);
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const permissions = await getAdminPermissions(user.uid);
                    setUserPermissions(permissions);
                    setIsAuthenticated(true);
                } catch (error) {
                    showToast(formatApiError(error), 'error');
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
                setUserPermissions([]);
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
             <Toast message={toast.message} type={toast.type} onClos