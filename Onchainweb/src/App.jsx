import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Features from './components/Features.jsx'
import Footer from './components/Footer.jsx'
import BottomNav from './components/BottomNav.jsx'
import Trade from './components/Trade.jsx'
import AIArbitrage from './components/AIArbitrage.jsx'
import Wallet from './components/Wallet.jsx'
import CustomerService from './components/CustomerService.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import MasterAdminDashboard from './components/MasterAdminDashboard.jsx'

// Main App Component (Home Page)
function MainApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tradeOpen, setTradeOpen] = useState(false)
  const [aiArbitrageOpen, setAiArbitrageOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [adminPanelOpen, setAdminPanelOpen] = useState(false)
  const [keySequence, setKeySequence] = useState([])

  // Secret admin access: Press "M" 5 times rapidly for Master Admin Panel
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'm') {
        setKeySequence(prev => {
          const now = Date.now()
          const newSequence = [...prev.filter(t => now - t < 2000), now]
          if (newSequence.length >= 5) {
            setAdminPanelOpen(true)
            return []
          }
          return newSequence
        })
      }
    }
    
    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [])

  return (
    <div className="app-root" lang="en">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main id="main" role="main">
        <Dashboard />
        <Features />
      </main>
      <Footer />
      <BottomNav 
        onTradeClick={() => setTradeOpen(true)} 
        onAIClick={() => setAiArbitrageOpen(true)}
        onWalletClick={() => setWalletOpen(true)}
      />
      <Trade isOpen={tradeOpen} onClose={() => setTradeOpen(false)} />
      <AIArbitrage isOpen={aiArbitrageOpen} onClose={() => setAiArbitrageOpen(false)} />
      <Wallet isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
      <CustomerService />
      <AdminPanel isOpen={adminPanelOpen} onClose={() => setAdminPanelOpen(false)} />
    </div>
  )
}

// Root App with Router
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/master-admin" element={<MasterAdminDashboard />} />
      </Routes>
    </Router>
  )
}