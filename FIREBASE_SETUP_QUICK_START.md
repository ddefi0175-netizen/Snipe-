# 🔥 Firebase Setup Guide for Snipe Platform

## Quick Start (5 minutes)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** (or use existing project)
3. Project Name: `snipe` or similar
4. Analytics: Optional (disable if not needed)
5. Click **"Create project"**

### Step 2: Register Web App
1. In Firebase Console, click the **`</>`** (Web) icon
2. App nickname: `snipe-web` or similar
3. Check "Also set up Firebase Hosting for this app" (optional)
4. Click **"Register app"**

### Step 3: Get Firebase Credentials
After registration, you'll see a config like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
  measurementId: "G-XXXXXXXXXX"
};
```

### Step 4: Update .env File
Copy each value to `Onchainweb/.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 5: Enable Firestore
1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose: **Start in test mode** (for development)
4. Select region: `us-central1` (or closest to you)
5. Click **"Create"**

### Step 6: Enable Authentication
1. Go to **Authentication** in Firebase Console
2. Click **"Get started"**
3. Enable these sign-in methods:
   - ✅ **Email/Password**
   - ✅ **Anonymous** (for testing)
4. Click **"Save"**

### Step 7: Set Up Firestore Rules
1. Go to **Firestore Database** → **Rules** tab
2. Replace default rules with security rules from `firestore.rules`
3. Click **"Publish"**

### Step 8: Update `.firebaserc`
Replace the placeholder in `.firebaserc`:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

---

## Testing Firebase Connection

### Test Backend
```bash
cd backend
npm run dev
# Should see: ✓ MongoDB connected successfully (or skipped if using Firebase only)
```

### Test Frontend
```bash
cd Onchainweb
npm run dev
# Should see: Firebase initialized successfully
# Check browser console for any errors
```

---

## Firestore Collection Structure

After authentication works, Firebase will auto-create collections:

```
firestore/
├── users/
│   └── {userId}
│       ├── email: string
│       ├── wallet: string
│       ├── balance: number
│       └── ...
├── trades/
│   └── {tradeId}
│       ├── userId: string
│       ├── amount: number
│       └── ...
├── admins/
│   └── {adminId}
│       ├── email: string
│       ├── role: 'admin' | 'master'
│       └── ...
└── chatMessages/
    └── {messageId}
        ├── userId: string
        ├── message: string
        └── timestamp: serverTimestamp
```

---

## Security Rules Checklist

Before going to production:

- [ ] Reviewed `firestore.rules` for proper access control
- [ ] Users can only read/write their own data
- [ ] Admins can read all user data
- [ ] Master can manage everything
- [ ] Authentication checks are in place
- [ ] Tested rules in **production mode** (not test mode)
- [ ] Set up proper indexes for queries
- [ ] Enabled audit logging

---

## Troubleshooting

### "Firebase not initialized"
- ✓ Check `VITE_FIREBASE_API_KEY` is set in `.env`
- ✓ Verify all 7 Firebase credentials are filled in (not empty)
- ✓ Restart dev server: `npm run dev`

### "Permission denied" errors
- ✓ Check Firestore rules allow the operation
- ✓ Make sure user is authenticated (check browser console)
- ✓ Verify collection/document paths match rules

### "Anonymous auth failed"
- ✓ Go to Firebase Console → Authentication → Sign-in method
- ✓ Make sure "Anonymous" is enabled

### Firestore queries slow
- ✓ Check indexes are deployed (`firebase deploy --only firestore:indexes`)
- ✓ Use proper query optimization (filters, ordering, limits)

---

## Production Checklist

Before deploying to production:

- [ ] Change Firestore from **test mode** to **production mode**
- [ ] Review and test security rules thoroughly
- [ ] Deploy proper indexes
- [ ] Set up authentication providers (Google, MetaMask, etc.)
- [ ] Configure CORS properly
- [ ] Enable monitoring/logging
- [ ] Set up backups
- [ ] Test all features end-to-end
- [ ] Security audit completed

---

## Useful Firebase CLI Commands

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set default project
firebase use --add

# Deploy everything
firebase deploy

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only indexes
firebase deploy --only firestore:indexes

# View logs
firebase functions:log

# Emulate locally
firebase emulators:start
```

---

## Next Steps

1. ✅ Complete Firebase setup above
2. ✅ Update `.env` file with credentials
3. ✅ Test Firebase connection (`npm run dev`)
4. ✅ Set up backend `.env` with JWT_SECRET, MASTER credentials
5. ✅ Test authentication flow
6. ✅ Test wallet connection
7. ✅ Test chat and notifications

---

**For more info**: [Firebase Documentation](https://firebase.google.com/docs)
