# Firebase Data Connect Setup Guide

Firebase Data Connect provides strongly-typed, generated APIs for Firestore data with built-in security, caching, and real-time capabilities.

## What We've Set Up

### 📁 Directory Structure
```
dataconnect/
├── connectors/
│   ├── users.gql          # User queries and mutations
│   ├── trades.gql         # Trading operations
│   ├── chat.gql           # Real-time messaging
│   ├── deposits.gql       # Deposit management
│   └── notifications.gql  # User notifications
└── dataconnect.yaml       # Configuration
```

### 📝 GraphQL Connectors

We've created 5 main connectors covering all your Snipe collections:

#### 1. **Users Connector** (`users.gql`)
- `GetUser` - Fetch single user
- `ListUsers` - Paginated user list
- `SearchUsers` - Search by wallet/email
- `CreateUser` - Register new user
- `UpdateUserBalance` - Update balance
- `UpdateUserStatus` - Change user status
- `DeleteUser` - Remove user (admin only)

#### 2. **Trades Connector** (`trades.gql`)
- `GetTrade` - Single trade details
- `ListUserTrades` - User's trade history
- `GetActiveTrades` - All active trades
- `GetTradeStats` - Trading statistics
- `CreateTrade` - Open new trade
- `CompleteTrade` - Close trade
- `CancelTrade` - Cancel trade

#### 3. **Chat Connector** (`chat.gql`)
- `GetChatMessages` - Fetch session messages
- `GetActiveChatSessions` - All open chats
- `GetSessionMessages` - Conversation history
- `SendMessage` - Post message
- `MarkChatMessageDelivered` - Delivery confirmation
- `UpdateActiveChat` - Update chat status
- `CreateActiveChat` - Start new chat

#### 4. **Deposits Connector** (`deposits.gql`)
- `GetDeposit` - Single deposit details
- `ListUserDeposits` - User's deposit history
- `GetPendingDeposits` - All pending deposits
- `GetApprovedDeposits` - User's approved deposits
- `CreateDeposit` - Record new deposit
- `ApproveDeposit` - Admin approval
- `RejectDeposit` - Admin rejection

#### 5. **Notifications Connector** (`notifications.gql`)
- `GetUserNotifications` - All notifications
- `GetUnreadNotifications` - Unread only
- `CreateNotification` - Send notification
- `MarkNotificationRead` - Mark as read
- `DeleteNotification` - Remove notification

## Implementation Steps

### Step 1: Install Firebase CLI Extension for Data Connect

```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Enable Data Connect in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Data Connect** (beta feature)
4. Enable it for your project
5. Choose Firestore as your database

### Step 3: Update `dataconnect.yaml`

Replace the service account placeholders with your actual Firebase project ID:

```yaml
specVersion: v1
serviceAccount: firebase-adminsdk-[YOUR_PROJECT_ID_HERE]@[YOUR_PROJECT_ID_HERE].iam.gserviceaccount.com
```

Get your project ID from Firebase Console → Project Settings → Project ID.

### Step 4: Deploy Connectors

```bash
firebase deploy --only dataconnect:connectors
```

This will:
- Validate your GraphQL schemas
- Generate TypeScript types
- Deploy to Firebase
- Create generated client SDKs

### Step 5: Install Generated SDK (Auto)

Firebase CLI automatically installs the generated SDK after deployment. The types are available in:
- TypeScript: `Onchainweb/src/types/dataconnect.types.ts`
- Service layer: `Onchainweb/src/services/dataconnect.service.ts`

## Using in Components

### Example 1: Fetch User Data

```tsx
import { usersService } from '@/services/dataconnect.service'

export function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    usersService.getUser(userId).then(setUser)
  }, [userId])

  return (
    <div>
      <h1>{user?.email}</h1>
      <p>Balance: ${user?.balance}</p>
    </div>
  )
}
```

### Example 2: List User Trades

```tsx
import { tradesService } from '@/services/dataconnect.service'

export function TradeHistory({ userId }) {
  const [trades, setTrades] = useState([])

  useEffect(() => {
    tradesService.listUserTrades(userId, 50, 0).then(setTrades)
  }, [userId])

  return (
    <ul>
      {trades.map(trade => (
        <li key={trade.id}>
          {trade.pair} - {trade.direction} @ {trade.entryPrice}
        </li>
      ))}
    </ul>
  )
}
```

### Example 3: Send Chat Message

```tsx
import { chatService } from '@/services/dataconnect.service'

export function ChatWidget({ sessionId, userId, userName }) {
  const handleSendMessage = async (message: string) => {
    const messageId = await chatService.sendMessage(
      sessionId,
      message,
      userName,
      userId,
      'user'
    )
    console.log('Message sent:', messageId)
  }

  return (
    <textarea
      onKeyPress={(e) => {
        if (e.key === 'Enter') handleSendMessage(e.currentTarget.value)
      }}
    />
  )
}
```

### Example 4: Create Notification

```tsx
import { notificationsService } from '@/services/dataconnect.service'

export function NotificationManager({ userId }) {
  const sendTradeNotification = async () => {
    await notificationsService.createNotification(
      userId,
      'Trade Executed',
      'Your trade on BTC/USD has been executed',
      'trade',
      '/trades/history'
    )
  }

  return <button onClick={sendTradeNotification}>Send Notification</button>
}
```

## Real-Time Features

### Subscribe to Active Trades (Using onSnapshot)

```tsx
import { onSnapshot, collection, query, where } from 'firebase/firestore'
import { db, isFirebaseAvailable } from '@/lib/firebase'

export function useActiveTrades() {
  const [trades, setTrades] = useState([])

  useEffect(() => {
    if (!isFirebaseAvailable) return

    const q = query(
      collection(db, 'trades'),
      where('status', '==', 'active')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeTrades = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTrades(activeTrades)
    })

    return () => unsubscribe()
  }, [])

  return trades
}
```

### Subscribe to User Notifications

```tsx
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore'

export function useUserNotifications(userId) {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!isFirebaseAvailable) return

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setNotifications(notifs)
    })

    return () => unsubscribe()
  }, [userId])

  return notifications
}
```

## Advanced Features

### Caching Strategy

The service layer includes automatic caching:

```typescript
// Cache is stored in memory and automatically expires after 5 minutes
const user = await usersService.getUser(userId) // Fetches from DB
const user2 = await usersService.getUser(userId) // Returns from cache

// Clear specific cache patterns
clearCachePattern('active_trades_')
```

### Offline Support

All services have built-in localStorage fallback:

```typescript
if (isFirebaseAvailable) {
  // Use Firebase
  await firebaseOperation()
} else {
  // Fallback to localStorage
  localStorage.setItem('key', JSON.stringify(data))
}
```

### Type Safety

All operations are fully typed:

```typescript
// TypeScript catches errors at compile time
const result = await usersService.updateUserBalance(userId, 100) // ✅ Correct types

// Invalid code is caught:
const result = await usersService.updateUserBalance(userId, "invalid") // ❌ Type error
```

## Security

### Firestore Rules Integration

Data Connect respects your existing Firestore security rules (`firestore.rules`):

- Users can only read/write their own data
- Admins can access all data based on permissions
- All mutations are validated on the server
- Data is encrypted in transit and at rest

### Example Rule for Data Connect

```firerules
// In firestore.rules
match /users/{userId} {
  // Data Connect respects these rules
  allow read: if isOwner(userId) || isAdmin();
  allow write: if isOwner(userId) || isAdmin();
}
```

## Deployment

### Deploy to Firebase Hosting

```bash
npm run build:production
firebase deploy
```

This will:
1. Deploy frontend to Firebase Hosting
2. Deploy Data Connect connectors
3. Deploy Firestore security rules
4. Deploy functions (if any)

### Monitor in Firebase Console

- **Data Connect → Metrics**: View API usage and performance
- **Firestore → Usage**: Monitor read/write operations
- **Authentication → Users**: Manage user accounts
- **Functions → Logs**: Debug serverless functions

## Troubleshooting

### Issue: "Data Connect not enabled"

```bash
# Enable in Firebase Console first, then:
firebase init dataconnect
```

### Issue: "Service account not found"

Make sure `dataconnect.yaml` has the correct format:

```yaml
specVersion: v1
serviceAccount: firebase-adminsdk-YOUR_ID@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Issue: "GraphQL schema error"

Check GraphQL syntax in `.gql` files:
- Queries must return types
- All required fields must be provided
- Input variables must match definitions

### Issue: "Type conflicts between sdk and ts"

```bash
# Regenerate types after deploying
firebase deploy --only dataconnect:connectors
npm run build  # Rebuild to use new types
```

## Next Steps

1. ✅ Deploy connectors: `firebase deploy --only dataconnect:connectors`
2. ✅ Test queries: Use Firebase Console → Data Connect → Explorer
3. ✅ Update components: Import and use services
4. ✅ Add more connectors: For staking, withdrawals, etc.
5. ✅ Set up monitoring: Track API usage and performance

## Resources

- [Firebase Data Connect Docs](https://firebase.google.com/docs/data-connect)
- [GraphQL Documentation](https://graphql.org)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Last Updated**: February 4, 2026
**Status**: Ready for deployment
**Next**: Deploy connectors and test in Firebase Console
