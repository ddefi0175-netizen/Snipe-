import React, { useState, useEffect } from 'react';

/**
 * Configuration Validator Component
 * Displays helpful warnings when environment variables are missing
 * Only shows in development mode
 */
export default function ConfigValidator() {
  const [issues, setIssues] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (import.meta.env.MODE !== 'development') return;

    const configIssues = [];

    // Check Firebase configuration
    const firebaseVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    const missingFirebase = firebaseVars.filter(
      varName => !import.meta.env[varName]
    );

    if (missingFirebase.length > 0) {
      configIssues.push({
        type: 'error',
        title: 'Firebase Configuration Missing',
        message: `Missing: ${missingFirebase.join(', ')}`,
        solution: 'Add Firebase credentials to Onchainweb/.env file. See .env.example for instructions.',
        docs: 'https://console.firebase.google.com'
      });
    }

    // Check WalletConnect configuration
    if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
      configIssues.push({
        type: 'warning',
        title: 'WalletConnect Not Configured',
        message: 'VITE_WALLETCONNECT_PROJECT_ID is missing',
        solution: 'WalletConnect QR code feature will not work. Get a free Project ID from WalletConnect Cloud.',
        docs: 'https://cloud.walletconnect.com'
      });
    }

    // Check Admin configuration
    const adminEnabled = import.meta.env.VITE_ENABLE_ADMIN === 'true';
    if (!adminEnabled) {
      configIssues.push({
        type: 'info',
        title: 'Admin Features Disabled',
        message: 'VITE_ENABLE_ADMIN is not set to "true"',
        solution: 'To enable master account login, set VITE_ENABLE_ADMIN=true in .env file and restart dev server.',
        docs: null
      });
    } else {
      // Admin is enabled, check allowlist
      const allowlist = import.meta.env.VITE_ADMIN_ALLOWLIST;
      if (!allowlist) {
        configIssues.push({
          type: 'warning',
          title: 'Admin Allowlist Empty',
          message: 'VITE_ADMIN_ALLOWLIST is not configured',
          solution: 'Add admin emails to VITE_ADMIN_ALLOWLIST in .env file (e.g., master@onchainweb.site). Master accounts MUST start with "master@".',
          docs: null
        });
      } else {
        // Check if allowlist has a master account
        const emails = allowlist.split(',').map(e => e.trim().toLowerCase());
        const hasMaster = emails.some(email => email.startsWith('master@'));
        if (!hasMaster) {
          configIssues.push({
            type: 'warning',
            title: 'No Master Account in Allowlist',
            message: 'No email starting with "master@" found in VITE_ADMIN_ALLOWLIST',
            solution: 'Add a master account email starting with "master@" (e.g., master@onchainweb.site) to access the master admin dashboard.',
            docs: null
          });
        }
      }
    }

    setIssues(configIssues);
    setIsVisible(configIssues.length > 0);
  }, []);

  if (!isVisible || issues.length === 0) return null;

  return (
    <div className="config-validator">
      <div className="config-validator-header">
        <span className="config-validator-icon">⚙️</span>
        <h3>Configuration Issues Detected</h3>
        <button 
          className="config-validator-close"
          onClick={() => setIsVisible(false)}
          title="Dismiss"
          aria-label="Close configuration validator"
        >
          ×
        </button>
      </div>
      <div className="config-validator-issues">
        {issues.map((issue, index) => (
          <div key={index} className={`config-issue config-issue-${issue.type}`}>
            <div className="config-issue-header">
              <span className="config-issue-icon">
                {issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <h4>{issue.title}</h4>
            </div>
            <p className="config-issue-message">{issue.message}</p>
            <p className="config-issue-solution">
              <strong>Solution:</strong> {issue.solution}
            </p>
            {issue.docs && (
              <a 
                href={issue.docs} 
                target="_blank" 
                rel="noopener noreferrer"
                className="config-issue-docs"
                aria-label={`Open documentation in new tab: ${issue.docs}`}
              >
                📖 Documentation <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="config-validator-footer">
        <p>💡 These warnings only appear in development mode</p>
      </div>

      <style>{`
        .config-validator {
          position: fixed;
          bottom: 20px;
          right: 20px;
          max-width: 400px;
          background: rgba(30, 30, 40, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
          max-height: 80vh;
          overflow-y: auto;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .config-validator-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px 12px 0 0;
        }

        .config-validator-icon {
          font-size: 24px;
        }

        .config-validator-header h3 {
          flex: 1;
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: white;
        }

        .config-validator-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .config-validator-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .config-validator-issues {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .config-issue {
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .config-issue-error {
          background: rgba(220, 38, 38, 0.1);
          border-left-color: #dc2626;
        }

        .config-issue-warning {
          background: rgba(251, 191, 36, 0.1);
          border-left-color: #fbbf24;
        }

        .config-issue-info {
          background: rgba(59, 130, 246, 0.1);
          border-left-color: #3b82f6;
        }

        .config-issue-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .config-issue-icon {
          font-size: 18px;
        }

        .config-issue-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .config-issue-message {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }

        .config-issue-solution {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        .config-issue-solution strong {
          color: rgba(255, 255, 255, 0.9);
        }

        .config-issue-docs {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #60a5fa;
          text-decoration: none;
          transition: color 0.2s;
        }

        .config-issue-docs:hover {
          color: #93c5fd;
          text-decoration: underline;
        }

        .config-validator-footer {
          padding: 12px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          border-radius: 0 0 12px 12px;
        }

        .config-validator-footer p {
          margin: 0;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
        }

        @media (max-width: 640px) {
          .config-validator {
            bottom: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
