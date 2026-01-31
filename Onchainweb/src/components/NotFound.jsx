import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * NotFound Component
 * Displays a clear 404 error message for undefined routes
 * Provides helpful information about admin routes when appropriate
 */
export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this is an admin route attempt
  const isAdminRoute = location.pathname === '/admin' || location.pathname === '/master-admin';
  const isMasterRoute = location.pathname === '/master-admin';

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
        {/* Error Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(239, 68, 68, 0.3)'
        }}>
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        {/* Error Code */}
        <h1 style={{
          fontSize: '72px',
          fontWeight: 'bold',
          margin: '0 0 16px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          404
        </h1>

        {/* Error Message */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          margin: '0 0 12px',
          color: '#f3f4f6'
        }}>
          {isAdminRoute ? (isMasterRoute ? 'Master Admin Route Not Available' : 'Admin Route Not Available') : 'Page Not Found'}
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#9ca3af',
          lineHeight: '1.6',
          margin: '0 0 32px'
        }}>
          {isAdminRoute ? (
            <>
              The {isMasterRoute ? 'master admin' : 'admin'} route is not enabled on this deployment.
              <br />
              Admin features must be enabled via environment configuration.
            </>
          ) : (
            <>
              The page you're looking for doesn't exist or has been moved.
              <br />
              Please check the URL or return to the home page.
            </>
          )}
        </p>

        {/* Additional Info for Admin Routes */}
        {isAdminRoute && (
          <div style={{
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#a78bfa',
              margin: '0 0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Configuration Required
            </h3>
            <ul style={{
              fontSize: '13px',
              color: '#d1d5db',
              lineHeight: '1.8',
              margin: 0,
              paddingLeft: '20px'
            }}>
              <li>Set <code style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                color: '#fbbf24'
              }} aria-label="Environment variable VITE_ENABLE_ADMIN equals true">VITE_ENABLE_ADMIN=true</code> in your environment</li>
              <li>Configure Firebase Authentication</li>
              <li>Set admin email allowlist</li>
              <li>Restart the development server</li>
            </ul>
          </div>
        )}

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
            onFocus={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
            }}
          >
            ← Back to Home
          </button>

          <button
            onClick={() => navigate(-1)}
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
            onFocus={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Go Back
          </button>
        </div>

        {/* Debug Info */}
        <div style={{
          marginTop: '32px',
          fontSize: '12px',
          color: '#6b7280',
          fontFamily: 'monospace'
        }}>
          Requested path: {location.pathname}
        </div>
      </div>
    </div>
  );
}
