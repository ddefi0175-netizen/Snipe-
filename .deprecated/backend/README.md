# ⚠️ DEPRECATED BACKEND

This backend is **DEPRECATED** and should **NOT** be used for new deployments.

## Migration Status
- ✅ Migrated to Firebase (serverless)
- ⛔ This Express/MongoDB backend is kept for reference only
- 🚫 **DO NOT DEPLOY THIS CODE**

## Current Architecture
The platform now uses:
- **Frontend**: Vite + React (Onchainweb/)
- **Backend**: Firebase Functions + Firestore
- **Cache**: Cloudflare Workers KV
- **Storage**: Cloudflare R2

## Why Deprecated?

The MongoDB/Express backend has been replaced with a serverless Firebase architecture for:
- **Better scalability**: No server management required
- **Lower costs**: Pay only for what you use
- **Better reliability**: Firebase's global infrastructure
- **Real-time updates**: Firestore's real-time listeners
- **Simplified deployment**: No server to maintain

## If You Need This Code

If you're maintaining a **legacy deployment**, see `LEGACY_MIGRATION_GUIDE.md` for migration instructions.

⚠️ **Security Warning**: This deprecated backend may contain outdated dependencies and security vulnerabilities. It is **strongly recommended** to migrate to the Firebase-based architecture.

## For New Deployments

See the main `README.md` in the root directory for current deployment instructions.

## Architecture Comparison

### Old (Deprecated)
```
Client -> Express.js -> MongoDB
```

### New (Current)
```
Client -> Firebase Auth/Firestore
Client -> Cloudflare Workers -> KV/R2
```

## Questions?

For questions about migration or the new architecture, please see:
- `BACKEND_REPLACEMENT.md` - Migration guide
- `REALTIME_DATA_ARCHITECTURE.md` - New architecture documentation
- `FIREBASE_DATA_CONNECT_SUMMARY.md` - Firebase integration guide
