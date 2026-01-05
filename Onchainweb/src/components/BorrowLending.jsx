import React, { useState, useEffect } from 'react'

// Borrow/Lending - Crypto Loans with Collateral
export default function BorrowLending({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('borrow') // 'borrow', 'lend', 'myLoans'

  // User collateral balance
  const [collateralBalance] = useState(() => {
    const saved = localStorage.getItem('walletBalances')
    return saved ? JSON.parse(saved) : { BTC: 0, ETH: 0, SOL: 0, BNB: 0 }
  })

  // Borrow form
  const [borrowForm, setBorrowForm] = useState({
    collateralCoin: 'BTC',
    collateralAmount: '',
    borrowCoin: 'USDT',
    duration: 7
  })

  // Lend form
  const [lendForm, setLendForm] = useState({
    coin: 'USDT',
    amount: '',
    duration: 7
  })

  // User loans
  const [myLoans, setMyLoans] = useState(() => {
    const saved = localStorage.getItem('cryptoLoans')
    return saved ? JSON.parse(saved) : []
  })

  // Lending positions
  const [myLending, setMyLending] = useState(() => {
    const saved = localStorage.getItem('cryptoLending')
    return saved ? JSON.parse(saved) : []
  })

  // Available coins
  const collateralCoins = ['BTC', 'ETH', 'BNB', 'SOL']
  const borrowCoins = ['USDT', 'USDC', 'DAI']
  const lendCoins = ['USDT', 'USDC', 'DAI', 'BTC', 'ETH']

  // Interest rates
  const borrowRates = {
    7: 0.05,   // 5% for 7 days
    14: 0.08,  // 8% for 14 days
    30: 0.12,  // 12% for 30 days
    90: 0.25   // 25% for 90 days
  }

  const lendRates = {
    7: 0.03,   // 3% APY for 7 days
    14: 0.05,  // 5% APY for 14 days
    30: 0.08,  // 8% APY for 30 days
    90: 0.15   // 15% APY for 90 days
  }

  // Collateral prices
  const prices = {
    BTC: 94500,
    ETH: 3450,
    BNB: 720,
    SOL: 205,
    USDT: 1,
    USDC: 1,
    DAI: 1
  }

  // LTV (Loan to Value) ratio
  const LTV = 0.65 // Can borrow 65% of collateral value

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cryptoLoans', JSON.stringify(myLoans))
  }, [myLoans])

  useEffect(() => {
    localStorage.setItem('cryptoLending', JSON.stringify(myLending))
  }, [myLending])

  // Calculate max borrow amount
  const calculateMaxBorrow = () => {
    if (!borrowForm.collateralAmount) return 0
    const collateralValue = parseFloat(borrowForm.collateralAmount) * prices[borrowForm.collateralCoin]
    return collateralValue * LTV
  }

  // Calculate total repayment
  const calculateRepayment = (amount, duration) => {
    const interest = amount * borrowRates[duration]
    return amount + interest
  }

  // Calculate lending earnings
  const calculateEarnings = (amount, duration) => {
    const rate = lendRates[duration]
    return amount * (rate * (duration / 365))
  }

  // Create borrow loan
  const createBorrow = () => {
    if (!borrowForm.collateralAmount) {
      alert('Please enter collateral amount')
      return
    }

    const collateralValue = parseFloat(borrowForm.collateralAmount) * prices[borrowForm.collateralCoin]
    const maxBorrow = collateralValue * LTV
    const borrowAmount = maxBorrow // Borrow max by default

    if (borrowAmount <= 0) {
      alert('Invalid borrow amount')
      return
    }

    const newLoan = {
      id: Date.now(),
      type: 'borrow',
      collateralCoin: borrowForm.collateralCoin,
      collateralAmount: parseFloat(borrowForm.collateralAmount),
      collateralValue: collateralValue,
      borrowCoin: borrowForm.borrowCoin,
      borrowAmount: borrowAmount,
      interest: borrowAmount * borrowRates[borrowForm.duration],
      totalRepayment: calculateRepayment(borrowAmount, borrowForm.duration),
      duration: borrowForm.duration,
      rate: borrowRates[borrowForm.duration] * 100,
      status: 'active',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + borrowForm.duration * 24 * 60 * 60 * 1000).toISOString(),
      liquidationPrice: (calculateRepayment(borrowAmount, borrowForm.duration) / parseFloat(borrowForm.collateralAmount)) / LTV
    }

    setMyLoans([newLoan, ...myLoans])
    setBorrowForm({ ...borrowForm, collateralAmount: '' })
    
    alert(`✅ Loan Created!\n\n📥 Borrowed: ${borrowAmount.toFixed(2)} ${borrowForm.borrowCoin}\n🔒 Collateral: ${borrowForm.collateralAmount} ${borrowForm.collateralCoin}\n📅 Due: ${newLoan.duration} days\n💰 Total Repayment: ${newLoan.totalRepayment.toFixed(2)} ${borrowForm.borrowCoin}`)
  }

  // Create lending position
  const createLend = () => {
    if (!lendForm.amount || parseFloat(lendForm.amount) <= 0) {
      alert('Please enter amount to lend')
      return
    }

    const amount = parseFloat(lendForm.amount)
    const earnings = calculateEarnings(amount, lendForm.duration)

    const newLending = {
      id: Date.now(),
      type: 'lend',
      coin: lendForm.coin,
      amount: amount,
      earnings: earnings,
      totalReturn: amount + earnings,
      duration: lendForm.duration,
      rate: lendRates[lendForm.duration] * 100,
      status: 'active',
      createdAt: new Date().toISOString(),
      maturityDate: new Date(Date.now() + lendForm.duration * 24 * 60 * 60 * 1000).toISOString()
    }

    setMyLending([newLending, ...myLending])
    setLendForm({ ...lendForm, amount: '' })
    
    alert(`✅ Lending Position Created!\n\n📤 Lent: ${amount.toFixed(2)} ${lendForm.coin}\n📈 APY: ${(lendRates[lendForm.duration] * 100).toFixed(1)}%\n📅 Duration: ${lendForm.duration} days\n💰 Expected Return: ${newLending.totalReturn.toFixed(2)} ${lendForm.coin}`)
  }

  // Repay loan
  const repayLoan = (loanId) => {
    const loan = myLoans.find(l => l.id === loanId)
    if (!loan) return

    // Simulate repayment
    setMyLoans(myLoans.map(l => 
      l.id === loanId ? { ...l, status: 'repaid', repaidAt: new Date().toISOString() } : l
    ))

    alert(`✅ Loan Repaid!\n\nYour collateral of ${loan.collateralAmount} ${loan.collateralCoin} has been released.`)
  }

  // Withdraw lending
  const withdrawLending = (lendingId) => {
    const lending = myLending.find(l => l.id === lendingId)
    if (!lending) return

    const now = new Date()
    const maturity = new Date(lending.maturityDate)

    if (now < maturity) {
      if (!confirm('Early withdrawal will forfeit your earnings. Continue?')) {
        return
      }
    }

    setMyLending(myLending.map(l =>
      l.id === lendingId ? { 
        ...l, 
        status: 'withdrawn', 
        withdrawnAt: new Date().toISOString(),
        actualReturn: now < maturity ? lending.amount : lending.totalReturn
      } : l
    ))

    const returnAmount = now < maturity ? lending.amount : lending.totalReturn
    alert(`✅ Withdrawn!\n\nReturned: ${returnAmount.toFixed(2)} ${lending.coin}`)
  }

  if (!isOpen) return null

  const maxBorrow = calculateMaxBorrow()

  return (
    <div className="borrow-modal">
      <div className="borrow-overlay" onClick={onClose} />
      <div className="borrow-container">
        <div className="borrow-header">
          <h2>🏦 Crypto Loans</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Info Banner */}
        <div className="info-banner">
          <span className="info-icon">💡</span>
          <p>Borrow against your crypto or earn interest by lending. No credit check required.</p>
        </div>

        {/* Tabs */}
        <div className="borrow-tabs">
          <button 
            className={activeTab === 'borrow' ? 'active' : ''} 
            onClick={() => setActiveTab('borrow')}
          >Borrow</button>
          <button 
            className={activeTab === 'lend' ? 'active' : ''} 
            onClick={() => setActiveTab('lend')}
          >Lend</button>
          <button 
            className={activeTab === 'myLoans' ? 'active' : ''} 
            onClick={() => setActiveTab('myLoans')}
          >My Positions ({myLoans.filter(l => l.status === 'active').length + myLending.filter(l => l.status === 'active').length})</button>
        </div>

        {/* Borrow Tab */}
        {activeTab === 'borrow' && (
          <div className="borrow-section">
            <div className="loan-stats">
              <div className="stat">
                <span className="label">LTV Ratio</span>
                <span className="value">{(LTV * 100).toFixed(0)}%</span>
              </div>
              <div className="stat">
                <span className="label">Min Interest</span>
                <span className="value">{(borrowRates[7] * 100).toFixed(0)}%</span>
              </div>
              <div className="stat">
                <span className="label">Max Interest</span>
                <span className="value">{(borrowRates[90] * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="form-group">
              <label>Collateral Asset</label>
              <div className="asset-selector">
                {collateralCoins.map(coin => (
                  <button
                    key={coin}
                    className={borrowForm.collateralCoin === coin ? 'active' : ''}
                    onClick={() => setBorrowForm({ ...borrowForm, collateralCoin: coin })}
                  >
                    {coin}
                    <span className="price">${prices[coin].toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Collateral Amount</label>
              <div className="input-with-max">
                <input
                  type="number"
                  value={borrowForm.collateralAmount}
                  onChange={(e) => setBorrowForm({ ...borrowForm, collateralAmount: e.target.value })}
                  placeholder="0.00"
                />
                <span className="coin-label">{borrowForm.collateralCoin}</span>
              </div>
              {borrowForm.collateralAmount && (
                <div className="collateral-value">
                  Value: ${(parseFloat(borrowForm.collateralAmount) * prices[borrowForm.collateralCoin]).toLocaleString()}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Borrow Asset</label>
              <div className="asset-selector small">
                {borrowCoins.map(coin => (
                  <button
                    key={coin}
                    className={borrowForm.borrowCoin === coin ? 'active' : ''}
                    onClick={() => setBorrowForm({ ...borrowForm, borrowCoin: coin })}
                  >
                    {coin}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Loan Duration</label>
              <div className="duration-selector">
                {Object.entries(borrowRates).map(([days, rate]) => (
                  <button
                    key={days}
                    className={borrowForm.duration === parseInt(days) ? 'active' : ''}
                    onClick={() => setBorrowForm({ ...borrowForm, duration: parseInt(days) })}
                  >
                    <span className="days">{days} days</span>
                    <span className="rate">{(rate * 100).toFixed(0)}% interest</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Summary */}
            {borrowForm.collateralAmount && maxBorrow > 0 && (
              <div className="loan-summary">
                <h3>Loan Summary</h3>
                <div className="summary-row">
                  <span>You will receive</span>
                  <span className="value">{maxBorrow.toFixed(2)} {borrowForm.borrowCoin}</span>
                </div>
                <div className="summary-row">
                  <span>Interest ({(borrowRates[borrowForm.duration] * 100).toFixed(0)}%)</span>
                  <span className="value">{(maxBorrow * borrowRates[borrowForm.duration]).toFixed(2)} {borrowForm.borrowCoin}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Repayment</span>
                  <span className="value">{calculateRepayment(maxBorrow, borrowForm.duration).toFixed(2)} {borrowForm.borrowCoin}</span>
                </div>
                <div className="summary-row warning">
                  <span>Liquidation Price</span>
                  <span className="value">${((calculateRepayment(maxBorrow, borrowForm.duration) / parseFloat(borrowForm.collateralAmount)) / LTV).toFixed(2)}</span>
                </div>
              </div>
            )}

            <button className="action-btn borrow" onClick={createBorrow}>
              🏦 Borrow {borrowForm.borrowCoin}
            </button>
          </div>
        )}

        {/* Lend Tab */}
        {activeTab === 'lend' && (
          <div className="lend-section">
            <div className="apy-rates">
              <h3>💰 Current APY Rates</h3>
              <div className="rates-grid">
                {Object.entries(lendRates).map(([days, rate]) => (
                  <div key={days} className="rate-card">
                    <span className="days">{days} Days</span>
                    <span className="apy">{(rate * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Asset to Lend</label>
              <div className="asset-selector">
                {lendCoins.map(coin => (
                  <button
                    key={coin}
                    className={lendForm.coin === coin ? 'active' : ''}
                    onClick={() => setLendForm({ ...lendForm, coin: coin })}
                  >
                    {coin}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Amount to Lend</label>
              <div className="input-with-max">
                <input
                  type="number"
                  value={lendForm.amount}
                  onChange={(e) => setLendForm({ ...lendForm, amount: e.target.value })}
                  placeholder="0.00"
                />
                <span className="coin-label">{lendForm.coin}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Lock Period</label>
              <div className="duration-selector">
                {Object.entries(lendRates).map(([days, rate]) => (
                  <button
                    key={days}
                    className={lendForm.duration === parseInt(days) ? 'active' : ''}
                    onClick={() => setLendForm({ ...lendForm, duration: parseInt(days) })}
                  >
                    <span className="days">{days} days</span>
                    <span className="rate">{(rate * 100).toFixed(1)}% APY</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Earnings Preview */}
            {lendForm.amount && parseFloat(lendForm.amount) > 0 && (
              <div className="earnings-preview">
                <h3>Expected Earnings</h3>
                <div className="earnings-row">
                  <span>Principal</span>
                  <span>{parseFloat(lendForm.amount).toFixed(2)} {lendForm.coin}</span>
                </div>
                <div className="earnings-row">
                  <span>Interest Earned</span>
                  <span className="profit">+{calculateEarnings(parseFloat(lendForm.amount), lendForm.duration).toFixed(4)} {lendForm.coin}</span>
                </div>
                <div className="earnings-row total">
                  <span>Total Return</span>
                  <span>{(parseFloat(lendForm.amount) + calculateEarnings(parseFloat(lendForm.amount), lendForm.duration)).toFixed(4)} {lendForm.coin}</span>
                </div>
              </div>
            )}

            <button className="action-btn lend" onClick={createLend}>
              📈 Start Lending
            </button>
          </div>
        )}

        {/* My Positions Tab */}
        {activeTab === 'myLoans' && (
          <div className="positions-section">
            {/* Active Borrows */}
            {myLoans.filter(l => l.status === 'active').length > 0 && (
              <div className="position-group">
                <h3>🏦 Active Loans</h3>
                {myLoans.filter(l => l.status === 'active').map(loan => (
                  <div key={loan.id} className="position-card borrow">
                    <div className="position-header">
                      <span className="type-badge borrow">BORROW</span>
                      <span className="status active">Active</span>
                    </div>
                    <div className="position-details">
                      <div className="detail">
                        <span className="label">Borrowed</span>
                        <span className="value">{loan.borrowAmount.toFixed(2)} {loan.borrowCoin}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Collateral</span>
                        <span className="value">{loan.collateralAmount} {loan.collateralCoin}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Interest Rate</span>
                        <span className="value">{loan.rate.toFixed(0)}%</span>
                      </div>
                      <div className="detail">
                        <span className="label">Total Repayment</span>
                        <span className="value">{loan.totalRepayment.toFixed(2)} {loan.borrowCoin}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Due Date</span>
                        <span className="value">{new Date(loan.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="detail warning">
                        <span className="label">Liquidation Price</span>
                        <span className="value">${loan.liquidationPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <button className="repay-btn" onClick={() => repayLoan(loan.id)}>
                      💰 Repay Loan
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Active Lending */}
            {myLending.filter(l => l.status === 'active').length > 0 && (
              <div className="position-group">
                <h3>📈 Active Lending</h3>
                {myLending.filter(l => l.status === 'active').map(lending => (
                  <div key={lending.id} className="position-card lend">
                    <div className="position-header">
                      <span className="type-badge lend">LENDING</span>
                      <span className="status active">Active</span>
                    </div>
                    <div className="position-details">
                      <div className="detail">
                        <span className="label">Lent Amount</span>
                        <span className="value">{lending.amount.toFixed(2)} {lending.coin}</span>
                      </div>
                      <div className="detail">
                        <span className="label">APY</span>
                        <span className="value profit">{lending.rate.toFixed(1)}%</span>
                      </div>
                      <div className="detail">
                        <span className="label">Expected Earnings</span>
                        <span className="value profit">+{lending.earnings.toFixed(4)} {lending.coin}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Maturity Date</span>
                        <span className="value">{new Date(lending.maturityDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="withdraw-btn" onClick={() => withdrawLending(lending.id)}>
                      📤 Withdraw
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {myLoans.filter(l => l.status === 'active').length === 0 && 
             myLending.filter(l => l.status === 'active').length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <p>No active positions</p>
                <p className="hint">Start borrowing or lending to see your positions here</p>
              </div>
            )}

            {/* History */}
            {(myLoans.filter(l => l.status !== 'active').length > 0 || 
              myLending.filter(l => l.status !== 'active').length > 0) && (
              <div className="position-group history">
                <h3>📜 History</h3>
                {[...myLoans, ...myLending].filter(p => p.status !== 'active').slice(0, 5).map(position => (
                  <div key={position.id} className="history-item">
                    <span className={`type ${position.type}`}>
                      {position.type === 'borrow' ? '🏦' : '📈'} {position.type.toUpperCase()}
                    </span>
                    <span className="amount">
                      {position.borrowAmount?.toFixed(2) || position.amount?.toFixed(2)} {position.borrowCoin || position.coin}
                    </span>
                    <span className={`status ${position.status}`}>{position.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .borrow-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .borrow-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .borrow-container {
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

        .borrow-header {
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

        .borrow-header h2 {
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

        .info-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: linear-gradient(90deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 255, 136, 0.1) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-icon {
          font-size: 1.25rem;
        }

        .info-banner p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .borrow-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .borrow-tabs button {
          flex: 1;
          padding: 15px 10px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          cursor: pointer;
        }

        .borrow-tabs button.active {
          color: #00ff88;
          border-bottom: 2px solid #00ff88;
        }

        .borrow-section,
        .lend-section,
        .positions-section {
          padding: 20px;
        }

        .loan-stats {
          display: flex;
          justify-content: space-around;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .loan-stats .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .loan-stats .label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .loan-stats .value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #00ff88;
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

        .asset-selector {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .asset-selector button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #fff;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .asset-selector button .price {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .asset-selector button.active {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
        }

        .asset-selector.small button {
          padding: 10px 16px;
          flex-direction: row;
        }

        .input-with-max {
          position: relative;
        }

        .input-with-max input {
          width: 100%;
          padding: 15px;
          padding-right: 80px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 1.1rem;
        }

        .input-with-max input:focus {
          outline: none;
          border-color: #00ff88;
        }

        .coin-label {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        .collateral-value {
          margin-top: 8px;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .duration-selector {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .duration-selector button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #fff;
          cursor: pointer;
        }

        .duration-selector button.active {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
        }

        .duration-selector .days {
          font-weight: 600;
        }

        .duration-selector .rate {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .loan-summary,
        .earnings-preview {
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .loan-summary h3,
        .earnings-preview h3 {
          margin: 0 0 15px 0;
          color: #fff;
          font-size: 1rem;
        }

        .summary-row,
        .earnings-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .summary-row:last-child,
        .earnings-row:last-child {
          border-bottom: none;
        }

        .summary-row.total,
        .earnings-row.total {
          color: #fff;
          font-weight: 600;
          padding-top: 12px;
          margin-top: 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .summary-row.warning {
          color: #ff9500;
        }

        .profit {
          color: #00ff88;
        }

        .action-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
        }

        .action-btn.borrow {
          background: linear-gradient(135deg, #ff9500 0%, #ff6b00 100%);
          color: #fff;
        }

        .action-btn.lend {
          background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
          color: #000;
        }

        .apy-rates {
          margin-bottom: 25px;
        }

        .apy-rates h3 {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin: 0 0 12px 0;
        }

        .rates-grid {
          display: flex;
          gap: 10px;
        }

        .rate-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 10px;
        }

        .rate-card .days {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .rate-card .apy {
          font-size: 1.1rem;
          font-weight: 600;
          color: #00ff88;
        }

        .position-group {
          margin-bottom: 25px;
        }

        .position-group h3 {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin: 0 0 15px 0;
        }

        .position-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 15px;
          margin-bottom: 12px;
        }

        .position-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .type-badge {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .type-badge.borrow {
          background: rgba(255, 149, 0, 0.2);
          color: #ff9500;
        }

        .type-badge.lend {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .status {
          font-size: 0.8rem;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .status.active {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .position-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .position-details .detail {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .position-details .label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .position-details .value {
          color: #fff;
          font-size: 0.9rem;
        }

        .position-details .value.profit {
          color: #00ff88;
        }

        .position-details .detail.warning .value {
          color: #ff9500;
        }

        .repay-btn,
        .withdraw-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
        }

        .repay-btn {
          background: rgba(255, 149, 0, 0.2);
          border: 1px solid rgba(255, 149, 0, 0.3);
          color: #ff9500;
        }

        .withdraw-btn {
          background: rgba(0, 255, 136, 0.2);
          border: 1px solid rgba(0, 255, 136, 0.3);
          color: #00ff88;
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

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .history-item .type {
          font-size: 0.85rem;
        }

        .history-item .amount {
          color: #fff;
        }

        .history-item .status {
          font-size: 0.75rem;
        }

        .history-item .status.repaid,
        .history-item .status.withdrawn {
          color: #00ff88;
        }
      `}</style>
    </div>
  )
}
