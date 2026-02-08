import { lazy, Suspense, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UniversalWalletProvider } from './lib/walletConnect.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ROUTES, ADMIN_GUARD } from './config/constants.js'
import { validateEnvironment } from './config/validateEnv.js'
import './index.css'
import './styles/master-admin.css'
import MainApp from './App.jsx'

// Debug helper to satisfy linters for globally-registered route components
const _debugUnused_Main = (ctx) => {
  if (typeof console !== 'undefined' && process?.env?.NODE_ENV !== 'production') console.debug('main-unused', ctx);
};

// Lazy load Admin panels for code splitting
const MasterAdminDashboard = lazy(() => import('./components/MasterAdminDashboard.jsx'))
const AdminPanel = lazy(() => import('./components/AdminPanel.jsx'))

// Admin route guard for authentication
import AdminRouteGuard from './components/AdminRouteGuard.jsx'

// Admin auto-detection for wallet-based admin access
import AdminAutoDetector from './components/AdminAutoDetector.jsx'

// Configuration validator (development only)
import ConfigValidator from './components/ConfigValidator.jsx'

// Consent banner for GDPR compliance
import ConsentBanner from './components/ConsentBanner.jsx'

// 404 Not Found page
import NotFound from './components/NotFound.jsx'

// Admin feature disabled page
import AdminFeatureDisabled from './components/AdminFeatureDisabled.jsx'

// Analytics initialization
import { initializeAnalytics } from './utils/analytics.js'
import { FIREBASE_CONFIG } from './config/firebase.config.js'

// Loading spinner for lazy loaded routes
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
    color: '#fff'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid rgba(124, 58, 237, 0.3)',
        borderTop: '3px solid #7c3aed',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <p>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
)

// Validate environment variables before rendering
const envCheck = validateEnvironment();
if (!envCheck.valid && import.meta.env.PROD) {
  // Using console.error directly here since this is a startup check
  // and occurs before the app/logger is initialized
  console.error('Application cannot start: Missing environment variables', envCheck.missing);
  // Show user-friendly error in production
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f0f1a; color: #fff; font-family: sans-serif;">
        <div style="text-align: center; max-width: 600px; padding: 20px;">
          <h1 style="color: #ef4444; margin-bottom: 20px;">⚠️ Configuration Error</h1>
          <p style="margin-bottom: 10px;">The application is missing required environment variables.</p>
          <p style="color: #9ca3af;">Please contact the administrator.</p>
        </div>
      </div>
    `;
  }
} else {
  // Initialize Google Analytics if measurement ID is configured
  if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true' && FIREBASE_CONFIG.measurementId) {
    initializeAnalytics(FIREBASE_CONFIG.measurementId);
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <UniversalWalletProvider>
            <AdminAutoDetector>
              <ConfigValidator />
              <ConsentBanner />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path={ROUTES.HOME} element={<MainApp />} />
                  {/* Admin route - always registered, but shows disabled message if feature not enabled */}
                  <Route
                    path={ROUTES.ADMIN}
                    element={
                      ADMIN_GUARD.ENABLED ? (
                        <AdminRouteGuard requireMaster={false}>
                          <AdminPanel isOpen={true} onClose={() => window.location.href = '/'} />
                        </AdminRouteGuard>
                      ) : (
                        <AdminFeatureDisabled isMasterRoute={false} />
                      )
                    }
                  />
                  {/* Master Admin route - always registered, but shows disabled message if feature not enabled */}
                  <Route
                    path={ROUTES.MASTER_ADMIN}
                    element={
                      ADMIN_GUARD.ENABLED ? (
                        <AdminRouteGuard requireMaster={true}>
                          <MasterAdminDashboard />
                        </AdminRouteGuard>
                      ) : (
                        <AdminFeatureDisabled isMasterRoute={true} />
                      )
                    }
                  />
                  {/* Catch-all route for 404 - must be last */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AdminAutoDetector>
          </UniversalWalletProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  )
}

// Reference items to avoid ESLint false positives
_debugUnused_Main({ Suspense, StrictMode, BrowserRouter, Routes, Route, UniversalWalletProvider, ErrorBoundary, MainApp, MasterAdminDashboard, AdminPanel, AdminRouteGuard, AdminAutoDetector, ConfigValidator, ConsentBanner, NotFound, AdminFeatureDisabled, LoadingSpinner });
