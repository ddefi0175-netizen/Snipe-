import { useState, useEffect, cloneElement } from 'react';
import { useNavigate } from 'react-router-dom';
import MasterAccountSetup from './MasterAccountSetup.jsx';
import AdminLogin from './AdminLogin.jsx';
import { getAdminByEmail, hasMasterAccount } from '../services/adminService.js';
import { onAuthStateChanged } from '../lib/firebase.js';
import { getAllowedAdminEmails } from '../lib/adminAuth.js';
import { logger } from '../utils/logger.js';

/**
 * Admin Route Guard
 * Handles authentication flow for admin routes:
 * 1. Check if master account exists
 * 2. If not, show master setup
 * 3. If exists, show login
 * 4. After login, show the admin dashboard
 */
export default function AdminRouteGuard({
  children,
  requireMaster = false,
  redirectOnSuccess = null
}) {
  const [authState, setAuthState] = useState('checking'); // checking, need_master, need_login, authenticated
  const [currentUser, setCurrentUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();

  // Check authentication state - only run once on mount
  useEffect(() => {
    let unsubscribe;

    // Async function to check master account existence and set up auth listener
    const checkAuth = async () => {
      // For master routes, first check if a master account exists in the database
      if (requireMaster) {
        try {
          const masterExists = await hasMasterAccount();
          if (!masterExists) {
            logger.log('[AdminRouteGuard] No master account found, showing setup');
            setAuthState('need_master');
            return; // Don't set up auth listener if no master exists
          }
        } catch (error) {
          logger.error('[AdminRouteGuard] Error checking master account:', error);
          setAuthState('need_login');
          return;
        }
      }

      // Set up auth state listener (synchronous, returns unsubscribe immediately)
      unsubscribe = onAuthStateChanged(async (user) => {
        if (user) {
          // User is signed in, verify they're an admin
          try {
            // Check if email is in the allowlist (security layer)
            // Note: getAllowedAdminEmails() already returns lowercase emails
            const allowedEmails = getAllowedAdminEmails();
            const userEmail = (user.email || '').toLowerCase();
            
            if (allowedEmails.length > 0 && !allowedEmails.includes(userEmail)) {
              logger.warn('[AdminRouteGuard] User email not in allowlist:', userEmail);
              setAuthState('need_login');
              setCurrentUser(null);
              setAdminData(null);
              return;
            }

            const admin = await getAdminByEmail(user.email);

            if (admin) {
              // Check if route requires master role
              if (requireMaster && admin.role !== 'master') {
                logger.warn('[AdminRouteGuard] User is not a master admin');
                setAuthState('need_login');
                setCurrentUser(null);
                setAdminData(null);
                return;
              }

              logger.log('[AdminRouteGuard] User authenticated:', user.email);
              setCurrentUser(user);
              setAdminData(admin);
              setAuthState('authenticated');
              return;
            } else {
              logger.warn('[AdminRouteGuard] User not found in admin collection');
              setAuthState('need_login');
            }
          } catch (err) {
            logger.error('[AdminRouteGuard] Error checking admin status:', err);
            setAuthState('need_login');
          }
        } else {
          // Not signed in
          logger.log('[AdminRouteGuard] No user signed in');
          setAuthState('need_login');
        }
      });
    };

    // Execute the async check
    checkAuth();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [requireMaster]); // Only depend on requireMaster which is stable

  const handleMasterSetupComplete = (masterInfo) => {
    logger.log('[AdminRouteGuard] Master setup complete:', masterInfo);
    // After master setup, show login
    setAuthState('need_login');
  };

  const handleLoginSuccess = (loginData) => {
    logger.log('[AdminRouteGuard] Login successful:', loginData.user.email);
    setCurrentUser(loginData.user);
    setAdminData(loginData.admin);
    setAuthState('authenticated');

    if (redirectOnSuccess) {
      navigate(redirectOnSuccess);
    }
  };

  // Show loading while checking
  if (authState === 'checking') {
    return (
      <div className="admin-guard-loading">
        <div className="spinner"></div>
        <p>Verifying access...</p>
        <style>{`
          .admin-guard-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show master setup if needed
  if (authState === 'need_master') {
    return <MasterAccountSetup onComplete={handleMasterSetupComplete} />;
  }

  // Show login if not authenticated
  if (authState === 'need_login') {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        allowedRoute={requireMaster ? '/master-admin' : '/admin'}
      />
    );
  }

  // Show the protected content if authenticated
  if (authState === 'authenticated') {
    // Clone children and pass admin data as props
    return cloneElement(children, {
      currentUser,
      adminData,
      isMaster: adminData?.role === 'master'
    });
  }

  return null;
}
