# ⚠️ DEPRECATED - MongoDB Backend

## Status: DEPRECATED ❌

**This backend is deprecated and should NOT be used for new deployments.**

## What Happened?

The Snipe trading platform has migrated from MongoDB + Express.js backend to Firebase (Firestore + Authentication). This folder contains the old backend code which is kept for reference only.

## Why Was It Replaced?

The MongoDB + Express.js backend had several issues:

1. **Cold Starts**: 30-60 second delays on free-tier hosting (Render.com)
2. **Maintenance Overhead**: Required managing server infrastructure
3. **Scaling Issues**: Manual capacity planning required
4. **Cost**: Fixed server costs even with low traffic
5. **Polling Delays**: 3-second polling for "real-time" updates
6. **Two-Tier Deployment**: Separate backend and frontend deployments

## New Backend: Firebase

The platform now uses **Firebase** which provides:

✅ **No Cold Starts**: Instant response times  
✅ **Serverless**: No server to maintain  
✅ **Real-Time**: WebSocket listeners instead of polling  
✅ **Auto-Scaling**: Automatic capacity management  
✅ **Lower Costs**: Pay-per-use pricing  
✅ **Single Deployment**: Frontend-only deployment  

## Migration Guide

If you have an existing deployment using this MongoDB backend:

1. **Read the Migration Guide**: [BACKEND_REPLACEMENT.md](../BACKEND_REPLACEMENT.md)
2. **Follow Firebase Setup**: [FIREBASE_SETUP.md](../FIREBASE_SETUP.md)
3. **Quick Start**: [QUICK_START_FIREBASE.md](../QUICK_START_FIREBASE.md)

## For New Deployments

**DO NOT USE THIS BACKEND**

Instead:
1. Follow [FIREBASE_SETUP.md](../FIREBASE_SETUP.md)
2. Configure Firebase in your environment
3. Deploy frontend only

## Files in This Folder

This folder is kept for:
- Historical reference
- Data migration tools
- Backward compatibility testing

**Do not deploy these files to production.**

## What to Use Instead

### Old Way (Deprecated)
```javascript
// Using REST API
import { userAPI } from '../lib/api.js';
const users = await userAPI.getUsers();
```

### New Way (Recommended)
```javascript
// Using Firebase
import { subscribeToUsers } from '../services';
const unsubscribe = subscribeToUsers((users) => {
  setUsers(users); // Real-time updates
});
```

## Architecture Comparison

| Aspect | Old (MongoDB) | New (Firebase) |
|--------|--------------|----------------|
| Server | Express.js on Render | Serverless |
| Database | MongoDB Atlas | Firestore |
| Auth | JWT tokens | Firebase Auth |
| Real-time | Polling (3s) | WebSocket |
| Deployment | 2-tier | 1-tier |
| Cold Starts | 30-60s | None |
| Cost/month | $7-24 | $0-5 |

## Support

For help migrating:
- [Backend Replacement Guide](../BACKEND_REPLACEMENT.md)
- [GitHub Issues](https://github.com/ddefi0175-netizen/Snipe/issues)

## Removal Timeline

This folder will be:
- **v2.x**: Kept for reference (deprecated)
- **v3.0**: Removed from repository

---

**Last Updated**: January 2026  
**Status**: ⚠️ DEPRECATED - DO NOT USE  
**Alternative**: Use Firebase (see [BACKEND_REPLACEMENT.md](../BACKEND_REPLACEMENT.md))
