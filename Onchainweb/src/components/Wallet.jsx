import React, { useState, useEffect } from 'react'

// Default deposit addresses (admin configurable)
const DEFAULT_DEPOSIT_ADDRESSES = {
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  'USDT-TRC20': 'TN2Y4gMgqQnNnRkMPjWgXwQPjQqBQtjxyX',
  'USDT-ERC20': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
  ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
  BNB: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
  SOL: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
}

// Coin information
const COINS = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿', color: '#f7931a', network: 'Bitcoin' },
  { id: 'USDT-TRC20', name: 'USDT', icon: '₮', color: '#26a17b', network: 'TRC20 (Tron)' },
  { id: 'USDT-ERC20', name: 'USDT', icon: '₮', color: '#26a17b', network: 'ERC20 (Ethereum)' },
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#627eea', network: 'Ethereum' },
  { id: 'BNB', name: 'BNB', icon: '◆', color: '#f3ba2f', network: 'BNB Smart Chain' },
  { id: 'SOL', name: 'Solana', icon: '◎', color: '#9945ff', network: 'Solana' },
]

// QR Code component (simplified visual representation)
function QRCode({ address }) {
  return (
    <div className="qr-code-container">
      <div className="qr-code">
        <div className="qr-pattern">
          {[...Array(7)].map((_, row) => (
            <div key={row} className="qr-row">
              {[...Array(7)].map((_, col) => (
                <div 
                  key={col} 
                  className={`qr-cell ${Math.random() > 0.5 ? 'filled' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="qr-center-icon">📱</div>
      </div>
      <p className="qr-hint">Scan QR code to deposit</p>
    </div>
  )
}

export default function Wallet({ isOpen, onClose }) {
  // Active tab
  const [activeTab, setActiveTab] = useState('assets') // 'assets', 'deposit', 'withdraw'
  
  // User balances
  const [balances, setBalances] = useState(() => {
    const saved = localStorage.getItem('walletBalances')
    return saved ? JSON.parse(saved) : {
      BTC: 0.00,
      'USDT-TRC20': 0.00,
      'USDT-ERC20': 0.00,
      ETH: 0.00,
      BNB: 0.00,
      SOL: 0.00,
    }
  })
  
  // Deposit addresses (admin configurable)
  const [depositAddresses, setDepositAddresses] = useState(() => {
    const saved = localStorage.getItem('depositAddresses')
    return saved ? JSON.parse(saved) : DEFAULT_DEPOSIT_ADDRESSES
  })
  
  // Selected coin for deposit/withdraw
  const [selectedCoin, setSelectedCoin] = useState(COINS[0])
  
  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawPending, setWithdrawPending] = useState(false)
  
  // Pending withdrawals
  const [pendingWithdrawals, setPendingWithdrawals] = useState(() => {
    const saved = localStorage.getItem('pendingWithdrawals')
    return saved ? JSON.parse(saved) : []
  })
  
  // Withdrawal history
  const [withdrawalHistory, setWithdrawalHistory] = useState(() => {
    const saved = localStorage.getItem('withdrawalHistory')
    return saved ? JSON.parse(saved) : []
  })
  
  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminKeySequence, setAdminKeySequence] = useState([])
  
  // Coin prices (simulated)
  const [coinPrices] = useState({
    BTC: 94500,
    'USDT-TRC20': 1,
    'USDT-ERC20': 1,
    ETH: 3450,
    BNB: 720,
    SOL: 205,
  })
  
  // Copy to clipboard
  const [copied, setCopied] = useState(false)
  
  // Secret admin access: Press "A" 5 times rapidly
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'a') {
        setAdminKeySequence(prev => {
          const newSeq = [...prev, Date.now()]
          const filtered = newSeq.filter(t => Date.now() - t < 2000)
          if (filtered.length >= 5) {
            setShowAdminPanel(true)
            return []
          }
          return filtered
        })
      }
    }
    
    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [])
  
  // Calculate total balance in USD
  const totalBalanceUSD = Object.entries(balances).reduce((total, [coin, amount]) => {
    return total + (amount * (coinPrices[coin] || 0))
  }, 0)
  
  // Copy address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Submit withdrawal request
  const submitWithdrawal = () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount <= 0 || amount > balances[selectedCoin.id]) return
    if (!withdrawAddress.trim()) return
    
    setWithdrawPending(true)
    
    setTimeout(() => {
      const withdrawal = {
        id: `w_${Date.now()}`,
        coin: selectedCoin.id,
        amount: amount,
        address: withdrawAddress,
        status: 'pending', // pending, approved, rejected
        timestamp: Date.now(),
        usdValue: amount * coinPrices[selectedCoin.id]
      }
      
      // Deduct from balance immediately (held in pending)
      setBalances(prev => {
        const updated = { ...prev, [selectedCoin.id]: prev[selectedCoin.id] - amount }
        localStorage.setItem('walletBalances', JSON.stringify(updated))
        return updated
      })
      
      // Add to pending withdrawals
      setPendingWithdrawals(prev => {
        const updated = [withdrawal, ...prev]
        localStorage.setItem('pendingWithdrawals', JSON.stringify(updated))
        return updated
      })
      
      setWithdrawAmount('')
      setWithdrawAddress('')
      setWithdrawPending(false)
    }, 1500)
  }
  
  // Admin: Approve withdrawal
  const approveWithdrawal = (withdrawalId) => {
    const withdrawal = pendingWithdrawals.find(w => w.id === withdrawalId)
    if (!withdrawal) return
    
    // Remove from pending
    setPendingWithdrawals(prev => {
      const updated = prev.filter(w => w.id !== withdrawalId)
      localStorage.setItem('pendingWithdrawals', JSON.stringify(updated))
      return updated
    })
    
    // Add to history as approved
    setWithdrawalHistory(prev => {
      const updated = [{ ...withdrawal, status: 'approved', processedAt: Date.now() }, ...prev]
      localStorage.setItem('withdrawalHistory', JSON.stringify(updated))
      return updated
    })
  }
  
  // Admin: Reject withdrawal
  const rejectWithdrawal = (withdrawalId) => {
    const withdrawal = pendingWithdrawals.find(w => w.id === withdrawalId)
    if (!withdrawal) return
    
    // Return funds to balance
    setBalances(prev => {
      const updated = { ...prev, [withdrawal.coin]: prev[withdrawal.coin] + withdrawal.amount }
      localStorage.setItem('walletBalances', JSON.stringify(updated))
      return updated
    })
    
    // Remove from pending
    setPendingWithdrawals(prev => {
      const updated = prev.filter(w => w.id !== withdrawalId)
      localStorage.setItem('pendingWithdrawals', JSON.stringify(updated))
      return updated
    })
    
    // Add to history as rejected
    setWithdrawalHistory(prev => {
      const updated = [{ ...withdrawal, status: 'rejected', processedAt: Date.now() }, ...prev]
      localStorage.setItem('withdrawalHistory', JSON.stringify(updated))
      return updated
    })
  }
  
  // Admin: Update deposit address
  const updateDepositAddress = (coin, address) => {
    setDepositAddresses(prev => {
      const updated = { ...prev, [coin]: address }
      localStorage.setItem('depositAddresses', JSON.stringify(updated))
      return updated
    })
  }
  
  // Admin: Add balance to user
  const addBalance = (coin, amount) => {
    setBalances(prev => {
      const updated = { ...prev, [coin]: (prev[coin] || 0) + amount }
      localStorage.setItem('walletBalances', JSON.stringify(updated))
      return updated
    })
  }
  
  // Admin: Reduce balance from user
  const reduceBalance = (coin, amount) => {
    setBalances(prev => {
      const currentBalance = prev[coin] || 0
      const newBalance = Math.max(0, currentBalance - amount) // Don't go below 0
      const updated = { ...prev, [coin]: newBalance }
      localStorage.setItem('walletBalances', JSON.stringify(updated))
      return updated
    })
  }
  
  // Admin: Set exact balance for user
  const setExactBalance = (coin, amount) => {
    const parsedAmount = parseFloat(amount) || 0
    setBalances(prev => {
      const updated = { ...prev, [coin]: Math.max(0, parsedAmount) }
      localStorage.setItem('walletBalances', JSON.stringify(updated))
      return updated
    })
  }
  
  // Format currency
  const formatCurrency = (amount, decimals = 2) => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  }
  
  // Format crypto amount
  const formatCrypto = (amount, coin) => {
    if (coin === 'BTC') return amount.toFixed(8)
    if (coin.includes('USDT')) return amount.toFixed(2)
    return amount.toFixed(6)
  }

  if (!isOpen) return null

  return (
    <div className="wallet-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={e => e.stopPropagation()}>
        {/* Header with Total Balance */}
        <div className="wallet-header">
          <div className="wallet-title">
            <span className="wallet-icon">👛</span>
            <div className="wallet-title-text">
              <h2>My Wallet</h2>
              <span className="wallet-total-balance">
                ${formatCurrency(totalBalanceUSD)}
              </span>
            </div>
          </div>
          <button className="wallet-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="wallet-tabs">
          <button 
            className={`wallet-tab ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            <span className="tab-icon">💰</span>
            Assets
          </button>
          <button 
            className={`wallet-tab ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            <span className="tab-icon">📥</span>
            Deposit
          </button>
          <button 
            className={`wallet-tab ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            <span className="tab-icon">📤</span>
            Withdraw
          </button>
        </div>

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <div className="wallet-assets">
            <div className="assets-header">
              <h3>Total Assets</h3>
              <span className="assets-total">${formatCurrency(totalBalanceUSD)}</span>
            </div>
            
            <div className="assets-list">
              {COINS.map(coin => {
                const balance = balances[coin.id] || 0
                const usdValue = balance * coinPrices[coin.id]
                
                return (
                  <div key={coin.id} className="asset-item">
                    <div className="asset-info">
                      <div 
                        className="asset-icon" 
                        style={{ background: `${coin.color}20`, color: coin.color }}
                      >
                        {coin.icon}
                      </div>
                      <div className="asset-details">
                        <span className="asset-name">{coin.name}</span>
                        <span className="asset-network">{coin.network}</span>
                      </div>
                    </div>
                    <div className="asset-amounts">
                      <span className="asset-balance">{formatCrypto(balance, coin.id)}</span>
                      <span className="asset-usd">${formatCurrency(usdValue)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Pending Withdrawals (visible to user) */}
            {pendingWithdrawals.length > 0 && (
              <div className="pending-section">
                <h4>Pending Withdrawals</h4>
                <div className="pending-list">
                  {pendingWithdrawals.map(w => (
                    <div key={w.id} className="pending-item">
                      <div className="pending-info">
                        <span className="pending-coin">{w.coin}</span>
                        <span className="pending-amount">{formatCrypto(w.amount, w.coin)}</span>
                      </div>
                      <span className="pending-status">⏳ Processing</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="wallet-deposit">
            <div className="coin-selector">
              <label>Select Coin to Deposit</label>
              <div className="coin-grid">
                {COINS.map(coin => (
                  <button
                    key={coin.id}
                    className={`coin-btn ${selectedCoin.id === coin.id ? 'active' : ''}`}
                    onClick={() => setSelectedCoin(coin)}
                    style={{ '--coin-color': coin.color }}
                  >
                    <span className="coin-icon">{coin.icon}</span>
                    <span className="coin-name">{coin.id.replace('-', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="deposit-info">
              <div className="deposit-network">
                <span className="network-label">Network</span>
                <span className="network-value">{selectedCoin.network}</span>
              </div>
              
              <QRCode address={depositAddresses[selectedCoin.id]} />
              
              <div className="deposit-address">
                <label>Deposit Address</label>
                <div className="address-box">
                  <span className="address-text">
                    {depositAddresses[selectedCoin.id]}
                  </span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(depositAddresses[selectedCoin.id])}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>
              
              <div className="deposit-warning">
                <span className="warning-icon">⚠️</span>
                <p>Only send {selectedCoin.name} ({selectedCoin.network}) to this address. Sending other coins may result in permanent loss.</p>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="wallet-withdraw">
            <div className="coin-selector">
              <label>Select Coin to Withdraw</label>
              <div className="coin-grid">
                {COINS.map(coin => (
                  <button
                    key={coin.id}
                    className={`coin-btn ${selectedCoin.id === coin.id ? 'active' : ''}`}
                    onClick={() => setSelectedCoin(coin)}
                    style={{ '--coin-color': coin.color }}
                  >
                    <span className="coin-icon">{coin.icon}</span>
                    <span className="coin-name">{coin.id.replace('-', ' ')}</span>
                    <span className="coin-balance">
                      {formatCrypto(balances[coin.id] || 0, coin.id)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="withdraw-form">
              <div className="withdraw-available">
                <span>Available Balance:</span>
                <span className="available-amount">
                  {formatCrypto(balances[selectedCoin.id] || 0, selectedCoin.id)} {selectedCoin.id}
                </span>
              </div>
              
              <div className="withdraw-input">
                <label>Withdrawal Address</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder={`Enter ${selectedCoin.network} address`}
                />
              </div>
              
              <div className="withdraw-input">
                <label>Amount</label>
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    max={balances[selectedCoin.id] || 0}
                  />
                  <button 
                    className="max-btn"
                    onClick={() => setWithdrawAmount((balances[selectedCoin.id] || 0).toString())}
                  >
                    MAX
                  </button>
                </div>
                {withdrawAmount && (
                  <span className="amount-usd">
                    ≈ ${formatCurrency(parseFloat(withdrawAmount || 0) * coinPrices[selectedCoin.id])}
                  </span>
                )}
              </div>
              
              <div className="withdraw-fees">
                <span>Network Fee:</span>
                <span>~ $2.50</span>
              </div>
              
              <button 
                className="withdraw-btn"
                onClick={submitWithdrawal}
                disabled={
                  withdrawPending || 
                  !withdrawAmount || 
                  parseFloat(withdrawAmount) <= 0 ||
                  parseFloat(withdrawAmount) > (balances[selectedCoin.id] || 0) ||
                  !withdrawAddress.trim()
                }
              >
                {withdrawPending ? (
                  <>
                    <span className="btn-spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Withdraw {selectedCoin.id}
                  </>
                )}
              </button>
              
              <p className="withdraw-note">
                Withdrawals are processed within 24 hours after approval.
              </p>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {showAdminPanel && (
          <div className="admin-panel wallet-admin" onClick={e => e.stopPropagation()}>
            <div className="admin-header">
              <h3>⚙️ Wallet Admin</h3>
              <button onClick={() => setShowAdminPanel(false)}>×</button>
            </div>
            
            {/* Add Balance Section */}
            <div className="admin-section">
              <h4 className="admin-section-title">💰 Manage User Balance</h4>
              <div className="admin-balance-grid">
                {COINS.map(coin => (
                  <div key={coin.id} className="admin-coin-row">
                    <div className="admin-coin-header">
                      <span className="admin-coin-label">{coin.id}</span>
                      <span className="admin-current-balance">
                        Current: {balances[coin.id]?.toFixed(coin.id === 'BTC' ? 8 : coin.id.includes('USDT') ? 2 : 6) || '0'}
                      </span>
                    </div>
                    <div className="admin-coin-controls">
                      {/* Add Buttons */}
                      <div className="admin-coin-btns add-btns">
                        <span className="btn-label">Add:</span>
                        <button className="add-btn" onClick={() => addBalance(coin.id, coin.id === 'BTC' ? 0.01 : coin.id.includes('USDT') ? 100 : 0.1)}>
                          +{coin.id === 'BTC' ? '0.01' : coin.id.includes('USDT') ? '100' : '0.1'}
                        </button>
                        <button className="add-btn" onClick={() => addBalance(coin.id, coin.id === 'BTC' ? 0.1 : coin.id.includes('USDT') ? 1000 : 1)}>
                          +{coin.id === 'BTC' ? '0.1' : coin.id.includes('USDT') ? '1000' : '1'}
                        </button>
                        <button className="add-btn" onClick={() => addBalance(coin.id, coin.id === 'BTC' ? 1 : coin.id.includes('USDT') ? 10000 : 10)}>
                          +{coin.id === 'BTC' ? '1' : coin.id.includes('USDT') ? '10000' : '10'}
                        </button>
                      </div>
                      {/* Reduce Buttons */}
                      <div className="admin-coin-btns reduce-btns">
                        <span className="btn-label">Reduce:</span>
                        <button className="reduce-btn" onClick={() => reduceBalance(coin.id, coin.id === 'BTC' ? 0.01 : coin.id.includes('USDT') ? 100 : 0.1)}>
                          -{coin.id === 'BTC' ? '0.01' : coin.id.includes('USDT') ? '100' : '0.1'}
                        </button>
                        <button className="reduce-btn" onClick={() => reduceBalance(coin.id, coin.id === 'BTC' ? 0.1 : coin.id.includes('USDT') ? 1000 : 1)}>
                          -{coin.id === 'BTC' ? '0.1' : coin.id.includes('USDT') ? '1000' : '1'}
                        </button>
                        <button className="reduce-btn" onClick={() => reduceBalance(coin.id, coin.id === 'BTC' ? 1 : coin.id.includes('USDT') ? 10000 : 10)}>
                          -{coin.id === 'BTC' ? '1' : coin.id.includes('USDT') ? '10000' : '10'}
                        </button>
                      </div>
                      {/* Set Exact Balance */}
                      <div className="admin-exact-balance">
                        <span className="btn-label">Set Exact:</span>
                        <input 
                          type="number" 
                          placeholder="Enter amount"
                          id={`exact-${coin.id}`}
                          step={coin.id === 'BTC' ? '0.00000001' : coin.id.includes('USDT') ? '0.01' : '0.000001'}
                          min="0"
                        />
                        <button 
                          className="set-btn"
                          onClick={() => {
                            const input = document.getElementById(`exact-${coin.id}`)
                            setExactBalance(coin.id, input.value)
                            input.value = ''
                          }}
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Reset All Balances */}
              <button 
                className="admin-reset-btn danger"
                onClick={() => {
                  if (confirm('Are you sure you want to reset ALL balances to 0?')) {
                    const resetBalances = {}
                    COINS.forEach(coin => { resetBalances[coin.id] = 0 })
                    setBalances(resetBalances)
                    localStorage.setItem('walletBalances', JSON.stringify(resetBalances))
                  }
                }}
              >
                ⚠️ Reset All Balances to Zero
              </button>
            </div>
            
            {/* Deposit Addresses Section */}
            <div className="admin-section">
              <h4 className="admin-section-title">📥 Deposit Addresses</h4>
              <div className="admin-addresses">
                {COINS.map(coin => (
                  <div key={coin.id} className="admin-address-row">
                    <label>{coin.id}</label>
                    <input
                      type="text"
                      value={depositAddresses[coin.id]}
                      onChange={(e) => updateDepositAddress(coin.id, e.target.value)}
                      placeholder={`${coin.id} deposit address`}
                    />
                  </div>
                ))}
              </div>
              <button 
                className="admin-reset-btn"
                onClick={() => {
                  setDepositAddresses(DEFAULT_DEPOSIT_ADDRESSES)
                  localStorage.setItem('depositAddresses', JSON.stringify(DEFAULT_DEPOSIT_ADDRESSES))
                }}
              >
                Reset to Default Addresses
              </button>
            </div>
            
            {/* Pending Withdrawals Section */}
            <div className="admin-section">
              <h4 className="admin-section-title">⏳ Pending Withdrawals ({pendingWithdrawals.length})</h4>
              {pendingWithdrawals.length === 0 ? (
                <p className="no-pending">No pending withdrawals</p>
              ) : (
                <div className="admin-withdrawals">
                  {pendingWithdrawals.map(w => (
                    <div key={w.id} className="admin-withdrawal-item">
                      <div className="withdrawal-details">
                        <div className="withdrawal-main">
                          <span className="withdrawal-coin">{w.coin}</span>
                          <span className="withdrawal-amount">{formatCrypto(w.amount, w.coin)}</span>
                          <span className="withdrawal-usd">(${formatCurrency(w.usdValue)})</span>
                        </div>
                        <div className="withdrawal-address">{w.address}</div>
                        <div className="withdrawal-time">
                          {new Date(w.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="withdrawal-actions">
                        <button 
                          className="approve-btn"
                          onClick={() => approveWithdrawal(w.id)}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => rejectWithdrawal(w.id)}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Withdrawal History */}
            <div className="admin-section">
              <h4 className="admin-section-title">📋 Withdrawal History</h4>
              {withdrawalHistory.length === 0 ? (
                <p className="no-history">No withdrawal history</p>
              ) : (
                <div className="admin-history">
                  {withdrawalHistory.slice(0, 10).map(w => (
                    <div key={w.id} className={`history-item ${w.status}`}>
                      <div className="history-main">
                        <span className="history-coin">{w.coin}</span>
                        <span className="history-amount">{formatCrypto(w.amount, w.coin)}</span>
                        <span className={`history-status ${w.status}`}>
                          {w.status === 'approved' ? '✓ Approved' : '✕ Rejected'}
                        </span>
                      </div>
                      <div className="history-time">
                        {new Date(w.processedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {withdrawalHistory.length > 0 && (
                <button 
                  className="clear-history-btn"
                  onClick={() => {
                    setWithdrawalHistory([])
                    localStorage.removeItem('withdrawalHistory')
                  }}
                >
                  Clear History
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
