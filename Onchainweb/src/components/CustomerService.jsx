import React, { useState, useEffect, useRef } from 'react'
import { 
  saveChatMessage, 
  saveActiveChat, 
  updateActiveChat,
  subscribeToAdminReplies, 
  markReplyDelivered,
  isFirebaseEnabled 
} from '../lib/firebase.js'
import { formatApiError } from '../lib/errorHandling'

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

  // Generate unique session ID for this chat
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('chatSessionId')
    if (saved) return saved
    const newId = 'CHAT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    localStorage.setItem('chatSessionId', newId)
    return newId
  })

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

  // Save message to Firebase/localStorage for admin to see - REAL TIME
  const saveMessageToAdmin = async (message, type, agentName = null) => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    const walletAddress = localStorage.getItem('walletAddress') || ''

    const newMessage = {
      sessionId: sessionId,
      user: userProfile.username || 'Anonymous',
      userId: userProfile.userId || '',
      email: userProfile.email || '',
      wallet: walletAddress,
      type: type,
      message: message,
      agentName: agentName,
      timestamp: new Date().toISOString(),
      read: false
    }

    // Save message to Firebase
    await saveChatMessage(newMessage)

    // Update active chat
    const chatData = {
      sessionId: sessionId,
      user: userProfile.username || 'Anonymous',
      userId: userProfile.userId || '',
      email: userProfile.email || '',
      wallet: walletAddress,
      startTime: new Date().toISOString(),
      status: 'active',
      unread: type === 'user' ? 1 : 0,
      lastMessage: message,
      lastMessageTime: new Date().toISOString()
    }
    
    await saveActiveChat(chatData)
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

    // Save message to admin dashboard (no external service)
    saveMessageToAdmin(inputMessage, 'user')

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

  const [isConnectedToAgent, setIsConnectedToAgent] = useState(false)
  const [agentName] = useState(() => {
    const names = ['Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James']
    return names[Math.floor(Math.random() * names.length)]
  })

  // Subscribe to admin replies using Firebase - REAL TIME across all devices
  useEffect(() => {
    const unsubscribe = subscribeToAdminReplies(sessionId, (replies) => {
      replies.forEach(async (reply) => {
        // If not connected to agent yet, auto-connect when admin replies
        if (!isConnectedToAgent) {
          setIsConnectedToAgent(true)
          setMessages(prev => [...prev, {
            id: Date.now() - 1,
            type: 'system',
            text: 'A support agent has joined the conversation.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }])
        }

        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'agent',
          text: reply.message,
          time: new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: reply.agentName || 'Support Agent'
        }])

        // Mark reply as delivered in Firebase
        await markReplyDelivered(reply.id, reply.firebaseKey)

        // Play notification sound for user
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQkAIHPQ3bF3HQkAgLTX15xQGBY=')
          audio.volume = 0.3
          audio.play().catch((error) => {
            console.error('Audio notification failed:', formatApiError(error))
          })
        } catch (error) {
          console.error('Audio initialization failed:', formatApiError(error))
        }

        // Update unread count if chat window is closed
        if (!isOpen) {
          setUnreadCount(prev => prev + 1)
        }
      })
    })

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [sessionId, isConnectedToAgent, isOpen])

  const connectToLiveAgent = async () => {
    // Show connecting message - stays in-app, no external links
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      text: 'Connecting you to a live support agent...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])

    // Save connection request to Firebase
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    
    await updateActiveChat(sessionId, {
      status: 'waiting_agent',
      requestedAgent: true,
      requestTime: new Date().toISOString()
    })

    // Save notification for admin
    await saveMessageToAdmin('Customer requested live agent connection', 'system')

    // Simulate connection delay - all stays in-app
    setTimeout(async () => {
      setIsConnectedToAgent(true)
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        text: `You are now connected with ${agentName} from our support team.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])

      // Update chat status in Firebase
      await updateActiveChat(sessionId, {
        status: 'connected',
        connectedAgent: agentName
      })

      // Agent greeting
      setTimeout(async () => {
        const greetingMsg = `Hi! I'm ${agentName}, your dedicated support agent. How can I assist you today?`
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'agent',
          text: greetingMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: agentName
        }])
        await saveMessageToAdmin(greetingMsg, 'agent', agentName)
      }, 1000)
    }, 2000)
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
          {!isConnectedToAgent ? (
            <button className="cs-live-agent-btn" onClick={connectToLiveAgent}>
              <span>👤</span> Connect to Live Agent
            </button>
          ) : (
            <div className="cs-agent-connected">
              <span className="cs-connected-dot"></span>
              <span>Connected with {agentName}</span>
            </div>
          )}

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
