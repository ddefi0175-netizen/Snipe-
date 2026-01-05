import React, { useState, useEffect } from 'react'

// C2C/P2P Trading - Buy/Sell Crypto Directly with Other Users
export default function C2CTrading({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('buy') // 'buy', 'sell', 'orders', 'post'
  const [selectedCrypto, setSelectedCrypto] = useState('USDT')
  const [selectedFiat, setSelectedFiat] = useState('USD')
  const [amount, setAmount] = useState('')
  const [selectedOffer, setSelectedOffer] = useState(null)

  // User orders
  const [myOrders, setMyOrders] = useState(() => {
    const saved = localStorage.getItem('c2cOrders')
    return saved ? JSON.parse(saved) : []
  })

  // Post ad form
  const [postForm, setPostForm] = useState({
    type: 'sell',
    crypto: 'USDT',
    fiat: 'USD',
    price: '',
    amount: '',
    minLimit: '',
    maxLimit: '',
    paymentMethods: []
  })

  const cryptos = ['USDT', 'BTC', 'ETH', 'BNB', 'SOL']
  const fiats = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'KRW', 'VND', 'THB']
  const paymentMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
    { id: 'paypal', name: 'PayPal', icon: '💳' },
    { id: 'alipay', name: 'Alipay', icon: '🔵' },
    { id: 'wechat', name: 'WeChat Pay', icon: '💚' },
    { id: 'cash', name: 'Cash Deposit', icon: '💵' },
    { id: 'zelle', name: 'Zelle', icon: '💜' }
  ]

  // Simulated P2P offers
  const [offers] = useState({
    buy: [
      { id: 1, merchant: 'CryptoKing ⭐', rating: 98.5, orders: 1250, crypto: 'USDT', fiat: 'USD', price: 0.998, available: 50000, minLimit: 100, maxLimit: 10000, methods: ['bank', 'paypal'] },
      { id: 2, merchant: 'TrustTrader ⭐', rating: 99.1, orders: 890, crypto: 'USDT', fiat: 'USD', price: 0.999, available: 25000, minLimit: 50, maxLimit: 5000, methods: ['bank', 'zelle'] },
      { id: 3, merchant: 'FastExchange', rating: 97.8, orders: 456, crypto: 'USDT', fiat: 'USD', price: 1.001, available: 15000, minLimit: 100, maxLimit: 3000, methods: ['paypal'] },
      { id: 4, merchant: 'BTCDealer ⭐', rating: 99.5, orders: 2100, crypto: 'BTC', fiat: 'USD', price: 94250, available: 2.5, minLimit: 500, maxLimit: 50000, methods: ['bank', 'cash'] },
      { id: 5, merchant: 'ETHTrader', rating: 96.2, orders: 320, crypto: 'ETH', fiat: 'USD', price: 3420, available: 15, minLimit: 200, maxLimit: 20000, methods: ['bank', 'paypal', 'zelle'] },
    ],
    sell: [
      { id: 6, merchant: 'QuickBuyer ⭐', rating: 99.0, orders: 780, crypto: 'USDT', fiat: 'USD', price: 1.002, available: 30000, minLimit: 100, maxLimit: 8000, methods: ['bank'] },
      { id: 7, merchant: 'CashKing', rating: 97.5, orders: 540, crypto: 'USDT', fiat: 'USD', price: 1.003, available: 20000, minLimit: 200, maxLimit: 5000, methods: ['bank', 'cash'] },
      { id: 8, merchant: 'BTCBuyer ⭐', rating: 98.8, orders: 1560, crypto: 'BTC', fiat: 'USD', price: 94800, available: 5, minLimit: 1000, maxLimit: 100000, methods: ['bank'] },
    ]
  })

  // Save orders
  useEffect(() => {
    localStorage.setItem('c2cOrders', JSON.stringify(myOrders))
  }, [myOrders])

  // Filter offers
  const filteredOffers = offers[activeTab === 'sell' ? 'sell' : 'buy']?.filter(
    offer => offer.crypto === selectedCrypto
  ) || []

  // Create order
  const createOrder = () => {
    if (!selectedOffer || !amount) {
      alert('Please select an offer and enter amount')
      return
    }

    const orderAmount = parseFloat(amount)
    if (orderAmount < selectedOffer.minLimit || orderAmount > selectedOffer.maxLimit) {
      alert(`Amount must be between ${selectedOffer.minLimit} and ${selectedOffer.maxLimit}`)
      return
    }

    const cryptoAmount = orderAmount / selectedOffer.price

    const newOrder = {
      id: Date.now(),
      type: activeTab,
      crypto: selectedOffer.crypto,
      fiat: selectedFiat,
      merchant: selectedOffer.merchant,
      price: selectedOffer.price,
      amount: orderAmount,
      cryptoAmount: cryptoAmount,
      status: 'pending',
      paymentMethod: selectedOffer.methods[0],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min
    }

    setMyOrders([newOrder, ...myOrders])
    setSelectedOffer(null)
    setAmount('')
    alert(`✅ Order created!\n\n${activeTab === 'buy' ? 'Buying' : 'Selling'} ${cryptoAmount.toFixed(6)} ${selectedOffer.crypto}\nTotal: $${orderAmount.toFixed(2)}\n\nPlease complete payment within 15 minutes.`)
  }

  // Post advertisement
  const postAd = () => {
    if (!postForm.price || !postForm.amount || !postForm.minLimit || !postForm.maxLimit) {
      alert('Please fill all required fields')
      return
    }

    if (postForm.paymentMethods.length === 0) {
      alert('Please select at least one payment method')
      return
    }

    const newAd = {
      id: Date.now(),
      type: postForm.type === 'sell' ? 'sell-ad' : 'buy-ad',
      crypto: postForm.crypto,
      fiat: postForm.fiat,
      price: parseFloat(postForm.price),
      amount: parseFloat(postForm.amount),
      minLimit: parseFloat(postForm.minLimit),
      maxLimit: parseFloat(postForm.maxLimit),
      methods: postForm.paymentMethods,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    setMyOrders([newAd, ...myOrders])
    setPostForm({
      type: 'sell',
      crypto: 'USDT',
      fiat: 'USD',
      price: '',
      amount: '',
      minLimit: '',
      maxLimit: '',
      paymentMethods: []
    })
    alert('✅ Advertisement posted successfully!')
    setActiveTab('orders')
  }

  // Cancel order
  const cancelOrder = (orderId) => {
    setMyOrders(myOrders.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ))
  }

  if (!isOpen) return null

  return (
    <div className="c2c-modal">
      <div className="c2c-overlay" onClick={onClose} />
      <div className="c2c-container">
        <div className="c2c-header">
          <h2>👥 P2P Trading</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="c2c-tabs">
          <button 
            className={activeTab === 'buy' ? 'active buy' : ''} 
            onClick={() => setActiveTab('buy')}
          >Buy</button>
          <button 
            className={activeTab === 'sell' ? 'active sell' : ''} 
            onClick={() => setActiveTab('sell')}
          >Sell</button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => setActiveTab('orders')}
          >My Orders</button>
          <button 
            className={activeTab === 'post' ? 'active' : ''} 
            onClick={() => setActiveTab('post')}
          >Post Ad</button>
        </div>

        {/* Buy/Sell Tab */}
        {(activeTab === 'buy' || activeTab === 'sell') && (
          <div className="offers-section">
            {/* Filters */}
            <div className="filters">
              <div className="crypto-selector">
                {cryptos.map(crypto => (
                  <button
                    key={crypto}
                    className={selectedCrypto === crypto ? 'active' : ''}
                    onClick={() => setSelectedCrypto(crypto)}
                  >
                    {crypto}
                  </button>
                ))}
              </div>
              <select 
                value={selectedFiat} 
                onChange={(e) => setSelectedFiat(e.target.value)}
                className="fiat-select"
              >
                {fiats.map(fiat => (
                  <option key={fiat} value={fiat}>{fiat}</option>
                ))}
              </select>
            </div>

            {/* Offers List */}
            <div className="offers-list">
              {filteredOffers.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p>No offers available</p>
                </div>
              ) : (
                filteredOffers.map(offer => (
                  <div 
                    key={offer.id} 
                    className={`offer-card ${selectedOffer?.id === offer.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOffer(offer)}
                  >
                    <div className="offer-header">
                      <div className="merchant-info">
                        <span className="merchant-name">{offer.merchant}</span>
                        <div className="merchant-stats">
                          <span className="rating">⭐ {offer.rating}%</span>
                          <span className="orders">{offer.orders} orders</span>
                        </div>
                      </div>
                      <div className="offer-price">
                        <span className="price">${offer.price.toLocaleString()}</span>
                        <span className="fiat">per {offer.crypto}</span>
                      </div>
                    </div>
                    <div className="offer-details">
                      <div className="detail">
                        <span className="label">Available</span>
                        <span className="value">{offer.available.toLocaleString()} {offer.crypto}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Limit</span>
                        <span className="value">${offer.minLimit} - ${offer.maxLimit}</span>
                      </div>
                    </div>
                    <div className="payment-methods">
                      {offer.methods.map(method => {
                        const pm = paymentMethods.find(p => p.id === method)
                        return pm ? (
                          <span key={method} className="method-badge">
                            {pm.icon} {pm.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Form */}
            {selectedOffer && (
              <div className="order-form">
                <h3>{activeTab === 'buy' ? '📥 Buy' : '📤 Sell'} {selectedOffer.crypto}</h3>
                <div className="form-group">
                  <label>Amount ({selectedFiat})</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${selectedOffer.minLimit} - ${selectedOffer.maxLimit}`}
                  />
                </div>
                {amount && (
                  <div className="crypto-receive">
                    <span>You will {activeTab === 'buy' ? 'receive' : 'send'}:</span>
                    <span className="crypto-amount">
                      {(parseFloat(amount) / selectedOffer.price).toFixed(6)} {selectedOffer.crypto}
                    </span>
                  </div>
                )}
                <button className={`submit-btn ${activeTab}`} onClick={createOrder}>
                  {activeTab === 'buy' ? '📥 Buy' : '📤 Sell'} {selectedOffer.crypto}
                </button>
              </div>
            )}
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            {myOrders.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <p>No orders yet</p>
              </div>
            ) : (
              myOrders.map(order => (
                <div key={order.id} className={`order-card ${order.status}`}>
                  <div className="order-header">
                    <span className={`order-type ${order.type}`}>
                      {order.type === 'buy' ? '📥 BUY' : order.type === 'sell' ? '📤 SELL' : order.type === 'sell-ad' ? '📢 SELL AD' : '📢 BUY AD'}
                    </span>
                    <span className={`order-status ${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="order-details">
                    <div className="detail">
                      <span className="label">Amount</span>
                      <span className="value">
                        {order.cryptoAmount?.toFixed(6) || order.amount} {order.crypto}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="label">Price</span>
                      <span className="value">${order.price}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Total</span>
                      <span className="value">${order.amount?.toFixed(2) || (order.amount * order.price).toFixed(2)}</span>
                    </div>
                    {order.merchant && (
                      <div className="detail">
                        <span className="label">Merchant</span>
                        <span className="value">{order.merchant}</span>
                      </div>
                    )}
                  </div>
                  {order.status === 'pending' && (
                    <button className="cancel-btn" onClick={() => cancelOrder(order.id)}>
                      Cancel Order
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Post Ad Tab */}
        {activeTab === 'post' && (
          <div className="post-section">
            <div className="ad-type-selector">
              <button 
                className={postForm.type === 'sell' ? 'active' : ''}
                onClick={() => setPostForm({ ...postForm, type: 'sell' })}
              >
                I want to Sell
              </button>
              <button 
                className={postForm.type === 'buy' ? 'active' : ''}
                onClick={() => setPostForm({ ...postForm, type: 'buy' })}
              >
                I want to Buy
              </button>
            </div>

            <div className="form-group">
              <label>Cryptocurrency</label>
              <select 
                value={postForm.crypto}
                onChange={(e) => setPostForm({ ...postForm, crypto: e.target.value })}
              >
                {cryptos.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fiat Currency</label>
                <select 
                  value={postForm.fiat}
                  onChange={(e) => setPostForm({ ...postForm, fiat: e.target.value })}
                >
                  {fiats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Your Price</label>
                <input
                  type="number"
                  value={postForm.price}
                  onChange={(e) => setPostForm({ ...postForm, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Total Amount ({postForm.crypto})</label>
              <input
                type="number"
                value={postForm.amount}
                onChange={(e) => setPostForm({ ...postForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Min Limit ({postForm.fiat})</label>
                <input
                  type="number"
                  value={postForm.minLimit}
                  onChange={(e) => setPostForm({ ...postForm, minLimit: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="form-group">
                <label>Max Limit ({postForm.fiat})</label>
                <input
                  type="number"
                  value={postForm.maxLimit}
                  onChange={(e) => setPostForm({ ...postForm, maxLimit: e.target.value })}
                  placeholder="10000"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Payment Methods</label>
              <div className="payment-method-grid">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    className={`method-btn ${postForm.paymentMethods.includes(method.id) ? 'active' : ''}`}
                    onClick={() => {
                      const methods = postForm.paymentMethods.includes(method.id)
                        ? postForm.paymentMethods.filter(m => m !== method.id)
                        : [...postForm.paymentMethods, method.id]
                      setPostForm({ ...postForm, paymentMethods: methods })
                    }}
                  >
                    {method.icon} {method.name}
                  </button>
                ))}
              </div>
            </div>

            <button className="post-btn" onClick={postAd}>
              📢 Post Advertisement
            </button>
          </div>
        )}
      </div>

      <style>{`
        .c2c-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .c2c-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .c2c-container {
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

        .c2c-header {
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

        .c2c-header h2 {
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

        .c2c-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .c2c-tabs button {
          flex: 1;
          padding: 15px 10px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          cursor: pointer;
        }

        .c2c-tabs button.active {
          color: #fff;
          border-bottom: 2px solid #00ff88;
        }

        .c2c-tabs button.active.buy {
          color: #00ff88;
          border-color: #00ff88;
        }

        .c2c-tabs button.active.sell {
          color: #ff4d4d;
          border-color: #ff4d4d;
        }

        .offers-section,
        .orders-section,
        .post-section {
          padding: 15px;
        }

        .filters {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .crypto-selector {
          display: flex;
          gap: 5px;
          flex: 1;
          overflow-x: auto;
        }

        .crypto-selector button {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          cursor: pointer;
          white-space: nowrap;
        }

        .crypto-selector button.active {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
          color: #00ff88;
        }

        .fiat-select {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
        }

        .offers-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .offer-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .offer-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .offer-card.selected {
          border-color: #00ff88;
          background: rgba(0, 255, 136, 0.05);
        }

        .offer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .merchant-name {
          color: #fff;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }

        .merchant-stats {
          display: flex;
          gap: 10px;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .rating {
          color: #ffd700;
        }

        .offer-price {
          text-align: right;
        }

        .offer-price .price {
          display: block;
          color: #00ff88;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .offer-price .fiat {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .offer-details {
          display: flex;
          gap: 20px;
          margin-bottom: 12px;
        }

        .detail {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .detail .label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .detail .value {
          color: #fff;
          font-size: 0.9rem;
        }

        .payment-methods {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .method-badge {
          font-size: 0.75rem;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.6);
        }

        .order-form {
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 16px;
          padding: 20px;
          position: sticky;
          bottom: 0;
        }

        .order-form h3 {
          margin: 0 0 15px 0;
          color: #fff;
        }

        .form-group {
          margin-bottom: 15px;
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
          border-radius: 10px;
          color: #fff;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #00ff88;
        }

        .crypto-receive {
          display: flex;
          justify-content: space-between;
          padding: 12px 15px;
          background: rgba(0, 136, 255, 0.1);
          border-radius: 10px;
          margin-bottom: 15px;
          color: rgba(255, 255, 255, 0.7);
        }

        .crypto-amount {
          color: #00d4ff;
          font-weight: 600;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
        }

        .submit-btn.buy {
          background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
          color: #000;
        }

        .submit-btn.sell {
          background: linear-gradient(135deg, #ff4d4d 0%, #cc3333 100%);
          color: #fff;
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

        .order-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 15px;
          margin-bottom: 12px;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .order-type {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .order-type.buy {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .order-type.sell {
          background: rgba(255, 77, 77, 0.2);
          color: #ff4d4d;
        }

        .order-status {
          font-size: 0.8rem;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .order-status.pending {
          background: rgba(255, 149, 0, 0.2);
          color: #ff9500;
        }

        .order-status.completed {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .order-status.cancelled {
          background: rgba(255, 77, 77, 0.2);
          color: #ff4d4d;
        }

        .order-status.active {
          background: rgba(0, 212, 255, 0.2);
          color: #00d4ff;
        }

        .order-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .cancel-btn {
          width: 100%;
          padding: 12px;
          background: rgba(255, 77, 77, 0.2);
          border: 1px solid rgba(255, 77, 77, 0.3);
          border-radius: 10px;
          color: #ff4d4d;
          cursor: pointer;
        }

        .ad-type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }

        .ad-type-selector button {
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
        }

        .ad-type-selector button.active {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
          color: #00ff88;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .payment-method-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .method-btn {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          cursor: pointer;
          text-align: left;
        }

        .method-btn.active {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
          color: #00ff88;
        }

        .post-btn {
          width: 100%;
          padding: 16px;
          margin-top: 10px;
          background: linear-gradient(135deg, #00d4ff 0%, #0088ff 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
