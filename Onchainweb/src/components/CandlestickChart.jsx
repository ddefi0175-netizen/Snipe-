import { useRef, useEffect, useState } from 'react'

// Professional Candlestick Chart Component
export default function CandlestickChart({ 
  symbol = 'BTC/USDT', 
  currentPrice = 0,
  height = 300,
  showToolbar = true,
  onTimeframeChange = null
}) {
  const canvasRef = useRef(null)
  const [timeframe, setTimeframe] = useState('1m')
  const [chartType, setChartType] = useState('candle') // 'candle' or 'line'
  const [candles, setCandles] = useState([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 })
  const [crosshair, setCrosshair] = useState(null)
  const [indicators, setIndicators] = useState({ ma: true, volume: true })

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d']

  // Generate initial candle data
  useEffect(() => {
    const generateCandles = () => {
      const data = []
      let basePrice = currentPrice || 95000
      const volatility = basePrice * 0.001 // 0.1% volatility
      const candleCount = 100

      for (let i = candleCount; i >= 0; i--) {
        const time = Date.now() - (i * getTimeframeMs(timeframe))
        const open = basePrice + (Math.random() - 0.5) * volatility
        const close = open + (Math.random() - 0.5) * volatility * 2
        const high = Math.max(open, close) + Math.random() * volatility * 0.5
        const low = Math.min(open, close) - Math.random() * volatility * 0.5
        const volume = Math.random() * 1000000 + 500000

        data.push({ time, open, high, low, close, volume })
        basePrice = close
      }
      return data
    }

    setCandles(generateCandles())
  }, [timeframe, symbol])

  // Update current candle with live price
  useEffect(() => {
    if (!currentPrice || candles.length === 0) return

    const interval = setInterval(() => {
      setCandles(prev => {
        const updated = [...prev]
        const last = { ...updated[updated.length - 1] }
        
        // Random price movement
        const change = (Math.random() - 0.5) * (last.close * 0.001)
        last.close = last.close + change
        last.high = Math.max(last.high, last.close)
        last.low = Math.min(last.low, last.close)
        last.volume += Math.random() * 10000

        // New candle every timeframe
        const now = Date.now()
        if (now - last.time > getTimeframeMs(timeframe)) {
          updated.push({
            time: now,
            open: last.close,
            high: last.close,
            low: last.close,
            close: last.close,
            volume: 0
          })
          updated.shift() // Keep only last 100 candles
        } else {
          updated[updated.length - 1] = last
        }

        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentPrice, timeframe])

  // Get timeframe in milliseconds
  const getTimeframeMs = (tf) => {
    const map = {
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '1h': 3600000,
      '4h': 14400000,
      '1d': 86400000
    }
    return map[tf] || 60000
  }

  // Calculate MA (Moving Average)
  const calculateMA = (data, period = 20) => {
    const ma = []
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ma.push(null)
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b.close, 0)
        ma.push(sum / period)
      }
    }
    return ma
  }

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || candles.length < 2) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const chartHeight = indicators.volume ? rect.height * 0.75 : rect.height - 30
    const volumeHeight = rect.height * 0.2
    const volumeTop = chartHeight + 10

    // Clear canvas
    ctx.fillStyle = '#0a0a14'
    ctx.fillRect(0, 0, width, rect.height)

    // Calculate price range
    const prices = candles.flatMap(c => [c.high, c.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const padding = (maxPrice - minPrice) * 0.05
    const min = minPrice - padding
    const max = maxPrice + padding
    setPriceRange({ min, max })

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width - 60, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = ((width - 60) / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, chartHeight)
      ctx.stroke()
    }

    // Draw price axis
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    
    for (let i = 0; i <= 5; i++) {
      const price = max - ((max - min) / 5) * i
      const y = (chartHeight / 5) * i + 4
      ctx.fillText(formatPrice(price), width - 5, y)
    }

    // Candle dimensions
    const candleWidth = (width - 70) / candles.length
    const candleGap = candleWidth * 0.2

    if (chartType === 'candle') {
      // Draw candlesticks
      candles.forEach((candle, i) => {
        const x = i * candleWidth + candleGap / 2
        const isGreen = candle.close >= candle.open

        // Wick
        const wickX = x + (candleWidth - candleGap) / 2
        const highY = chartHeight - ((candle.high - min) / (max - min)) * chartHeight
        const lowY = chartHeight - ((candle.low - min) / (max - min)) * chartHeight

        ctx.strokeStyle = isGreen ? '#00ff88' : '#ff4d4d'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(wickX, highY)
        ctx.lineTo(wickX, lowY)
        ctx.stroke()

        // Body
        const openY = chartHeight - ((candle.open - min) / (max - min)) * chartHeight
        const closeY = chartHeight - ((candle.close - min) / (max - min)) * chartHeight
        const bodyTop = Math.min(openY, closeY)
        const bodyHeight = Math.abs(closeY - openY) || 1

        ctx.fillStyle = isGreen ? '#00ff88' : '#ff4d4d'
        ctx.fillRect(x, bodyTop, candleWidth - candleGap, bodyHeight)
      })
    } else {
      // Draw line chart
      ctx.beginPath()
      ctx.strokeStyle = '#7c3aed'
      ctx.lineWidth = 2

      candles.forEach((candle, i) => {
        const x = i * candleWidth + (candleWidth - candleGap) / 2
        const y = chartHeight - ((candle.close - min) / (max - min)) * chartHeight
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Area fill
      const lastX = (candles.length - 1) * candleWidth + (candleWidth - candleGap) / 2
      ctx.lineTo(lastX, chartHeight)
      ctx.lineTo((candleWidth - candleGap) / 2, chartHeight)
      ctx.closePath()
      const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight)
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.3)')
      gradient.addColorStop(1, 'rgba(124, 58, 237, 0)')
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // Draw MA if enabled
    if (indicators.ma && chartType === 'candle') {
      const ma20 = calculateMA(candles, 20)
      const ma50 = calculateMA(candles, 50)

      // MA 20
      ctx.beginPath()
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 1
      ma20.forEach((value, i) => {
        if (value === null) return
        const x = i * candleWidth + (candleWidth - candleGap) / 2
        const y = chartHeight - ((value - min) / (max - min)) * chartHeight
        if (i === 0 || ma20[i - 1] === null) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // MA 50
      ctx.beginPath()
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 1
      ma50.forEach((value, i) => {
        if (value === null) return
        const x = i * candleWidth + (candleWidth - candleGap) / 2
        const y = chartHeight - ((value - min) / (max - min)) * chartHeight
        if (i === 0 || ma50[i - 1] === null) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    // Draw volume if enabled
    if (indicators.volume) {
      const maxVolume = Math.max(...candles.map(c => c.volume))
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '10px monospace'
      ctx.fillText('Volume', 5, volumeTop + 12)

      candles.forEach((candle, i) => {
        const x = i * candleWidth + candleGap / 2
        const barHeight = (candle.volume / maxVolume) * volumeHeight
        const isGreen = candle.close >= candle.open

        ctx.fillStyle = isGreen ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 77, 77, 0.3)'
        ctx.fillRect(x, volumeTop + volumeHeight - barHeight, candleWidth - candleGap, barHeight)
      })
    }

    // Draw crosshair if hovering
    if (crosshair) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.setLineDash([5, 5])
      ctx.lineWidth = 1

      // Vertical line
      ctx.beginPath()
      ctx.moveTo(crosshair.x, 0)
      ctx.lineTo(crosshair.x, chartHeight)
      ctx.stroke()

      // Horizontal line
      ctx.beginPath()
      ctx.moveTo(0, crosshair.y)
      ctx.lineTo(width - 60, crosshair.y)
      ctx.stroke()

      ctx.setLineDash([])

      // Price label
      const hoverPrice = max - (crosshair.y / chartHeight) * (max - min)
      ctx.fillStyle = '#7c3aed'
      ctx.fillRect(width - 60, crosshair.y - 10, 60, 20)
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.fillText(formatPrice(hoverPrice), width - 30, crosshair.y + 4)
    }

    // Current price line
    const lastCandle = candles[candles.length - 1]
    if (lastCandle) {
      const priceY = chartHeight - ((lastCandle.close - min) / (max - min)) * chartHeight
      
      ctx.strokeStyle = lastCandle.close >= candles[candles.length - 2]?.close ? '#00ff88' : '#ff4d4d'
      ctx.setLineDash([3, 3])
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, priceY)
      ctx.lineTo(width - 60, priceY)
      ctx.stroke()
      ctx.setLineDash([])

      // Price tag
      ctx.fillStyle = lastCandle.close >= candles[candles.length - 2]?.close ? '#00ff88' : '#ff4d4d'
      ctx.fillRect(width - 60, priceY - 10, 60, 20)
      ctx.fillStyle = '#000'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(formatPrice(lastCandle.close), width - 30, priceY + 4)
    }

  }, [candles, chartType, indicators, crosshair])

  // Format price based on value
  const formatPrice = (price) => {
    if (price >= 1000) return price.toFixed(0)
    if (price >= 1) return price.toFixed(2)
    if (price >= 0.01) return price.toFixed(4)
    return price.toFixed(6)
  }

  // Handle mouse move for crosshair
  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCrosshair({ x, y })
  }

  const handleMouseLeave = () => {
    setCrosshair(null)
  }

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf)
    if (onTimeframeChange) onTimeframeChange(tf)
  }

  return (
    <div className="candlestick-chart-container">
      {showToolbar && (
        <div className="chart-toolbar">
          <div className="timeframe-buttons">
            {timeframes.map(tf => (
              <button
                key={tf}
                className={timeframe === tf ? 'active' : ''}
                onClick={() => handleTimeframeChange(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <div className="chart-type-buttons">
            <button
              className={chartType === 'candle' ? 'active' : ''}
              onClick={() => setChartType('candle')}
              title="Candlestick"
            >
              📊
            </button>
            <button
              className={chartType === 'line' ? 'active' : ''}
              onClick={() => setChartType('line')}
              title="Line"
            >
              📈
            </button>
          </div>

          <div className="indicator-buttons">
            <button
              className={indicators.ma ? 'active' : ''}
              onClick={() => setIndicators(prev => ({ ...prev, ma: !prev.ma }))}
              title="Moving Average"
            >
              MA
            </button>
            <button
              className={indicators.volume ? 'active' : ''}
              onClick={() => setIndicators(prev => ({ ...prev, volume: !prev.volume }))}
              title="Volume"
            >
              Vol
            </button>
          </div>
        </div>
      )}

      <div className="chart-legend">
        <span className="legend-item">
          <span className="dot green"></span> MA(20)
        </span>
        <span className="legend-item">
          <span className="dot blue"></span> MA(50)
        </span>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      <style>{`
        .candlestick-chart-container {
          background: #0a0a14;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chart-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-wrap: wrap;
        }

        .timeframe-buttons,
        .chart-type-buttons,
        .indicator-buttons {
          display: flex;
          gap: 4px;
        }

        .chart-toolbar button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .chart-toolbar button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .chart-toolbar button.active {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          border-color: transparent;
          color: #fff;
        }

        .chart-legend {
          display: flex;
          gap: 15px;
          padding: 5px 12px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .legend-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-item .dot.green {
          background: #fbbf24;
        }

        .legend-item .dot.blue {
          background: #3b82f6;
        }

        canvas {
          display: block;
          cursor: crosshair;
        }
      `}</style>
    </div>
  )
}
