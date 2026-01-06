import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './lib/wallet.jsx'
import './index.css'
import './styles/master-admin.css'

// Import main app directly for fast initial load
import MainApp from './App.jsx'

// Lazy load Admin panels for code splitting
const MasterAdminDashboard = lazy(() => import('./components/MasterAdminDashboard.jsx'))
const AdminPanel = lazy(() => import('./components/AdminPanel.jsx'))

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

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/admin" element={<AdminPanel isOpen={true} onClose={() => window.location.href = '/'} />} />
            <Route path="/master" element={<MasterAdminDashboard />} />
            <Route path="/master-admin" element={<MasterAdminDashboard />} />
          </Routes>
        </Suspense>
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
)