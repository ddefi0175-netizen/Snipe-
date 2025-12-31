import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import MasterAdminDashboard from './components/MasterAdminDashboard.jsx'
import { WalletProvider } from './lib/wallet.jsx'
import './index.css'
import './styles/master-admin.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/master-admin" element={<MasterAdminDashboard />} />
        </Routes>
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
)