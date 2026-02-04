# Real-Time Data Architecture

## Overview

This document describes how real-time data flows through the Snipe trading platform, ensuring that admin and master accounts always work with current data from MongoDB.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Master Admin    │         │   Admin Panel    │          │
│  │   Dashboard      │         │                  │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                             │                     │
│           └──────────┬──────────────────┘                     │
│                      │                                        │
│            ┌─────────▼─────────┐                             │
│            │   API Client      │                             │
│            │  (src/lib/api.js) │                             │
│            └─────────┬─────────┘                             │
│                      │ HTTPS/JSON                            │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       │ Real-Time HTTP Requests
                       │ with JWT Authorization
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                    Backend API                                │
│                 (Render.com)                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │             Express.js Routes                            │ │
│  │                                                           │ │
│  │  /api/auth          - Authentication & Admin Management  │ │
│  │  /api/users         - User Management                    │ │
│  │  /api/uploads       - Deposit Management                 │ │
│  │  /api/trades        - Trading Operations                 │ │
│  │  /api/staking       - Staking Management                 │ │
│  │  /api/admin-activity - Activity Tracking                 │ │
│  │  /api/health        - System Health & Stats              │ │
│  └─────────────┬───────────────────────────────────────────┘ │
│                │                                              │
│  ┌─────────────▼───────────────────────────────────────────┐ │
│  │           MongoDB Models                                 │ │
│  │                                                           │ │
│  │  - User            - Admin                               │ │
│  │  - Trade           - Staking                             │ │
│  │  - Upload          - AdminActivity                       │ │
│  └─────────────┬───────────────────────────────────────────┘ │
└────────────────┼─────────────────────────────────────────────┘
                 │
                 │ Mongoose ODM
                 │ Real-Time Queries
                 │
┌────────────────▼─────────────────────────────────────────────┐
│                    MongoDB Atlas                              │
│                  (Cloud Database)                             │
│                                                               │
│  Collections:                                                 │
│  - users          - Real-time user data                      │
│  - admins         - Admin accounts & permissions             │
│  - trades         - Trading history                          │
│  - stakings       - Staking records                          │
│  - uploads        - Deposit/upload records                   │
│  - adminactivities - Admin action logs                       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow Patterns

### 1. Read Operations (Real-Time Data Retrieval)

#### Example: Get User List

```
Frontend Dashboard → API Client → Backend API → MongoDB → Backend API → Frontend Dashboard
     (Request)         (GET)        (Query)     (Data)     (JSON)        (Display)
```

**Code Flow**:
```javascript
// 1. Frontend makes request
const users = await userAPI.getAll()

// 2. API Client adds auth token and calls backend
fetch(`${API_BASE}/users`, {
  headers: { 'Authorization': `Bearer ${token}` }
})

// 3. Backend queries MongoDB
User.find().sort({ createdAt: -1 }).lean()

// 4. Backend returns with real-time metadata
{
  users: [...],
  pagination: {...},
  realTime: {
    timestamp: "2026-01-08T16:59:07Z",
    source: "mongodb"
  }
}

// 5. Frontend displays data with timestamp
```

### 2. Write Operations (Real-Time Data Updates)

#### Example: Update User Balance

```
Frontend → API → Backend → MongoDB → Backend → Frontend
(Change)   (PATCH) (Update)  (Save)   (Confirm) (Refresh)
```

**Code Flow**:
```javascript
// 1. Admin updates balance
await userAPI.update(userId, { balance: 5000 })

// 2. Backend updates in MongoDB
await User.findByIdAndUpdate(userId, { balance: 5000 }, { new: true })

// 3. Backend logs admin activity
await AdminActivity.create({
  adminUsername: req.user.username,
  action: 'Update user balance',
  actionType: 'update',
  targetType: 'user',
  targetId: userId
})

// 4. Frontend refreshes user list to show change
```

### 3. Authentication Flow

```
Login → Verify → Store Token → Use Token → Verify → Refresh
```

**Detailed Flow**:
```
1. User enters credentials
   ↓
2. POST /api/auth/login
   ↓
3. Backend verifies password (bcrypt)
   ↓
4. Generate JWT token (24h expiration)
   ↓
5. Return token + user info
   ↓
6. Store token in localStorage
   ↓
7. Include token in all API requests
   ↓
8. Backend verifies token on each request
   ↓
9. Token expires → User logs in again
```

## Real-Time Features

### Feature 1: Auto-Refresh Data

The dashboards automatically refresh data at intervals:

```javascript
// Master Dashboard refresh
useEffect(() => {
  if (!isAuthenticated) return

  // Initial load
  loadAllData()

  // Auto-refresh every 30 seconds
  const interval = setInterval(() => {
    loadAllData()
  }, 30000)

  return () => clearInterval(interval)
}, [isAuthenticated])

// Active trades refresh (more frequent)
useEffect(() => {
  if (!isAuthenticated) return

  // Refresh every 3 seconds for active trades
  const interval = setInterval(() => {
    refreshActiveTrades()
  }, 3000)

  return () => clearInterval(interval)
}, [isAuthenticated])
```

### Feature 2: Real-Time Timestamps

All API responses include timestamps:

```javascript
{
  success: true,
  data: {...},
  realTime: {
    timestamp: "2026-01-08T16:59:07.726Z",
    source: "mongodb",
    queryTime: 1641667147726
  }
}
```

Frontend displays these timestamps to indicate data freshness.

### Feature 3: Admin Activity Tracking

All admin actions are logged in real-time:

```javascript
// Automatic logging on admin actions
router.patch('/users/:id', verifyToken, async (req, res) => {
  // Update user
  const user = await User.findByIdAndUpdate(req.params.id, updates)

  // Log activity
  await AdminActivity.create({
    adminUsername: req.user.username,
    action: `Updated user ${user.userId}`,
    actionType: 'update',
    targetType: 'user',
    targetId: user._id,
    details: updates,
    timestamp: new Date()
  })

  res.json({ success: true, user })
})
```

### Feature 4: Optimized Queries

All database queries are optimized for speed:

```javascript
// Pagination reduces data transfer
User.find(query)
  .sort({ [sortBy]: sortOrder })
  .skip(skip)
  .limit(limit)
  .lean()  // Returns plain objects (faster)
  .select('-__v')  // Exclude version field

// Parallel queries for efficiency
const [users, total] = await Promise.all([
  User.find(query).limit(50),
  User.countDocuments(query)
])
```

## Performance Optimizations

### 1. Database Indexes

```javascript
// User model indexes
UserSchema.index({ wallet: 1 })
UserSchema.index({ userId: 1 })
UserSchema.index({ email: 1 })
UserSchema.index({ createdAt: -1 })

// Admin activity indexes
AdminActivitySchema.index({ adminUsername: 1, timestamp: -1 })
AdminActivitySchema.index({ actionType: 1, timestamp: -1 })
```

### 2. Lean Queries

```javascript
// Use .lean() for read-only operations (30-50% faster)
const users = await User.find().lean()

// Don't use .lean() when you need to save
const user = await User.findById(id)
user.balance = 5000
await user.save()
```

### 3. Connection Pooling

```javascript
// MongoDB connection with pooling
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,  // Max 10 connections
  minPoolSize: 2,   // Min 2 connections
  socketTimeoutMS: 45000,
  family: 4
})
```

### 4. API Retry Logic

```javascript
// Frontend retries on timeout (Render cold starts)
async function apiCall(endpoint, options = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(url, { ...config, signal: controller.signal })
      clearTimeout(timeoutId)

      return await response.json()
    } catch (error) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 2000))  // Wait 2s
        continue
      }
      throw error
    }
  }
}
```

## Monitoring Real-Time Data

### Health Check

Check system health and real-time stats:

```bash
curl https://snipe-api.onrender.com/api/health | jq .
```

Response:
```json
{
  "status": "ok",
  "mongoConnected": true,
  "realTimeData": {
    "users": 5,
    "admins": 4,
    "trades": 0,
    "stakingPlans": 0,
    "lastChecked": "2026-01-08T16:59:07.726Z"
  },
  "timestamp": "2026-01-08T16:59:07.726Z",
  "uptime": 12345.67,
  "nodeVersion": "v18.0.0"
}
```

### Admin Status

Check your authentication status and permissions:

```bash
curl https://snipe-api.onrender.com/api/auth/status \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

Response for Master:
```json
{
  "success": true,
  "user": {
    "username": "master",
    "role": "master",
    "permissions": {...},
    "systemStats": {
      "totalUsers": 5,
      "totalAdmins": 4,
      "activeUsers": 5,
      "frozenUsers": 0
    }
  },
  "timestamp": "2026-01-08T16:59:07.726Z"
}
```

### Activity Monitoring

Monitor admin activities in real-time:

```bash
curl "https://snipe-api.onrender.com/api/admin-activity?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

## Debugging Real-Time Issues

### Check MongoDB Connection

```javascript
// Backend logs show connection status
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected')
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
})
```

### Verify Data Freshness

```javascript
// Check response timestamps
const response = await userAPI.getAll()
console.log('Data timestamp:', response.realTime.timestamp)
console.log('Data source:', response.realTime.source)

// Calculate age
const dataAge = Date.now() - new Date(response.realTime.timestamp).getTime()
console.log(`Data is ${dataAge}ms old`)
```

### Monitor API Response Times

```javascript
// Frontend API client logs response times
const startTime = Date.now()
const response = await fetch(url)
const endTime = Date.now()
console.log(`API call took ${endTime - startTime}ms`)
```

## Best Practices

1. **Always Check Timestamps**
   - Verify data is recent before making decisions
   - Display timestamps in UI for transparency

2. **Handle Connection Failures Gracefully**
   - Use try-catch blocks
   - Implement retry logic
   - Show user-friendly error messages

3. **Optimize Database Queries**
   - Use indexes for frequently queried fields
   - Limit result sets with pagination
   - Use lean() for read-only operations

4. **Cache Appropriately**
   - Don't cache user balances or critical financial data
   - Can cache static data (currencies, networks)
   - Clear cache after updates

5. **Monitor Performance**
   - Track API response times
   - Monitor MongoDB query performance
   - Set up alerts for slow queries

---

**Last Updated**: January 2026
**Version**: 1.0
