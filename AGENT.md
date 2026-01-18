# AI Agent Quick-Start Guide for Snipe Platform

## Read this in 5 minutes to be productive immediately

## What is Snipe?

Web3 trading platform with React frontend, Firebase backend, 11+ wallet providers, and real-time WebSocket data synchronization.

## 🎯 The #1 Thing You Must Know

### Dual-Layer Architecture: Firebase + localStorage Fallback

```javascript
// Every feature follows this pattern:
if (!isFirebaseAvailable) {
  localStorage.setItem('key', JSON.stringify(data)); // Fallback
} else {
  await setDoc(doc(db, 'collection'), data); // Primary
}
```

**Why?** App works offline or with incomplete Firebase credentials. Always check `isFirebaseAvailable` flag.

## 🗂️ Key Files (Top 5)

| File | Purpose | Critical Detail |
|------|---------|-----------------|
| `Onchainweb/src/lib/firebase.js` | Main Firebase service | Singleton - exports `isFirebaseAvailable`, `db`, `auth` |
| `Onchainweb/src/lib/walletConnect.jsx` | Wallet connection | 11 wallets, injected → WalletConnect fallback |
| `Onchainweb/src/lib/errorHandling.js` | Error formatter | Use `formatApiError()` for all errors |
| `Onchainweb/src/config/firebase.config.js` | Config centralization | COLLECTIONS constants, env vars |
| `Onchainweb/src/lib/adminAuth.js` | Admin roles | master/admin/user, permission flags |

**⚠️ DEPRECATED:** `src/lib/api.js` (old MongoDB API - don't use)

## 🚀 Start Development (3 commands)

```bash
cd Onchainweb
npm install
npm run dev  # → http://localhost:5173
```

**Required:** Create `Onchainweb/.env` with 8 Firebase variables:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_WALLETCONNECT_PROJECT_ID=...
```

## 📋 The 3 Core Patterns

### 1. Real-Time Listeners (Not Polling!)

```javascript
// ✅ DO THIS
useEffect(() => {
  if (!isFirebaseAvailable) return;
  const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
    setUserData(doc.data());
  });
  return () => unsubscribe(); // Always cleanup!
}, [userId]);

// ❌ NEVER DO THIS
setInterval(() => fetchUser(), 3000); // Wastes bandwidth
```

### 2. Error Handling

```javascript
import { formatApiError } from './lib/errorHandling';

try {
  await operation();
} catch (error) {
  showNotification(formatApiError(error)); // Centralized, cold-start aware
}
```

### 3. Loading States

```javascript
const [loading, setLoading] = useState(false);
const handleAction = async () => {
  setLoading(true);
  try {
    await action();
  } finally {
    setLoading(false); // Always reset
  }
};
```

## 🔧 Adding a New Feature (5 Steps)

1. **Data source?** Firebase primary, localStorage fallback
2. **Add CRUD** in `src/lib/firebase.js` with fallback logic
3. **Component** uses `onSnapshot()` real-time listener
4. **Errors** formatted with `formatApiError()`
5. **Test** with Firebase Console + localStorage inspector

## 🎨 Tech Stack Snapshot

- **Frontend:** React 18 + Vite 5.4.21
- **Backend:** Firebase (Firestore + Auth)
- **Styling:** Tailwind CSS v4
- **Wallets:** WalletConnect v2 + EIP-6963
- **State:** Context API (no Redux)

## 🔐 Wallet Integration

**11 Supported Wallets:**
MetaMask, Trust, Coinbase, OKX, Phantom, Binance, TokenPocket, Rainbow, Ledger, imToken, WalletConnect

**Connection Strategy:**
1. Try injected provider (browser extension)
2. Fallback to WalletConnect QR code (mobile)
3. Session persists in localStorage (STORAGE_KEYS)

## 👥 Admin System

**Roles:** `master` (full access) | `admin` (scoped) | `user` (wallet-only)

**Key Permissions:**
- `manageUsers`, `manageBalances`, `manageTrades`
- `viewReports`, `manageDeposits`, `manageWithdrawals`
- `customerService`, `viewLogs`, `siteSettings`, `createAdmins`

**Access Modes:** `all` (all users) | `assigned` (specific user IDs)

## ⚡ Quick Commands Reference

```bash
# Development
npm run dev              # Dev server on :5173
npm run build            # Production build
npm run preview          # Preview dist/

# Firebase (if needed)
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## 🚨 Common Gotchas

| Issue | Solution |
|-------|----------|
| Firebase not initializing | Check `.env` has all 8 `VITE_FIREBASE_*` vars |
| Wallet won't connect | Verify `VITE_WALLETCONNECT_PROJECT_ID` is set |
| Polling instead of listeners | Use `onSnapshot()`, not setInterval |
| Forgot cleanup | Return `() => unsubscribe()` in useEffect |
| Build too large | Manual chunking already configured (vendor-react split) |

## ✅ Code Quality Checklist

**Always:**
- ✅ Check `isFirebaseAvailable` before Firebase calls
- ✅ Implement localStorage fallback
- ✅ Use `onSnapshot()` for real-time (not polling)
- ✅ Cleanup listeners in useEffect return
- ✅ Use `formatApiError()` for errors
- ✅ Test MetaMask + WalletConnect flows

**Never:**
- ❌ Poll Firebase with setInterval
- ❌ Reinitialize Firebase singleton
- ❌ Use `src/lib/api.js` (deprecated)
- ❌ Commit `.env` files
- ❌ Request wallet private keys

## 📚 Deep Dive Documentation

- `QUICK_START_GUIDE.md` - Detailed setup
- `BACKEND_REPLACEMENT.md` - Why Firebase architecture
- `REALTIME_DATA_ARCHITECTURE.md` - WebSocket patterns
- `ADMIN_USER_GUIDE.md` - Permission system details
- `VERCEL_DEPLOYMENT_GUIDE.md` - Production deployment
- `.github/copilot-instructions.md` - Full AI agent guide

## 🐛 Debugging Workflow

1. **F12 Console** → Check Firebase init errors
2. **Firebase Console** → Verify data structure
3. **Network Tab** → Inspect Firestore API calls
4. **Check `isFirebaseAvailable`** → Determines active data source
5. **Test offline** → Verify localStorage fallback

## 🎯 Your First Task

To verify you understand the architecture:

1. Find where `isFirebaseAvailable` is initialized
2. Locate the STORAGE_KEYS for wallet persistence
3. Identify the COLLECTIONS constants in firebase.config.js
4. Check vite.config.js for the manual chunking setup

**You're ready to code!** 🚀

---

**Questions?** Check `.github/copilot-instructions.md` for comprehensive guidance or ping ddefi0175@gmail.com
