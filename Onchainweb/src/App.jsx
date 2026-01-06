import React, { useState, useEffect } from 'react'
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

// Promo Carousel Component
function PromoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const promos = [
    {
      title: "Welcome to OnchainWeb",
      subtitle: "Your Gateway to Decentralized Trading",
      description: "Trade crypto, stocks, and more with advanced tools and real-time data",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
      gradient: "linear-gradient(135deg, rgba(102,126,234,0.85) 0%, rgba(118,75,162,0.85) 100%)"
    },
    {
      title: "AI-Powered Trading",
      subtitle: "Smart Arbitrage Detection",
      description: "Let our AI find the best trading opportunities across multiple markets",
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80",
      gradient: "linear-gradient(135deg, rgba(17,153,142,0.85) 0%, rgba(56,239,125,0.85) 100%)"
    },
    {
      title: "Secure & Transparent",
      subtitle: "Your Assets, Your Control",
      description: "Non-custodial trading with full transparency and blockchain security",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
      gradient: "linear-gradient(135deg, rgba(79,172,254,0.85) 0%, rgba(0,242,254,0.85) 100%)"
    },
    {
      title: "24/7 Global Markets",
      subtitle: "Trade Anytime, Anywhere",
      description: "Access crypto and stock markets around the clock with live updates",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      gradient: "linear-gradient(135deg, rgba(250,112,154,0.85) 0%, rgba(254,225,64,0.85) 100%)"
    },
    {
      title: "New: Binary Options",
      subtitle: "Predict & Profit",
      description: "Simple up/down predictions with 60-second to 1-hour expiry times",
      image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80",
      gradient: "linear-gradient(135deg, rgba(161,140,209,0.85) 0%, rgba(251,194,235,0.85) 100%)"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [promos.length])

  return (
    <div className="promo-carousel">
      <div className="promo-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {promos.map((promo, index) => (
          <div 
            key={index} 
            className="promo-slide"
            style={{ 
              backgroundImage: `${promo.gradient}, url(${promo.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="promo-content">
              <h2 className="promo-title">{promo.title}</h2>
              <h3 className="promo-subtitle">{promo.subtitle}</h3>
              <p className="promo-description">{promo.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="promo-dots">
        {promos.map((_, index) => (
          <button
            key={index}
            className={`promo-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// Account Switcher Component (Real/Demo)
function AccountSwitcher({ onDemoClick }) {
  const [accountType, setAccountType] = useState(() => {
    return localStorage.getItem('accountType') || 'real'
  })
  
  // Get Real Account ID (5-digit numbers only)
  const [realAccountId] = useState(() => {
    const savedId = localStorage.getItem('realAccountId')
    if (savedId && /^\d{5}$/.test(savedId)) return savedId
    const newId = Math.floor(10000 + Math.random() * 90000).toString()
    localStorage.setItem('realAccountId', newId)
    return newId
  })

  // User Points (controlled by admin only, starts at 0)
  const [userPoints, setUserPoints] = useState(() => {
    const saved = localStorage.getItem('userPoints')
    return saved ? parseFloat(saved) : 0
  })

  // Demo Account Balance
  const [demoBalance] = useState(() => {
    const saved = localStorage.getItem('demoBalance')
    return saved ? parseFloat(saved) : 100000
  })

  // Listen for points updates from admin
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('userPoints')
      setUserPoints(saved ? parseFloat(saved) : 0)
    }
    window.addEventListener('storage', handleStorageChange)
    // Also check periodically for local updates
    const interval = setInterval(handleStorageChange, 2000)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const handleSwitch = (type) => {
    setAccountType(type)
    localStorage.setItem('accountType', type)
    if (type === 'demo' && onDemoClick) {
      onDemoClick()
    }
  }

  return (
    <div className="account-switcher">
      <div className="account-switcher-header">
        <span className="account-label">Account Type</span>
        <div className="account-toggle">
          <button 
            className={`toggle-btn ${accountType === 'real' ? 'active' : ''}`}
            onClick={() => handleSwitch('real')}
          >
            💰 Real
          </button>
          <button 
            className={`toggle-btn ${accountType === 'demo' ? 'active' : ''}`}
            onClick={() => handleSwitch('demo')}
          >
            🎮 Demo
          </button>
        </div>
      </div>
      <div className="account-info-card">
        {accountType === 'real' ? (
          <>
            <div className="account-type-badge real">
              <span className="badge-icon">💰</span>
              <span>Real Account</span>
            </div>
            <div className="account-id">
              <span className="id-label">Account ID:</span>
              <span className="id-value">{realAccountId}</span>
              <button 
                className="copy-btn-mini"
                onClick={() => {
                  navigator.clipboard.writeText(realAccountId)
                }}
                title="Copy ID"
              >
                📋
              </button>
            </div>
            <div className="user-points-display">
              <span className="points-label">Points Balance:</span>
              <span className="points-value">{userPoints.toLocaleString()} USDT</span>
            </div>
            <p className="account-note">Points are added by admin after deposit verification.</p>
          </>
        ) : (
          <>
            <div className="account-type-badge demo">
              <span className="badge-icon">🎮</span>
              <span>Demo Account</span>
            </div>
            <div className="demo-balance">
              <span className="balance-label">Demo Balance:</span>
              <span className="balance-value">${demoBalance.toLocaleString()}</span>
            </div>
            <p className="account-note">Practice trading with virtual money. No risk!</p>
            <button className="open-demo-btn" onClick={() => onDemoClick && onDemoClick()}>
              Open Demo Trading →
            </button>
          </>
        )}
      </div>
    </div>
  )
}

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
  // Modal states for profile dropdown
  const [aboutModalOpen, setAboutModalOpen] = useState(false)
  const [whitepaperModalOpen, setWhitepaperModalOpen] = useState(false)
  const [howItWorksModalOpen, setHowItWorksModalOpen] = useState(false)

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
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onAboutClick={() => setAboutModalOpen(true)}
          onWhitepaperClick={() => setWhitepaperModalOpen(true)}
          onHowItWorksClick={() => setHowItWorksModalOpen(true)}
        />
        <main id="main" role="main">
          {/* Promo Carousel */}
          <PromoCarousel />
          
          {/* Account Switcher (Real/Demo) */}
          <AccountSwitcher onDemoClick={() => setDemoOpen(true)} />
          
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
        
        {/* About Us Modal */}
        {aboutModalOpen && (
          <div className="info-modal-overlay" onClick={() => setAboutModalOpen(false)}>
            <div className="info-modal" onClick={(e) => e.stopPropagation()}>
              <div className="info-modal-header">
                <h2>ℹ️ About Us</h2>
                <button onClick={() => setAboutModalOpen(false)} className="modal-close-btn">×</button>
              </div>
              <div className="info-modal-content">
                <div className="about-hero">
                  <span className="about-logo">🌐</span>
                  <h3>OnchainWeb</h3>
                  <p className="tagline">Your Gateway to Decentralized Finance</p>
                </div>
                
                <div className="about-section">
                  <h4>🎯 Our Mission</h4>
                  <p>To democratize access to financial markets through cutting-edge blockchain technology, providing secure, transparent, and efficient trading solutions for everyone.</p>
                </div>

                <div className="about-section">
                  <h4>🌟 What We Offer</h4>
                  <ul>
                    <li>✅ Real-time crypto & stock market data</li>
                    <li>✅ AI-powered trading tools</li>
                    <li>✅ Binary options & futures trading</li>
                    <li>✅ Peer-to-peer (P2P) marketplace</li>
                    <li>✅ Secure wallet integration</li>
                    <li>✅ 24/7 customer support</li>
                  </ul>
                </div>

                <div className="about-section">
                  <h4>🔒 Security First</h4>
                  <p>Your security is our priority. We use industry-leading encryption and non-custodial solutions to ensure your assets remain in your control.</p>
                </div>

                <div className="about-stats">
                  <div className="stat-item">
                    <span className="stat-value">100K+</span>
                    <span className="stat-label">Users Worldwide</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">$50M+</span>
                    <span className="stat-label">Trading Volume</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">99.9%</span>
                    <span className="stat-label">Uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* White Paper Modal */}
        {whitepaperModalOpen && (
          <div className="info-modal-overlay" onClick={() => setWhitepaperModalOpen(false)}>
            <div className="info-modal large" onClick={(e) => e.stopPropagation()}>
              <div className="info-modal-header">
                <h2>📄 White Paper</h2>
                <button onClick={() => setWhitepaperModalOpen(false)} className="modal-close-btn">×</button>
              </div>
              <div className="info-modal-content">
                <div className="whitepaper-hero">
                  <p>Technical White Paper v2.0</p>
                  <span className="version-badge">Latest Version</span>
                </div>

                <div className="whitepaper-section">
                  <h4>1. Introduction</h4>
                  <p>OnchainWeb is a next-generation decentralized trading platform that combines the power of blockchain technology with advanced trading tools. Our platform enables users to trade cryptocurrencies, tokenized stocks, and derivatives in a secure, transparent environment.</p>
                </div>

                <div className="whitepaper-section">
                  <h4>2. Technology Stack</h4>
                  <ul>
                    <li><strong>Smart Contracts:</strong> Ethereum-based contracts for secure transactions</li>
                    <li><strong>Layer 2 Solutions:</strong> Optimistic rollups for faster, cheaper trades</li>
                    <li><strong>Oracle Integration:</strong> Chainlink for reliable price feeds</li>
                    <li><strong>AI Engine:</strong> Machine learning for arbitrage detection</li>
                  </ul>
                </div>

                <div className="whitepaper-section">
                  <h4>3. Trading Features</h4>
                  <p>Our platform supports multiple trading modes including spot trading, futures with up to 125x leverage, binary options, and P2P marketplace for direct user-to-user trades.</p>
                </div>

                <div className="whitepaper-section">
                  <h4>4. Security Model</h4>
                  <p>We implement a non-custodial architecture where users maintain full control of their private keys. All smart contracts are audited by leading security firms.</p>
                </div>

                <div className="whitepaper-section">
                  <h4>5. Tokenomics</h4>
                  <p>The OCW token serves as the utility token for the platform, providing fee discounts, governance rights, and staking rewards.</p>
                </div>

                <button className="download-whitepaper-btn">
                  📥 Download Full White Paper (PDF)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Modal */}
        {howItWorksModalOpen && (
          <div className="info-modal-overlay" onClick={() => setHowItWorksModalOpen(false)}>
            <div className="info-modal" onClick={(e) => e.stopPropagation()}>
              <div className="info-modal-header">
                <h2>🎬 How It Works</h2>
                <button onClick={() => setHowItWorksModalOpen(false)} className="modal-close-btn">×</button>
              </div>
              <div className="info-modal-content">
                <div className="how-steps">
                  <div className="how-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Connect Your Wallet</h4>
                      <p>Link your MetaMask, Trust Wallet, or any Web3 wallet to get started. Your keys, your crypto.</p>
                    </div>
                  </div>

                  <div className="how-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Deposit Funds</h4>
                      <p>Transfer crypto to your trading account. We support ETH, USDT, USDC, and 50+ other tokens.</p>
                    </div>
                  </div>

                  <div className="how-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Choose Your Trading Style</h4>
                      <p>Select from spot trading, futures, binary options, or use our AI arbitrage tool.</p>
                    </div>
                  </div>

                  <div className="how-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Execute Trades</h4>
                      <p>Place your orders with real-time market data. Our smart contracts ensure fair execution.</p>
                    </div>
                  </div>

                  <div className="how-step">
                    <div className="step-number">5</div>
                    <div className="step-content">
                      <h4>Withdraw Anytime</h4>
                      <p>Your profits are yours. Withdraw to your wallet instantly with minimal fees.</p>
                    </div>
                  </div>
                </div>

                <div className="video-placeholder">
                  <span>🎥</span>
                  <p>Watch Tutorial Video</p>
                  <button className="watch-video-btn">▶ Play Video</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WalletGate>
  )
}