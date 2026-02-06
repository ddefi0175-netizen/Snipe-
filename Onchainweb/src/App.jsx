import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import WalletGate from './components/WalletGateUniversal.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Features from './components/Features.jsx';
import Footer from './components/Footer.jsx';
import BottomNav from './components/BottomNav.jsx';
import Trade from './components/Trade.jsx';
import AIArbitrage from './components/AIArbitrage.jsx';
import Wallet from './components/Wallet.jsx';
import CustomerService from './components/CustomerService.jsx';
import WalletActions from './components/WalletActions.jsx';
import FuturesTrading from './components/FuturesTrading.jsx';
import BinaryOptions from './components/BinaryOptions.jsx';
import SimulatedTrading from './components/SimulatedTrading.jsx';
import C2CTrading from './components/C2CTrading.jsx';
import BorrowLending from './components/BorrowLending.jsx';
import { isFirebaseAvailable, getUser, saveUser } from './lib/firebase';


// Promo Carousel Component
function PromoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

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
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promos.length]);

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
    </div>
  );
}

// Account Switcher Component
function AccountSwitcher({ onDemoClick }) {
  const [accountType, setAccountType] = useState('real');
  const [userBalance, setUserBalance] = useState(0);
  const [demoBalance, setDemoBalance] = useState(100000);
  const [realAccountId, setRealAccountId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUserId = localStorage.getItem('wallet_address') || JSON.parse(localStorage.getItem('userProfile') || '{}').id;
    if (currentUserId) {
      setUserId(currentUserId);
      setRealAccountId(currentUserId.slice(-5)); // Use last 5 chars of wallet/ID as account ID
    }

    const fetchUserData = async () => {
      if (isFirebaseAvailable() && currentUserId) {
        const userDoc = await getUser(currentUserId);
        if (userDoc) {
          setUserBalance(userDoc.balance || 0); // Real balance from Firebase
        } else {
          await saveUser({ id: currentUserId, balance: 0 }); // Create user if not exists
        }
      } else {
        const localBalance = parseFloat(localStorage.getItem('userPoints')) || 0;
        setUserBalance(localBalance);
      }
      // Demo balance is always local
      const localDemoBalance = parseFloat(localStorage.getItem('demoBalance')) || 100000;
      setDemoBalance(localDemoBalance);
    };

    fetchUserData();

    // Listen for external balance updates
    const handleStorageChange = () => {
        if (!isFirebaseAvailable()) {
            setUserBalance(parseFloat(localStorage.getItem('userPoints')) || 0);
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, []);

  const handleSwitch = (type) => {
    setAccountType(type);
    if (type === 'demo' && onDemoClick) {
      onDemoClick();
    }
  };

  return (
    <div className="account-switcher">
        <div className="account-switcher-header">
            <div className="account-toggle">
                <button className={`toggle-btn ${accountType === 'real' ? 'active' : ''}`} onClick={() => handleSwitch('real')}>💰 Real</button>
                <button className={`toggle-btn ${accountType === 'demo' ? 'active' : ''}`} onClick={() => handleSwitch('demo')}>🎮 Demo</button>
            </div>
        </div>
        <div className="account-info-card">
            {accountType === 'real' ? (
                <>
                    <div className="account-type-badge real"><span>💰</span><span>Real Account</span></div>
                    <div className="account-id"><span className="id-label">Account ID:</span><span className="id-value">{realAccountId}</span></div>
                    <div className="user-points-display"><span className="points-label">Balance:</span><span className="points-value">{userBalance.toLocaleString()} USDT</span></div>
                </>
            ) : (
                <>
                    <div className="account-type-badge demo"><span>🎮</span><span>Demo Account</span></div>
                    <div className="demo-balance"><span className="balance-label">Demo Balance:</span><span className="balance-value">${demoBalance.toLocaleString()}</span></div>
                    <button className="open-demo-btn" onClick={() => onDemoClick && onDemoClick()}>Open Demo Trading →</button>
                </>
            )}
        </div>
    </div>
  );
}


// Main App Component
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [aiArbitrageOpen, setAiArbitrageOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletActionsOpen, setWalletActionsOpen] = useState(false);
  const [futuresOpen, setFuturesOpen] = useState(false);
  const [binaryOpen, setBinaryOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [c2cOpen, setC2cOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [whitepaperModalOpen, setWhitepaperModalOpen] = useState(false);
  const [howItWorksModalOpen, setHowItWorksModalOpen] = useState(false);

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
          <PromoCarousel />
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
        <FuturesTrading isOpen={futuresOpen} onClose={() => setFuturesOpen(false)} />
        <BinaryOptions isOpen={binaryOpen} onClose={() => setBinaryOpen(false)} />
        <SimulatedTrading isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
        <C2CTrading isOpen={c2cOpen} onClose={() => setC2cOpen(false)} />
        <BorrowLending isOpen={borrowOpen} onClose={() => setBorrowOpen(false)} />

        {aboutModalOpen && (
            <div className="info-modal-overlay" onClick={() => setAboutModalOpen(false)}>
                <div className="info-modal" onClick={(e) => e.stopPropagation()}>
                    <h2>About Us</h2>
                    <p>OnchainWeb is your gateway to decentralized finance...</p>
                </div>
            </div>
        )}
      </div>
      <Analytics />
    </WalletGate>
  );
}
