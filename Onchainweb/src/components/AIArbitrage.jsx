import React, { useState, useEffect, useCallback } from 'react'

// Default AI Arbitrage levels configuration
const DEFAULT_ARBITRAGE_LEVELS = [
  { level: 1, minCapital: 1000, maxCapital: 30000, profit: 0.9, cycleDays: 2 },
  { level: 2, minCapital: 30001, maxCapital: 50000, profit: 2, cycleDays: 5 },
  { level: 3, minCapital: 50001, maxCapital: 300000, profit: 3.5, cycleDays: 7 },
  { level: 4, minCapital: 300001, maxCapital: 500000, profit: 15, cycleDays: 15 },
  { level: 5, minCapital: 500001, maxCapital: 999999999, profit: 20, cycleDays: 30 },
]

// AI Strategy descriptions
const AI_STRATEGIES = [
  { name: 'Cross-Exchange Arbitrage', icon: '🔄', desc: 'Exploits price differences across exchanges' },
  { name: 'Triangular Arbitrage', icon: '🔺', desc: 'Multi-currency pair optimization' },
  { name: 'Statistical Arbitrage', icon: '📊', desc: 'ML-based pattern recognition' },
  { name: 'Flash Loan Arbitrage', icon: '⚡', desc: 'DeFi flash loan opportunities' },
  { name: 'MEV Extraction', icon: '🤖', desc: 'Blockchain mempool analysis' },
]

// Cycle progress component
function CycleProgress({ investment }) {
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState('')
  
  useEffect(() => {
    const updateProgress = () => {
      const now = Date.now()
      const start = investment.startTime
      const end = investment.endTime
      const total = end - start
      const elapsed = now - start
      const pct = Math.min(100, (elapsed / total) * 100)
      setProgress(pct)
      
      // Calculate time left
      const remaining = Math.max(0, end - now)
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`)
      } else {
        setTimeLeft(`${mins}m`)
      }
    }
    
    updateProgress()
    const interval = setInterval(updateProgress, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [investment])
  
  return (
    <div className="cycle-progress">
      <div className="cycle-progress-bar">
        <div 
          className="cycle-progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="cycle-progress-info">
        <span className="cycle-percent">{progress.toFixed(1)}%</span>
        <span className="cycle-time-left">{timeLeft} remaining</span>
      </div>
    </div>
  )
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
  )
}

export default function AIArbitrage({ isOpen, onClose }) {
  // Investment state
  const [investAmount, setInvestAmount] = useState('')
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [isInvesting, setIsInvesting] = useState(false)
  
  // Active investments
  const [activeInvestments, setActiveInvestments] = useState(() => {
    const saved = localStorage.getItem('aiArbitrageInvestments')
    return saved ? JSON.parse(saved) : []
  })
  
  // User balance (simulated)
  const [userBalance, setUserBalance] = useState(() => {
    const saved = localStorage.getItem('aiArbitrageBalance')
    return saved ? parseFloat(saved) : 10000
  })
  
  // Completed earnings
  const [totalEarnings, setTotalEarnings] = useState(() => {
    const saved = localStorage.getItem('aiArbitrageTotalEarnings')
    return saved ? parseFloat(saved) : 0
  })
  
  // Arbitrage levels (admin adjustable via Master Admin Panel)
  const [arbitrageLevels, setArbitrageLevels] = useState(() => {
    const saved = localStorage.getItem('aiArbitrageLevels')
    return saved ? JSON.parse(saved) : DEFAULT_ARBITRAGE_LEVELS
  })
  
  // Investment history
  const [investmentHistory, setInvestmentHistory] = useState(() => {
    const saved = localStorage.getItem('aiArbitrageHistory')
    return saved ? JSON.parse(saved) : []
  })
  
  // Check for completed investments and auto-add profits
  useEffect(() => {
    const checkCompletedInvestments = () => {
      const now = Date.now()
      let hasCompleted = false
      let newBalance = userBalance
      let newEarnings = totalEarnings
      
      const updatedInvestments = activeInvestments.filter(inv => {
        if (now >= inv.endTime && !inv.completed) {
          // Investment completed - add capital + profit to balance
          const totalReturn = inv.amount + inv.expectedProfit
          newBalance += totalReturn
          newEarnings += inv.expectedProfit
          hasCompleted = true
          
          // Add to history
          setInvestmentHistory(prev => {
            const updated = [{
              ...inv,
              completed: true,
              completedAt: now,
              returnAmount: totalReturn
            }, ...prev].slice(0, 100)
            localStorage.setItem('aiArbitrageHistory', JSON.stringify(updated))
            return updated
          })
          
          return false // Remove from active
        }
        return true
      })
      
      if (hasCompleted) {
        setActiveInvestments(updatedInvestments)
        setUserBalance(newBalance)
        setTotalEarnings(newEarnings)
        localStorage.setItem('aiArbitrageInvestments', JSON.stringify(updatedInvestments))
        localStorage.setItem('aiArbitrageBalance', newBalance.toString())
        localStorage.setItem('aiArbitrageTotalEarnings', newEarnings.toString())
      }
    }
    
    checkCompletedInvestments()
    const interval = setInterval(checkCompletedInvestments, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [activeInvestments, userBalance, totalEarnings])
  
  // Determine level based on amount
  useEffect(() => {
    const amount = parseFloat(investAmount) || 0
    const level = arbitrageLevels.find(l => amount >= l.minCapital && amount <= l.maxCapital)
    setSelectedLevel(level || null)
  }, [investAmount, arbitrageLevels])
  
  // Start investment
  const startInvestment = () => {
    const amount = parseFloat(investAmount)
    if (!selectedLevel || amount > userBalance) return
    
    setIsInvesting(true)
    
    setTimeout(() => {
      const now = Date.now()
      const cycleDuration = selectedLevel.cycleDays * 24 * 60 * 60 * 1000
      const expectedProfit = amount * (selectedLevel.profit / 100)
      
      const newInvestment = {
        id: `inv_${now}`,
        amount: amount,
        level: selectedLevel.level,
        profit: selectedLevel.profit,
        expectedProfit: expectedProfit,
        cycleDays: selectedLevel.cycleDays,
        startTime: now,
        endTime: now + cycleDuration,
        strategy: AI_STRATEGIES[Math.floor(Math.random() * AI_STRATEGIES.length)].name,
        completed: false
      }
      
      // Deduct from balance
      const newBalance = userBalance - amount
      setUserBalance(newBalance)
      localStorage.setItem('aiArbitrageBalance', newBalance.toString())
      
      // Add to active investments
      setActiveInvestments(prev => {
        const updated = [newInvestment, ...prev]
        localStorage.setItem('aiArbitrageInvestments', JSON.stringify(updated))
        return updated
      })
      
      setInvestAmount('')
      setIsInvesting(false)
    }, 2000)
  }
  
  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (!isOpen) return null

  return (
    <div className="ai-arbitrage-overlay" onClick={onClose}>
      <div className="ai-arbitrage-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-arbitrage-header">
          <div className="ai-header-title">
            <span className="ai-header-icon">🤖</span>
            <h2>AI Arbitrage</h2>
          </div>
          <button className="ai-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Balance Display */}
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

        {/* AI Animation */}
        <AIAnimation isActive={activeInvestments.length > 0} />

        {/* Strategy Info */}
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

        {/* Investment Levels */}
        <div className="ai-levels-section">
          <h3>Investment Levels</h3>
          <div className="ai-levels-grid">
            {arbitrageLevels.map((level) => (
              <div 
                key={level.level}
                className={`ai-level-card ${selectedLevel?.level === level.level ? 'active' : ''}`}
              >
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

        {/* Investment Input */}
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
            {isInvesting ? (
              <>
                <span className="btn-spinner"></span>
                Initializing AI...
              </>
            ) : (
              <>
                <span>🚀</span>
                Start AI Arbitrage
              </>
            )}
          </button>
        </div>

        {/* Active Investments */}
        {activeInvestments.length > 0 && (
          <div className="ai-active-investments">
            <h3>Active Investments ({activeInvestments.length})</h3>
            <div className="active-investments-list">
              {activeInvestments.map((inv) => (
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
                    <div className="investment-total">
                      <span className="amount-label">Total Return</span>
                      <span className="amount-value">${formatCurrency(inv.amount + inv.expectedProfit)}</span>
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
  )
}
