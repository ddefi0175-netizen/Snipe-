import React, { useState, useEffect, useRef } from 'react';
import { firebaseSignIn, onAuthStateChanged } from '../lib/firebase.js';
import { handleAdminLogin, formatFirebaseAuthError } from '../lib/adminAuth.js';
import { getAdminByEmail, updateAdminLastLogin } from '../services/adminService.js';

/**
 * Admin Login Page
 * Allows admins and master to login with username/password
 * No wallet connection required
 */
export default function AdminLogin({ onLoginSuccess, allowedRoute = '/admin' }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Use ref to store stable callback reference
  const onLoginSuccessRef = useRef(onLoginSuccess);
  
  // Update ref when callback changes, but don't trigger re-render
  useEffect(() => {
    onLoginSuccessRef.current = onLoginSuccess;
  }, [onLoginSuccess]);

  // Check if already authenticated
  // Note: Using ref pattern so callback stays updated without triggering re-renders
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, check if they're an admin
        try {
          const adminData = await getAdminByEmail(user.email);
          if (adminData) {
            console.log('[AdminLogin] Already authenticated:', user.email);
            await updateAdminLastLogin(adminData.uid);
            if (onLoginSuccessRef.current) {
              onLoginSuccessRef.current({
                user,
                admin: adminData,
                role: adminData.role,
                permissions: adminData.permissions
              });
            }
          }
        } catch (err) {
          console.error('[AdminLogin] Error checking admin status:', err);
        }
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency array - only run once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use admin login handler which validates against allowlist
      const result = await handleAdminLogin(username, password, firebaseSignIn);

      console.log('[AdminLogin] Login successful:', result.user.email);

      // Get full admin data from Firestore
      const adminData = await getAdminByEmail(result.user.email);

      // Update last login timestamp
      if (adminData) {
        await updateAdminLastLogin(adminData.uid);
      }

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess({
          user: result.user,
          admin: adminData,
          role: result.role,
          permissions: result.permissions,
          token: result.token
        });
      }
    } catch (err) {
      console.error('[AdminLogin] Login error:', err);
      const errorMessage = formatFirebaseAuthError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="admin-login-container" suppressHydrationWarning>
        <div className="admin-login-box">
          <div className="admin-login-loading">
            <div className="spinner"></div>
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-bg"></div>
      
      <div className="admin-login-box">
        <div className="admin-login-header">
          <div className="admin-login-icon">🔐</div>
          <h1>Admin Access</h1>
          <p className="admin-login-subtitle">
            {allowedRoute === '/master-admin' ? 'Master Admin Portal' : 'Admin Panel'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="admin-login-error">
              <span className="admin-login-error-icon">⚠️</span>
              <span className="admin-login-error-text">{error}</span>
            </div>
          )}

          <div className="admin-login-field">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              required
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? (
              <>
                <span className="spinner-small"></span>
                Signing in...
              </>
            ) : (
              <>
                <span>🔓</span>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p className="admin-login-notice">
            <span>🔒</span>
            Authorized personnel only
          </p>
          <p className="admin-login-help">
            Contact the master admin if you need access
          </p>
        </div>
      </div>

      <style jsx>{`
        .admin-login-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          z-index: 10000;
        }

        .admin-login-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          animation: bgMove 20s ease-in-out infinite;
        }

        @keyframes bgMove {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 30px); }
        }

        .admin-login-box {
          position: relative;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 420px;
          margin: 1rem;
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .admin-login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .admin-login-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .admin-login-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .admin-login-subtitle {
          font-size: 1rem;
          color: #718096;
        }

        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .admin-login-error {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 10px;
          color: #c33;
        }

        .admin-login-error-icon {
          font-size: 1.25rem;
        }

        .admin-login-error-text {
          flex: 1;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .admin-login-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .admin-login-field label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #4a5568;
        }

        .admin-login-field input {
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s;
          background: white;
        }

        .admin-login-field input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .admin-login-field input:disabled {
          background: #f7fafc;
          cursor: not-allowed;
        }

        .admin-login-button {
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .admin-login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .admin-login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .admin-login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-login-footer {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .admin-login-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }

        .admin-login-help {
          font-size: 0.75rem;
          color: #a0aec0;
        }

        .admin-login-loading {
          text-align: center;
          padding: 2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .spinner-small {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .admin-login-box {
            padding: 2rem 1.5rem;
          }

          .admin-login-header h1 {
            font-size: 1.5rem;
          }

          .admin-login-icon {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}
