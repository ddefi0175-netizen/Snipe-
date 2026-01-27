# Customer Service Chat System

## ❓ What Social App Is It Connected To?

**Answer: NONE - It's completely internal!**

The customer service chat in your application is **NOT** integrated with any external social media platform or messaging app.

## 🏗️ Architecture

### What It Actually Uses:

```
User sends message
    ↓
Saved to Cloudflare D1 Database
    (workers/chat-api.js)
    ↓
Admin Dashboard receives via Server-Sent Events (SSE)
    (Real-time polling every 3 seconds)
    ↓
Admin replies in dashboard
    ↓
Reply saved to Cloudflare D1
    ↓
User receives via SSE
```

### Storage: Cloudflare D1 (SQL Database)

Tables:
- `chat_messages` - All messages
- `active_chats` - Active conversations

### Real-Time: Server-Sent Events (SSE)

- Polls database every 3 seconds
- No WebSocket needed
- Works across all browsers

## ❌ NOT Connected To:

- ❌ Telegram Bot API
- ❌ WhatsApp Business API
- ❌ Discord Webhooks
- ❌ Facebook Messenger
- ❌ Twitter/X DMs
- ❌ Slack
- ❌ Intercom
- ❌ Any external chat service

## ✅ How It Works

### User Side:

1. User clicks chat icon (💬) on website
2. Types message: "I need help"
3. Message saved to Cloudflare D1 database
4. User waits for reply

### Admin Side:

1. Admin opens Master/Admin Dashboard
2. Sees "Active Chats" section
3. Clicks on user's chat
4. Types reply: "How can I help?"
5. Reply saved to database

### Real-Time Updates:

- Admin dashboard polls D1 every 3 seconds
- User chat window polls D1 every 3 seconds
- New messages appear automatically
- No external services involved

## 🗄️ Database Schema

```sql
-- chat_messages table
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  sender_type TEXT NOT NULL, -- 'user' or 'admin'
  sender_name TEXT,
  sender_wallet TEXT,
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  delivered BOOLEAN DEFAULT 0,
  read BOOLEAN DEFAULT 0
);

-- active_chats table
CREATE TABLE active_chats (
  session_id TEXT PRIMARY KEY,
  user_name TEXT,
  user_wallet TEXT,
  last_message TEXT,
  last_message_time INTEGER,
  unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  updated_at INTEGER
);
```

## 📂 Code Files

### Frontend:
- `Onchainweb/src/components/CustomerService.jsx` - Chat UI
- `Onchainweb/src/lib/cloudflareApi.js` - API client

### Backend:
- `workers/chat-api.js` - Cloudflare Worker (API)
- `wrangler.toml` - D1 database configuration

### Admin Dashboard:
- `Onchainweb/src/components/MasterAdminDashboard.jsx` - Shows active chats

## 🔧 Setup Required

### 1. Cloudflare D1 Database:

```bash
# Create database
wrangler d1 create onchainweb

# Create tables
wrangler d1 execute onchainweb --file=schema.sql

# Deploy worker
wrangler deploy workers/chat-api.js
```

### 2. Environment Variables:

```bash
VITE_CLOUDFLARE_WORKER_URL=https://chat-api.YOUR-SUBDOMAIN.workers.dev
```

## 💡 Why Internal Chat?

**Advantages:**
- ✅ Full control over data
- ✅ No external API limits
- ✅ No monthly fees
- ✅ Customizable UI
- ✅ Privacy compliant
- ✅ No rate limiting

**No Need For:**
- ❌ Telegram bot tokens
- ❌ WhatsApp Business approval
- ❌ Discord bot setup
- ❌ External API keys
- ❌ Third-party terms of service

## 📊 Admin View

When admin opens dashboard:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Active Chats (3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session: CHAT-1737990123-ABC123
User: 0x1234...5678
Last: "I need help with deposits"
Unread: 2
[View Chat]

Session: CHAT-1737990456-DEF456
User: Anonymous
Last: "How do I withdraw?"
Unread: 1
[View Chat]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Admin clicks "View Chat" → Opens chat window → Types reply → User receives instantly!

## 🎯 Summary

**Your chat system is:**
- 100% internal
- Stored in Cloudflare D1
- Real-time via SSE polling
- Displayed in admin dashboard
- No external social apps involved

**It's like having your own private messaging system built into your app!**
