import { useState, useEffect } from 'react';
import { initializeMasterAccount, getAdminByEmail } from '../services/adminService.js';
import { isFirebaseEnabled } from '../lib/firebase.js';

/**
 * Master Account Setup Component
 * Automatically creates master account on first run
 * Shows setup status and instructions
 */
export default function MasterAccountSetup({ onComplete }) {
  const [status, setStatus] = useState('checking'); // checking, needs_setup, setting_up, complete, error
  const [message, setMessage] = useState('');
  const [masterEmail, setMasterEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showManualSetup, setShowManualSetup] = useState(false);

  useEffect(() => {
    checkMasterAccount();
  }, []);

  const checkMasterAccount = async () => {
    if (!isFirebaseEnabled()) {
      setStatus('error');
      setMessage('Firebase is not configured. Please set up Firebase credentials in .env file.');
      return;
    }

    try {
      // Check environment for default master email
      const allowlistEmails = import.meta.env.VITE_ADMIN_ALLOWLIST || '';
      const emails = allowlistEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

      if (emails.length === 0) {
        setStatus('error');
        setMessage('No admin emails configured in VITE_ADMIN_ALLOWLIST environment variable.');
        setShowManualSetup(true);
        return;
      }

      // Find master email (starts with 'master@' or first in list)
      const defaultMasterEmail = emails.find(e => e.startsWith('master@')) || emails[0];
      setMasterEmail(defaultMasterEmail);

      // Check if master already exists
      const existingMaster = await getAdminByEmail(defaultMasterEmail);

      if (existingMaster) {
        setStatus('complete');
        setMessage(`Master account already exists: ${defaultMasterEmail}`);
        setTimeout(() => {
          if (onComplete) onComplete(existingMaster);
        }, 1500);
      } else {
        setStatus('needs_setup');
        setMessage(`Master account needs to be created for: ${defaultMasterEmail}`);
        setShowManualSetup(true);
      }
    } catch (err) {
      console.error('[MasterSetup] Check error:', err);
      setStatus('error');
      setMessage(`Error checking master account: ${err.message}`);
      setShowManualSetup(true);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (masterPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (masterPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setStatus('setting_up');
    setMessage('Creating master account...');

    try {
      const result = await initializeMasterAccount(masterEmail, masterPassword);

      if (result.success) {
        setStatus('complete');
        setMessage(result.message);

        // Save credentials hint to localStorage (NOT the actual password, just a reminder)
        localStorage.setItem('masterAccountEmail', masterEmail);

        setTimeout(() => {
          if (onComplete) onComplete({ email: masterEmail });
        }, 2000);
      } else {
        setStatus('error');
        setMessage(result.message || 'Failed to create master account');
        setError(result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('[MasterSetup] Setup error:', err);
      setStatus('error');
      setMessage('Failed to create master account');
      setError(err.message);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return '🔍';
      case 'needs_setup':
        return '⚙️';
      case 'setting_up':
        return '⏳';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
      case 'setting_up':
        return '#667eea';
      case 'needs_setup':
        return '#f59e0b';
      case 'complete':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="master-setup-container">
      <div className="master-setup-bg"></div>

      <div className="master-setup-box">
        <div className="master-setup-header">
          <div className="master-setup-icon" style={{ color: getStatusColor() }}>
            {getStatusIcon()}
          </div>
          <h1>Master Account Setup</h1>
          <p className="master-setup-subtitle">Platform Administration</p>
        </div>

        <div className="master-setup-status" style={{ borderColor: getStatusColor() }}>
          <p>{message}</p>
        </div>

        {error && (
          <div className="master-setup-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {showManualSetup && status === 'needs_setup' && (
          <form onSubmit={handleSetup} className="master-setup-form">
            <div className="master-setup-field">
              <label htmlFor="email">Master Email</label>
              <input
                id="email"
                type="email"
                value={masterEmail}
                onChange={(e) => setMasterEmail(e.target.value)}
                placeholder="master@admin.yourdomain.com"
                required
                autoComplete="email"
              />
              <p className="master-setup-hint">
                This should match an email in your VITE_ADMIN_ALLOWLIST
              </p>
            </div>

            <div className="master-setup-field">
              <label htmlFor="password">Master Password</label>
              <input
                id="password"
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Enter a secure password (min 8 characters)"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="master-setup-field">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="master-setup-button">
              <span>🚀</span>
              Create Master Account
            </button>
          </form>
        )}

        {status === 'checking' && (
          <div className="master-setup-loading">
            <div className="spinner"></div>
          </div>
        )}

        {status === 'setting_up' && (
          <div className="master-setup-loading">
            <div className="spinner"></div>
            <p>Please wait...</p>
          </div>
        )}

        {status === 'complete' && (
          <div className="master-setup-success">
            <p>✨ Setup complete! Redirecting to login...</p>
          </div>
        )}

        <div className="master-setup-footer">
          <p className="master-setup-notice">
            <span>🔐</span>
            This account has full administrative privileges
          </p>
          <p className="master-setup-help">
            Keep your credentials secure and never share them
          </p>
        </div>
      </div>

      <style jsx>{`
        .master-setup-container {
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

        .master-setup-bg {
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

        .master-setup-box {
          position: relative;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 500px;
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

        .master-setup-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .master-setup-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .master-setup-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .master-setup-subtitle {
          font-size: 1rem;
          color: #718096;
        }

        .master-setup-status {
          padding: 1.25rem;
          background: #f7fafc;
          border-left: 4px solid;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: center;
          font-weight: 500;
          color: #2d3748;
        }

        .master-setup-error {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 10px;
          color: #c33;
          margin-bottom: 1.5rem;
        }

        .master-setup-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .master-setup-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .master-setup-field label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #4a5568;
        }

        .master-setup-field input {
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s;
          background: white;
        }

        .master-setup-field input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .master-setup-hint {
          font-size: 0.75rem;
          color: #a0aec0;
          margin-top: -0.25rem;
        }

        .master-setup-button {
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

        .master-setup-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .master-setup-loading {
          text-align: center;
          padding: 2rem;
        }

        .master-setup-success {
          padding: 2rem;
          text-align: center;
          font-weight: 500;
          color: #10b981;
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .master-setup-footer {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .master-setup-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }

        .master-setup-help {
          font-size: 0.75rem;
          color: #a0aec0;
        }

        @media (max-width: 640px) {
          .master-setup-box {
            padding: 2rem 1.5rem;
          }

          .master-setup-header h1 {
            font-size: 1.5rem;
          }

          .master-setup-icon {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
}
