import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AdminFeatureDisabled Component
 * Shows a helpful message when admin features are disabled via environment config
 * This is shown when VITE_ENABLE_ADMIN is not set to 'true'
 */
export default function AdminFeatureDisabled({ isMasterRoute = false }) {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%'
      }}>
        {/* Warning Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(251, 191, 36, 0.3)'
        }}>
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#fbbf24" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          margin: '0 0 16px',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {isMasterRoute ? 'Master Admin' : 'Admin'} Features Disabled
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#9ca3af',
          lineHeight: '1.6',
          margin: '0 0 32px'
        }}>
          The {isMasterRoute ? 'master admin' : 'admin'} feature is currently disabled on this deployment.
          <br />
          To enable admin access, please configure your environment variables.
        </p>

        {/* Configuration Instructions */}
        <div style={{
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#a78bfa',
            margin: '0 0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Setup Instructions
          </h3>
          
          <ol style={{
            fontSize: '14px',
            color: '#d1d5db',
            lineHeight: '1.8',
            margin: 0,
            paddingLeft: '20px',
            listStyle: 'decimal'
          }}>
            <li style={{ marginBottom: '8px' }}>
              Create or edit <code style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                color: '#fbbf24',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}>Onchainweb/.env</code> file
            </li>
            <li style={{ marginBottom: '8px' }}>
              Add <code style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                color: '#fbbf24',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}>VITE_ENABLE_ADMIN=true</code>
            </li>
            <li style={{ marginBottom: '8px' }}>
              Configure Firebase Authentication credentials
            </li>
            <li style={{ marginBottom: '8px' }}>
              Set admin email allowlist: <code style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                color: '#fbbf24',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}>VITE_ADMIN_ALLOWLIST=your@email.com</code>
            </li>
            <li>
              Restart the development server: <code style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                color: '#fbbf24',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}>npm run dev</code>
            </li>
          </ol>
        </div>

        {/* Additional Help */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#93c5fd',
            margin: 0,
            lineHeight: '1.6'
          }}>
            <strong>💡 Need help?</strong> Check the following documentation files:
          </p>
          <ul style={{
            fontSize: '13px',
            color: '#93c5fd',
            margin: '8px 0 0',
            paddingLeft: '20px',
            lineHeight: '1.8'
          }}>
            <li><code style={{ fontFamily: 'monospace' }}>MASTER_ACCOUNT_SETUP_GUIDE.md</code></li>
            <li><code style={{ fontFamily: 'monospace' }}>ADMIN_SYSTEM_SETUP_GUIDE.md</code></li>
            <li><code style={{ fontFamily: 'monospace' }}>Onchainweb/.env.example</code></li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
            }}
          >
            ← Return to Home
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            🔄 Reload Page
          </button>
        </div>

        {/* Environment Status */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#fca5a5',
          fontFamily: 'monospace'
        }}>
          <strong>Current Status:</strong> VITE_ENABLE_ADMIN = {import.meta.env?.VITE_ENABLE_ADMIN || 'undefined'}
        </div>
      </div>
    </div>
  );
}
