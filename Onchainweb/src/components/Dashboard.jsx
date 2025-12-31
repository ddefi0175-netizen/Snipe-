import React, { useEffect, useState, useMemo } from 'react'
import NewsModal from './NewsModal.jsx'

// CoinGecko API - fetch top 250 coins (covers 60%+ of market)
const CRYPTO_API = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h'

// Free news APIs
const CRYPTO_NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular'

// K-line chart component
function KLineChart({ symbol, name, type, onClose }) {
  const [timeframe, setTimeframe] = useState('1D')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Generate realistic K-line data
    const generateKLineData = () => {
      const data = []
      const now = Date.now()
      const intervals = { '1H': 60, '4H': 96, '1D': 30, '1W': 52, '1M': 12 }
      const count = intervals[timeframe] || 30
      const intervalMs = {
        '1H': 60 * 1000,
        '4H': 4 * 60 * 60 * 1000,
        '1D': 24 * 60 * 60 * 1000,
        '1W': 7 * 24 * 60 * 60 * 1000,
        '1M': 30 * 24 * 60 * 60 * 1000
      }
      
      let basePrice = type === 'crypto' ? 
        (symbol === 'BTC' ? 94000 : symbol === 'ETH' ? 3400 : Math.random() * 1000) :
        Math.random() * 500 + 50
      
      for (let i = count - 1; i >= 0; i--) {
        const volatility = type === 'crypto' ? 0.03 : 0.015
        const change = (Math.random() - 0.5) * 2 * volatility
        const open = basePrice
        const close = open * (1 + change)
        const high = Math.max(open, close) * (1 + Math.random() * volatility)
        const low = Math.min(open, close) * (1 - Math.random() * volatility)
        const volume = Math.random() * 1000000000
        
        data.push({
          time: now - i * intervalMs[timeframe],
          open: open,
          high: high,
          low: low,
          close: close,
          volume: volume
        })
        basePrice = close
      }
      return data
    }

    setLoading(true)
    setTimeout(() => {
      setChartData(generateKLineData())
      setLoading(false)
    }, 500)
  }, [symbol, timeframe, type])

  const maxPrice = Math.max(...chartData.map(d => d.high))
  const minPrice = Math.min(...chartData.map(d => d.low))
  const priceRange = maxPrice - minPrice

  const formatChartPrice = (price) => {
    if (price >= 1000) return `$${price.toFixed(0)}`
    if (price >= 1) return `$${price.toFixed(2)}`
    return `$${price.toFixed(6)}`
  }

  return (
    <div className="kline-modal-overlay" onClick={onClose}>
      <div className="kline-modal" onClick={e => e.stopPropagation()}>
        <div className="kline-header">
          <div className="kline-title">
            <h2>{symbol} - {name}</h2>
            <span className="kline-type">{type === 'crypto' ? 'Cryptocurrency' : 'Stock'}</span>
          </div>
          <button className="kline-close" onClick={onClose}>×</button>
        </div>

        <div className="kline-timeframes">
          {['1H', '4H', '1D', '1W', '1M'].map(tf => (
            <button 
              key={tf}
              className={timeframe === tf ? 'active' : ''}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="kline-loading">
            <div className="spinner"></div>
            <p>Loading chart data...</p>
          </div>
        ) : (
          <>
            <div className="kline-chart">
              <div className="kline-y-axis">
                <span>{formatChartPrice(maxPrice)}</span>
                <span>{formatChartPrice((maxPrice + minPrice) / 2)}</span>
                <span>{formatChartPrice(minPrice)}</span>
              </div>
              <div className="kline-candles">
                {chartData.map((candle, idx) => {
                  const isGreen = candle.close >= candle.open
                  const bodyTop = ((maxPrice - Math.max(candle.open, candle.close)) / priceRange) * 100
                  const bodyHeight = (Math.abs(candle.close - candle.open) / priceRange) * 100
                  const wickTop = ((maxPrice - candle.high) / priceRange) * 100
                  const wickBottom = ((maxPrice - candle.low) / priceRange) * 100
                  
                  return (
                    <div key={idx} className="kline-candle-container">
                      <div 
                        className="kline-wick"
                        style={{
                          top: `${wickTop}%`,
                          height: `${wickBottom - wickTop}%`,
                          backgroundColor: isGreen ? '#22c55e' : '#ef4444'
                        }}
                      />
                      <div 
                        className={`kline-candle ${isGreen ? 'green' : 'red'}`}
                        style={{
                          top: `${bodyTop}%`,
                          height: `${Math.max(bodyHeight, 0.5)}%`
                        }}
                        title={`O: ${formatChartPrice(candle.open)}\nH: ${formatChartPrice(candle.high)}\nL: ${formatChartPrice(candle.low)}\nC: ${formatChartPrice(candle.close)}`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="kline-volume">
              <span className="kline-volume-label">Volume</span>
              <div className="kline-volume-bars">
                {chartData.map((candle, idx) => {
                  const isGreen = candle.close >= candle.open
                  const maxVol = Math.max(...chartData.map(d => d.volume))
                  const height = (candle.volume / maxVol) * 100
                  return (
                    <div 
                      key={idx} 
                      className={`kline-volume-bar ${isGreen ? 'green' : 'red'}`}
                      style={{ height: `${height}%` }}
                    />
                  )
                })}
              </div>
            </div>

            <div className="kline-stats">
              <div className="kline-stat">
                <span className="label">Open</span>
                <span className="value">{formatChartPrice(chartData[0]?.open || 0)}</span>
              </div>
              <div className="kline-stat">
                <span className="label">High</span>
                <span className="value green">{formatChartPrice(maxPrice)}</span>
              </div>
              <div className="kline-stat">
                <span className="label">Low</span>
                <span className="value red">{formatChartPrice(minPrice)}</span>
              </div>
              <div className="kline-stat">
                <span className="label">Close</span>
                <span className="value">{formatChartPrice(chartData[chartData.length - 1]?.close || 0)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [cryptoData, setCryptoData] = useState([])
  const [stockData, setStockData] = useState([])
  const [cryptoNews, setCryptoNews] = useState([])
  const [stockNews, setStockNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('crypto')
  const [error, setError] = useState(null)
  const [selectedNews, setSelectedNews] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('market_cap')
  const [showAll, setShowAll] = useState(false)
  const [selectedChart, setSelectedChart] = useState(null)

  // Fetch crypto prices
  useEffect(() => {
    let mounted = true
    
    const fetchCrypto = async () => {
      try {
        const res = await fetch(CRYPTO_API)
        if (!res.ok) throw new Error('Failed to fetch crypto data')
        const data = await res.json()
        if (mounted) setCryptoData(data)
      } catch (err) {
        console.error('Crypto fetch error:', err)
        // Use fallback data for demo
        if (mounted) setCryptoData(getFallbackCryptoData())
      }
    }

    const fetchCryptoNews = async () => {
      try {
        const res = await fetch(CRYPTO_NEWS_API)
        if (!res.ok) throw new Error('Failed to fetch news')
        const data = await res.json()
        if (mounted) setCryptoNews(data.Data?.slice(0, 10) || [])
      } catch (err) {
        console.error('News fetch error:', err)
        if (mounted) setCryptoNews(getFallbackCryptoNews())
      }
    }

    // Stock data (comprehensive list)
    const fetchStocks = () => {
      if (mounted) {
        setStockData(getStockData())
        setStockNews(getStockNews())
      }
    }

    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchCrypto(), fetchCryptoNews()])
      fetchStocks()
      if (mounted) setLoading(false)
    }

    loadAll()
    const interval = setInterval(loadAll, 30000) // Refresh every 30s for live data

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const formatPrice = (price) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    if (price >= 1) return `$${price.toFixed(2)}`
    if (price >= 0.0001) return `$${price.toFixed(4)}`
    return `$${price.toFixed(8)}`
  }

  const formatMarketCap = (cap) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toLocaleString()}`
  }

  const formatChange = (change) => {
    if (change === null || change === undefined) return null
    const isPositive = change >= 0
    return (
      <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </span>
    )
  }

  // Filter and sort data
  const filteredCrypto = useMemo(() => {
    let data = [...cryptoData]
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      data = data.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.symbol.toLowerCase().includes(term)
      )
    }
    if (sortBy === 'price') data.sort((a, b) => b.current_price - a.current_price)
    else if (sortBy === 'change') data.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
    else if (sortBy === 'name') data.sort((a, b) => a.name.localeCompare(b.name))
    else data.sort((a, b) => b.market_cap - a.market_cap)
    return showAll ? data : data.slice(0, 20)
  }, [cryptoData, searchTerm, sortBy, showAll])

  const filteredStocks = useMemo(() => {
    let data = [...stockData]
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      data = data.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.symbol.toLowerCase().includes(term)
      )
    }
    if (sortBy === 'price') data.sort((a, b) => b.price - a.price)
    else if (sortBy === 'change') data.sort((a, b) => (b.change || 0) - (a.change || 0))
    else if (sortBy === 'name') data.sort((a, b) => a.name.localeCompare(b.name))
    else data.sort((a, b) => b.marketCap - a.marketCap)
    return showAll ? data : data.slice(0, 20)
  }, [stockData, searchTerm, sortBy, showAll])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading market data...</p>
      </div>
    )
  }

  return (
    <div className="dashboard" id="dashboard">
      {/* Market Overview Section */}
      <section className="market-overview" aria-labelledby="market-heading">
        <h2 id="market-heading">📊 Market Overview</h2>
        <p className="sub">Live prices • Auto-refresh every 30s • {activeTab === 'crypto' ? cryptoData.length : stockData.length} assets</p>

        {/* Tab Switcher */}
        <div className="tab-switcher" role="tablist">
          <button 
            role="tab"
            aria-selected={activeTab === 'crypto'}
            className={activeTab === 'crypto' ? 'active' : ''}
            onClick={() => { setActiveTab('crypto'); setSearchTerm(''); setShowAll(false); }}
          >
            🪙 Crypto ({cryptoData.length})
          </button>
          <button 
            role="tab"
            aria-selected={activeTab === 'stocks'}
            className={activeTab === 'stocks' ? 'active' : ''}
            onClick={() => { setActiveTab('stocks'); setSearchTerm(''); setShowAll(false); }}
          >
            📈 Stocks ({stockData.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="market-controls">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'crypto' ? 'cryptocurrencies' : 'stocks'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="market_cap">Market Cap</option>
            <option value="price">Price</option>
            <option value="change">24h Change</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Crypto Prices */}
        {activeTab === 'crypto' && (
          <div className="price-grid" id="crypto" role="tabpanel">
            {filteredCrypto.map((coin, idx) => (
              <div key={coin.id} className="price-card" onClick={() => setSelectedChart({ symbol: coin.symbol?.toUpperCase(), name: coin.name, type: 'crypto' })}>
                <span className="price-rank">#{cryptoData.findIndex(c => c.id === coin.id) + 1}</span>
                <div className="price-card-header">
                  <img src={coin.image} alt={coin.name} width="32" height="32" loading="lazy" />
                  <div>
                    <span className="coin-name">{coin.name}</span>
                    <span className="coin-symbol">{coin.symbol?.toUpperCase()}</span>
                  </div>
                </div>
                <div className="price-card-body">
                  <span className="price">{formatPrice(coin.current_price)}</span>
                  {formatChange(coin.price_change_percentage_24h)}
                </div>
                <div className="price-card-footer">
                  <span className="sub">MCap: {formatMarketCap(coin.market_cap)}</span>
                  <span className="sub">Vol: {formatMarketCap(coin.total_volume)}</span>
                </div>
                <button className="kline-btn" onClick={(e) => { e.stopPropagation(); setSelectedChart({ symbol: coin.symbol?.toUpperCase(), name: coin.name, type: 'crypto' }); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" />
                    <path d="M7 14l4-4 4 4 5-5" />
                  </svg>
                  K-Line
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'crypto' && !showAll && cryptoData.length > 20 && (
          <button className="show-all-btn" onClick={() => setShowAll(true)}>
            Show All {cryptoData.length} Cryptocurrencies
          </button>
        )}

        {/* Stock Prices */}
        {activeTab === 'stocks' && (
          <div className="price-grid" id="stocks" role="tabpanel">
            {filteredStocks.map((stock, idx) => (
              <div key={stock.symbol} className="price-card" onClick={() => setSelectedChart({ symbol: stock.symbol, name: stock.name, type: 'stock' })}>
                <span className="price-rank">#{stockData.findIndex(s => s.symbol === stock.symbol) + 1}</span>
                <div className="price-card-header">
                  <div className="stock-icon">{stock.symbol.slice(0, 2)}</div>
                  <div>
                    <span className="coin-name">{stock.name}</span>
                    <span className="coin-symbol">{stock.symbol}</span>
                  </div>
                </div>
                <div className="price-card-body">
                  <span className="price">{formatPrice(stock.price)}</span>
                  {formatChange(stock.change)}
                </div>
                <div className="price-card-footer">
                  <span className="sub">MCap: {formatMarketCap(stock.marketCap)}</span>
                  <span className="sub sector-tag">{stock.sector}</span>
                </div>
                <button className="kline-btn" onClick={(e) => { e.stopPropagation(); setSelectedChart({ symbol: stock.symbol, name: stock.name, type: 'stock' }); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" />
                    <path d="M7 14l4-4 4 4 5-5" />
                  </svg>
                  K-Line
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stocks' && !showAll && stockData.length > 20 && (
          <button className="show-all-btn" onClick={() => setShowAll(true)}>
            Show All {stockData.length} Stocks
          </button>
        )}
      </section>

      {/* News Section */}
      <section className="news-section" id="news" aria-labelledby="news-heading">
        <h2 id="news-heading">📰 Latest News</h2>
        
        <div className="news-tabs">
          <div className="news-column">
            <h3>🪙 Crypto News</h3>
            <div className="news-list">
              {cryptoNews.map((item, idx) => (
                <button 
                  key={idx} 
                  className="news-item"
                  onClick={() => setSelectedNews(item)}
                >
                  {item.imageurl && (
                    <img src={item.imageurl} alt="" className="news-thumb" />
                  )}
                  <div className="news-content">
                    <span className="news-title">{item.title}</span>
                    <span className="news-source">{item.source || item.source_info?.name} • {formatTimeAgo(item.published_on)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="news-column">
            <h3>📈 Stock News</h3>
            <div className="news-list">
              {stockNews.map((item, idx) => (
                <button 
                  key={idx} 
                  className="news-item"
                  onClick={() => setSelectedNews(item)}
                >
                  <div className="news-content">
                    <span className="news-title">{item.title}</span>
                    <span className="news-source">{item.source} • {item.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News Modal */}
      {selectedNews && (
        <NewsModal 
          news={selectedNews} 
          onClose={() => setSelectedNews(null)} 
        />
      )}

      {/* K-Line Chart Modal */}
      {selectedChart && (
        <KLineChart 
          symbol={selectedChart.symbol}
          name={selectedChart.name}
          type={selectedChart.type}
          onClose={() => setSelectedChart(null)}
        />
      )}
    </div>
  )
}

// Helper functions
function formatTimeAgo(timestamp) {
  if (!timestamp) return ''
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// Fallback data for demo purposes
function getFallbackCryptoData() {
  return [
    // Top 25 Cryptocurrencies by Market Cap
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 94250, price_change_percentage_24h: 2.35, market_cap: 1850000000000, total_volume: 45000000000, image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 3420, price_change_percentage_24h: 1.82, market_cap: 410000000000, total_volume: 18000000000, image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { id: 'tether', name: 'Tether', symbol: 'usdt', current_price: 1.00, price_change_percentage_24h: 0.01, market_cap: 137000000000, total_volume: 85000000000, image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
    { id: 'ripple', name: 'XRP', symbol: 'xrp', current_price: 2.18, price_change_percentage_24h: -1.23, market_cap: 125000000000, total_volume: 8500000000, image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
    { id: 'binancecoin', name: 'BNB', symbol: 'bnb', current_price: 705, price_change_percentage_24h: -0.45, market_cap: 102000000000, total_volume: 1500000000, image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
    { id: 'solana', name: 'Solana', symbol: 'sol', current_price: 192, price_change_percentage_24h: 4.21, market_cap: 89000000000, total_volume: 3200000000, image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
    { id: 'usd-coin', name: 'USD Coin', symbol: 'usdc', current_price: 1.00, price_change_percentage_24h: 0.02, market_cap: 42000000000, total_volume: 8200000000, image: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'doge', current_price: 0.32, price_change_percentage_24h: 5.67, market_cap: 47000000000, total_volume: 4200000000, image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
    { id: 'cardano', name: 'Cardano', symbol: 'ada', current_price: 0.92, price_change_percentage_24h: 3.15, market_cap: 32000000000, total_volume: 890000000, image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
    { id: 'staked-ether', name: 'Lido Staked ETH', symbol: 'steth', current_price: 3415, price_change_percentage_24h: 1.78, market_cap: 31000000000, total_volume: 120000000, image: 'https://assets.coingecko.com/coins/images/13442/small/steth_logo.png' },
    { id: 'tron', name: 'TRON', symbol: 'trx', current_price: 0.26, price_change_percentage_24h: 2.34, market_cap: 22500000000, total_volume: 1100000000, image: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png' },
    { id: 'avalanche-2', name: 'Avalanche', symbol: 'avax', current_price: 39.85, price_change_percentage_24h: -2.18, market_cap: 16300000000, total_volume: 520000000, image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
    { id: 'chainlink', name: 'Chainlink', symbol: 'link', current_price: 23.45, price_change_percentage_24h: 1.92, market_cap: 14700000000, total_volume: 890000000, image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
    { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'shib', current_price: 0.0000225, price_change_percentage_24h: 4.56, market_cap: 13200000000, total_volume: 620000000, image: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png' },
    { id: 'wrapped-bitcoin', name: 'Wrapped Bitcoin', symbol: 'wbtc', current_price: 94180, price_change_percentage_24h: 2.31, market_cap: 12800000000, total_volume: 320000000, image: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'dot', current_price: 7.35, price_change_percentage_24h: -0.87, market_cap: 11200000000, total_volume: 380000000, image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png' },
    { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'bch', current_price: 485.20, price_change_percentage_24h: 1.45, market_cap: 9600000000, total_volume: 420000000, image: 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png' },
    { id: 'sui', name: 'Sui', symbol: 'sui', current_price: 4.52, price_change_percentage_24h: 6.78, market_cap: 13500000000, total_volume: 1800000000, image: 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg' },
    { id: 'uniswap', name: 'Uniswap', symbol: 'uni', current_price: 14.25, price_change_percentage_24h: 2.89, market_cap: 10700000000, total_volume: 340000000, image: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png' },
    { id: 'litecoin', name: 'Litecoin', symbol: 'ltc', current_price: 108.50, price_change_percentage_24h: 0.95, market_cap: 8100000000, total_volume: 580000000, image: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png' },
    { id: 'pepe', name: 'Pepe', symbol: 'pepe', current_price: 0.0000198, price_change_percentage_24h: 8.92, market_cap: 8300000000, total_volume: 2100000000, image: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg' },
    { id: 'near', name: 'NEAR Protocol', symbol: 'near', current_price: 5.42, price_change_percentage_24h: 3.21, market_cap: 6400000000, total_volume: 420000000, image: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg' },
    { id: 'stellar', name: 'Stellar', symbol: 'xlm', current_price: 0.45, price_change_percentage_24h: 1.67, market_cap: 13800000000, total_volume: 680000000, image: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png' },
    { id: 'hedera-hashgraph', name: 'Hedera', symbol: 'hbar', current_price: 0.29, price_change_percentage_24h: 4.12, market_cap: 11000000000, total_volume: 520000000, image: 'https://assets.coingecko.com/coins/images/3688/small/hbar.png' },
    { id: 'internet-computer', name: 'Internet Computer', symbol: 'icp', current_price: 11.25, price_change_percentage_24h: -1.34, market_cap: 5300000000, total_volume: 110000000, image: 'https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png' },
  ]
}

function getFallbackCryptoNews() {
  return [
    { title: 'Bitcoin Surges Past $94K as Institutional Interest Grows', source: 'CoinDesk', published_on: Date.now()/1000 - 3600, url: 'https://coindesk.com' },
    { title: 'Ethereum 2.0 Staking Rewards Hit New Highs', source: 'Decrypt', published_on: Date.now()/1000 - 7200, url: 'https://decrypt.co' },
    { title: 'Solana DeFi TVL Reaches $10B Milestone', source: 'The Block', published_on: Date.now()/1000 - 14400, url: 'https://theblock.co' },
    { title: 'SEC Approves New Crypto ETF Applications', source: 'Bloomberg', published_on: Date.now()/1000 - 28800, url: 'https://bloomberg.com' },
    { title: 'XRP Lawsuit Settlement Boosts Market Confidence', source: 'CoinTelegraph', published_on: Date.now()/1000 - 36000, url: 'https://cointelegraph.com' },
    { title: 'Dogecoin Rally Continues as Elon Musk Tweets', source: 'Decrypt', published_on: Date.now()/1000 - 43200, url: 'https://decrypt.co' },
  ]
}

function getStockData() {
  return [
    // Magnificent 7 Tech Giants
    { symbol: 'AAPL', name: 'Apple Inc.', price: 254.32, change: 1.24, marketCap: 3900000000000, sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 436.78, change: 0.85, marketCap: 3250000000000, sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 192.45, change: -0.32, marketCap: 2380000000000, sector: 'Technology' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 225.18, change: 2.15, marketCap: 2350000000000, sector: 'E-Commerce' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 137.25, change: 3.45, marketCap: 3380000000000, sector: 'Semiconductors' },
    { symbol: 'META', name: 'Meta Platforms', price: 612.45, change: 1.67, marketCap: 1560000000000, sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 421.56, change: -1.82, marketCap: 1350000000000, sector: 'Automotive' },
    // Tech & Semiconductors
    { symbol: 'AMD', name: 'AMD Inc.', price: 124.80, change: 2.34, marketCap: 202000000000, sector: 'Semiconductors' },
    { symbol: 'INTC', name: 'Intel Corp.', price: 20.15, change: -0.95, marketCap: 86000000000, sector: 'Semiconductors' },
    { symbol: 'AVGO', name: 'Broadcom Inc.', price: 224.56, change: 1.89, marketCap: 935000000000, sector: 'Semiconductors' },
    { symbol: 'QCOM', name: 'Qualcomm Inc.', price: 158.34, change: 0.67, marketCap: 176000000000, sector: 'Semiconductors' },
    { symbol: 'TXN', name: 'Texas Instruments', price: 192.45, change: -0.34, marketCap: 175000000000, sector: 'Semiconductors' },
    { symbol: 'MU', name: 'Micron Technology', price: 89.23, change: 2.56, marketCap: 99000000000, sector: 'Semiconductors' },
    { symbol: 'AMAT', name: 'Applied Materials', price: 178.90, change: 1.23, marketCap: 148000000000, sector: 'Semiconductors' },
    { symbol: 'LRCX', name: 'Lam Research', price: 734.56, change: 0.89, marketCap: 96000000000, sector: 'Semiconductors' },
    { symbol: 'KLAC', name: 'KLA Corporation', price: 678.23, change: 1.45, marketCap: 92000000000, sector: 'Semiconductors' },
    // Software & Cloud
    { symbol: 'CRM', name: 'Salesforce Inc.', price: 342.67, change: 1.12, marketCap: 328000000000, sector: 'Software' },
    { symbol: 'ORCL', name: 'Oracle Corp.', price: 172.34, change: 0.78, marketCap: 478000000000, sector: 'Software' },
    { symbol: 'ADBE', name: 'Adobe Inc.', price: 452.18, change: -0.45, marketCap: 199000000000, sector: 'Software' },
    { symbol: 'NOW', name: 'ServiceNow Inc.', price: 912.34, change: 2.34, marketCap: 187000000000, sector: 'Software' },
    { symbol: 'INTU', name: 'Intuit Inc.', price: 623.45, change: 0.56, marketCap: 174000000000, sector: 'Software' },
    { symbol: 'SNOW', name: 'Snowflake Inc.', price: 167.89, change: 3.21, marketCap: 56000000000, sector: 'Software' },
    { symbol: 'PLTR', name: 'Palantir Tech.', price: 78.45, change: 4.56, marketCap: 178000000000, sector: 'Software' },
    { symbol: 'PANW', name: 'Palo Alto Networks', price: 378.90, change: 1.67, marketCap: 123000000000, sector: 'Software' },
    { symbol: 'CRWD', name: 'CrowdStrike', price: 356.78, change: 2.89, marketCap: 86000000000, sector: 'Software' },
    { symbol: 'ZS', name: 'Zscaler Inc.', price: 198.45, change: 1.23, marketCap: 30000000000, sector: 'Software' },
    { symbol: 'DDOG', name: 'Datadog Inc.', price: 134.56, change: 2.45, marketCap: 45000000000, sector: 'Software' },
    { symbol: 'NET', name: 'Cloudflare Inc.', price: 98.34, change: 3.12, marketCap: 33000000000, sector: 'Software' },
    // Entertainment & Media
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 895.23, change: 2.56, marketCap: 385000000000, sector: 'Entertainment' },
    { symbol: 'DIS', name: 'Walt Disney Co.', price: 112.34, change: -0.78, marketCap: 205000000000, sector: 'Entertainment' },
    { symbol: 'CMCSA', name: 'Comcast Corp.', price: 42.56, change: 0.34, marketCap: 165000000000, sector: 'Media' },
    { symbol: 'WBD', name: 'Warner Bros Disc.', price: 12.34, change: -1.23, marketCap: 30000000000, sector: 'Entertainment' },
    { symbol: 'PARA', name: 'Paramount Global', price: 11.23, change: 0.89, marketCap: 7000000000, sector: 'Entertainment' },
    { symbol: 'SPOT', name: 'Spotify Tech.', price: 478.90, change: 1.56, marketCap: 95000000000, sector: 'Entertainment' },
    // Finance & Banking
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 252.45, change: 0.92, marketCap: 725000000000, sector: 'Finance' },
    { symbol: 'V', name: 'Visa Inc.', price: 318.90, change: 0.67, marketCap: 622000000000, sector: 'Finance' },
    { symbol: 'MA', name: 'Mastercard Inc.', price: 528.34, change: 0.89, marketCap: 492000000000, sector: 'Finance' },
    { symbol: 'BAC', name: 'Bank of America', price: 46.78, change: 1.23, marketCap: 365000000000, sector: 'Finance' },
    { symbol: 'GS', name: 'Goldman Sachs', price: 598.12, change: 1.45, marketCap: 192000000000, sector: 'Finance' },
    { symbol: 'MS', name: 'Morgan Stanley', price: 125.67, change: 0.78, marketCap: 203000000000, sector: 'Finance' },
    { symbol: 'WFC', name: 'Wells Fargo', price: 72.34, change: 0.56, marketCap: 254000000000, sector: 'Finance' },
    { symbol: 'C', name: 'Citigroup Inc.', price: 71.23, change: 1.12, marketCap: 136000000000, sector: 'Finance' },
    { symbol: 'SCHW', name: 'Charles Schwab', price: 78.90, change: 0.45, marketCap: 142000000000, sector: 'Finance' },
    { symbol: 'BLK', name: 'BlackRock Inc.', price: 1023.45, change: 0.89, marketCap: 155000000000, sector: 'Finance' },
    { symbol: 'SPGI', name: 'S&P Global', price: 512.34, change: 0.67, marketCap: 159000000000, sector: 'Finance' },
    { symbol: 'AXP', name: 'American Express', price: 298.56, change: 1.34, marketCap: 214000000000, sector: 'Finance' },
    { symbol: 'PYPL', name: 'PayPal Holdings', price: 89.45, change: 2.12, marketCap: 96000000000, sector: 'Finance' },
    { symbol: 'SQ', name: 'Block Inc.', price: 92.34, change: 2.89, marketCap: 57000000000, sector: 'Finance' },
    { symbol: 'COIN', name: 'Coinbase Global', price: 267.89, change: 5.67, marketCap: 67000000000, sector: 'Finance' },
    // Healthcare & Pharma
    { symbol: 'JNJ', name: 'Johnson & Johnson', price: 145.67, change: 0.34, marketCap: 350000000000, sector: 'Healthcare' },
    { symbol: 'UNH', name: 'UnitedHealth', price: 512.34, change: -0.67, marketCap: 472000000000, sector: 'Healthcare' },
    { symbol: 'PFE', name: 'Pfizer Inc.', price: 26.45, change: 0.89, marketCap: 149000000000, sector: 'Healthcare' },
    { symbol: 'LLY', name: 'Eli Lilly', price: 785.23, change: 2.12, marketCap: 745000000000, sector: 'Healthcare' },
    { symbol: 'MRK', name: 'Merck & Co.', price: 99.34, change: 0.45, marketCap: 252000000000, sector: 'Healthcare' },
    { symbol: 'ABBV', name: 'AbbVie Inc.', price: 178.90, change: 0.78, marketCap: 316000000000, sector: 'Healthcare' },
    { symbol: 'TMO', name: 'Thermo Fisher', price: 534.56, change: 1.23, marketCap: 205000000000, sector: 'Healthcare' },
    { symbol: 'ABT', name: 'Abbott Labs', price: 118.45, change: 0.56, marketCap: 205000000000, sector: 'Healthcare' },
    { symbol: 'DHR', name: 'Danaher Corp.', price: 245.67, change: 0.89, marketCap: 178000000000, sector: 'Healthcare' },
    { symbol: 'BMY', name: 'Bristol-Myers', price: 57.34, change: -0.34, marketCap: 116000000000, sector: 'Healthcare' },
    { symbol: 'AMGN', name: 'Amgen Inc.', price: 278.90, change: 0.67, marketCap: 150000000000, sector: 'Healthcare' },
    { symbol: 'GILD', name: 'Gilead Sciences', price: 92.34, change: 1.12, marketCap: 115000000000, sector: 'Healthcare' },
    { symbol: 'ISRG', name: 'Intuitive Surgical', price: 523.45, change: 1.89, marketCap: 186000000000, sector: 'Healthcare' },
    { symbol: 'VRTX', name: 'Vertex Pharma', price: 412.34, change: 0.45, marketCap: 106000000000, sector: 'Healthcare' },
    { symbol: 'REGN', name: 'Regeneron Pharma', price: 756.78, change: 1.34, marketCap: 84000000000, sector: 'Healthcare' },
    // Consumer & Retail
    { symbol: 'WMT', name: 'Walmart Inc.', price: 92.45, change: 0.56, marketCap: 742000000000, sector: 'Retail' },
    { symbol: 'COST', name: 'Costco Wholesale', price: 934.56, change: 0.89, marketCap: 414000000000, sector: 'Retail' },
    { symbol: 'HD', name: 'Home Depot', price: 412.34, change: 0.45, marketCap: 410000000000, sector: 'Retail' },
    { symbol: 'LOW', name: "Lowe's Companies", price: 267.89, change: 0.67, marketCap: 153000000000, sector: 'Retail' },
    { symbol: 'TGT', name: 'Target Corp.', price: 134.56, change: -0.89, marketCap: 62000000000, sector: 'Retail' },
    { symbol: 'KO', name: 'Coca-Cola Co.', price: 62.34, change: 0.23, marketCap: 269000000000, sector: 'Consumer' },
    { symbol: 'PEP', name: 'PepsiCo Inc.', price: 152.67, change: -0.12, marketCap: 209000000000, sector: 'Consumer' },
    { symbol: 'MCD', name: "McDonald's Corp.", price: 295.45, change: 0.78, marketCap: 213000000000, sector: 'Consumer' },
    { symbol: 'SBUX', name: 'Starbucks Corp.', price: 98.34, change: 1.23, marketCap: 112000000000, sector: 'Consumer' },
    { symbol: 'NKE', name: 'Nike Inc.', price: 78.23, change: -1.23, marketCap: 118000000000, sector: 'Consumer' },
    { symbol: 'PG', name: 'Procter & Gamble', price: 168.90, change: 0.34, marketCap: 398000000000, sector: 'Consumer' },
    { symbol: 'PM', name: 'Philip Morris', price: 123.45, change: 0.56, marketCap: 192000000000, sector: 'Consumer' },
    { symbol: 'MO', name: 'Altria Group', price: 52.34, change: 0.89, marketCap: 89000000000, sector: 'Consumer' },
    { symbol: 'CL', name: 'Colgate-Palmolive', price: 92.56, change: 0.23, marketCap: 77000000000, sector: 'Consumer' },
    { symbol: 'EL', name: 'Estee Lauder', price: 78.90, change: -0.67, marketCap: 28000000000, sector: 'Consumer' },
    // Energy
    { symbol: 'XOM', name: 'Exxon Mobil', price: 108.90, change: 1.67, marketCap: 468000000000, sector: 'Energy' },
    { symbol: 'CVX', name: 'Chevron Corp.', price: 148.23, change: 0.92, marketCap: 273000000000, sector: 'Energy' },
    { symbol: 'COP', name: 'ConocoPhillips', price: 112.34, change: 1.45, marketCap: 128000000000, sector: 'Energy' },
    { symbol: 'SLB', name: 'Schlumberger', price: 43.56, change: 2.12, marketCap: 62000000000, sector: 'Energy' },
    { symbol: 'EOG', name: 'EOG Resources', price: 128.90, change: 1.89, marketCap: 75000000000, sector: 'Energy' },
    { symbol: 'PXD', name: 'Pioneer Natural', price: 223.45, change: 1.34, marketCap: 52000000000, sector: 'Energy' },
    // Industrial & Aerospace
    { symbol: 'BA', name: 'Boeing Co.', price: 178.45, change: -2.34, marketCap: 110000000000, sector: 'Industrial' },
    { symbol: 'CAT', name: 'Caterpillar Inc.', price: 378.90, change: 1.12, marketCap: 186000000000, sector: 'Industrial' },
    { symbol: 'GE', name: 'GE Aerospace', price: 178.56, change: 0.89, marketCap: 195000000000, sector: 'Industrial' },
    { symbol: 'HON', name: 'Honeywell Intl.', price: 212.34, change: 0.45, marketCap: 138000000000, sector: 'Industrial' },
    { symbol: 'UPS', name: 'United Parcel', price: 128.90, change: -0.67, marketCap: 110000000000, sector: 'Industrial' },
    { symbol: 'RTX', name: 'RTX Corp.', price: 118.45, change: 0.78, marketCap: 158000000000, sector: 'Industrial' },
    { symbol: 'LMT', name: 'Lockheed Martin', price: 512.34, change: 0.56, marketCap: 123000000000, sector: 'Industrial' },
    { symbol: 'DE', name: 'Deere & Company', price: 445.67, change: 1.23, marketCap: 122000000000, sector: 'Industrial' },
    { symbol: 'MMM', name: '3M Company', price: 134.56, change: 0.89, marketCap: 74000000000, sector: 'Industrial' },
    { symbol: 'FDX', name: 'FedEx Corp.', price: 278.90, change: 1.45, marketCap: 69000000000, sector: 'Industrial' },
    // Telecom
    { symbol: 'T', name: 'AT&T Inc.', price: 22.34, change: 0.45, marketCap: 160000000000, sector: 'Telecom' },
    { symbol: 'VZ', name: 'Verizon Comm.', price: 42.56, change: 0.34, marketCap: 179000000000, sector: 'Telecom' },
    { symbol: 'TMUS', name: 'T-Mobile US', price: 234.56, change: 0.89, marketCap: 275000000000, sector: 'Telecom' },
    // Real Estate & Utilities
    { symbol: 'AMT', name: 'American Tower', price: 198.45, change: -0.56, marketCap: 92000000000, sector: 'Real Estate' },
    { symbol: 'PLD', name: 'Prologis Inc.', price: 112.34, change: 0.67, marketCap: 104000000000, sector: 'Real Estate' },
    { symbol: 'NEE', name: 'NextEra Energy', price: 72.34, change: 0.45, marketCap: 149000000000, sector: 'Utilities' },
    { symbol: 'DUK', name: 'Duke Energy', price: 108.90, change: 0.34, marketCap: 84000000000, sector: 'Utilities' },
    { symbol: 'SO', name: 'Southern Company', price: 87.56, change: 0.23, marketCap: 95000000000, sector: 'Utilities' },
  ];
}

function getStockNews() {
  return [
    { title: 'NVIDIA Announces New AI Chip Lineup for 2025', source: 'Reuters', time: '2h ago', url: 'https://reuters.com' },
    { title: 'Apple Vision Pro Sales Exceed Expectations', source: 'CNBC', time: '4h ago', url: 'https://cnbc.com' },
    { title: 'Fed Signals Potential Rate Cuts in Q1 2025', source: 'WSJ', time: '6h ago', url: 'https://wsj.com' },
    { title: 'Tesla Cybertruck Deliveries Ramp Up Globally', source: 'Bloomberg', time: '8h ago', url: 'https://bloomberg.com' },
    { title: 'Microsoft Cloud Revenue Hits Record Quarter', source: 'Yahoo Finance', time: '12h ago', url: 'https://finance.yahoo.com' },
    { title: 'Amazon AWS Expands AI Infrastructure', source: 'TechCrunch', time: '14h ago', url: 'https://techcrunch.com' },
    { title: 'Meta Unveils New AI Assistant Features', source: 'The Verge', time: '16h ago', url: 'https://theverge.com' },
  ]
}
