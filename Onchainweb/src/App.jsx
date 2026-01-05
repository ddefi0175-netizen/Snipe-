import React, { useState } from 'react'
import WalletGate from './components/WalletGate.jsx'
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
import WalletActions from './components/WalletActions.jsx'
// New Features
import FuturesTrading from './components/FuturesTrading.jsx'
import BinaryOptions from './components/BinaryOptions.jsx'
import SimulatedTrading from './components/SimulatedTrading.jsx'
import C2CTrading from './components/C2CTrading.jsx'
import BorrowLending from './components/BorrowLending.jsx'

// Main App Component (Home Page)
// Note: Admin access is only available via /master-admin route
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tradeOpen, setTradeOpen] = useState(false)
  const [aiArbitrageOpen, setAiArbitrageOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [walletActionsOpen, setWalletActionsOpen] = useState(false)
  // New feature states
  const [futuresOpen, setFuturesOpen] = useState(false)
  const [binaryOpen, setBinaryOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const [c2cOpen, setC2cOpen] = useState(false)
  const [borrowOpen, setBorrowOpen] = useState(false)

  return (
    <WalletGate>
      <div className="app-root" lang="en">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          onFuturesClick={() => { setSidebarOpen(false); setFuturesOpen(true); }}
          onBinaryClick={() => { setSidebarOpen(false); setBinaryOpen(true); }}
          onDemoClick={() => { setSidebarOpen(false); setDemoOpen(true); }}
          onC2CClick={() => { setSidebarOpen(false); setC2cOpen(true); }}
          onBorrowClick={() => { setSidebarOpen(false); setBorrowOpen(true); }}
          onWalletActionsClick={() => { setSidebarOpen(false); setWalletActionsOpen(true); }}
        />
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
        <WalletActions isOpen={walletActionsOpen} onClose={() => setWalletActionsOpen(false)} />
        <CustomerService />
        {/* New Features */}
        <FuturesTrading isOpen={futuresOpen} onClose={() => setFuturesOpen(false)} />
        <BinaryOptions isOpen={binaryOpen} onClose={() => setBinaryOpen(false)} />
        <SimulatedTrading isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
        <C2CTrading isOpen={c2cOpen} onClose={() => setC2cOpen(false)} />
        <BorrowLending isOpen={borrowOpen} onClose={() => setBorrowOpen(false)} />
      </div>
    </WalletGate>
  )
}