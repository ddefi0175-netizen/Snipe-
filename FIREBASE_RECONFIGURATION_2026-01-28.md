# Firebase Project Reconfiguration - January 28, 2026

## Overview

This document describes the Firebase project migration from `onchainweb-37d30` to `onchainweb-b4b36`.

## Changes Made

### 1. Firebase Project Configuration Updated

**Old Project**: `onchainweb-37d30`  
**New Project**: `onchainweb-b4b36`

#### New Firebase Web SDK Configuration:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA1fSnlpADLpeDFrbRxdIcgQlccqudpsWU",
  authDomain: "onchainweb-b4b36.firebaseapp.com",
  databaseURL: "https://onchainweb-b4b36-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "onchainweb-b4b36",
  storageBucket: "onchainweb-b4b36.firebasestorage.app",
  messagingSenderId: "635972146777",
  appId: "1:635972146777:web:70807929d2f014c0160348",
  measurementId: "G-NVT9RVZW06"
};
```

### 2. Files Updated

#### Configuration Files:
- ✅ `.firebaserc` - Updated default project to `onchainweb-b4b36`

#### Environment Configuration:
All Firebase configuration now comes from environment variables in `Onchainweb/.env`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyA1fSnlpADLpeDFrbRxdIcgQlccqudpsWU
VITE_FIREBASE_AUTH_DOMAIN=onchainweb-b4b36.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://onchainweb-b4b36-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=onchainweb-b4b36
VITE_FIREBASE_STORAGE_BUCKET=onchainweb-b4b36.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=635972146777
VITE_FIREBASE_APP_ID=1:635972146777:web:70807929d2f014c0160348
VITE_FIREBASE_MEASUREMENT_ID=G-NVT9RVZW06
```

### 3. Service Account Key Security

⚠️ **CRITICAL**: A Firebase Service Account private key was accidentally shared. This key has been documented for immediate revocation.

**Action Required**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project `onchainweb-b4b36`
3. Navigate to **Project Settings** → **Service Accounts**
4. Find and delete the key with ID: `79be340424b59131436919c6f1a1ce5caa2cdaa2`
5. Generate a new service account key if needed for backend operations
6. **Never commit service account keys to git**

### 4. Service Account vs Web SDK Clarification

**Service Account Key** (Backend/Admin - ❌ Never commit to git):
- Used for Firebase Admin SDK
- Has full administrative access
- Must be kept secret
- Used only in secure backend environments
- File format: JSON with `private_key` field

**Web SDK Configuration** (Frontend - ✅ Safe to use publicly):
- Used for client-side Firebase SDK
- Safe to use in frontend code
- Can be committed to git in documentation
- File format: JavaScript object with `apiKey`, `authDomain`, etc.

### 5. Documentation Updates Needed

The following documentation files still reference the old project `onchainweb-37d30` and should be updated:

- Documentation files in `docs/` (to be updated in production deployment)
- Test files in `Onchainweb/` (test-firebase.html, firebase-debug.html)
- Setup scripts (setup-firebase-credentials.sh, setup-credentials-quick.sh)
- Verification scripts (verify-admin-accounts.js)

**Note**: These files were already sanitized in the previous security fixes to use placeholders. They just need the project name updated from `onchainweb-37d30` to `onchainweb-b4b36` when setting up for production use.

---

## Setup Instructions for New Firebase Project

### 1. Initial Setup

1. **Firebase Console Configuration**:
   - Project is already created: `onchainweb-b4b36`
   - Web app is configured with App ID: `1:635972146777:web:70807929d2f014c0160348`

2. **Enable Required Services**:
   ```bash
   # In Firebase Console, enable:
   - Authentication (Email/Password provider)
   - Firestore Database
   - Realtime Database
   - Cloud Functions
   - Cloud Storage
   ```

3. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only database
   ```

4. **Deploy Indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### 2. Local Development Setup

1. **Update Environment Variables**:
   ```bash
   cd Onchainweb
   cp .env.example .env
   ```

2. **Edit `.env` with new Firebase configuration**:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyA1fSnlpADLpeDFrbRxdIcgQlccqudpsWU
   VITE_FIREBASE_AUTH_DOMAIN=onchainweb-b4b36.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://onchainweb-b4b36-default-rtdb.asia-southeast1.firebasedatabase.app
   VITE_FIREBASE_PROJECT_ID=onchainweb-b4b36
   VITE_FIREBASE_STORAGE_BUCKET=onchainweb-b4b36.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=635972146777
   VITE_FIREBASE_APP_ID=1:635972146777:web:70807929d2f014c0160348
   VITE_FIREBASE_MEASUREMENT_ID=G-NVT9RVZW06
   ```

3. **Install and Run**:
   ```bash
   npm install
   npm run dev
   ```

### 3. Deploy Functions

If using Cloud Functions:
```bash
cd functions
npm install
firebase deploy --only functions
```

---

## Migration Checklist

### Configuration:
- [x] Update `.firebaserc` with new project ID
- [ ] Update `.env` files with new credentials
- [ ] Revoke exposed service account key
- [ ] Generate new service account key (if needed for backend)

### Firebase Console:
- [ ] Enable Authentication (Email/Password)
- [ ] Create Firestore Database
- [ ] Create Realtime Database
- [ ] Deploy security rules
- [ ] Deploy indexes
- [ ] Set up Cloud Functions (if needed)

### Application:
- [ ] Update all environment variables in deployment platforms
- [ ] Test authentication flow
- [ ] Verify Firestore reads/writes
- [ ] Test real-time listeners
- [ ] Verify admin access

### Documentation:
- [ ] Update any remaining references to old project
- [ ] Update setup guides with new project name
- [ ] Document new Firebase configuration

---

## Security Notes

### ✅ Safe to Commit:
- Web SDK configuration (apiKey, authDomain, projectId, etc.)
- Firebase project ID
- App ID and measurement ID

### ❌ Never Commit:
- Service account private keys
- `.env` files with real credentials
- Database passwords
- OAuth client secrets

### Best Practices:
1. Always use environment variables for configuration
2. Keep `.env` files in `.gitignore`
3. Use separate projects for development, staging, and production
4. Rotate credentials regularly
5. Monitor authentication logs for suspicious activity

---

## Verification Steps

1. **Test Firebase Connection**:
   ```bash
   cd Onchainweb
   npm run dev
   # Check browser console for "Firebase initialized successfully"
   ```

2. **Test Authentication**:
   - Create a test user in Firebase Console
   - Attempt login through the app
   - Verify user data appears in Firestore

3. **Test Real-time Updates**:
   - Open admin dashboard
   - Make changes in Firestore Console
   - Verify updates appear in real-time

---

## Summary

- ✅ Firebase project updated to `onchainweb-b4b36`
- ✅ `.firebaserc` configuration file updated
- ⚠️  Service account key exposed and needs to be revoked
- 📋 Environment variables documented for setup
- 📋 Security best practices documented

**Next Steps**:
1. Revoke the exposed service account key immediately
2. Update `.env` file with new Firebase configuration
3. Test the application with new project
4. Deploy security rules and indexes
5. Update deployment platform environment variables

---

**Date**: January 28, 2026  
**Author**: GitHub Copilot Workspace Agent  
**Status**: 🔄 Configuration Updated, Awaiting Setup Completion