# ⚠️ DEPRECATED - DO NOT USE

This backend code is **DEPRECATED** and should **NOT** be used for any deployments.

## ⚠️ CRITICAL WARNING

**This code is kept for historical reference only. Do not use it in production or development.**

## Why is this deprecated?

The platform has migrated from MongoDB/Express backend to **Firebase** (serverless architecture) for the following reasons:

- ✅ **Better reliability** - Firebase's 99.95% SLA vs. self-hosted server maintenance
- ✅ **Lower cost** - Serverless pricing model, no idle server costs
- ✅ **Real-time capabilities** - Native real-time database synchronization
- ✅ **Better security** - Built-in authentication and security rules
- ✅ **Scalability** - Automatic scaling without infrastructure management
- ✅ **Global CDN** - Fast content delivery worldwide

## What should I use instead?

Use **Firebase services** instead:

| Old Backend Component | New Firebase Service | Migration Guide |
|----------------------|---------------------|----------------|
| MongoDB | Cloud Firestore | [BACKEND_REPLACEMENT.md](../../docs/BACKEND_REPLACEMENT.md) |
| Express REST API | Firebase Functions + REST API | [FIREBASE_FUNCTIONS_VERIFICATION.md](../../FIREBASE_FUNCTIONS_VERIFICATION.md) |
| JWT Authentication | Firebase Auth | See Firebase Auth docs |
| File Storage | Cloud Storage | [DEPLOYMENT_CHECKLIST.md](../../DEPLOYMENT_CHECKLIST.md) |
| Server Hosting | Firebase Hosting / Vercel | [DEPLOYMENT_EXECUTION_GUIDE.md](../../DEPLOYMENT_EXECUTION_GUIDE.md) |

### Migration Guide

See `/docs/BACKEND_REPLACEMENT.md` for complete migration instructions.

## Can I delete this?

**NO** - This directory is kept for:

1. **Reference during migration** - Historical code for comparison
2. **Backward compatibility testing** - Verify no dependencies remain
3. **Historical documentation** - Understanding old architecture
4. **Audit trail** - Complete project history

## For New Development

If you're starting fresh or adding new features, **completely ignore this directory** and use:

1. **Frontend**: `/Onchainweb` - React + Vite + Firebase SDK
2. **Backend**: Firebase services (Firestore, Auth, Functions, Storage)
3. **Serverless API**: `/workers` - Cloudflare Workers (optional)

See the main [README.md](../../README.md) for current architecture and setup instructions.

---

**Last Updated**: February 2026  
**Status**: DEPRECATED - DO NOT USE  
**Alternative**: Firebase + Cloudflare Workers  
**Support**: None - Use Firebase services instead
