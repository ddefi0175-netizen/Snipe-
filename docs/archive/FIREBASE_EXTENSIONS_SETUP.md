# Firebase Setup & Extensions Configuration Guide

## Overview

This guide walks you through setting up Firebase with all necessary extensions, environment variables, and security configurations for the Snipe platform.

---

## ✅ Current Status

| Component | Status | Details |
|-----------|--------|---------|
| Firebase Project | ✅ Active | `YOUR_FIREBASE_PROJECT_ID` |
| Firestore Database | ✅ Ready | Collections configured |
| Authentication | ✅ Enabled | Email/Password method |
| Storage Bucket | ⚠️ Optional | For file uploads |
| Cloud Functions | ⚠️ Optional | For advanced features |
| Security Rules | ✅ Deployed | firestore.rules |
| Database Indexes | ✅ Deployed | firestore.indexes.json |

---

## 🔧 Step 1: Deploy Firebase Configuration

### Via CLI Script (Recommended)

```bash
cd /workspaces/Snipe-
./firebase-setup.sh
```

This script will:
- ✅ Verify Firebase CLI installation
- ✅ Deploy Firestore security rules
- ✅ Deploy Firestore indexes
- ✅ Create `.env.firebase` template
- ✅ Display setup summary

### Manual Deployment

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy everything
firebase deploy
```

---

## 🧩 Step 2: Install Firebase Extensions

Firebase Extensions are pre-built, production-ready solutions for common tasks.

### Recommended Extensions

#### 1. **Storage Resize Images** (Optional)
Automatically resize images when uploaded.

```bash
firebase ext:install firebase/storage-resize-images
```

**Configuration**:
- Input bucket: `gs://YOUR_FIREBASE_PROJECT_ID.appspot.com`
- Sizes: `200x200`, `500x500`, `1024x1024`
- Output format: WebP (for compression)

#### 2. **Delete User Data** (Recommended)
Auto-delete user data when account is deleted.

```bash
firebase ext:install firebase/delete-user-data
```

**Configuration**:
- Collections to delete: `users`, `trades`, `deposits`, `staking`
- User ID field: `uid`

#### 3. **Stripe Payments** (Optional - if processing payments)
Integration with Stripe for payment processing.

```bash
firebase ext:install firebase/stripe
```

#### 4. **Firestore Bulk Delete** (Optional)
Efficiently delete large datasets.

```bash
firebase ext:install firebase/firestore-bulk-delete
```

#### 5. **Send Email** (Optional - for notifications)
Send emails via Sendgrid or SMTP.

```bash
firebase ext:install firebase/send-email
```

---

## 🌍 Step 3: Configure Environment Variables

### In `Onchainweb/.env` (Frontend)

```env
# Firebase Credentials (Already Set)
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=42039c73d0dacb66d82c12faabf27c9b

# Admin Configuration
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

### In `.env.firebase` (Firebase Backend)

Created by setup script. Edit with your values:

```env
# Admin Settings
ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
MASTER_PASSWORD=ChangeMe123!@

# API Settings
API_TIMEOUT_MS=30000
MAX_RETRIES=3

# Email Settings (if using email extension)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Stripe (if using Stripe extension)
STRIPE_API_SECRET_KEY=sk_test_...

# Logging
LOG_LEVEL=info
ENABLE_DEBUG_LOGS=false
```

### In Firebase Console (Global Settings)

1. Go to https://console.firebase.google.com
2. Select project: `YOUR_FIREBASE_PROJECT_ID`
3. Go to **Project Settings** ⚙️
4. Set environment variables in **Functions** section

---

## 🔐 Step 4: Configure Firestore Security Rules

Security rules are already in `firestore.rules`. Key points:

```plaintext
✅ Users can only read/write their own data
✅ Admins can read/write based on permissions
✅ Activity logs are immutable (create-only)
✅ No public write access to any collection
```

To deploy:

```bash
firebase deploy --only firestore:rules
```

---

## 📊 Step 5: Configure Firestore Indexes

Indexes are already in `firestore.indexes.json`. They enable:

```plaintext
✅ Fast queries on multiple fields
✅ Pagination with sorting
✅ Real-time listeners performance
```

To deploy:

```bash
firebase deploy --only firestore:indexes
```

---

## 🔑 Step 6: Create Master Account

### Via Firebase Console

1. Go to https://console.firebase.google.com
2. Select `YOUR_FIREBASE_PROJECT_ID` project
3. Click **Authentication** → **Users**
4. Click **+ Create user**
5. Fill in:
   - **Email**: `master@gmail.com` (must match ALLOWLIST)
   - **Password**: Strong password (16+ characters recommended)
6. Click **Create user**

### Via Firebase Admin SDK

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

admin.auth().createUser({
  email: 'master@gmail.com',
  password: 'YourSecurePassword123!',
  displayName: 'Master Admin'
}).then(user => {
  console.log('Master created:', user.uid);
}).catch(error => {
  console.error('Error:', error);
});
```

---

## 🚀 Step 7: Enable Additional Firebase Services

### Cloud Storage (for file uploads)

```bash
# Add storage bucket
firebase storage:bucket add gs://YOUR_FIREBASE_PROJECT_ID.appspot.com

# Deploy storage rules
firebase deploy --only storage
```

### Cloud Functions (for backend logic)

```bash
# Create functions directory
mkdir -p functions

# Deploy functions
firebase deploy --only functions
```

### Hosting (for static site hosting)

```bash
# Deploy frontend to Firebase Hosting
firebase deploy --only hosting
```

---

## 📋 Step 8: Verify Everything

### Check Firestore Collections

```bash
firebase firestore:inspect
```

### Check Security Rules

```bash
firebase firestore:list-rules
```

### Check Deployed Extensions

```bash
firebase ext:list
```

### Check Functions

```bash
firebase functions:list
```

---

## 🧪 Step 9: Testing

### Test Firestore Connection

1. Start dev server:
```bash
cd Onchainweb
npm run dev
```

1. Open browser console (F12)

1. Check for Firebase logs:
```javascript
// Should see: "Firebase initialized successfully"
```

### Test Master Login

1. Visit: `http://localhost:5173/master-admin`
2. Username: `master` or `master@gmail.com`
3. Password: (password from Step 6)
4. Should see Master Admin Dashboard

### Test Real-Time Data

1. Login as master
2. Open browser console
3. Make changes to user data
4. Should see instant updates (no page refresh)

---

## 📈 Performance Optimization

### Firestore Optimization

- ✅ Indexes created for fast queries
- ✅ Composite indexes for multi-field queries
- ✅ TTL policies for automatic data cleanup

### Frontend Optimization

- ✅ Real-time listeners (not polling)
- ✅ Query pagination (max 100 results)
- ✅ localStorage fallback when offline

---

## 🔧 Maintenance

### Regular Tasks

| Task | Frequency | Command |
|------|-----------|---------|
| Backup Firestore | Weekly | `firebase firestore:export` |
| Review Security Rules | Monthly | `firebase firestore:list-rules` |
| Check Extension Logs | Daily | Firebase Console > Extensions |
| Monitor Functions | Daily | Firebase Console > Functions |

### Backup & Restore

```bash
# Backup
firebase firestore:export --backup-dir ./backups

# Restore
firebase firestore:import ./backups/[timestamp]
```

---

## 🐛 Troubleshooting

### Firebase Not Available

**Error**: "Firebase not available" in console

**Fix**:
- Check all 8 env vars are filled in `Onchainweb/.env`
- Restart dev server: `npm run dev`
- Check Firebase project is active

### Rules Deployment Failed

**Error**: "Ruleset update failed"

**Fix**:
- Validate rules: `firebase firestore:list-rules`
- Check syntax in `firestore.rules`
- Ensure no circular references

### Indexes Not Deploying

**Error**: "Index creation failed"

**Fix**:
- Check `firestore.indexes.json` format
- Ensure indexes don't duplicate existing ones
- Wait for index creation to complete (can take hours)

### Extensions Installation Error

**Error**: "Extension installation failed"

**Fix**:
- Ensure billing is enabled in Firebase Console
- Check all required permissions are granted
- Review extension requirements

---

## 📚 Related Documentation

- [FIREBASE_AUTO_PROVISIONING.md](../FIREBASE_AUTO_PROVISIONING.md) - Admin setup guide
- [QUICK_START_GUIDE.md](../QUICK_START_GUIDE.md) - Environment variables
- [ADMIN_USER_GUIDE.md](../ADMIN_USER_GUIDE.md) - Admin management
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Production deployment

---

## 🎯 Next Steps

1. ✅ Run `./firebase-setup.sh` to deploy configuration
2. ✅ Update `.env.firebase` with your values
3. ✅ Create master account in Firebase Console
4. ✅ Test master login at `/master-admin`
5. ✅ Create additional admin accounts
6. ✅ Deploy to production

---

## 💡 Best Practices

- ✅ Always backup Firestore before major changes
- ✅ Test security rules in development first
- ✅ Monitor function execution time and cost
- ✅ Use environment variables for sensitive data
- ✅ Enable audit logging for admin activities
- ✅ Regularly review and update security rules
- ✅ Keep Firebase SDK updated
- ✅ Monitor Firestore usage and costs

---

**Status**: ✅ **READY FOR DEPLOYMENT**

**Last Updated**: January 2026
**Version**: 2.0
