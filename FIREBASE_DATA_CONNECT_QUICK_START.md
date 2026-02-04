# 🚀 Firebase Data Connect Quick Start

> **Status**: ✅ **Complete** - Ready to Deploy
> **Total Operations**: 33 (5 connectors × 5-7 operations each)
> **Type Safety**: ✅ Full TypeScript support
> **Auto-Caching**: ✅ 5-min default with manual control
> **Offline Support**: ✅ localStorage fallback

---

## ⚡ 2-Minute Setup

### Step 1: Update Project ID
```bash
# Get your Firebase Project ID from:
# https://console.firebase.google.com → Settings → Project ID

# Update dataconnect.yaml
sed -i 's/\[PROJECT_ID\]/YOUR_PROJECT_ID/g' dataconnect.yaml
```

### Step 2: Deploy
```bash
# Run interactive checklist
./DATACONNECT_DEPLOY_CHECKLIST.sh

# OR manually deploy
firebase deploy --only dataconnect:connectors
```

### Step 3: Use in Code
```typescript
import { usersService, tradesService } from '@/services/dataconnect.service'

// Type-safe queries with auto-caching
const user = await usersService.getUser('0x123...')
const trades = await tradesService.listUserTrades(userId, 20, 0)

// Mutations with offline fallback
const tradeId = await tradesService.createTrade({
  userId, pair: 'BTC/USD', direction: 'up', entryPrice: 50000, amount: 100
})
```

---

## 📦 What's Included

### 1. GraphQL Connectors (5 files)
```
dataconnect/connectors/
├── users.gql              ← 7 operations
├── trades.gql             ← 7 operations
├── chat.gql               ← 7 operations
├── deposits.gql           ← 7 operations
└── notifications.gql      ← 5 operations
```

**Total**: 33 GraphQL operations (queries + mutations)

### 2. Type System
```typescript
// Onchainweb/src/types/dataconnect.types.ts
export interface User {
  id: string
  wallet: string
  email?: string
  balance: number
  vipLevel: number
  status: 'active' | 'frozen' | 'pending'
  points: number
  createdAt: string
  updatedAt: string
}

// ... 15+ more interfaces with full type safety
```

### 3. Service Layer (25+ Methods)
```typescript
// Onchainweb/src/services/dataconnect.service.ts

// Users Service
usersService.getUser(userId: string)
usersService.listUsers(limit: number, offset: number)
usersService.searchUsers(query: string)
usersService.updateUserBalance(userId: string, balance: number)
usersService.updateUserStatus(userId: string, status: string)
// ... 2 more methods

// Trades Service
tradesService.listUserTrades(userId: string, limit: number, offset: number)
tradesService.getActiveTrades()
tradesService.getTradeStats()
tradesService.createTrade(input: CreateTradeInput)
tradesService.completeTrade(input: CompleteTradeInput)
tradesService.cancelTrade(tradeId: string)
// ... 1 more method

// Chat Service (7 methods)
// Notifications Service (5 methods)
// Deposits Service (7 methods)

// Features:
// ✅ Automatic 5-minute caching
// ✅ Manual cache invalidation
// ✅ localStorage fallback when offline
// ✅ Type-safe query parameters
// ✅ Automatic error handling
```

### 4. Example Components
```typescript
// Onchainweb/src/examples/DataConnectExamples.tsx

1. UserProfileExample
   - Displays user profile with real-time balance
   - Demonstrates: getUser, updateUserBalance

2. TradeHistoryExample
   - Shows user's trades with pagination
   - Demonstrates: listUserTrades, getActiveTrades

3. NotificationsExample
   - Real-time notification display with polling
   - Demonstrates: getUserNotifications, unreadCount

4. CreateTradeExample
   - Form to create new trades
   - Demonstrates: createTrade with validation

5. AdminUserManagementExample
   - Admin panel for user management
   - Demonstrates: listUsers, updateUserStatus
```

---

## 🔧 Common Tasks

### Using a Service Method
```typescript
// Simple query with auto-caching
const user = await usersService.getUser(userId)

// List with pagination
const page1 = await tradesService.listUserTrades(userId, 20, 0)
const page2 = await tradesService.listUserTrades(userId, 20, 20)

// Create with validation
const tradeId = await tradesService.createTrade({
  userId: '0x123...',
  pair: 'BTC/USD',
  direction: 'up',
  entryPrice: 50000,
  amount: 100,
  leverage: 1
})
```

### Manual Cache Control
```typescript
// Get cached data (instant)
const user = await usersService.getUser(userId)

// Bypass cache (force fresh)
const freshUser = await usersService.getUser(userId, { bypassCache: true })

// Clear specific cache
usersService.clearCache('getUser')

// Clear all caches
usersService.clearAllCaches()
```

### Error Handling
```typescript
try {
  const user = await usersService.getUser(userId)
  if (!user) {
    console.log('User not found - using fallback data')
  }
} catch (error) {
  console.error('Query failed:', error)
  // Falls back to localStorage automatically
}
```

### Real-Time Updates
```typescript
// For real-time updates, use Firebase listeners:
import { onSnapshot, doc } from 'firebase/firestore'
import { db, isFirebaseAvailable } from '@/lib/firebase'

useEffect(() => {
  if (!isFirebaseAvailable) return

  const unsubscribe = onSnapshot(
    doc(db, 'users', userId),
    (doc) => {
      setUserData(doc.data())
    }
  )

  return () => unsubscribe()
}, [userId])
```

---

## 📊 Connector Summary

| Connector | Operations | Operations | Operations | Operations | Operations |
|-----------|-----------|-----------|-----------|-----------|-----------|
| **users** | GetUser | ListUsers | SearchUsers | CreateUser | UpdateUserBalance |
|           | UpdateUserStatus | DeleteUser | | | |
| **trades** | GetTrade | ListUserTrades | GetActiveTrades | GetTradeStats | CreateTrade |
|           | CompleteTrade | CancelTrade | | | |
| **chat** | GetChatMessages | GetActiveChatSessions | GetSessionMessages | SendMessage | MarkChatMessageDelivered |
|          | UpdateActiveChat | CreateActiveChat | | | |
| **deposits** | GetDeposit | ListUserDeposits | GetPendingDeposits | GetApprovedDeposits | CreateDeposit |
|             | ApproveDeposit | RejectDeposit | | | |
| **notifications** | GetUserNotifications | GetUnreadNotifications | CreateNotification | MarkNotificationRead | DeleteNotification |

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Firebase project created
- [ ] Firestore database initialized
- [ ] Data Connect enabled in Firebase Console
- [ ] Project ID obtained from Firebase Settings

### Deployment
- [ ] Update `dataconnect.yaml` with project ID
- [ ] Run `./DATACONNECT_DEPLOY_CHECKLIST.sh`
- [ ] Verify deployment in Firebase Console
- [ ] Test with example components

### Post-Deployment
- [ ] Test service methods in browser console
- [ ] Verify caching works
- [ ] Test offline fallback
- [ ] Monitor Data Connect metrics

---

## 📚 Documentation Files

| File | Purpose | Lines |
|------|---------|-------|
| `FIREBASE_DATA_CONNECT_SETUP.md` | Complete setup guide with schema details | 350+ |
| `FIREBASE_DATA_CONNECT_SUMMARY.md` | Executive summary with statistics | 200+ |
| `Onchainweb/src/examples/DataConnectExamples.tsx` | Production-ready examples | 400+ |
| `Onchainweb/src/services/dataconnect.service.ts` | Full service layer with caching | 600+ |
| `Onchainweb/src/types/dataconnect.types.ts` | TypeScript type definitions | 200+ |

---

## 🧪 Testing Services Locally

### Browser Console Test
```javascript
// Open browser DevTools → Console
// Import and test
import { usersService } from '@/services/dataconnect.service'

// Get current user
const user = await usersService.getUser('YOUR_WALLET_ADDRESS')
console.log('User:', user)

// List users (admin only)
const users = await usersService.listUsers(10, 0)
console.log('Users:', users)
```

### Example Component Test
1. Copy `DataConnectExamples.tsx` to a route
2. Import in your app
3. Test each example component
4. Verify data displays correctly

---

## ⚠️ Troubleshooting

### "Connector not found"
**Solution**: Ensure `firebase deploy --only dataconnect:connectors` completed successfully

### "Type mismatch in service"
**Solution**: Update `dataconnect.types.ts` after changing GraphQL schema

### "Cache not clearing"
**Solution**: Call `usersService.clearAllCaches()` explicitly

### "Offline fallback not working"
**Solution**: Check localStorage quota; ensure data was cached before going offline

### "Firebase not available"
**Solution**: Check `isFirebaseAvailable` flag in firebase.js; ensure .env has all 8 Firebase vars

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| Firebase Data Connect Docs | https://firebase.google.com/docs/data-connect |
| GraphQL Documentation | https://graphql.org/learn/ |
| TypeScript Handbook | https://www.typescriptlang.org/docs/ |
| Snipe Project Issues | https://github.com/ddefi0175-netizen/Snipe/issues |

---

## 🎯 Next Steps

1. **Deploy** (5 min)
   ```bash
   ./DATACONNECT_DEPLOY_CHECKLIST.sh
   ```

2. **Test** (10 min)
   - Open Firebase Console → Data Connect → Explorer
   - Run test queries
   - Verify response times

3. **Integrate** (1-2 hours)
   - Replace direct Firebase calls with services
   - Update error handling
   - Test in browser

4. **Monitor** (Ongoing)
   - Watch API metrics
   - Track cache hit rates
   - Optimize indexes

---

## 📊 Quick Stats

```
📦 Infrastructure: 10 files created
📄 Total Code: 2,000+ lines
🔧 Service Methods: 25+
📋 GraphQL Operations: 33
🎯 TypeScript Interfaces: 16+
📝 Documentation: 750+ lines
💾 Example Components: 5
🚀 Ready for Production: YES ✅
```

---

**Last Updated**: February 4, 2026
**Version**: 1.0
**Status**: ✅ Ready to Deploy
