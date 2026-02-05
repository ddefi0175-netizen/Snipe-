# Firebase Project Activation Guide

## 🎯 Current Status

**Firebase Project**: `onchainweb-37d30` (766146811888)
**Configuration**: ✅ Complete
**Build Status**: ✅ Working (8.46s)
**API Access**: ⚠️ Suspended (needs activation)

## ✅ What's Already Done

1. **Environment Configuration**
   - Created `Onchainweb/.env` with all Firebase credentials
   - Updated `.firebaserc` with project ID
   - Build tested and succeeds

2. **Firebase Credentials Set**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyA56Pq_WcE6TehQDayLTZ0ibCHCwZkUUlw
   VITE_FIREBASE_AUTH_DOMAIN=onchainweb-37d30.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://onchainweb-37d30-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=onchainweb-37d30
   VITE_FIREBASE_STORAGE_BUCKET=onchainweb-37d30.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=766146811888
   VITE_FIREBASE_APP_ID=1:766146811888:web:883839b4a6987b0108ef35
   VITE_FIREBASE_MEASUREMENT_ID=G-2XBP804Q8Z
   ```

3. **Admin Configuration**
   - Admin panel enabled: `VITE_ENABLE_ADMIN=true`
   - Allowlist set: `master@gmail.com, admin@gmail.com`

## 🔧 How to Activate Firebase Project

### Step 1: Enable Billing (Required for Firestore API)

1. Go to [Firebase Console](https://console.firebase.google.com/project/onchainweb-37d30/overview)
2. Click **Settings** ⚙️ → **Usage and billing**
3. Click **Modify plan** or **Set up billing**
4. Choose **Blaze Plan (Pay as you go)**
   - Set a budget limit (e.g., $10/month) to avoid charges
   - First $0.15/GB storage is free
   - Most small apps stay in free tier
5. Add a payment method
6. Confirm upgrade

### Step 2: Enable Required APIs

After billing is enabled, enable these APIs:

1. **Cloud Firestore API**
   ```
   https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=onchainweb-37d30
   ```
   - Click **ENABLE**

2. **Firebase Management API**
   ```
   https://console.cloud.google.com/apis/library/firebase.googleapis.com?project=onchainweb-37d30
   ```
   - Click **ENABLE**

3. **Identity Toolkit API** (for Authentication)
   ```
   https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=onchainweb-37d30
   ```
   - Click **ENABLE**

### Step 3: Initialize Firestore Database

1. Go to [Firestore Database](https://console.firebase.google.com/project/onchainweb-37d30/firestore)
2. Click **Create database**
3. Select **Production mode**
4. Choose **Cloud Firestore location**: `us-central1` (or your preferred region)
5. Click **Enable**

### Step 4: Enable Authentication

1. Go to [Authentication](https://console.firebase.google.com/project/onchainweb-37d30/authentication/users)
2. Click **Get started**
3. Enable **Email/Password** provider:
   - Sign-in method → Email/Password
   - Toggle **Enable**
   - Save

### Step 5: Create Admin Users

After Authentication is enabled:

1. Go to **Users** tab
2. Click **Add user**
3. Create Master Admin:
   - Email: `master@gmail.com`
   - Password: (Strong password - save this!)
   - Click **Add user**
4. Create Regular Admin:
   - Email: `admin@gmail.com`
   - Password: (Strong password - save this!)
   - Click **Add user**

### Step 6: Deploy Firestore Rules & Indexes

Once everything is enabled:

```bash
cd /workspaces/Snipe-
firebase deploy --only firestore:rules,firestore:indexes
```

Expected output:
```
✔ Deploy complete!
✔ firestore: released rules firestore.rules to (default)
✔ firestore: deployed indexes in firestore.indexes.json successfully
```

## ✅ Verify Setup

### Test Firebase Connection
```bash
cd Onchainweb
npm run dev
```
Open http://localhost:5173 and check browser console - should see:
```
Firebase initialized successfully
```

### Test Admin Login
1. Go to http://localhost:5173/master-admin
2. Login with `master@gmail.com` + your password
3. Should see admin dashboard

### Test Firebase in Console
```bash
firebase firestore:get users --limit 5
```
Should return data or empty array (not "permission denied")

## 🚨 Common Issues & Solutions

### Issue: "Payment method required"
**Solution**: Go to Google Cloud Console → Billing → Add payment method

### Issue: "APIs not enabled"
**Solution**: Enable Cloud Firestore API, Firebase Management API, Identity Toolkit API

### Issue: "Region not selected"
**Solution**: Firestore → Create database → Select region → Enable

### Issue: "Still suspended after enabling billing"
**Solution**: Wait 10-15 minutes for changes to propagate, then try again

### Issue: "Email verification required"
**Solution**: Check your Google account email → Verify email address

## 📊 Firebase Free Tier Limits

Even with Blaze plan, you get these free quotas:
- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- **Authentication**: Unlimited users
- **Functions**: 2M invocations/month
- **Hosting**: 10 GB storage, 360 MB/day transfer

Most small/medium apps never exceed these limits!

## 🎉 After Activation

Once Firebase is fully activated, you can:

1. **Deploy Firestore Configuration**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

2. **Install Firebase Extensions** (Optional)
   ```bash
   firebase ext:install
   ```
   Recommended extensions:
   - Trigger Email (email notifications)
   - Delete User Data (GDPR compliance)
   - Resize Images (image optimization)

3. **Deploy to Production**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
   Or deploy to Vercel:
   ```bash
   vercel --prod
   ```

## 📞 Need Help?

- **Firebase Support**: https://firebase.google.com/support
- **Billing Issues**: https://console.cloud.google.com/billing
- **Community**: https://firebase.google.com/community

---

**Last Updated**: February 4, 2026
**Status**: Configuration complete, awaiting activation
**Next**: Enable billing → Enable APIs → Deploy Firestore
