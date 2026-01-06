import React, { useState, useEffect, useRef } from 'react'
import CandlestickChart from './CandlestickChart'
import { tradeAPI, userAPI } from '../lib/api'

// Binary Options Trading - Time-based Up/Down Predictions
export default function BinaryOptions({ isOpen, onClose }) {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [duration, setDuration] = useState(60) // seconds
  const [amount, setAmount] = useState('')
  const [activeTrades, setActiveTrades] = useState([])
  const [tradeHistory, setTradeHistory] = useState(() => {
    const saved = localStorage.getItem('binaryHistory')
    return saved ? JSON.parse(saved) : []
  })

  // User balance
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('binaryBalance')
    return saved ? parseFloat(saved) : 5000
  })

  // Live prices
  const [prices, setPrices] = useState({
    'BTC/USDT': { price: 94500, change: 0 },
    'ETH/USDT': { price: 3450, change: 0 },
    'SOL/USDT': { price: 205, change: 0 },
    'BNB/USDT': { price: 720, change: 0 },
    'XRP/USDT': { price: 2.12, change: 0 },
    'DOGE/USDT': { price: 0.32, change: 0 }
  })

  const pairs = Object.keys(prices)
  const durations = [30, 60, 120, 300, 600] // seconds

  // Payout percentages
  const payoutRate = 0.85 // 85% payout

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('binaryBalance', balance.toString())
  }, [balance])

  useEffect(() => {
    localStorage.setItem('binaryHistory', JSON.stringify(tradeHistory))
  }, [tradeHistory])

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated = {}
        Object.keys(prev).forEach(pair => {
          const change = (Math.random() - 0.5) * 0.004 // ±0.2%
          const newPrice = prev[pair].price * (1 + change)
          updated[pair] = {
            price: newPrice,
            change: ((newPrice - prev[pair].price) / prev[pair].price) * 100
          }
        })
        return updated
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Process active trades countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prev => {
        const now = Date.now()
        const updated = []
        const completed = []

        prev.forEach(trade => {
          const remaining = trade.expiryTime - now
          if (remaining <= 0) {
            // Trade expired - determine result
            const currentPrice = prices[trade.pair].price
            const won = trade.direction === 'up' 
              ? currentPrice > trade.entryPrice
              : currentPrice < trade.entryPrice

            completed.push({
              ...trade,
              exitPrice: currentPrice,
              result: won ? 'win' : 'loss',
              payout: won ? trade.amount * (1 + payoutRate) : 0,
              completedAt: new Date().toISOString()
            })

            // Sync completion to backend
            if (trade.backendId) {
              tradeAPI.complete(
                trade.backendId, 
                won ? 'win' : 'lose', 
                currentPrice, 
                won ? trade.amount * payoutRate : -trade.amount,
                won ? trade.amount * (1 + payoutRate) : 0
              ).catch(err => console.error('Failed to sync trade completion:', err))
            }

            if (won) {
              setBalance(b => b + trade.amount * (1 + payoutRate))
            }
          } else {
            updated.push({ ...trade, remaining })
          }
        })

        if (completed.length > 0) {
          setTradeHistory(h => [...completed, ...h])
        }

        return updated
      })
    }, 100)
    return () => clearInterval(interval)
  }, [prices])

  // Place trade
  const placeTrade = async (direction) => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const tradeAmount = parseFloat(amount)
    if (tradeAmount > balance) {
      alert('Insufficient balance')
      return
    }

    const wallet = localStorage.getItem('walletAddress') || ''
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    
    const newTrade = {
      id: Date.now(),
      pair: selectedPair,
      direction: direction,
      amount: tradeAmount,
      entryPrice: prices[selectedPair].price,
      duration: duration,
      expiryTime: Date.now() + (duration * 1000),
      remaining: duration * 1000,
      potentialPayout: tradeAmount * (1 + payoutRate)
    }

    // Sync to backend
    try {
      const backendTrade = await tradeAPI.create({
        userId: wallet,
        username: userProfile.username || '',
        type: 'binary',
        pair: selectedPair,
        direction: direction,
        entryPrice: prices[selectedPair].price,
        duration: duration,
        amount: tradeAmount,
        profitPercent: payoutRate * 100,
        expectedProfit: tradeAmount * payoutRate
      })
      newTrade.backendId = backendTrade._id
      console.log('Trade synced to backend:', backendTrade.tradeId)
    } catch (error) {
      console.error('Failed to sync trade to backend:', error)
    }

    setActiveTrades([...activeTrades, newTrade])
    setBalance(balance - tradeAmount)
    setAmount('')
  }

  // Format time remaining
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return minutes > 0 ? `${minutes}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }

  if (!isOpen) return null

  return (
    <div className="binary-modal">
      <div className="binary-overlay" onClick={onClose} />
      <div className="binary-container">
        <div className="binary-header">
          <h2>⏱️ Binary Options</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Balance */}
        <div className="binary-balance">
          <span className="balance-label">Balance</span>
          <span className="balance-amount">${balance.toFixed(2)}</span>
        </div>

        {/* Price Chart Area */}
        <div className="chart-area">
          <div className="chart-header">
            <select 
              value={selectedPair} 
              onChange={(e) => setSelectedPair(e.target.value)}
              className="pair-select"
            >
              {pairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
            <div className="current-price-display">
              <span className="price">${prices[selectedPair].price.toFixed(2)}</span>
              <span className={`change ${prices[selectedPair].change >= 0 ? 'up' : 'down'}`}>
                {prices[selectedPair].change >= 0 ? '▲' : '▼'} {Math.abs(prices[selectedPair].change).toFixed(3)}%
              </span>
            </div>
          </div>

          {/* Simulated Chart */}
          <div className="price-chart">
            <CandlestickChart 
              symbol={selectedPair}
              currentPrice={prices[selectedPair].price}
              height={200}
              showToolbar={true}
            />
          </div>
        </div>

        {/* Duration Selection */}
        <div className="duration-section">
          <label>Expiry Time</label>
          <div className="duration-options">
            {durations.map(d => (
              <button
                key={d}
                className={duration === d ? 'active' : ''}
                onClick={() => setDuration(d)}
              >
                {d < 60 ? `${d}s` : `${d / 60}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="amount-section">
          <label>Investment Amount</label>
          <div className="amount-input-wrapper">
            <span className="currency">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="amount-presets">
            {[10, 25, 50, 100, 500].map(amt => (
              <button key={amt} onClick={() => setAmount(amt.toString())}>
                ${amt}
              </button>
            ))}
          </div>
          {amount && (
            <div className="potential-payout">
              Potential Payout: <span className="payout-amount">${(parseFloat(amount) * (1 + payoutRate)).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Trade Buttons */}
        <div className="trade-buttons">
          <button className="trade-btn up" onClick={() => placeTrade('up')}>
            <span className="btn-icon">📈</span>
            <span className="btn-label">UP</span>
            <span className="btn-payout">+{(payoutRate * 100).toFixed(0)}%</span>
          </button>
          <button className="trade-btn down" onClick={() => placeTrade('down')}>
            <span className="btn-icon">📉</span>
            <span className="btn-label">DOWN</span>
            <span className="btn-payout">+{(payoutRate * 100).toFixed(0)}%</span>
          </button>
        </div>

        {/* Active Trades */}
        {activeTrades.length > 0 && (
          <div className="active-trades">
            <h3>Active Trades</h3>
            {activeTrades.map(trade => {
              const currentPrice = prices[trade.pair].price
              const inProfit = trade.direction === 'up' 
                ? currentPrice > trade.entryPrice 
                : currentPrice < trade.entryPrice
              const progress = 1 - (trade.remaining / (trade.duration * 1000))
              
              return (
                <div key={trade.id} className={`active-trade-card ${inProfit ? 'winning' : 'losing'}`}>
                  <div className="trade-info">
                    <span className={`direction ${trade.direction}`}>
                      {trade.direction === 'up' ? '📈' : '📉'} {trade.direction.toUpperCase()}
                    </span>
                    <span className="trade-pair">{trade.pair}</span>
                    <span className="trade-amount">${trade.amount.toFixed(2)}</span>
                  </div>
                  <div className="trade-prices">
                    <span>Entry: ${trade.entryPrice.toFixed(2)}</span>
                    <span>Current: ${currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="trade-timer">
                    <div className="timer-bar">
                      <div className="timer-progress" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <span className="time-remaining">{formatTime(trade.remaining)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Trade History */}
        {tradeHistory.length > 0 && (
          <div className="trade-history">
            <h3>Recent Trades</h3>
            {tradeHistory.slice(0, 5).map((trade, idx) => (
              <div key={idx} className={`history-item ${trade.result}`}>
                <div className="history-info">
                  <span className={`direction ${trade.direction}`}>
                    {trade.direction === 'up' ? '📈' : '📉'}
                  </span>
                  <span className="pair">{trade.pair}</span>
                  <span className="amount">${trade.amount.toFixed(2)}</span>
                </div>
                <span className={`result-badge ${trade.result}`}>
                  {trade.result === 'win' ? `+$${(trade.payout - trade.amount).toFixed(2)}` : `-$${trade.amount.toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .binary-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .binary-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .binary-container {
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

        .binary-header {
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

        .binary-header h2 {
          margin: 0;
          color: #fff;
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

        .binary-balance {
          display: flex;
          justify-content: space-between;
          padding: 15px 20px;
          background: rgba(0, 255, 136, 0.1);
        }

        .balance-label {
          color: rgba(255, 255, 255, 0.6);
        }

        .balance-amount {
          color: #00ff88;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .chart-area {
          padding: 15px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .pair-select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: #fff;
          padding: 10px 15px;
          font-size: 1rem;
        }

        .current-price-display {
          text-align: right;
        }

        .current-price-display .price {
          display: block;
          color: #fff;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .current-price-display .change {
          font-size: 0.9rem;
        }

        .change.up {
          color: #00ff88;
        }

        .change.down {
          color: #ff4d4d;
        }

        .price-chart {
          height: 150px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          overflow: hidden;
        }

        .duration-section {
          padding: 15px 20px;
        }

        .duration-section label {
          display: block;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          margin-bottom: 10px;
        }

        .duration-options {
          display: flex;
          gap: 10px;
        }

        .duration-options button {
          flex: 1;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .duration-options button.active {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
          color: #00ff88;
        }

        .amount-section {
          padding: 15px 20px;
        }

        .amount-section label {
          display: block;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          margin-bottom: 10px;
        }

        .amount-input-wrapper {
          position: relative;
          margin-bottom: 12px;
        }

        .amount-input-wrapper .currency {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.25rem;
        }

        .amount-input-wrapper input {
          width: 100%;
          padding: 15px 15px 15px 35px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 1.25rem;
        }

        .amount-input-wrapper input:focus {
          outline: none;
          border-color: #00ff88;
        }

        .amount-presets {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .amount-presets button {
          flex: 1;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          cursor: pointer;
        }

        .potential-payout {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }

        .payout-amount {
          color: #00ff88;
          font-weight: 600;
        }

        .trade-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          padding: 20px;
        }

        .trade-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .trade-btn.up {
          background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
        }

        .trade-btn.down {
          background: linear-gradient(135deg, #ff4d4d 0%, #cc3333 100%);
        }

        .trade-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .btn-icon {
          font-size: 2rem;
        }

        .btn-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: #000;
        }

        .trade-btn.down .btn-label {
          color: #fff;
        }

        .btn-payout {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .active-trades,
        .trade-history {
          padding: 15px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .active-trades h3,
        .trade-history h3 {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          margin: 0 0 15px 0;
          text-transform: uppercase;
        }

        .active-trade-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 12px;
        }

        .active-trade-card.winning {
          border-color: rgba(0, 255, 136, 0.3);
        }

        .active-trade-card.losing {
          border-color: rgba(255, 77, 77, 0.3);
        }

        .trade-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .direction {
          font-size: 0.8rem;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .direction.up {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .direction.down {
          background: rgba(255, 77, 77, 0.2);
          color: #ff4d4d;
        }

        .trade-pair {
          color: #fff;
          font-weight: 500;
        }

        .trade-amount {
          margin-left: auto;
          color: rgba(255, 255, 255, 0.6);
        }

        .trade-prices {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 12px;
        }

        .trade-timer {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .timer-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .timer-progress {
          height: 100%;
          background: linear-gradient(90deg, #00ff88 0%, #ff9500 50%, #ff4d4d 100%);
          transition: width 0.1s linear;
        }

        .time-remaining {
          color: #fff;
          font-weight: 600;
          font-size: 0.9rem;
          min-width: 50px;
          text-align: right;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .history-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .history-info .pair {
          color: #fff;
        }

        .history-info .amount {
          color: rgba(255, 255, 255, 0.5);
        }

        .result-badge {
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .result-badge.win {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .result-badge.loss {
          background: rgba(255, 77, 77, 0.2);
          color: #ff4d4d;
        }
      `}</style>
    </div>
  )
}

// Simple Price Chart Component
function PriceChart({ price }) {
  const canvasRef = useRef(null)
  const [priceHistory, setPriceHistory] = useState([])

  useEffect(() => {
    setPriceHistory(prev => {
      const updated = [...prev, price].slice(-60)
      return updated
    })
  }, [price])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || priceHistory.length < 2) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate bounds
    const min = Math.min(...priceHistory) * 0.9999
    const max = Math.max(...priceHistory) * 1.0001
    const range = max - min

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.1)')
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0)')

    // Draw line
    ctx.beginPath()
    priceHistory.forEach((p, i) => {
      const x = (i / (priceHistory.length - 1)) * width
      const y = height - ((p - min) / range) * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 2
    ctx.stroke()

    // Fill area
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }, [priceHistory])

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={150}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
