import React, { useState, useEffect } from 'react'

// Simulated/Demo Trading - Practice with Virtual Money
export default function SimulatedTrading({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('trade') // 'trade', 'portfolio', 'leaderboard'
  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [orderType, setOrderType] = useState('buy')
  const [amount, setAmount] = useState('')

  // Demo balance (separate from real balance)
  const [demoBalance, setDemoBalance] = useState(() => {
    const saved = localStorage.getItem('demoBalance')
    return saved ? parseFloat(saved) : 100000 // Start with $100,000 demo
  })

  // Demo portfolio
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('demoPortfolio')
    return saved ? JSON.parse(saved) : {}
  })

  // Trade history
  const [tradeHistory, setTradeHistory] = useState(() => {
    const saved = localStorage.getItem('demoTradeHistory')
    return saved ? JSON.parse(saved) : []
  })

  // Live prices
  const [prices, setPrices] = useState({
    'BTC/USDT': 94500,
    'ETH/USDT': 3450,
    'SOL/USDT': 205,
    'BNB/USDT': 720,
    'XRP/USDT': 2.12,
    'DOGE/USDT': 0.32,
    'ADA/USDT': 0.89,
    'LINK/USDT': 23.50,
    'DOT/USDT': 7.25,
    'AVAX/USDT': 38.50
  })

  const pairs = Object.keys(prices)

  // Leaderboard (simulated)
  const [leaderboard] = useState([
    { rank: 1, name: 'CryptoKing', profit: 45230.50, trades: 128 },
    { rank: 2, name: 'TraderPro', profit: 38750.25, trades: 95 },
    { rank: 3, name: 'BTCHunter', profit: 32100.00, trades: 156 },
    { rank: 4, name: 'MoonShot', profit: 28500.75, trades: 72 },
    { rank: 5, name: 'DiamondHands', profit: 25800.30, trades: 89 },
    { rank: 6, name: 'You', profit: 0, trades: tradeHistory.length, isUser: true },
  ])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('demoBalance', demoBalance.toString())
  }, [demoBalance])

  useEffect(() => {
    localStorage.setItem('demoPortfolio', JSON.stringify(portfolio))
  }, [portfolio])

  useEffect(() => {
    localStorage.setItem('demoTradeHistory', JSON.stringify(tradeHistory))
  }, [tradeHistory])

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(pair => {
          const change = (Math.random() - 0.5) * 0.003
          updated[pair] = updated[pair] * (1 + change)
        })
        return updated
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Calculate portfolio value
  const calculatePortfolioValue = () => {
    let total = 0
    Object.entries(portfolio).forEach(([coin, data]) => {
      const pair = `${coin}/USDT`
      if (prices[pair]) {
        total += data.amount * prices[pair]
      }
    })
    return total
  }

  // Calculate total profit/loss
  const calculateTotalPnL = () => {
    let totalCost = 0
    let currentValue = 0
    Object.entries(portfolio).forEach(([coin, data]) => {
      totalCost += data.totalCost
      const pair = `${coin}/USDT`
      if (prices[pair]) {
        currentValue += data.amount * prices[pair]
      }
    })
    return currentValue - totalCost
  }

  // Execute trade
  const executeTrade = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const tradeAmount = parseFloat(amount)
    const coin = selectedPair.split('/')[0]
    const price = prices[selectedPair]
    const coinAmount = tradeAmount / price

    if (orderType === 'buy') {
      if (tradeAmount > demoBalance) {
        alert('Insufficient demo balance')
        return
      }

      // Update balance and portfolio
      setDemoBalance(demoBalance - tradeAmount)
      setPortfolio(prev => ({
        ...prev,
        [coin]: {
          amount: (prev[coin]?.amount || 0) + coinAmount,
          totalCost: (prev[coin]?.totalCost || 0) + tradeAmount,
          avgPrice: ((prev[coin]?.totalCost || 0) + tradeAmount) / ((prev[coin]?.amount || 0) + coinAmount)
        }
      }))

      // Add to history
      setTradeHistory(prev => [{
        id: Date.now(),
        type: 'buy',
        pair: selectedPair,
        price: price,
        amount: coinAmount,
        value: tradeAmount,
        timestamp: new Date().toISOString()
      }, ...prev])

      alert(`✅ Demo Buy Executed!\n${coinAmount.toFixed(6)} ${coin} @ $${price.toFixed(2)}`)

    } else {
      // Sell
      const holding = portfolio[coin]
      if (!holding || holding.amount < coinAmount) {
        alert('Insufficient holdings')
        return
      }

      const saleValue = coinAmount * price
      const costBasis = (holding.totalCost / holding.amount) * coinAmount

      // Update balance and portfolio
      setDemoBalance(demoBalance + saleValue)
      
      const newAmount = holding.amount - coinAmount
      if (newAmount <= 0.00000001) {
        // Remove from portfolio
        setPortfolio(prev => {
          const updated = { ...prev }
          delete updated[coin]
          return updated
        })
      } else {
        setPortfolio(prev => ({
          ...prev,
          [coin]: {
            amount: newAmount,
            totalCost: holding.totalCost - costBasis,
            avgPrice: (holding.totalCost - costBasis) / newAmount
          }
        }))
      }

      // Add to history
      setTradeHistory(prev => [{
        id: Date.now(),
        type: 'sell',
        pair: selectedPair,
        price: price,
        amount: coinAmount,
        value: saleValue,
        pnl: saleValue - costBasis,
        timestamp: new Date().toISOString()
      }, ...prev])

      alert(`✅ Demo Sell Executed!\n${coinAmount.toFixed(6)} ${coin} @ $${price.toFixed(2)}\nP/L: ${saleValue - costBasis >= 0 ? '+' : ''}$${(saleValue - costBasis).toFixed(2)}`)
    }

    setAmount('')
  }

  // Reset demo account
  const resetDemo = () => {
    if (confirm('Reset demo account? This will restore $100,000 and clear all positions.')) {
      setDemoBalance(100000)
      setPortfolio({})
      setTradeHistory([])
      localStorage.removeItem('demoBalance')
      localStorage.removeItem('demoPortfolio')
      localStorage.removeItem('demoTradeHistory')
    }
  }

  if (!isOpen) return null

  const portfolioValue = calculatePortfolioValue()
  const totalValue = demoBalance + portfolioValue
  const totalPnL = calculateTotalPnL()

  return (
    <div className="sim-modal">
      <div className="sim-overlay" onClick={onClose} />
      <div className="sim-container">
        <div className="sim-header">
          <h2>🎮 Demo Trading</h2>
          <div className="header-actions">
            <button className="reset-btn" onClick={resetDemo}>↻ Reset</button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Demo Badge */}
        <div className="demo-badge">
          <span className="badge-icon">🎮</span>
          <span className="badge-text">DEMO ACCOUNT - Virtual Funds Only</span>
        </div>

        {/* Account Summary */}
        <div className="account-summary">
          <div className="summary-item">
            <span className="label">Available</span>
            <span className="value">${demoBalance.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Portfolio</span>
            <span className="value">${portfolioValue.toFixed(2)}</span>
          </div>
          <div className="summary-item highlight">
            <span className="label">Total Value</span>
            <span className="value">${totalValue.toFixed(2)}</span>
          </div>
          <div className={`summary-item ${totalPnL >= 0 ? 'profit' : 'loss'}`}>
            <span className="label">Total P/L</span>
            <span className="value">{totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="sim-tabs">
          <button 
            className={activeTab === 'trade' ? 'active' : ''} 
            onClick={() => setActiveTab('trade')}
          >Trade</button>
          <button 
            className={activeTab === 'portfolio' ? 'active' : ''} 
            onClick={() => setActiveTab('portfolio')}
          >Portfolio</button>
          <button 
            className={activeTab === 'leaderboard' ? 'active' : ''} 
            onClick={() => setActiveTab('leaderboard')}
          >Leaderboard</button>
        </div>

        {/* Trade Tab */}
        {activeTab === 'trade' && (
          <div className="trade-section">
            {/* Pair Selection */}
            <div className="form-group">
              <label>Select Asset</label>
              <div className="pair-grid">
                {pairs.slice(0, 6).map(pair => (
                  <button
                    key={pair}
                    className={`pair-btn ${selectedPair === pair ? 'active' : ''}`}
                    onClick={() => setSelectedPair(pair)}
                  >
                    <span className="pair-name">{pair.split('/')[0]}</span>
                    <span className="pair-price">${prices[pair].toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Type */}
            <div className="order-type-selector">
              <button 
                className={`type-btn buy ${orderType === 'buy' ? 'active' : ''}`}
                onClick={() => setOrderType('buy')}
              >Buy</button>
              <button 
                className={`type-btn sell ${orderType === 'sell' ? 'active' : ''}`}
                onClick={() => setOrderType('sell')}
              >Sell</button>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label>Amount (USDT)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <div className="amount-presets">
                {[100, 500, 1000, 5000].map(amt => (
                  <button key={amt} onClick={() => setAmount(amt.toString())}>
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Coin Amount Display */}
            {amount && (
              <div className="coin-amount-display">
                <span>You will {orderType}:</span>
                <span className="coin-value">
                  {(parseFloat(amount) / prices[selectedPair]).toFixed(6)} {selectedPair.split('/')[0]}
                </span>
              </div>
            )}

            {/* Execute Button */}
            <button 
              className={`execute-btn ${orderType}`}
              onClick={executeTrade}
            >
              {orderType === 'buy' ? '📈 Buy' : '📉 Sell'} {selectedPair.split('/')[0]}
            </button>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="portfolio-section">
            {Object.keys(portfolio).length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📊</span>
                <p>No holdings yet</p>
                <p className="hint">Start trading to build your portfolio!</p>
              </div>
            ) : (
              <div className="holdings-list">
                {Object.entries(portfolio).map(([coin, data]) => {
                  const pair = `${coin}/USDT`
                  const currentPrice = prices[pair] || 0
                  const currentValue = data.amount * currentPrice
                  const pnl = currentValue - data.totalCost
                  const pnlPercent = (pnl / data.totalCost) * 100

                  return (
                    <div key={coin} className="holding-card">
                      <div className="holding-header">
                        <span className="coin-name">{coin}</span>
                        <span className={`holding-pnl ${pnl >= 0 ? 'profit' : 'loss'}`}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="holding-details">
                        <div className="detail">
                          <span className="label">Amount</span>
                          <span className="value">{data.amount.toFixed(6)}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Avg Price</span>
                          <span className="value">${data.avgPrice.toFixed(2)}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Current Price</span>
                          <span className="value">${currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Value</span>
                          <span className="value">${currentValue.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Recent Trades */}
            {tradeHistory.length > 0 && (
              <div className="recent-trades">
                <h3>Recent Trades</h3>
                {tradeHistory.slice(0, 5).map((trade, idx) => (
                  <div key={idx} className={`trade-item ${trade.type}`}>
                    <div className="trade-info">
                      <span className={`trade-type ${trade.type}`}>
                        {trade.type === 'buy' ? '📈' : '📉'} {trade.type.toUpperCase()}
                      </span>
                      <span className="trade-pair">{trade.pair}</span>
                    </div>
                    <div className="trade-details">
                      <span>{trade.amount.toFixed(6)} @ ${trade.price.toFixed(2)}</span>
                      {trade.pnl !== undefined && (
                        <span className={trade.pnl >= 0 ? 'profit' : 'loss'}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="leaderboard-section">
            <div className="leaderboard-header">
              <span className="trophy">🏆</span>
              <h3>Top Traders This Week</h3>
            </div>
            <div className="leaderboard-list">
              {leaderboard.map((trader, idx) => (
                <div 
                  key={idx} 
                  className={`leaderboard-item ${trader.isUser ? 'is-user' : ''} ${trader.rank <= 3 ? 'top-three' : ''}`}
                >
                  <div className="rank">
                    {trader.rank === 1 ? '🥇' : trader.rank === 2 ? '🥈' : trader.rank === 3 ? '🥉' : `#${trader.rank}`}
                  </div>
                  <div className="trader-info">
                    <span className="trader-name">{trader.name}</span>
                    <span className="trader-trades">{trader.trades} trades</span>
                  </div>
                  <div className={`trader-profit ${trader.profit >= 0 ? 'profit' : 'loss'}`}>
                    {trader.isUser ? `$${(totalValue - 100000).toFixed(2)}` : `+$${trader.profit.toFixed(2)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .sim-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .sim-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .sim-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
          border-radius: 24px 24px 0 0;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .sim-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          background: #1a1a2e;
          z-index: 10;
        }

        .sim-header h2 {
          margin: 0;
          color: #fff;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .reset-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #ff9500;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
        }

        .demo-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: linear-gradient(90deg, rgba(255, 149, 0, 0.2) 0%, rgba(255, 77, 77, 0.2) 100%);
          border-bottom: 1px solid rgba(255, 149, 0, 0.3);
        }

        .badge-icon {
          font-size: 1.25rem;
        }

        .badge-text {
          color: #ff9500;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .account-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 15px;
          border-radius: 12px;
          overflow: hidden;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          padding: 15px;
          background: #1a1a2e;
        }

        .summary-item .label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          margin-bottom: 4px;
        }

        .summary-item .value {
          color: #fff;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .summary-item.highlight .value {
          color: #00d4ff;
        }

        .summary-item.profit .value {
          color: #00ff88;
        }

        .summary-item.loss .value {
          color: #ff4d4d;
        }

        .sim-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sim-tabs button {
          flex: 1;
          padding: 15px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
        }

        .sim-tabs button.active {
          color: #00ff88;
          border-bottom: 2px solid #00ff88;
        }

        .trade-section,
        .portfolio-section,
        .leaderboard-section {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          margin-bottom: 10px;
        }

        .pair-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .pair-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pair-btn.active {
          border-color: #00ff88;
          background: rgba(0, 255, 136, 0.1);
        }

        .pair-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .pair-price {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .order-type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }

        .type-btn {
          padding: 15px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .type-btn.buy {
          background: rgba(0, 255, 136, 0.05);
          color: rgba(0, 255, 136, 0.5);
        }

        .type-btn.buy.active {
          background: rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
          color: #00ff88;
        }

        .type-btn.sell {
          background: rgba(255, 77, 77, 0.05);
          color: rgba(255, 77, 77, 0.5);
        }

        .type-btn.sell.active {
          background: rgba(255, 77, 77, 0.2);
          border-color: #ff4d4d;
          color: #ff4d4d;
        }

        .form-group input {
          width: 100%;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 1.1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #00ff88;
        }

        .amount-presets {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .amount-presets button {
          flex: 1;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
        }

        .coin-amount-display {
          display: flex;
          justify-content: space-between;
          padding: 12px 15px;
          background: rgba(0, 136, 255, 0.1);
          border-radius: 10px;
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.7);
        }

        .coin-value {
          color: #00d4ff;
          font-weight: 600;
        }

        .execute-btn {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
        }

        .execute-btn.buy {
          background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
          color: #000;
        }

        .execute-btn.sell {
          background: linear-gradient(135deg, #ff4d4d 0%, #cc3333 100%);
          color: #fff;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.4);
        }

        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 15px;
        }

        .hint {
          font-size: 0.85rem;
          margin-top: 8px;
        }

        .holdings-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .holding-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 15px;
        }

        .holding-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .coin-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
        }

        .holding-pnl {
          font-weight: 600;
        }

        .holding-pnl.profit {
          color: #00ff88;
        }

        .holding-pnl.loss {
          color: #ff4d4d;
        }

        .holding-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .detail {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .detail .label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .detail .value {
          color: #fff;
          font-size: 0.9rem;
        }

        .recent-trades {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .recent-trades h3 {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          margin: 0 0 15px 0;
        }

        .trade-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .trade-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .trade-type {
          font-size: 0.8rem;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .trade-type.buy {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .trade-type.sell {
          background: rgba(255, 77, 77, 0.2);
          color: #ff4d4d;
        }

        .trade-pair {
          color: #fff;
        }

        .trade-details {
          text-align: right;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .trade-details .profit {
          color: #00ff88;
        }

        .trade-details .loss {
          color: #ff4d4d;
        }

        .leaderboard-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .trophy {
          font-size: 48px;
          display: block;
          margin-bottom: 10px;
        }

        .leaderboard-header h3 {
          color: #fff;
          margin: 0;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .leaderboard-item.is-user {
          background: rgba(0, 212, 255, 0.1);
          border-color: rgba(0, 212, 255, 0.3);
        }

        .leaderboard-item.top-three {
          background: rgba(255, 215, 0, 0.05);
          border-color: rgba(255, 215, 0, 0.2);
        }

        .rank {
          font-size: 1.25rem;
          min-width: 40px;
          text-align: center;
        }

        .trader-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .trader-name {
          color: #fff;
          font-weight: 500;
        }

        .trader-trades {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .trader-profit {
          font-weight: 600;
        }

        .trader-profit.profit {
          color: #00ff88;
        }
      `}</style>
    </div>
  )
}
