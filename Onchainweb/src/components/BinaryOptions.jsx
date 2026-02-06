import React, { useState, useEffect } from 'react';
import CandlestickChart from './CandlestickChart';
import { isFirebaseEnabled, getUser, saveUser, subscribeToBinaryTrades, saveBinaryTrade, closeBinaryTrade, subscribeToBinaryHistory } from '../lib/firebase';

const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];
const durations = [30, 60, 120, 300]; // in seconds
const payoutRate = 0.85;

export default function BinaryOptions({ isOpen, onClose }) {
  const [userId, setUserId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [activeTrades, setActiveTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [prices, setPrices] = useState({});

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

    const unsubTrades = subscribeToBinaryTrades(currentUserId, setActiveTrades);
    const unsubHistory = subscribeToBinaryHistory(currentUserId, setTradeHistory);

    return () => {
      unsubTrades();
      unsubHistory();
    };
  }, [isOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => pairs.reduce((acc, pair) => ({ ...acc, [pair]: (prev[pair] || 60000) * (1 + (Math.random() - 0.5) * 0.004) }), {}));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = Date.now();
    activeTrades.forEach(trade => {
      if (now >= trade.expiryTime) {
        const currentPrice = prices[trade.pair] || trade.entryPrice;
        const won = trade.direction === 'up' ? currentPrice > trade.entryPrice : currentPrice < trade.entryPrice;
        const payout = won ? trade.amount * (1 + payoutRate) : 0;
        closeBinaryTrade(userId, trade, won ? 'win' : 'loss', payout);
      }
    });
  }, [prices, activeTrades, userId]);

  if (!isOpen) return null;

  return (
    <div className="binary-modal">
      <div className="binary-overlay" onClick={onClose} />
      <div className="binary-container">
        <Header balance={balance} onClose={onClose} />
        <ChartAndControls userId={userId} balance={balance} setBalance={setBalance} prices={prices} />
        <TradesList activeTrades={activeTrades} history={tradeHistory} prices={prices} />
      </div>
    </div>
  );
}

const Header = ({ balance, onClose }) => (
  <div className="binary-header">
    <h2>Binary Options</h2>
    <div className="binary-balance">Balance: ${balance.toFixed(2)}</div>
    <button className="close-btn" onClick={onClose}>✕</button>
  </div>
);

const ChartAndControls = ({ userId, balance, setBalance, prices }) => {
  const [pair, setPair] = useState('BTC/USDT');
  const [duration, setDuration] = useState(60);
  const [amount, setAmount] = useState('');

  const handlePlaceTrade = async (direction) => {
    const tradeAmount = parseFloat(amount);
    if (!tradeAmount || tradeAmount <= 0 || tradeAmount > balance) return;

    const newTrade = {
      id: Date.now().toString(),
      pair,
      direction,
      amount: tradeAmount,
      entryPrice: prices[pair],
      duration,
      expiryTime: Date.now() + duration * 1000,
      status: 'active'
    };

    await saveBinaryTrade(userId, newTrade);
    const newBalance = balance - tradeAmount;
    await saveUser(userId, { balance: newBalance });
    setBalance(newBalance);
    setAmount('');
  };

  return (
    <div>
      <CandlestickChart symbol={pair} currentPrice={prices[pair] || 0} height={200} />
      <div className="controls">
        <select onChange={e => setPair(e.target.value)}>{pairs.map(p => <option key={p}>{p}</option>)}</select>
        <select onChange={e => setDuration(Number(e.target.value))}>{durations.map(d => <option key={d} value={d}>{d}s</option>)}</select>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" />
        <button onClick={() => handlePlaceTrade('up')}>UP</button>
        <button onClick={() => handlePlaceTrade('down')}>DOWN</button>
      </div>
    </div>
  );
};

const TradesList = ({ activeTrades, history, prices }) => (
  <div>
    <h3>Active Trades</h3>
    {activeTrades.map(trade => (
      <div key={trade.id}>
        {trade.pair} {trade.direction} ${trade.amount} | Entry: ${trade.entryPrice.toFixed(2)} | Current: ${prices[trade.pair]?.toFixed(2) || '...'}
      </div>
    ))}
    <h3>Trade History</h3>
    {history.map(trade => (
      <div key={trade.id}>
        {trade.pair} {trade.direction} ${trade.amount} | Result: {trade.result} | Payout: ${trade.payout.toFixed(2)}
      </div>
    ))}
  </div>
);
