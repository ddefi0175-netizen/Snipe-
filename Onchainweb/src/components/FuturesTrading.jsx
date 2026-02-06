import React, { useState, useEffect } from 'react';
import CandlestickChart from './CandlestickChart';
import { isFirebaseAvailable, getUser, saveUser, subscribeToFuturesPositions, saveFuturesPosition, closeFuturesPosition, subscribeToFuturesHistory } from '../lib/firebase';

const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'DOGE/USDT'];

// Main Futures Trading Component
export default function FuturesTrading({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('open');
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);
  const [prices, setPrices] = useState({});

  // Setup user and subscriptions
  useEffect(() => {
    if (!isOpen) return;
    const currentUserId = localStorage.getItem('wallet_address');
    if (!currentUserId) return;
    setUserId(currentUserId);

    const fetchUser = async () => {
      const user = await getUser(currentUserId);
      setBalance(user?.balance || 0);
    };
    fetchUser();

    const unsubPositions = subscribeToFuturesPositions(currentUserId, setPositions);
    const unsubHistory = subscribeToFuturesHistory(currentUserId, setHistory);

    return () => {
      unsubPositions();
      unsubHistory();
    };
  }, [isOpen]);

  // Price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => pairs.reduce((acc, pair) => ({ ...acc, [pair]: (prev[pair] || 60000) * (1 + (Math.random() - 0.5) * 0.002) }), {}));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="futures-modal">
      <div className="futures-overlay" onClick={onClose} />
      <div className="futures-container">
        <div className="futures-header">
          <h2>Futures Trading</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="futures-balance"><span>Balance:</span><span>${balance.toFixed(2)}</span></div>

        <div className="futures-tabs">
          <button onClick={() => setActiveTab('open')} className={activeTab === 'open' ? 'active' : ''}>Open</button>
          <button onClick={() => setActiveTab('positions')} className={activeTab === 'positions' ? 'active' : ''}>Positions ({positions.length})</button>
          <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>History</button>
        </div>

        {activeTab === 'open' && <OpenPositionForm userId={userId} balance={balance} prices={prices} setBalance={setBalance} />}
        {activeTab === 'positions' && <PositionsList positions={positions} prices={prices} userId={userId} />}
        {activeTab === 'history' && <HistoryList history={history} />}
      </div>
    </div>
  );
}

// Form to open a new position
const OpenPositionForm = ({ userId, balance, prices, setBalance }) => {
  const [pair, setPair] = useState('BTC/USDT');
  const [leverage, setLeverage] = useState(10);
  const [side, setSide] = useState('long');
  const [amount, setAmount] = useState('');

  const handleOpenPosition = async () => {
    const margin = parseFloat(amount);
    if (!margin || margin <= 0 || margin > balance) return;

    const newPosition = {
      id: Date.now().toString(),
      pair,
      side,
      leverage,
      margin,
      size: margin * leverage,
      entryPrice: prices[pair],
      openTime: Date.now(),
      status: 'open'
    };

    await saveFuturesPosition(userId, newPosition);
    const newBalance = balance - margin;
    await saveUser(userId, { balance: newBalance });
    setBalance(newBalance);
    setAmount('');
  };

  return (
    <div className="open-position-form">
      <CandlestickChart symbol={pair} currentPrice={prices[pair] || 0} height={180} />
      <select value={pair} onChange={e => setPair(e.target.value)}>{pairs.map(p => <option key={p} value={p}>{p}</option>)}</select>
      <div className="position-side-selector">
        <button onClick={() => setSide('long')} className={`side-btn long ${side === 'long' ? 'active' : ''}`}>Long</button>
        <button onClick={() => setSide('short')} className={`side-btn short ${side === 'short' ? 'active' : ''}`}>Short</button>
      </div>
      <input type="range" min="1" max="125" value={leverage} onChange={e => setLeverage(Number(e.target.value))} />
      <span>Leverage: {leverage}x</span>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Margin amount" />
      <button onClick={handleOpenPosition}>Open Position</button>
    </div>
  );
};

// List of active positions
const PositionsList = ({ positions, prices, userId }) => {
  const calculatePnL = (pos) => ((prices[pos.pair] - pos.entryPrice) / pos.entryPrice) * pos.margin * pos.leverage * (pos.side === 'long' ? 1 : -1);

  return (
    <div className="positions-list">
      {positions.map(pos => {
        const pnl = calculatePnL(pos);
        return (
          <div key={pos.id} className="position-card">
            <div>{pos.pair} {pos.leverage}x {pos.side}</div>
            <div>Entry: ${pos.entryPrice.toFixed(2)}</div>
            <div>PnL: ${pnl.toFixed(2)}</div>
            <button onClick={() => closeFuturesPosition(userId, pos, pnl)}>Close</button>
          </div>
        );
      })}
    </div>
  );
};

// List of historical trades
const HistoryList = ({ history }) => (
  <div className="history-list">
    {history.map(trade => (
      <div key={trade.id} className="history-card">
        <div>{trade.pair} {trade.leverage}x {trade.side}</div>
        <div>PnL: <span className={trade.pnl >= 0 ? 'profit' : 'loss'}>${trade.pnl.toFixed(2)}</span></div>
        <div>Closed: {new Date(trade.closeTime).toLocaleString()}</div>
      </div>
    ))}
  </div>
);
