import React, { useState, useEffect } from 'react';
import { 
  isFirebaseAvailable, 
  saveAiArbitrageInvestment, 
  subscribeToAiArbitrageInvestments,
  getUser, 
  saveUser 
} from '../lib/firebase';
import { formatApiError } from '../lib/errorHandling';

// Default AI Arbitrage levels configuration
const DEFAULT_ARBITRAGE_LEVELS = [
  { level: 1, minCapital: 1000, maxCapital: 30000, profit: 0.9, cycleDays: 2 },
  { level: 2, minCapital: 30001, maxCapital: 50000, profit: 2, cycleDays: 5 },
  { level: 3, minCapital: 50001, maxCapital: 300000, profit: 3.5, cycleDays: 7 },
  { level: 4, minCapital: 300001, maxCapital: 500000, profit: 15, cycleDays: 15 },
  { level: 5, minCapital: 500001, maxCapital: 999999999, profit: 20, cycleDays: 30 },
];

// AI Strategy descriptions
const AI_STRATEGIES = [
  { name: 'Cross-Exchange Arbitrage', icon: '🔄', desc: 'Exploits price differences across exchanges' },
  { name: 'Triangular Arbitrage', icon: '🔺', desc: 'Multi-currency pair optimization' },
  { name: 'Statistical Arbitrage', icon: '📊', desc: 'ML-based pattern recognition' },
  { name: 'Flash Loan Arbitrage', icon: '⚡', desc: 'DeFi flash loan opportunities' },
  { name: 'MEV Extraction', icon: '🤖', desc: 'Blockchain mempool analysis' },
];

// Helper to get current user ID
const getCurrentUserId = () => {
    const walletAddress = localStorage.getItem('wallet_address');
    if (walletAddress) return walletAddress;
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    return userProfile.id;
};


// Cycle progress component
function CycleProgress({ investment }) {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateProgress = () => {
      const now = Date.now();
      const start = investment.startTime;
      const end = investment.endTime;
      const total = end - start;
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / total) * 100);
      setProgress(pct);

      const remaining = Math.max(0, end - now);
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`);
      } else {
        setTimeLeft(`${mins}m`);
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000);
    return () => clearInterval(interval);
  }, [investment]);

  return (
    <div className="cycle-progress">
      <div className="cycle-progress-bar">
        <div className="cycle-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="cycle-progress-info">
        <span className="cycle-percent">{progress.toFixed(1)}%</span>
        <span className="cycle-time-left">{timeLeft} remaining</span>
      </div>
    </div>
  );
}

// AI Animation component
function AIAnimation({ isActive }) {
  return (
    <div className={`ai-animation ${isActive ? 'active' : ''}`}>
      <div className="ai-brain">
        <div className="ai-pulse"></div>
        <div className="ai-pulse delay-1"></div>
        <div className="ai-pulse delay-2"></div>
        <span className="ai-icon">🧠</span>
      </div>
      <div className="ai-signals">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`ai-signal signal-${i}`}>
            <span>📈</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AIArbitrage({ isOpen, onClose }) {
  const [investAmount, setInvestAmount] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isInvesting, setIsInvesting] = useState(false);
  const [activeInvestments, setActiveInvestments] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [arbitrageLevels, setArbitrageLevels] = useState(DEFAULT_ARBITRAGE_LEVELS);
  const [userMaxLevel, setUserMaxLevel] = useState(1);
  const [userId, setUserId] = useState(null);

  // Subscribe to investments and user data on mount
  useEffect(() => {
    if (!isOpen) return;
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
        console.warn("User not identified. AI Arbitrage disabled.");
        return;
    }
    setUserId(currentUserId);

    // Fetch user data for balance and level
    const fetchUserData = async () => {
        if (isFirebaseAvailable()) {
            const userDoc = await getUser(currentUserId);
            if (userDoc) {
                setUserBalance(userDoc.balance || 10000); // Default to 10k if no balance
                setTotalEarnings(userDoc.aiTotalEarnings || 0);
                setUserMaxLevel(userDoc.allowedTradingLevel || 1);
            } else {
                // Create a new user with default balance if they don't exist
                await saveUser({ id: currentUserId, balance: 10000, aiTotalEarnings: 0, allowedTradingLevel: 1 });
                setUserBalance(10000);
            }
        } else {
             // Fallback to local storage if firebase is not available
            const localBalance = parseFloat(localStorage.getItem('aiArbitrageBalance')) || 10000;
            const localEarnings = parseFloat(localStorage.getItem('aiArbitrageTotalEarnings')) || 0;
            const localLevel = JSON.parse(localStorage.getItem('userProfile') || '{}').allowedTradingLevel || 1;
            setUserBalance(localBalance);
            setTotalEarnings(localEarnings);
            setUserMaxLevel(localLevel);
        }
    };

    fetchUserData();

    // Subscribe to real-time investment updates
    const unsubscribe = subscribeToAiArbitrageInvestments(setActiveInvestments);
    return () => unsubscribe();

  }, [isOpen]);

  // Process completed investments
  useEffect(() => {
    const processCompletions = async () => {
      const now = Date.now();
      const completed = activeInvestments.filter(inv => now >= inv.endTime && !inv.completed);
      
      if (completed.length === 0) return;

      let earningsThisCycle = 0;
      let balanceUpdate = 0;

      for (const inv of completed) {
          const totalReturn = inv.amount + inv.expectedProfit;
          earningsThisCycle += inv.expectedProfit;
          balanceUpdate += totalReturn;
          
          // Mark as completed
          await saveAiArbitrageInvestment({ ...inv, completed: true, completedAt: now });
      }

      // Update user balance and earnings in one go
      const newBalance = userBalance + balanceUpdate;
      const newEarnings = totalEarnings + earningsThisCycle;

      if (isFirebaseAvailable()) {
          await saveUser({ id: userId, balance: newBalance, aiTotalEarnings: newEarnings });
      } else {
          localStorage.setItem('aiArbitrageBalance', newBalance.toString());
          localStorage.setItem('aiArbitrageTotalEarnings', newEarnings.toString());
      }

      setUserBalance(newBalance);
      setTotalEarnings(newEarnings);
    };

    processCompletions();
  }, [activeInvestments, userId, userBalance, totalEarnings]);


  // Determine level based on amount
  useEffect(() => {
    const amount = parseFloat(investAmount) || 0;
    const availableLevels = arbitrageLevels.filter(l => l.level <= userMaxLevel);
    const level = availableLevels.find(l => amount >= l.minCapital && amount <= l.maxCapital);
    setSelectedLevel(level || null);
  }, [investAmount, arbitrageLevels, userMaxLevel]);


  // Start investment
  const startInvestment = async () => {
    const amount = parseFloat(investAmount);
    if (!selectedLevel || amount > userBalance || !userId) return;

    setIsInvesting(true);

    try {
        const now = Date.now();
        const cycleDuration = selectedLevel.cycleDays * 24 * 60 * 60 * 1000;
        
        const newInvestment = {
            userId,
            amount,
            level: selectedLevel.level,
            profit: selectedLevel.profit,
            expectedProfit: amount * (selectedLevel.profit / 100),
            cycleDays: selectedLevel.cycleDays,
            startTime: now,
            endTime: now + cycleDuration,
            strategy: AI_STRATEGIES[Math.floor(Math.random() * AI_STRATEGIES.length)].name,
            completed: false
        };

        // Save investment to Firestore
        await saveAiArbitrageInvestment(newInvestment);

        // Deduct from balance
        const newBalance = userBalance - amount;
        if (isFirebaseAvailable()) {
            await saveUser({ id: userId, balance: newBalance });
        } else {
            localStorage.setItem('aiArbitrageBalance', newBalance.toString());
        }
        setUserBalance(newBalance);
        
        setInvestAmount('');

    } catch (error) {
        console.error("Failed to start investment:", formatApiError(error));
    } finally {
        setIsInvesting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!isOpen) return null;

  return (
    <div className="ai-arbitrage-overlay" onClick={onClose}>
      <div className="ai-arbitrage-modal" onClick={e => e.stopPropagation()}>
        <div className="ai-arbitrage-header">
          <div className="ai-header-title">
            <span className="ai-header-icon">🤖</span>
            <h2>AI Arbitrage</h2>
          </div>
          <button className="ai-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="ai-balance-section">
          <div className="ai-balance-card">
            <span className="balance-label">Available Balance</span>
            <span className="balance-amount">${formatCurrency(userBalance)}</span>
          </div>
          <div className="ai-balance-card earnings">
            <span className="balance-label">Total Earnings</span>
            <span className="balance-amount positive">+${formatCurrency(totalEarnings)}</span>
          </div>
        </div>

        <AIAnimation isActive={activeInvestments.some(inv => !inv.completed)} />

        <div className="ai-strategies">
          <h3>AI Trading Strategies</h3>
          <div className="strategies-grid">
            {AI_STRATEGIES.map((strategy, idx) => (
              <div key={idx} className="strategy-card">
                <span className="strategy-icon">{strategy.icon}</span>
                <span className="strategy-name">{strategy.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-levels-section">
          <h3>Investment Levels</h3>
          <div className="ai-levels-grid">
            {arbitrageLevels.filter(level => level.level <= userMaxLevel).map((level) => (
              <div key={level.level} className={`ai-level-card ${selectedLevel?.level === level.level ? 'active' : ''}`}>
                <div className="ai-level-header">
                  <span className="ai-level-badge">Level {level.level}</span>
                </div>
                <div className="ai-level-capital">
                  ${level.minCapital.toLocaleString()} - ${level.maxCapital >= 999999999 ? '∞' : level.maxCapital.toLocaleString()}
                </div>
                <div className="ai-level-details">
                  <div className="ai-level-profit">
                    <span className="detail-value">+{level.profit}%</span>
                    <span className="detail-label">Profit</span>
                  </div>
                  <div className="ai-level-cycle">
                    <span className="detail-value">{level.cycleDays}d</span>
                    <span className="detail-label">Cycle</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-invest-section">
          <div className="ai-invest-input">
            <label>Investment Amount (USDT)</label>
            <input
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              placeholder="Enter amount (min 1,000 USDT)"
              min="1000"
              disabled={isInvesting}
            />
            {selectedLevel && (
              <div className="ai-level-info">
                <span>Level {selectedLevel.level}</span>
                <span>•</span>
                <span className="profit-info">+{selectedLevel.profit}% profit</span>
                <span>•</span>
                <span>{selectedLevel.cycleDays} day cycle</span>
              </div>
            )}
            {parseFloat(investAmount) > userBalance && (
              <div className="ai-error-msg">Insufficient balance</div>
            )}
          </div>

          <button
            className="ai-invest-btn"
            onClick={startInvestment}
            disabled={!selectedLevel || parseFloat(investAmount) > userBalance || isInvesting}
          >
            {isInvesting ? 'Initializing AI...' : 'Start AI Arbitrage'}
          </button>
        </div>

        {activeInvestments.length > 0 && (
          <div className="ai-active-investments">
            <h3>Active Investments ({activeInvestments.filter(inv => !inv.completed).length})</h3>
            <div className="active-investments-list">
              {activeInvestments.filter(inv => !inv.completed).map((inv) => (
                <div key={inv.id} className="active-investment-card">
                  <div className="investment-header">
                    <span className="investment-level">Level {inv.level}</span>
                    <span className="investment-strategy">{inv.strategy}</span>
                  </div>
                  <div className="investment-amounts">
                    <div className="investment-principal">
                      <span className="amount-label">Principal</span>
                      <span className="amount-value">${formatCurrency(inv.amount)}</span>
                    </div>
                    <div className="investment-expected">
                      <span className="amount-label">Expected Profit</span>
                      <span className="amount-value positive">+${formatCurrency(inv.expectedProfit)}</span>
                    </div>
                  </div>
                  <CycleProgress investment={inv} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
