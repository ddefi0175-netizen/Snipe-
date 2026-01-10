# Snipe Trading Platform - AI Agent Instructions

## Architecture Overview

**Snipe** is a Web3 trading platform with a **serverless Firebase backend** (migrated from MongoDB). The platform has two distinct authentication systems:
1. **User Auth**: Web3 wallet-based (MetaMask, Trust Wallet, etc.) via WalletConnect
2. **Admin Auth**: Firebase email/password (no wallet required)

### Key Architectural Decisions

- **Frontend-Only Deployment**: No backend server. All logic in React + Firebase SDK.
- **Real-Time First**: Uses Firestore `onSnapshot` listeners, not REST polling.
- **Route Separation**: Admin routes (`/admin`, `/master-admin`) bypass wallet authentication.
- **Mobile-First**: Responsive design with bottom nav, works in wallet in-app browsers.

## Project Structure

```
Onchainweb/                    # Frontend (React + Vite)
  src/
    services/                   # Business logic layer
      firebase.service.js       # Firebase SDK initialization & auth
      database.service.js       # Firestore CRUD operations
      api.service.js           # Legacy API (backward compat only)
    components/                 # UI components
      WalletGateUniversal.jsx  # Wallet auth wrapper (users only)
      AdminPanel.jsx           # Admin dashboard (no wallet)
      MasterAdminDashboard.jsx # Master admin (no wallet)
    lib/                        # Legacy utilities
      walletConnect.jsx        # 11 wallet providers (MetaMask, Trust, etc.)
      firebase.js             # Old Firebase wrapper (being phased out)
    config/
      firebase.config.js       # Firebase config & collection names
      constants.js            # Routes, feature flags, roles
    main.jsx                   # Router setup (critical for auth flow)
firebase.json                  # Firebase hosting config
firestore.rules                # Security rules (MUST sync with code)
firestore.indexes.json         # Query indexes
```

## Critical Workflows

### Development
```bash
cd Onchainweb
npm install
npm run dev  # Starts Vite at localhost:5173
```

### Testing
```bash
./run-all-tests.sh  # Runs all 4 test suites
./test-firebase-realtime.sh  # Tests Firebase integration
```

### Deployment (Vercel/Firebase)
```bash
cd Onchainweb && npm run build  # Builds to Onchainweb/dist
firebase deploy --only hosting  # Deploy to Firebase
```

**Important**: Always build from `Onchainweb/` directory. `vercel.json` specifies `buildCommand` and `outputDirectory`.

## Authentication Patterns

### User Auth (Wallet-Based)
```jsx
// main.jsx - User route REQUIRES WalletGate
<Route path="/" element={
  <WalletGate>  {/* Enforces wallet connection */}
    <MainApp />
  </WalletGate>
} />
```

### Admin Auth (Firebase Email/Password)
```jsx
// main.jsx - Admin routes BYPASS WalletGate
<Route path="/admin" element={<AdminPanel />} />
<Route path="/master-admin" element={<MasterAdminDashboard />} />

// AdminPanel.jsx - Own login form
const handleLogin = async (e) => {
  const userCredential = await firebaseSignIn(email, password);
  // Verify admin role in Firestore
  const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
};
```

**NEVER** mix wallet auth and admin auth. Admin components must NOT import `useWallet` or `WalletGate`.

## Firebase Integration

### Service Layer Pattern
Always use `Onchainweb/src/services/` modules, not direct Firebase SDK calls:

```javascript
// ✅ CORRECT: Use service layer
import { db } from '../services/firebase.service.js';
import { getUsers, updateUserBalance } from '../services/database.service.js';

// ❌ WRONG: Direct Firebase import
import { getFirestore } from 'firebase/firestore';
```

### Real-Time Listeners
**Pattern**: Setup listener in `useEffect`, cleanup on unmount:

```javascript
useEffect(() => {
  const unsubscribe = subscribeToChatMessages((messages) => {
    setMessages(messages);
  });
  return () => unsubscribe();  // CRITICAL: Prevent memory leaks
}, []);
```

### Firestore Collections
Defined in `config/firebase.config.js`:
- `users` - User profiles, balances, wallet addresses
- `admins` - Admin accounts with permissions
- `trades` - Trading history
- `chatMessages` - Live chat (with sessionId)
- `activityLogs` - Admin action audit trail

**Security**: Firestore rules in `firestore.rules` enforce read/write permissions. If adding new queries, update rules AND `firestore.indexes.json`.

## Multi-Wallet System

11 providers supported via `lib/walletConnect.jsx`:
- **Injected**: MetaMask, Trust Wallet, Coinbase, OKX, Phantom, Rabby, Brave, Rainbow
- **WalletConnect**: QR code fallback for mobile wallets
- **Requires**: `VITE_WALLETCONNECT_PROJECT_ID` in `.env`

### Wallet Connection Flow
```jsx
const { connectWallet, address, disconnect } = useUniversalWallet();

// User clicks wallet button
await connectWallet('metamask');  // or 'trustwallet', 'coinbase', etc.

// QR fallback if no injected provider
await connectWallet('walletconnect');
```

## Environment Configuration

### Required Variables (`.env`)
```bash
# Firebase (REQUIRED)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_AUTH_DOMAIN=...

# WalletConnect (REQUIRED for mobile wallets)
VITE_WALLETCONNECT_PROJECT_ID=...

# Legacy API (DEPRECATED - leave empty)
VITE_API_BASE=
```

**Never commit** `.env` file. Use `.env.example` as template.

## Common Pitfalls

1. **Cold Start Confusion**: Old docs mention MongoDB cold starts. Firebase has NONE.
2. **Polling vs Real-Time**: Never use `setInterval` for data updates. Use `onSnapshot` listeners.
3. **Admin Wallet Dependency**: Admin routes must NOT check `isConnected` or require wallet.
4. **Build Directory**: Always `cd Onchainweb` before `npm run build`. Root has no package.json.
5. **Firestore Rules**: When adding queries, update `firestore.rules` AND `firestore.indexes.json`.
6. **Listener Cleanup**: Always return cleanup function from `useEffect` to unsubscribe.

## Testing Strategy

Test scripts verify production readiness:
- `test-firebase-realtime.sh` - Firebase integration
- `test-admin-access-control.sh` - Admin permissions
- `test-login-functionality.sh` - Auth flows
- `test-performance.sh` - Load times

**Before PR**: Run `./run-all-tests.sh` and ensure all pass.

## Documentation Quick Links

- **Setup**: [QUICK_START_GUIDE.md](/QUICK_START_GUIDE.md)
- **Firebase Migration**: [BACKEND_REPLACEMENT.md](/BACKEND_REPLACEMENT.md)
- **Real-Time Data**: [REALTIME_DATA_ARCHITECTURE.md](/REALTIME_DATA_ARCHITECTURE.md)
- **Admin Guide**: [ADMIN_USER_GUIDE.md](/ADMIN_USER_GUIDE.md)
- **Deployment**: [VERCEL_DEPLOYMENT_GUIDE.md](/VERCEL_DEPLOYMENT_GUIDE.md)

## Code Style Conventions

- **Components**: PascalCase files (`AdminPanel.jsx`)
- **Services**: camelCase with `.service.js` suffix
- **Config**: camelCase with `.config.js` suffix
- **Async/Await**: Preferred over `.then()` chains
- **Error Handling**: Use try/catch blocks, log to console, show user-friendly messages
- **Accessibility**: All interactive elements must be keyboard navigable

## When Adding Features

1. **Check Firebase limits**: Free tier = 50k reads/day, 20k writes/day
2. **Update Firestore rules**: Security rules in `firestore.rules`
3. **Add indexes**: Complex queries need indexes in `firestore.indexes.json`
4. **Test offline**: Firebase SDK caches data, test with network throttling
5. **Document in README**: Update relevant guide in root directory

## Deprecated Patterns (DO NOT USE)

- `backend/` directory (old MongoDB Express server)
- `lib/api.js` direct imports (use `services/api.service.js`)
- REST API endpoints (replaced with Firebase SDK)
- Polling with `setInterval` (use `onSnapshot`)
- `WalletGate` for admin routes (admin has own auth)
