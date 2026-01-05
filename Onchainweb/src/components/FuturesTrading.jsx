import React, { useState, useEffect } from 'react'
import CandlestickChart from './CandlestickChart'

// Futures Trading Component - Leveraged Long/Short Positions
export default function FuturesTrading({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('open') // 'open', 'positions', 'history'
  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [leverage, setLeverage] = useState(10)
  const [orderType, setOrderType] = useState('market') // 'market', 'limit'
  const [positionSide, setPositionSide] = useState('long') // 'long', 'short'
  const [amount, setAmount] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')

  // User balance
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('futuresBalance')
    return saved ? parseFloat(saved) : 10000
  })

  // Open positions
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('futuresPositions')
    return saved ? JSON.parse(saved) : []
  })

  // Trade history
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('futuresHistory')
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
    'LINK/USDT': 23.50
  })

  // Trading pairs
  const pairs = Object.keys(prices)

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('futuresBalance', balance.toString())
  }, [balance])

  useEffect(() => {
    localStorage.setItem('futuresPositions', JSON.stringify(positions))
  }, [positions])

  useEffect(() => {
    localStorage.setItem('futuresHistory', JSON.stringify(history))
  }, [history])

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(pair => {
          const change = (Math.random() - 0.5) * 0.002 // ±0.1%
          updated[pair] = updated[pair] * (1 + change)
        })
        return updated
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Calculate PnL for positions
  const calculatePnL = (position) => {
    const currentPrice = prices[position.pair]
    const priceChange = currentPrice - position.entryPrice
    const pnl = position.side === 'long' 
      ? (priceChange / position.entryPrice) * position.margin * position.leverage
      : (-priceChange / position.entryPrice) * position.margin * position.leverage
    return pnl
  }

  // Open new position
  const openPosition = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const margin = parseFloat(amount)
    if (margin > balance) {
      alert('Insufficient balance')
      return
    }

    const newPosition = {
      id: Date.now(),
      pair: selectedPair,
      side: positionSide,
      leverage: leverage,
      margin: margin,
      size: margin * leverage,
      entryPrice: prices[selectedPair],
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      openTime: new Date().toISOString(),
      status: 'open'
    }

    setPositions([...positions, newPosition])
    setBalance(balance - margin)
    setAmount('')
    setStopLoss('')
    setTakeProfit('')
    alert(`✅ ${positionSide.toUpperCase()} position opened!\nPair: ${selectedPair}\nLeverage: ${leverage}x\nSize: $${(margin * leverage).toFixed(2)}`)
  }

  // Close position
  const closePosition = (positionId) => {
    const position = positions.find(p => p.id === positionId)
    if (!position) return

    const pnl = calculatePnL(position)
    const returnAmount = position.margin + pnl

    const closedPosition = {
      ...position,
      closePrice: prices[position.pair],
      closeTime: new Date().toISOString(),
      pnl: pnl,
      status: 'closed'
    }

    setHistory([closedPosition, ...history])
    setPositions(positions.filter(p => p.id !== positionId))
    setBalance(balance + Math.max(0, returnAmount))
    
    alert(`Position closed!\nPnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`)
  }

  if (!isOpen) return null

  return (
    <div className="futures-modal">
      <div className="futures-overlay" onClick={onClose} />
      <div className="futures-container">
        <div className="futures-header">
          <h2>📈 Futures Trading</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Balance Display */}
        <div className="futures-balance">
          <span className="balance-label">Available Balance</span>
          <span className="balance-amount">${balance.toFixed(2)} USDT</span>
        </div>

        {/* Tabs */}
        <div className="futures-tabs">
          <button 
            className={activeTab === 'open' ? 'active' : ''} 
            onClick={() => setActiveTab('open')}
          >Open Position</button>
          <button 
            className={activeTab === 'positions' ? 'active' : ''} 
            onClick={() => setActiveTab('positions')}
          >Positions ({positions.length})</button>
          <button 
            className={activeTab === 'history' ? 'active' : ''} 
            onClick={() => setActiveTab('history')}
          >History</button>
        </div>

        {/* Open Position Tab */}
        {activeTab === 'open' && (
          <div className="open-position-form">
            {/* Pair Selection */}
            <div className="form-group">
              <label>Trading Pair</label>
              <select value={selectedPair} onChange={(e) => setSelectedPair(e.target.value)}>
                {pairs.map(pair => (
                  <option key={pair} value={pair}>{pair} - ${prices[pair].toFixed(2)}</option>
                ))}
              </select>
            </div>

            {/* Current Price */}
            <div className="current-price">
              <span className="price-label">{selectedPair}</span>
              <span className="price-value">${prices[selectedPair].toFixed(2)}</span>
            </div>

            {/* Candlestick Chart */}
            <div className="futures-chart">
              <CandlestickChart 
                symbol={selectedPair}
                currentPrice={prices[selectedPair]}
                height={180}
                showToolbar={true}
              />
            </div>

            {/* Position Side */}
            <div className="position-side-selector">
              <button 
                className={`side-btn long ${positionSide === 'long' ? 'active' : ''}`}
                onClick={() => setPositionSide('long')}
              >
                <span className="side-icon">📈</span>
                <span>Long</span>
              </button>
              <button 
                className={`side-btn short ${positionSide === 'short' ? 'active' : ''}`}
                onClick={() => setPositionSide('short')}
              >
                <span className="side-icon">📉</span>
                <span>Short</span>
              </button>
            </div>

            {/* Leverage Slider */}
            <div className="form-group">
              <label>Leverage: {leverage}x</label>
              <input 
                type="range" 
                min="1" 
                max="125" 
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="leverage-slider"
              />
              <div className="leverage-presets">
                {[5, 10, 20, 50, 100].map(lev => (
                  <button 
                    key={lev}
                    className={leverage === lev ? 'active' : ''}
                    onClick={() => setLeverage(lev)}
                  >{lev}x</button>
                ))}
              </div>
            </div>

            {/* Order Type */}
            <div className="order-type-selector">
              <button 
                className={orderType === 'market' ? 'active' : ''}
                onClick={() => setOrderType('market')}
              >Market</button>
              <button 
                className={orderType === 'limit' ? 'active' : ''}
                onClick={() => setOrderType('limit')}
              >Limit</button>
            </div>

            {orderType === 'limit' && (
              <div className="form-group">
                <label>Limit Price (USDT)</label>
                <input 
                  type="number" 
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="Enter limit price"
                />
              </div>
            )}

            {/* Margin Amount */}
            <div className="form-group">
              <label>Margin Amount (USDT)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter margin amount"
              />
              <div className="amount-presets">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => setAmount((balance * pct / 100).toFixed(2))}>
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Position Size Display */}
            {amount && (
              <div className="position-size-display">
                <span>Position Size:</span>
                <span className="size-value">${(parseFloat(amount || 0) * leverage).toFixed(2)}</span>
              </div>
            )}

            {/* Stop Loss / Take Profit */}
            <div className="sl-tp-row">
              <div className="form-group">
                <label>Stop Loss</label>
                <input 
                  type="number" 
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="form-group">
                <label>Take Profit</label>
                <input 
                  type="number" 
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className={`submit-btn ${positionSide}`}
              onClick={openPosition}
            >
              Open {positionSide.toUpperCase()} {leverage}x
            </button>
          </div>
        )}

        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <div className="positions-list">
            {positions.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📊</span>
                <p>No open positions</p>
              </div>
            ) : (
              positions.map(position => {
                const pnl = calculatePnL(position)
                const pnlPercent = (pnl / position.margin) * 100
                return (
                  <div key={position.id} className="position-card">
                    <div className="position-header">
                      <span className={`position-side ${position.side}`}>
                        {position.side === 'long' ? '📈' : '📉'} {position.side.toUpperCase()}
                      </span>
                      <span className="position-pair">{position.pair}</span>
                      <span className="position-leverage">{position.leverage}x</span>
                    </div>
                    <div className="position-details">
                      <div className="detail-row">
                        <span>Entry Price</span>
                        <span>${position.entryPrice.toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Current Price</span>
                        <span>${prices[position.pair].toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Margin</span>
                        <span>${position.margin.toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Size</span>
                        <span>${position.size.toFixed(2)}</span>
                      </div>
                      <div className={`detail-row pnl ${pnl >= 0 ? 'profit' : 'loss'}`}>
                        <span>PnL</span>
                        <span>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)</span>
                      </div>
                    </div>
                    <button className="close-position-btn" onClick={() => closePosition(position.id)}>
                      Close Position
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📜</span>
                <p>No trade history</p>
              </div>
            ) : (
              history.map((trade, idx) => (
                <div key={idx} className="history-card">
                  <div className="history-header">
                    <span className={`position-side ${trade.side}`}>
                      {trade.side === 'long' ? '📈' : '📉'} {trade.side.toUpperCase()}
                    </span>
                    <span className="position-pair">{trade.pair}</span>
                    <span className={`history-pnl ${trade.pnl >= 0 ? 'profit' : 'loss'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="history-details">
                    <span>Entry: ${trade.entryPrice.toFixed(2)}</span>
                    <span>Exit: ${trade.closePrice.toFixed(2)}</span>
                    <span>{new Date(trade.closeTime).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        .futures-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .futures-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .futures-container {
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

        .futures-header {
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

        .futures-header h2 {
          margin: 0;
          font-size: 1.25rem;
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
          font-size: 1.25rem;
        }

        .futures-balance {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: rgba(0, 255, 136, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .balance-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .balance-amount {
          color: #00ff88;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .futures-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .futures-tabs button {
          flex: 1;
          padding: 15px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .futures-tabs button.active {
          color: #00ff88;
          border-bottom: 2px solid #00ff88;
        }

        .open-position-form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #00ff88;
        }

        .current-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .price-label {
          color: rgba(255, 255, 255, 0.6);
        }

        .price-value {
          color: #fff;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .position-side-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .side-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 15px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .side-btn.long.active {
          border-color: #00ff88;
          background: rgba(0, 255, 136, 0.1);
        }

        .side-btn.short.active {
          border-color: #ff4d4d;
          background: rgba(255, 77, 77, 0.1);
        }

        .side-icon {
          font-size: 1.5rem;
        }

        .leverage-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          -webkit-appearance: none;
          margin-bottom: 12px;
        }

        .leverage-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #00ff88;
          cursor: pointer;
        }

        .leverage-presets,
        .amount-presets {
          display: flex;
          gap: 8px;
        }

        .leverage-presets button,
        .amount-presets button {
          flex: 1;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          cursor: pointer;
        }

        .leverage-presets button.active {
          background: rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
          color: #00ff88;
        }

        .order-type-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .order-type-selector button {
          flex: 1;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
        }

        .order-type-selector button.active {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
          color: #00ff88;
        }

        .position-size-display {
          display: flex;
          justify-content: space-between;
          padding: 12px 15px;
          background: rgba(0, 136, 255, 0.1);
          border-radius: 10px;
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.7);
        }

        .size-value {
          color: #00d4ff;
          font-weight: 600;
        }

        .sl-tp-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
        }

        .submit-btn.long {
          background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
          color: #000;
        }

        .submit-btn.short {
          background: linear-gradient(135deg, #ff4d4d 0%, #cc3333 100%);
          color: #fff;
        }

        .positions-list,
        .history-list {
          padding: 20px;
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

        .position-card,
        .history-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .position-header,
        .history-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .position-side {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .position-side.long {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .position-side.short {
          background: rgba(255, 77, 77, 0.2);
          color: #ff4d4d;
        }

        .position-pair {
          color: #fff;
          font-weight: 600;
        }

        .position-leverage {
          margin-left: auto;
          color: #00d4ff;
          font-size: 0.85rem;
        }

        .position-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .detail-row.pnl.profit {
          color: #00ff88;
        }

        .detail-row.pnl.loss {
          color: #ff4d4d;
        }

        .close-position-btn {
          width: 100%;
          padding: 12px;
          margin-top: 15px;
          background: rgba(255, 77, 77, 0.2);
          border: 1px solid rgba(255, 77, 77, 0.3);
          border-radius: 10px;
          color: #ff4d4d;
          cursor: pointer;
        }

        .history-pnl {
          margin-left: auto;
          font-weight: 600;
        }

        .history-pnl.profit {
          color: #00ff88;
        }

        .history-pnl.loss {
          color: #ff4d4d;
        }

        .history-details {
          display: flex;
          gap: 15px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  )
}
