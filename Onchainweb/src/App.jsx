import React, { useState } from 'react'
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

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tradeOpen, setTradeOpen] = useState(false)
  const [aiArbitrageOpen, setAiArbitrageOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)

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
    </div>
  )
}