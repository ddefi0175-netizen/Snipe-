# Quick Start Guide - Firebase Version

Get up and running with Snipe in under 10 minutes!

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Google account (for Firebase)

## Step 1: Clone the Repository (1 minute)

```bash
git clone https://github.com/ddefi0175-netizen/Snipe-.git
cd Snipe-
```

## Step 2: Create Firebase Project (3 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it (e.g., "snipe-trading")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

## Step 3: Enable Firestore (1 minute)

1. In Firebase Console, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose a location (closest to your users)
5. Click **"Enable"**

## Step 4: Enable Authentication (1 minute)

1. Click **"Authentication"** in sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Enable it and click **"Save"**

## Step 5: Get Firebase Configuration (1 minute)

1. Click the ⚙️ gear icon > **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the web icon `</>`
4. Register app (name: "Snipe Web")
5. Copy the `firebaseConfig` object

## Step 6: Configure Environment (2 minutes)

```bash
cd Onchainweb
cp .env.example .env
```

Edit `.env` and paste your Firebase config:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123

# WalletConnect (Get free ID from https://cloud.walletconnect.com)
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

## Step 7: Deploy Firebase Rules (1 minute)

```bash
# Go back to root directory
cd ..

# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase use --add
# Select your project and give it an alias (e.g., "default")

# Deploy security rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

## Step 8: Install and Run (2 minutes)

```bash
# Go to frontend directory
cd Onchainweb

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser! 🎉

## Step 9: Create Master Admin (Optional - 2 minutes)

### Option A: Using Firebase Console

1. Go to **Authentication** in Firebase Console
2. Click **"Add user"**
3. Enter email: `admin@yourdomain.com`
4. Enter a strong password
5. Click **"Add user"** and copy the User UID

6. Go to **Firestore Database**
7. Click **"Start collection"** > Enter `admins`
8. Document ID: Paste the User UID
9. Add these fields:
   - `email`: (string) `admin@yourdomain.com`
   - `username`: (string) `master`
   - `role`: (string) `master`
   - `createdAt`: (timestamp) Click "SET TO SERVER TIMESTAMP"
10. Add a nested object field `permissions`:
    ```
    permissions (map):
      - manageUsers: true
      - manageBalances: true
      - manageKYC: true
      - manageTrades: true
      - viewReports: true
      - createAdmins: true
      (... set all to true for master)
    ```

### Option B: Using Import Script

Create a file `create-admin.js`:

```javascript
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Download service account key from Firebase Console
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function createMasterAdmin() {
  // Create user in Authentication
  const user = await auth.createUser({
    email: 'admin@yourdomain.com',
    password: 'YourSecurePassword123!',
    emailVerified: true
  });

  // Create admin document in Firestore
  await db.collection('admins').doc(user.uid).set({
    email: 'admin@yourdomain.com',
    username: 'master',
    role: 'master',
    permissions: {
      manageUsers: true,
      manageBalances: true,
      manageKYC: true,
      manageTrades: true,
      viewReports: true,
      manageStaking: true,
      manageAIArbitrage: true,
      manageDeposits: true,
      manageWithdrawals: true,
      customerService: true,
      viewLogs: true,
      siteSettings: true,
      createAdmins: true
    },
    userAccessMode: 'all',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('Master admin created:', user.uid);
}

createMasterAdmin().catch(console.error);
```

Run it:
```bash
node create-admin.js
```

## You're All Set! 🚀

### Test Your Setup

1. **Public Access**: Visit http://localhost:5173
   - Connect wallet
   - Explore features

2. **Admin Access**: Visit http://localhost:5173/master-admin
   - Login with admin credentials
   - Test admin features

## Next Steps

### For Development
- Read [Source Structure Guide](Onchainweb/src/README.md)
- Explore [Firebase Setup Guide](FIREBASE_SETUP.md)
- Check [Migration Guide](MIGRATION_GUIDE_FIREBASE.md)

### For Production
1. Build: `npm run build`
2. Deploy to Firebase:
   ```bash
   cd ..
   firebase deploy --only hosting
   ```
   OR deploy to Vercel:
   ```bash
   cd Onchainweb
   vercel --prod
   ```

## Troubleshooting

### "Firebase not available" warning
- Check `.env` file has all required variables
- Restart dev server after changing `.env`

### "Permission denied" errors
- Ensure Firestore rules are deployed
- Check user is authenticated
- Verify admin document exists in Firestore

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and reinstall if issues persist

## Need Help?

- 📖 [Full Documentation](README.md)
- 🔥 [Firebase Setup Guide](FIREBASE_SETUP.md)
- 🐛 [Report Issues](https://github.com/ddefi0175-netizen/Snipe/issues)

## What's Different from MongoDB Version?

- ✅ No backend server to run
- ✅ Real-time updates built-in
- ✅ Simpler deployment
- ✅ Better scalability
- ✅ Lower costs

See [Firebase Migration Summary](FIREBASE_MIGRATION_SUMMARY.md) for details.

---

**Estimated Time**: 10 minutes  
**Difficulty**: Easy  
**Support**: [GitHub Issues](https://github.com/ddefi0175-netizen/Snipe/issues)
