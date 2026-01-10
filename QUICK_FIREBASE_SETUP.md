# 🚀 Quick Firebase Credential Setup Guide

**Status**: Configuration incomplete - 7 items need real values

## ⚡ 5-Minute Setup (Fast Path)

### Step 1: Get Your Firebase Credentials (2 min)

Go to: https://console.firebase.google.com

1. **Select/Create Project**: `onchainweb-37d30` (or your project name)
2. **Go to**: Project Settings (gear icon) → Your apps → Web app
3. **Copy these 7 values**:
   ```
   API Key: AIza...
   Auth Domain: your-project.firebaseapp.com
   Project ID: onchainweb-37d30
   Storage Bucket: onchainweb-37d30.appspot.com
   Messaging Sender ID: 123456789
   App ID: 1:123456789:web:abc123def456
   Measurement ID: G-ABCD1234EF
   ```

### Step 2: Update Frontend .env (1 min)

**File**: `Onchainweb/.env`

Replace placeholder values:
```bash
VITE_FIREBASE_API_KEY=AIza... # Your actual API key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=onchainweb-37d30
VITE_FIREBASE_STORAGE_BUCKET=onchainweb-37d30.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCD1234EF
VITE_WALLET_CONNECT_ID=... # Keep your existing WalletConnect ID
```

### Step 3: Update Backend .env (1 min)

**File**: `backend/.env`

Replace with strong values:
```bash
# Generate a secure JWT secret (min 32 chars)
JWT_SECRET=your-secure-jwt-secret-min-32-characters-long-change-this

# Change admin credentials
MASTER_USERNAME=admin_snipe_2025
MASTER_PASSWORD=SuperSecurePasswordHere123!@#

# Firebase project ID
FIREBASE_PROJECT_ID=onchainweb-37d30
```

### Step 4: Validate (1 min)

```bash
# Run validator
./validate-config.sh

# Expected output: ✅ All configuration checks passed!
```

### Step 5: Start Servers (0 min)

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Expected: ✓ Server running on port 4000

# Terminal 2 - Frontend
cd Onchainweb
npm run dev
# Expected: ✓ VITE v5.4.21 running at http://localhost:5173
```

### Step 6: Test Connection (1 min)

**In Browser DevTools Console** (http://localhost:5173):
```javascript
// Should show your Firebase project ID (not "your-")
console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)
// Output: onchainweb-37d30
```

**In Terminal**:
```bash
# Test backend health
curl http://localhost:4000/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test Firebase auth
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

---

## 🎯 Common Issues

| Issue | Solution |
|-------|----------|
| "Firebase is not available" in console | Verify VITE_FIREBASE_API_KEY is not placeholder in .env |
| Port 4000 already in use | Kill process: `lsof -ti :4000 \| xargs kill` |
| Hot reload not working | Make sure `npm run dev` (not `npm start`) |
| Logo not showing | Already fixed with SVG fallback - no action needed |
| Wallet connection fails | Check WalletConnect ID in .env is valid |

---

## 📋 What You Just Unlocked

Once real credentials are added:
- ✅ Firebase authentication (sign up, login)
- ✅ Real-time Firestore database
- ✅ Wallet connection fully functional
- ✅ Admin controls operational
- ✅ Ready for production deployment

---

## 🔒 Security Notes

**Development** (.env):
- Can use test credentials
- Keep passwords moderately strong
- Don't commit .env to git (already in .gitignore)

**Production** (before deploying):
- Change JWT_SECRET to cryptographically strong value
- Use separate Firebase project credentials
- Change MASTER_USERNAME and MASTER_PASSWORD
- Enable Firestore security rules (already deployed)
- Use environment variables in deployment platform

---

## ✅ Verification Checklist

After completing setup, verify:

- [ ] Onchainweb/.env has no "YOUR_" placeholder strings
- [ ] backend/.env has no default values
- [ ] Both servers start without errors
- [ ] Browser shows no Firebase initialization errors
- [ ] Wallet connection button appears
- [ ] Logo displays with glow effect
- [ ] Curl health check returns {"status":"ok"}

---

## 🚀 Next Steps (After Verification)

Once all checks pass:

1. **Test the app**: Create account, connect wallet, explore trading UI
2. **Run test suite**: `cd Onchainweb && npm test` (9/9 tests should pass)
3. **Deploy to production**: See [DEPLOYMENT.md](DEPLOYMENT.md) or [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)

---

**Need help?**
- Detailed guide: [FIREBASE_DATABASE_SETUP.md](FIREBASE_DATABASE_SETUP.md)
- Test Firebase: [test-firebase-realtime.sh](test-firebase-realtime.sh)
- Full deployment: [DEPLOYMENT.md](DEPLOYMENT.md)
