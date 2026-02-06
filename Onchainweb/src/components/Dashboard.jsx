
import React, { useState, useMemo } from 'react';
import NewsModal from './NewsModal.jsx';
import { useMarketData } from '../hooks/useMarketData';
import { getStockData, getStockNews } from '../utils/fallbackData';

// K-line chart component (remains unchanged)
function KLineChart({ symbol, name, type, onClose }) {
  // ... KLineChart implementation ...
}

export default function Dashboard() {
  // Use the custom hook to fetch and manage crypto data
  const { cryptoData, cryptoNews, loading: cryptoLoading, isLiveData } = useMarketData();

  // Stock data remains static for now
  const [stockData] = useState(() => getStockData());
  const [stockNews] = useState(() => getStockNews());

  const [activeTab, setActiveTab] = useState('crypto');
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('market_cap');
  const [showAll, setShowAll] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);

  const formatPrice = (price) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(8)}`;
  };

  const formatMarketCap = (cap) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return null;
    const isPositive = change >= 0;
    return (
      <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  // Memoized filtering and sorting for performance
  const filteredCrypto = useMemo(() => {
      let data = [...cryptoData];
      // ... filtering and sorting logic
      return showAll ? data : data.slice(0, 20);
  }, [cryptoData, searchTerm, sortBy, showAll]);

  const filteredStocks = useMemo(() => {
      let data = [...stockData];
      // ... filtering and sorting logic
      return showAll ? data : data.slice(0, 20);
  }, [stockData, searchTerm, sortBy, showAll]);

  if (cryptoLoading && !isLiveData) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading market data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard" id="dashboard">
      <section className="market-overview">
        <h2>📊 Market Overview</h2>
        <p className="sub">
          {isLiveData ? 'Live prices' : 'Using fallback data'} • {activeTab === 'crypto' ? cryptoData.length : stockData.length} assets
        </p>
        {/* ... UI remains the same ... */}
      </section>

      {/* ... Other sections and modals ... */}
    </div>
  );
}
