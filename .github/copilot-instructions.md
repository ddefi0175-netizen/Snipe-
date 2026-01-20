## Snipe AI Agent Instructions (Firebase-first Web3 app)

- **Architecture**: React 18 + Vite frontend in `Onchainweb`; Firebase (Firestore + Auth) is the primary backend; legacy Express/Mongo in `backend/` is deprecated—do not add new features there.
- **Firebase-first with localStorage fallback**: All data paths check `isFirebaseAvailable`. If false, read/write localStorage; if true, use Firestore/Auth. Never reinitialize the Firebase singleton exports `app`, `db`, `auth`.
- **Key files**: Firebase singleton `src/lib/firebase.js` | Config `src/config/firebase.config.js` | Wallet `src/lib/walletConnect.jsx` | Errors `src/lib/errorHandling.js` | Admin `src/lib/adminAuth.js`
- **Data flow**: App → config → firebase.js singleton → Firestore → components with `onSnapshot` listeners (no polling). Always return unsubscribe in useEffect.
- **Wallet integration**: 11 providers (MetaMask, Trust, Coinbase, OKX, Phantom, Binance, TokenPocket, Rainbow, Ledger, imToken, WalletConnect). Strategy: injected → deep link (mobile) → WalletConnect QR.
- **Admin system**: Roles `master`/`admin`/`user` | Permission flags for granular control | Email allowlist via `VITE_ADMIN_ALLOWLIST`.
- **Env setup (required)**: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_WALLETCONNECT_PROJECT_ID`
- **Build/dev commands**: `cd Onchainweb && npm install && npm run dev` (5173); `npm run build`; `npm run preview`
- **Patterns to follow**: Real-time: onSnapshot (not polling) | Errors: formatApiError/formatWalletError | Loading: try/finally | Performance: React.memo/useMemo
- **Common gotchas**: Don't reinit Firebase | Don't commit .env | Don't request private keys | Clean up onSnapshot listeners
- **Docs**: QUICK_START_GUIDE.md, BACKEND_REPLACEMENT.md, REALTIME_DATA_ARCHITECTURE.md, ADMIN_USER_GUIDE.md, VERCEL_DEPLOYMENT_GUIDE.md

If anything here is unclear or feels incomplete, tell me what to expand.
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
## GitHub Copilot Instructions for Snipe (January 2026)

### Platform Snapshot
- React 18 + Vite 5 frontend; Firebase (Firestore + Auth) is the default backend with real-time listeners. Legacy Express/Mongo backend in `backend/` is deprecated—use only for compatibility.
- Dual-layer data access: primary Firebase; fallback to localStorage when `isFirebaseAvailable` is false. Keep the app functional without credentials.

### Architecture & Data Flow
- App → config → Firebase singleton → Firestore → components with `onSnapshot` listeners. Never reinitialize Firebase—reuse `app/db/auth/isFirebaseAvailable` from `src/lib/firebase.js`.
- Wallet connections: `src/lib/walletConnect.jsx` injected provider first, then WalletConnect QR; sessions via STORAGE_KEYS.
- Admin: roles/permissions in `src/lib/adminAuth.js`; legacy API client `src/lib/api.js` deprecated.
- Services in `src/services/` and config in `src/config/firebase.config.js` (COLLECTIONS, env setup).

### Critical Patterns (follow every time)
- Always guard Firebase calls with `isFirebaseAvailable`; provide localStorage fallback mirroring Firestore shape.
- Prefer `onSnapshot` listeners over polling; always return the unsubscribe in `useEffect`.
- Centralize errors through `formatApiError`; wallet errors via `formatWalletError`.
- Wallets: support 11 providers; keep injected→WC QR fallback; persist chain/address; do not request private keys.
- Admin auth: enforce permission flags + allowlist; honor `userAccessMode` (all vs assigned) and avoid bypassing master/admin separation.

### Workflows & Commands
- Env: create `Onchainweb/.env` with 8 Firebase vars + `VITE_WALLETCONNECT_PROJECT_ID` (see QUICK_START_GUIDE.md). Fallback to localStorage if missing.
- Frontend: `cd Onchainweb && npm install && npm run dev` (5173); `npm run build`; `npm run preview`.
- Firebase ops: `firebase deploy --only firestore:rules` and `firebase deploy --only firestore:indexes` when touching security/indexes.
- Legacy backend (optional): `cd backend && npm run dev` (Mongo/Express); do not add new features there.

### Gotchas to avoid
- Do not poll Firestore with `setInterval`; use listeners.
- Do not reinitialize Firebase or bypass the singleton.
- Do not use `src/lib/api.js` for new code.
- Ensure manual chunking in `vite.config.js` stays intact (vendor-react split, 1000kB limit).
- Never commit `.env` or credentials.

### Key Files
- Firebase: `src/lib/firebase.js` (singleton + `isFirebaseAvailable`)
- Wallet: `src/lib/walletConnect.jsx` (11 provider support)
- Admin: `src/lib/adminAuth.js` (permissions + allowlist)
- Errors: `src/lib/errorHandling.js` (formatApiError/formatWalletError)
- Config: `src/config/firebase.config.js` (COLLECTIONS + env setup)

### Debugging checklist
- Browser console for Firebase init errors; Network tab for Firestore calls.
- Verify `isFirebaseAvailable` path and env values when behavior falls back to localStorage.
- Test both MetaMask (injected) and WalletConnect QR flows after wallet changes.
- Use Firebase Console to confirm collection structure matches COLLECTIONS constants.

### Documentation jump points
- [QUICK_START_GUIDE.md](../QUICK_START_GUIDE.md) for env setup
- [BACKEND_REPLACEMENT.md](../BACKEND_REPLACEMENT.md) for Firebase-first rationale
- [REALTIME_DATA_ARCHITECTURE.md](../REALTIME_DATA_ARCHITECTURE.md) for listener patterns
- [ADMIN_USER_GUIDE.md](../ADMIN_USER_GUIDE.md) for permissions/access modes
- [VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md) for deployment specifics
