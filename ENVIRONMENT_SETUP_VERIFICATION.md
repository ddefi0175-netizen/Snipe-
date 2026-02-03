# 🔧 Environment Setup Verification Guide

**Last Updated:** February 3, 2026  
**Purpose:** Step-by-step guide to verify and setup the Snipe environment

---

## ⚡ Quick Status Check

Run this command to check current environment status:

```bash
cd /home/runner/work/Snipe-/Snipe-

echo "=== Environment Setup Status ==="
echo ""
echo "1. Node.js Version:"
node --version
echo ""
echo "2. npm Version:"
npm --version
echo ""
echo "3. Root .env file:"
test -f .env && echo "✅ EXISTS" || echo "❌ MISSING"
echo ""
echo "4. Frontend .env file:"
test -f Onchainweb/.env && echo "✅ EXISTS" || echo "❌ MISSING"
echo ""
echo "5. Frontend node_modules:"
test -d Onchainweb/node_modules && echo "✅ INSTALLED" || echo "❌ MISSING"
echo ""
echo "6. Frontend build output:"
test -d Onchainweb/dist && echo "✅ EXISTS" || echo "❌ NOT BUILT"
echo ""
```

---

## 🎯 Complete Setup Checklist

### Phase 1: Prerequisites ✅

#### 1.1 System Requirements
- [ ] **Node.js 20.x or higher**
  ```bash
  node --version
  # Expected: v20.20.0 or higher
  ```

- [ ] **npm 10.x or higher**
  ```bash
  npm --version
  # Expected: 10.8.2 or higher
  ```

- [ ] **Git installed**
  ```bash
  git --version
  ```

- [ ] **Repository cloned**
  ```bash
  cd /home/runner/work/Snipe-/Snipe-
  pwd
  # Expected: /home/runner/work/Snipe-/Snipe-
  ```

**Status:** ✅ All prerequisites met (verified during audit)

---

### Phase 2: Environment Configuration ⚠️

#### 2.1 Create Environment File

**Location:** `Onchainweb/.env`  
**Template:** `.env.example`

```bash
cd /home/runner/work/Snipe-/Snipe-
cp .env.example Onchainweb/.env
```

#### 2.2 Configure Firebase Credentials

**Where to get credentials:**
1. Go to: https://console.firebase.google.com
2. Select project: **onchainweb-b4b36** (or create new)
3. Navigate: **Project Settings** → **General** → **Your apps**
4. Click: **SDK setup and configuration**
5. Copy all values

**Edit `Onchainweb/.env` and fill in:**

```bash
# REQUIRED - Firebase Configuration
VITE_FIREBASE_API_KEY="AIza..."                    # Get from Firebase Console
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"
VITE_FIREBASE_DATABASE_URL="https://your-project.firebasedatabase.app"
```

**Verification:**
```bash
# Check if all required Firebase variables are set
grep "VITE_FIREBASE" Onchainweb/.env | grep -v "^#" | grep -v "your-"
# Should show 8 configured lines (no "your-" placeholders)
```

#### 2.3 Configure WalletConnect Project ID

**Where to get:**
1. Go to: https://cloud.walletconnect.com
2. Create account or login
3. Create new project
4. Copy Project ID

**Edit `Onchainweb/.env` and add:**

```bash
# REQUIRED - WalletConnect
VITE_WALLETCONNECT_PROJECT_ID="1234567890abcdef"   # Get from WalletConnect Cloud
```

**Verification:**
```bash
grep "VITE_WALLETCONNECT_PROJECT_ID" Onchainweb/.env | grep -v "^#"
# Should show configured value (not "your-walletconnect-project-id")
```

#### 2.4 Optional Configuration

**Admin System (Optional but Recommended):**
```bash
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin
VITE_ADMIN_ALLOWLIST=master@onchainweb.site,admin@example.com
```

**Telegram Integration (Optional):**
```bash
VITE_TELEGRAM_BOT_TOKEN=your-bot-token
VITE_TELEGRAM_CHAT_ID=your-chat-id
```

**Cloudflare TURN Server (Optional):**
```bash
VITE_CLOUDFLARE_TURN_SERVER_NAME=your-server-name
VITE_CLOUDFLARE_TURN_TOKEN_ID=your-token-id
VITE_CLOUDFLARE_TURN_API_TOKEN=your-api-token
```

---

### Phase 3: Install Dependencies ✅

#### 3.1 Install Frontend Dependencies

```bash
cd /home/runner/work/Snipe-/Snipe-/Onchainweb
npm install
```

**Expected Output:**
```
added 362 packages in 13s
5 moderate severity vulnerabilities (dev-only, safe to ignore)
```

**Verification:**
```bash
# Check if node_modules exists
test -d node_modules && echo "✅ Dependencies installed" || echo "❌ Install failed"

# Check package count
ls node_modules | wc -l
# Expected: ~362 packages
```

**Status:** ✅ Completed during audit

---

### Phase 4: Build Verification ✅

#### 4.1 Run Production Build

```bash
cd /home/runner/work/Snipe-/Snipe-/Onchainweb
npm run build
```

**Expected Output:**
```
vite v5.4.21 building for production...
✓ 410 modules transformed.
✓ built in 5.08s

dist/
├── index.html (2.44 kB)
├── assets/
│   ├── css/index-*.css (168.51 kB)
│   └── js/
│       ├── vendor-react-*.js (140.61 kB)
│       ├── firebase-*.js (475.43 kB)
│       ├── wallet-*.js (487.78 kB)
│       ├── index-*.js (408.90 kB)
│       └── ... (other chunks)
```

**Verification:**
```bash
# Check if dist directory was created
test -d dist && echo "✅ Build successful" || echo "❌ Build failed"

# Check build output size
du -sh dist/
# Expected: ~2.0M uncompressed
```

**Status:** ✅ Build successful (5.08 seconds)

---

### Phase 5: Development Server ⚠️

#### 5.1 Start Dev Server

```bash
cd /home/runner/work/Snipe-/Snipe-/Onchainweb
npm run dev
```

**Expected Output:**
```
VITE v5.4.21  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

#### 5.2 Verify in Browser

**Open:** http://localhost:5173

**Check Console for:**
```
✅ Firebase initialized successfully
✅ App loaded without errors
✅ No red error messages
```

**Visual Verification:**
- [ ] Page loads without errors
- [ ] Wallet connection button visible
- [ ] Navigation menu appears
- [ ] No layout issues
- [ ] Console shows Firebase success message

**Common Console Messages (Expected):**
```
Firebase initialized successfully
isFirebaseAvailable: true
```

#### 5.3 Test Key Features

1. **Wallet Connection:**
   - [ ] Click "Connect Wallet" button
   - [ ] Wallet provider options appear
   - [ ] Can select a wallet provider

2. **Navigation:**
   - [ ] Can navigate between pages
   - [ ] URLs change correctly
   - [ ] No 404 errors

3. **Admin Routes (if configured):**
   - [ ] `/admin` route accessible
   - [ ] `/master-admin` route accessible
   - [ ] Login prompt appears

---

### Phase 6: Firebase Deployment (Optional but Recommended)

#### 6.1 Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

#### 6.2 Login to Firebase

```bash
firebase login

# Expected: Browser opens for authentication
# Click "Allow" to authorize
```

#### 6.3 Select Project

```bash
cd /home/runner/work/Snipe-/Snipe-
firebase use onchainweb-b4b36

# Or create new project
# firebase projects:create
```

#### 6.4 Deploy Firestore Rules

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Expected output:
# ✔ Deploy complete!
```

**Verification:**
```bash
firebase firestore:rules:list
# Should show deployed rules
```

#### 6.5 Deploy Firestore Indexes

```bash
# Deploy database indexes
firebase deploy --only firestore:indexes

# Expected output:
# ✔ Deploy complete!
```

---

## 🔍 Troubleshooting Guide

### Issue 1: `.env` file not found

**Symptom:**
```
Error: Cannot find module '.env'
Application starts but Firebase fails
```

**Solution:**
```bash
cd /home/runner/work/Snipe-/Snipe-
cp .env.example Onchainweb/.env
# Edit Onchainweb/.env with real credentials
```

---

### Issue 2: Firebase initialization failed

**Symptom:**
```javascript
Firebase initialization failed
isFirebaseAvailable: false
Error: Firebase: Error (auth/invalid-api-key)
```

**Solution:**
1. Check `.env` file exists in `Onchainweb/` directory
2. Verify all Firebase credentials are correct
3. Check for typos in variable names
4. Ensure no quotes around values in `.env`
5. Restart dev server after editing `.env`

**Verify credentials:**
```bash
# Check Firebase configuration
grep "VITE_FIREBASE" Onchainweb/.env

# Should show 8 lines with real values (not "your-*")
```

---

### Issue 3: WalletConnect not working

**Symptom:**
```
WalletConnect QR code doesn't appear
Error: Missing projectId
```

**Solution:**
1. Get Project ID from https://cloud.walletconnect.com
2. Add to `Onchainweb/.env`:
   ```bash
   VITE_WALLETCONNECT_PROJECT_ID=your-actual-project-id
   ```
3. Restart dev server

---

### Issue 4: Build fails

**Symptom:**
```
npm run build
Error: ... failed to load config ...
```

**Solutions:**

**Missing dependencies:**
```bash
cd Onchainweb
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Node version mismatch:**
```bash
node --version
# Should be 20.x or higher
# If not, install Node.js 20.x
```

**Out of memory:**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

### Issue 5: Port 5173 already in use

**Symptom:**
```
Error: Port 5173 is already in use
```

**Solution:**
```bash
# Find process using port 5173
lsof -ti:5173

# Kill the process
kill -9 $(lsof -ti:5173)

# Or use different port
npm run dev -- --port 3000
```

---

### Issue 6: Firestore rules deployment fails

**Symptom:**
```
firebase deploy --only firestore:rules
Error: Permission denied
```

**Solutions:**

**Not logged in:**
```bash
firebase logout
firebase login
```

**Wrong project:**
```bash
firebase use onchainweb-b4b36
```

**Insufficient permissions:**
```
Contact project owner to grant Editor or Owner role
```

---

## 📊 Environment Status Summary

### Current Status (After Audit)

✅ **System Requirements:**
- Node.js: 20.20.0 ✅
- npm: 10.8.2 ✅
- Git: Installed ✅

✅ **Dependencies:**
- Frontend: 362 packages installed ✅
- Build: Successful (5.08s) ✅

⚠️ **Configuration:**
- `.env` file: ❌ Missing (must create)
- Firebase: ⚠️ Not configured (pending credentials)
- WalletConnect: ⚠️ Not configured (pending Project ID)

⚠️ **Deployment:**
- Firestore rules: ⚠️ Not deployed (optional but recommended)
- Firestore indexes: ⚠️ Not deployed (optional but recommended)

---

## ✅ Quick Setup Commands

**For first-time setup, run these commands in order:**

```bash
# 1. Navigate to project
cd /home/runner/work/Snipe-/Snipe-

# 2. Create environment file
cp .env.example Onchainweb/.env

# 3. Edit environment file (add real credentials)
nano Onchainweb/.env
# Or use your preferred editor

# 4. Install dependencies (if not already done)
cd Onchainweb
npm install

# 5. Build to verify setup
npm run build

# 6. Start dev server
npm run dev

# 7. Open browser to http://localhost:5173

# 8. (Optional) Deploy Firebase rules
cd ..
firebase login
firebase use onchainweb-b4b36
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 📋 Final Verification Checklist

Use this checklist to confirm everything is working:

### System ✅
- [x] Node.js 20.x installed
- [x] npm 10.x installed
- [x] Repository cloned
- [x] Dependencies installed (362 packages)

### Configuration ⚠️
- [ ] `Onchainweb/.env` file created
- [ ] Firebase credentials configured (8 variables)
- [ ] WalletConnect Project ID configured
- [ ] Optional features configured (admin, telegram, etc.)

### Build & Run ✅
- [x] `npm run build` succeeds
- [ ] `npm run dev` starts server
- [ ] Browser opens http://localhost:5173
- [ ] Console shows "Firebase initialized successfully"
- [ ] No error messages in console

### Features ⚠️
- [ ] Wallet connection button visible
- [ ] Can navigate between pages
- [ ] Admin routes accessible (if configured)
- [ ] Firebase connection successful

### Optional ⚠️
- [ ] Firebase CLI installed
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] Cloudflare Workers configured (for deployment)

---

## 🎓 Understanding the Environment

### What `.env` Does

The `.env` file contains **environment-specific configuration** that:
- ✅ Enables Firebase connection (database, auth, storage)
- ✅ Enables WalletConnect (multi-wallet support)
- ✅ Configures admin system (access control)
- ✅ Enables optional features (Telegram, TURN server)

**Security Note:**
- `.env` files contain sensitive credentials
- Never commit `.env` to Git (it's in `.gitignore`)
- Use `.env.example` as template only
- Each environment (dev/prod) needs its own `.env`

### Why Firebase Configuration is Required

Firebase provides:
- **Firestore:** Real-time database for user data, trades, chat
- **Auth:** User authentication and authorization
- **Storage:** File uploads (if needed)
- **Hosting:** Static file hosting (optional)

Without Firebase credentials, the app will:
- ✅ Still build successfully
- ⚠️ Fall back to localStorage (limited functionality)
- ❌ Cannot sync data across devices
- ❌ Cannot authenticate users
- ❌ Cannot use real-time features

### Why WalletConnect is Required

WalletConnect enables:
- QR code connections for mobile wallets
- Support for wallets without browser extensions
- Wider wallet compatibility (11 providers total)

Without WalletConnect:
- ✅ MetaMask still works (injected provider)
- ⚠️ Mobile wallets won't work
- ⚠️ QR code connections fail

---

## 📞 Getting Help

**Documentation:**
- Quick Start: `QUICK_START_GUIDE.md`
- Full Audit: `COMPREHENSIVE_AUDIT_2026.md`
- Known Issues: `KNOWN_ISSUES.md`
- Deployment: `FINAL_DEPLOYMENT_GUIDE.md`

**External Resources:**
- Firebase Console: https://console.firebase.google.com
- WalletConnect Cloud: https://cloud.walletconnect.com
- Node.js Download: https://nodejs.org
- Firebase Docs: https://firebase.google.com/docs

**Support:**
- GitHub Issues: https://github.com/ddefi0175-netizen/Snipe-/issues
- Repository: https://github.com/ddefi0175-netizen/Snipe-

---

## 🎯 Next Steps After Setup

1. **Verify everything works:**
   - Dev server runs without errors
   - Firebase connects successfully
   - Wallet connection works

2. **Start development:**
   - Read `ARCHITECTURE.md` to understand codebase
   - Review `CONTRIBUTING.md` for contribution guidelines
   - Check `KNOWN_ISSUES.md` for limitations

3. **Deploy to production:**
   - Follow `FINAL_DEPLOYMENT_GUIDE.md`
   - Configure production environment variables
   - Deploy to Cloudflare/Vercel/Firebase

---

**Last Updated:** February 3, 2026  
**Status:** Complete environment verification guide

**Ready to deploy after environment setup!** 🚀
