# GitHub Copilot Instructions for Snipe Platform

**Last Updated**: January 2026 | **Version**: 2.0 (Firebase-First Architecture)

Snipe is a Web3 trading platform (React + Vite frontend, Firebase backend) with wallet connection, admin systems, and real-time data.

## Critical Architecture Pattern: Firebase-First + Fallback Design

**Key Insight**: The codebase is dual-layered to handle missing Firebase credentials gracefully:

1. **Firebase primary** (`src/lib/firebase.js`, `src/services/firebase.service.js`): Firestore collections (users, admins, trades, deposits), Auth, real-time listeners
2. **Fallback to localStorage** when Firebase unavailable: For dev/offline scenarios
3. **Optional legacy backend** (`src/lib/api.js`): Deprecated MongoDB-Express.js (don't use for new features)

**When you add a feature**: Always implement Firebase-first with localStorage fallback. Example:
```javascript
export const saveChatMessage = async (message) => {
  if (!isFirebaseAvailable) {
    // Fallback: localStorage
    const logs = JSON.parse(localStorage.getItem('customerChatLogs') || '[]');
    logs.push(message);
    localStorage.setItem('customerChatLogs', JSON.stringify(logs));
  } else {
    // Primary: Firestore
    await addDoc(collection(db, 'chatMessages'), message);
  }
};
```

## Tech Stack

- **Frontend**: React 18 + Vite (ES modules)
- **Backend**: Firebase (Firestore, Authentication, Realtime DB)
- **Styling**: Tailwind CSS (v4 with PostCSS)
- **Wallet Integration**: WalletConnect v2 (universal provider) + EIP-6963 (injected wallets)
- **State Management**: React Context API (no Redux)
- **Build**: Vite 5.4.21 with React plugin, manual chunking for vendor splitting

## Directory Structure & Data Flow

```
Onchainweb/src/
├── config/
│   └── firebase.config.js         # Centralized env vars (VITE_FIREBASE_*, COLLECTIONS)
├── lib/
│   ├── firebase.js                # Main Firebase service (auth, CRUD, listeners)
│   ├── walletConnect.jsx          # Universal wallet detection + connection logic
│   ├── errorHandling.js           # Shared error formatting (API + wallet errors)
│   ├── adminAuth.js               # Email-to-admin conversion, permission helpers
│   ├── api.js                     # DEPRECATED: Legacy MongoDB API client
│   └── coingecko.jsx              # Price data fetching
├── services/
│   ├── firebase.service.js        # Secondary Firebase wrapper (redundant, consider consolidating)
│   ├── database.service.js        # Database abstraction (CRUD, querying)
│   ├── api.service.js             # API call wrapper with retry logic
│   └── index.js                   # Service barrel export
├── components/
│   ├── WalletGateUniversal.jsx    # Wallet connection gate (first render)
│   ├── UniversalWalletModal.jsx   # Wallet selection UI + connection flow
│   ├── MasterAdminDashboard.jsx   # Master user controls
│   ├── AdminPanel.jsx             # Admin features (by permission)
│   └── [Feature].jsx              # Pages: Trade, Dashboard, etc.
├── App.jsx                        # Main router + route logic
└── main.jsx                       # Vite entry + React mount
```

**Data Flow**: App → Firebase config → firebase.js (singleton) → Firestore collections → Components (real-time listeners)

**Critical Singletons** (initialized once at app start):
- `app`, `db`, `auth`, `isFirebaseAvailable` in `src/lib/firebase.js`
- Never reinitialize Firebase—check `isFirebaseAvailable` flag first

## Build & Development Workflow

### Commands
```bash
# Frontend (required)
cd Onchainweb && npm run dev    # Vite dev server on http://localhost:5173
cd Onchainweb && npm run build  # Production build → dist/
cd Onchainweb && npm run preview # Preview dist/ locally

# Backend (deprecated, optional for legacy)
cd backend && npm run dev        # Express server on http://localhost:4000 (MongoDB)
```

### Environment Setup
**File**: `Onchainweb/.env` (required for Firebase):
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_WALLETCONNECT_PROJECT_ID=... # Required for wallet QR code on mobile
```

### Build Configuration (vite.config.js)
- **Manual chunking**: `vendor-react` split for better caching
- **Chunk size warning limit**: 1000kB (default 500kB) due to Firebase/WalletConnect size
- **JSX loader**: esbuild configured for `.js` + `.jsx` files
- **Base path**: `'/'` (works with Vercel + custom domains)

## Key Patterns & Conventions

### Firebase Real-Time Listeners (Core Pattern)
Always use `onSnapshot()` for live data, not polling:
```javascript
// ✅ DO: Real-time listener
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
    setUserData(doc.data());
  });
  return () => unsubscribe();
}, [userId]);

// ❌ DON'T: Polling (slow, wastes bandwidth)
setInterval(() => fetchUser(), 3000);
```

### Wallet Connection Flow (src/lib/walletConnect.jsx)
- **11+ wallets supported** (MetaMask, WalletConnect, Trust, Coinbase, OKX, Phantom, Binance, TokenPocket, Rainbow, Ledger, imToken)
- **Dual strategy**: Try injected provider first → fallback to WalletConnect QR code
- **Mobile detection**: Optimizes connection method based on environment
- **Session persistence**: Stored in localStorage (STORAGE_KEYS constants)

### Firebase Initialization (src/lib/firebase.js)
- Singleton pattern: Initialize once, reuse globally via `isFirebaseAvailable` flag
- Graceful degradation: If Firebase config incomplete, app falls back to localStorage
- No exceptions thrown on init: Check `isFirebaseAvailable` before each Firebase call

### Error Handling (src/lib/errorHandling.js)
- Centralized formatter: `formatApiError()` handles network, timeout, auth errors
- Cold-start aware: Messages guide users to retry after Render cold starts
- Wallet-specific formatter: `formatWalletError()` for connection issues
- Status code mapping: 401 (auth), 403 (denied), 500+ (server errors)

### Admin Authentication (src/lib/adminAuth.js)
- Role-based permissions: `master` (full access), `admin` (scoped), `user` (wallet-only)
- Email allowlist: Control who can create admin accounts via `VITE_ADMIN_ALLOWLIST`
- Permission structure: Fine-grained flags (manageUsers, manageBalances, manageTrades, etc.)
- Fallback roles: Assigned users vs. all users access modes

## Wallet Connection

### Supported Wallets
- MetaMask (injected + WalletConnect)
- Trust Wallet (deep link + WalletConnect)
- Coinbase Wallet
- OKX Wallet
- Phantom (EVM mode)
- Binance Web3 Wallet
- TokenPocket
- Rainbow
- Ledger Live
- imToken
- WalletConnect (universal)

### Key Implementation Details (walletConnect.jsx)
- **Storage keys**: Persist connected wallet address, chain ID, session info
- **Chain support**: Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Fantom
- **Environment detection**: Browser type determines connection strategy (desktop extension vs. mobile QR)
- **Wallet definitions**: WALLET_CONNECTORS object maps wallet IDs to icons, colors, connection methods
- **Graceful fallback**: No injected provider? Offer WalletConnect modal with auto-connecting QR

## Real-Time Data

### Architecture
All data updates use Firebase Firestore real-time listeners (WebSocket):
- User balances: Real-time synchronization
- Trade updates: Instant notifications
- Chat messages: WebSocket-based delivery
- Admin actions: Live activity logs

### Performance
- Updates delivered in <50ms
- No polling required
- Automatic reconnection on connection loss

## Admin System

### Permission Structure
Admins have granular permissions:
- `manageUsers`: View/edit user profiles
- `manageBalances`: Modify account balances
- `manageKYC`: Review KYC submissions
- `manageTrades`: Monitor trades
- `viewReports`: Access analytics
- `manageDeposits`: Process deposits
- `manageWithdrawals`: Approve withdrawals
- `customerService`: Support tickets
- `viewLogs`: System audit logs
- `siteSettings`: Platform settings
- `createAdmins`: Create admin accounts

### User Access Modes
- `all`: Access to all users
- `assigned`: Access to specific user IDs only

## Critical Developer Workflows

### First Time Setup
1. Install Node 18+: `node --version`
2. Ensure Firebase credentials: Check `Onchainweb/.env` has all 8 `VITE_FIREBASE_*` vars
3. Install deps: `cd Onchainweb && npm install`
4. Start dev: `npm run dev` → http://localhost:5173

### Adding a New Feature
1. **Identify data source**: Firebase (`src/lib/firebase.js`) or fallback localStorage?
2. **Add CRUD**: Implement in Firebase service, include fallback
3. **Create component**: Use real-time listeners, not polling
4. **Error handling**: Use `formatApiError()` for consistency
5. **Test locally**: Verify with Firebase Console or localStorage

### Debugging
- **Dev console** (F12): Check for Firebase init errors
- **Firebase Console**: Verify data structure matches code
- **Network tab**: Check Firestore API calls
- **Check `isFirebaseAvailable`**: Determines active data source

## Testing Guidelines (Optional)

### Validation Pattern
Test Firebase fallback gracefully:
```javascript
// Component should work with or without Firebase
if (isFirebaseAvailable) {
  // Use Firebase
} else {
  // Use localStorage
}
```

### Integration Points to Verify
- Wallet connection: MetaMask + WalletConnect QR both work
- Firebase operations: CRUD on Firestore with security rules
- Admin permissions: Master/admin/user roles properly enforced

## Documentation References

For detailed information on specific topics, refer to:
- **Quick Start**: [QUICK_START_GUIDE.md](../QUICK_START_GUIDE.md) — Setup Firebase credentials in 5 min
- **Backend Architecture**: [BACKEND_REPLACEMENT.md](../BACKEND_REPLACEMENT.md) — Why Firebase, not MongoDB
- **Real-Time Architecture**: [REALTIME_DATA_ARCHITECTURE.md](../REALTIME_DATA_ARCHITECTURE.md) — Data flow, WebSocket listeners
- **Admin Guide**: [ADMIN_USER_GUIDE.md](../ADMIN_USER_GUIDE.md) — Permission model, account creation
- **Vercel Deployment**: [VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md) — Deploy frontend + WalletConnect config

## Security Best Practices

### General
- Never commit API keys, secrets, or credentials
- Use environment variables for sensitive data
- Validate all user inputs
- Implement rate limiting for API calls
- Use HTTPS in production

### Firebase Security
- Deploy proper Firestore security rules
- Validate authentication on server side
- Use Firebase Admin SDK for privileged operations
- Implement proper CORS policies

### Wallet Security
- Never request private keys
- Validate all transaction data
- Implement proper signature verification
- Use secure random number generation

## Common Patterns & Best Practices

### Error Handling with Fallback
```javascript
// Always check Firebase availability
try {
  if (isFirebaseAvailable) {
    await firebaseOperation();
  } else {
    // Fallback to localStorage or stub
    localStorage.setItem('key', JSON.stringify(data));
  }
} catch (error) {
  showNotification(formatApiError(error)); // Use centralized error formatter
}
```

### Component Loading State Pattern
```javascript
const [loading, setLoading] = useState(false);
const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
  } finally {
    setLoading(false); // Always reset, even on error
  }
};
```

### Real-Time Data Unsubscribe
```javascript
useEffect(() => {
  if (!isFirebaseAvailable) return;
  const unsubscribe = onSnapshot(query, (snapshot) => {
    setData(snapshot.docs.map(doc => doc.data()));
  });
  return () => unsubscribe(); // Critical: cleanup listener
}, []);
```

## Deployment

### Vercel Deployment
- Platform is optimized for Vercel deployment
- Environment variables configured in Vercel dashboard
- Automatic deployments on git push
- Ensure `VITE_WALLETCONNECT_PROJECT_ID` is set for mobile wallet connections

### Firebase Deployment
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Deploy Cloud Functions: `firebase deploy --only functions` (if used)

## Performance Optimization

### React Performance
- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize re-renders with useCallback and useMemo
- Use React Suspense for code splitting

### Firebase Performance
- Use pagination for large lists
- Implement proper indexing (see firestore.indexes.json)
- Cache frequently accessed data locally
- Use Firebase Performance Monitoring

### Build Performance
- Manual chunking in vite.config.js keeps vendor-react separate
- Chunk size warning at 1000kB (Firebase + WalletConnect are large)
- Tree-shaking removes unused Firebase functions

## Accessibility

- Follow WCAG 2.1 Level AA guidelines
- Implement proper ARIA labels
- Ensure keyboard navigation
- Provide text alternatives for images
- Test with screen readers

## Mobile Responsiveness

- Use Tailwind's responsive utilities
- Test on multiple device sizes
- Implement touch-friendly UI elements
- Optimize for mobile performance

## Development Workflow

### Local Development
```bash
# Start frontend
cd Onchainweb
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup
- Copy `.env.example` to `.env`
- Fill in Firebase credentials
- Set WalletConnect Project ID
- Configure other API keys as needed

## Git Workflow

- Create feature branches from `main`
- Use descriptive commit messages
- Keep commits atomic and focused
- Run tests before committing
- Submit pull requests for review

## Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Check `.env` file has all VITE_FIREBASE_* variables
   - Verify Firebase project is active

2. **Wallet connection fails**
   - Check WalletConnect Project ID is set
   - Verify wallet extension is installed
   - Try WalletConnect QR code fallback

3. **Build errors**
   - Clear node_modules and reinstall
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [WalletConnect Docs](https://docs.walletconnect.com)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Support

For questions or issues:
- Check the documentation files in the repository root
- Open an issue on GitHub
- Contact: ddefi0175@gmail.com

---

**Last Updated**: January 2026
**Maintained By**: Snipe Development Team
