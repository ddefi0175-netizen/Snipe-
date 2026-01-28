# Master Account Username and Password Verification Guide

**Last Updated**: January 26, 2026  
**Status**: ✅ Active

---

## 🎯 Quick Answer: How to Find Master Account Credentials

The Snipe platform has **TWO** authentication systems:

1. **Firebase Authentication** (Primary, Recommended) - For production and modern deployments
2. **Legacy MongoDB Backend** (Deprecated) - For backward compatibility only

---

## 🔐 Method 1: Firebase Authentication (Primary System)

### Current Firebase Admin Credentials

Firebase uses **email/password** authentication. The master account must be:

1. **Created in Firebase Console** first
2. **Added to the allowlist** in environment variables

### How to Check/Create Firebase Master Account

#### Step 1: Check Environment Variables

**File**: `Onchainweb/.env`

Look for these settings:
```dotenv
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ALLOWLIST=master@example.com,admin@example.com
```

The emails listed in `VITE_ADMIN_ALLOWLIST` are the authorized admin accounts.

#### Step 2: Verify Account Exists in Firebase

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project (e.g., `YOUR_FIREBASE_PROJECT_ID`)
3. Go to **Authentication** → **Users**
4. Look for the master email (e.g., `master@example.com`)

#### Step 3: Master Account Login

- **URL**: https://www.onchainweb.app/master-admin (production) or http://localhost:5173/master-admin (dev)
- **Username/Email**: The email from `VITE_ADMIN_ALLOWLIST` starting with `master@` or `master.`
- **Password**: The password you set in Firebase Console

**Important Notes**:
- Emails starting with `master@` or `master.` get **master role** (full access)
- Other emails get **admin role** (limited permissions)
- If you forgot the password, reset it via Firebase Console → Authentication → Users → (select user) → Reset Password

---

## 🗄️ Method 2: Legacy MongoDB Backend (Deprecated)

### Current Legacy Credentials

**⚠️ SECURITY NOTE**: Actual credentials are stored in secure environment variables and should NEVER be committed to version control.

Credentials are documented in `docs/admin/MASTER_ACCOUNT_ACCESS_GUIDE.md` (accessible only to authorized administrators).

### Where These Are Configured

**Backend Environment Variables** (on Render.com or local `backend/.env`):
```bash
MASTER_USERNAME=[SECURE_CREDENTIAL_SEE_ADMIN_GUIDE]
MASTER_PASSWORD=[SECURE_CREDENTIAL_SEE_ADMIN_GUIDE]
```

**To access actual credentials**: Contact your system administrator or check `docs/admin/MASTER_ACCOUNT_ACCESS_GUIDE.md` in your secure deployment environment.

### Legacy Backend Login

- **API Endpoint**: POST https://snipe-api.onrender.com/api/auth/login
- **Dashboard**: Not directly accessible (use API)

**Example API Login**:
```bash
# Use environment variables - never hardcode credentials
export LEGACY_USERNAME="[your_legacy_username]"
export LEGACY_PASSWORD="[your_legacy_password]"

curl -X POST https://snipe-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${LEGACY_USERNAME}\",
    \"password\": \"${LEGACY_PASSWORD}\"
  }"
```

### ⚠️ Important: Legacy Backend is Deprecated

The MongoDB/Express backend is **no longer recommended** for new deployments. Use Firebase Authentication instead.

---

## 🧪 Quick Verification Scripts

### Check Firebase Admin Setup

```bash
# Check if admin is enabled (run from repository root)
grep "VITE_ENABLE_ADMIN\|VITE_ADMIN_ALLOWLIST" Onchainweb/.env

# Expected output:
# VITE_ENABLE_ADMIN=true
# VITE_ADMIN_ALLOWLIST=master@example.com,admin@example.com
```

### Check Legacy Backend Credentials

```bash
# Check backend environment (if backend is deployed)
# On Render.com: Go to Dashboard → Service → Environment
# Look for: MASTER_USERNAME and MASTER_PASSWORD

# Or check local backend/.env
cd /home/runner/work/Snipe-/Snipe-/backend
grep "MASTER_USERNAME\|MASTER_PASSWORD" .env 2>/dev/null || echo "No backend .env found"
```

### Test Firebase Login (Browser)

1. Open: http://localhost:5173/master-admin (or production URL)
2. Enter your Firebase admin email (from allowlist)
3. Enter the password you set in Firebase Console
4. Click Login
5. Should redirect to master admin dashboard

### Test Legacy Backend Login (API)

```bash
# Set your actual credentials in environment variables (NEVER commit these)
export LEGACY_USERNAME="[your_legacy_username]"
export LEGACY_PASSWORD="[your_legacy_password]"

# Test login
curl -X POST https://snipe-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$LEGACY_USERNAME\",\"password\":\"$LEGACY_PASSWORD\"}" | jq .

# Expected: {"success": true, "token": "...", "user": {...}}
```

---

## 📋 Comparison: Firebase vs Legacy

| Feature | Firebase (Primary) | Legacy Backend |
|---------|-------------------|----------------|
| **Authentication** | Firebase Auth | MongoDB + JWT |
| **Credential Format** | Email/Password | Username/Password |
| **Setup Location** | Firebase Console + .env | backend/.env |
| **Login URL** | /master-admin route | API endpoint |
| **Status** | ✅ Active & Recommended | ⚠️ Deprecated |
| **Master Email** | master@* emails | N/A (username) |
| **Password Reset** | Firebase Console | Manual update |

---

## 🆘 Troubleshooting

### Problem: "I don't know my Firebase master password"

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Authentication → Users
3. Find the master email
4. Click the three dots menu → **"Reset Password"**
5. Firebase will send a password reset email
6. Follow the link to set a new password

### Problem: "I don't know my Firebase master email"

**Solution**:
```bash
# Check your environment file (from repository root)
cat Onchainweb/.env | grep VITE_ADMIN_ALLOWLIST

# The master email is the one starting with 'master@' or 'master.'
```

### Problem: "Email not in admin allowlist"

**Solution**:
1. Edit `Onchainweb/.env`
2. Add your email to `VITE_ADMIN_ALLOWLIST`
3. Restart the dev server: `npm run dev`
4. Try logging in again

### Problem: "Admin account not found in Firebase"

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Authentication → Users
3. Click **"Add User"**
4. Enter email (e.g., `master@example.com`)
5. Enter a strong password
6. Click **"Add User"**
7. Add the email to `VITE_ADMIN_ALLOWLIST` in `Onchainweb/.env`

### Problem: "Legacy backend credentials not working"

**Solution**:
1. Check if backend is running: `curl https://snipe-api.onrender.com/health`
2. Verify credentials in backend environment variables
3. Note: Legacy backend sleeps after inactivity (30-60 sec startup time)
4. Consider migrating to Firebase Authentication

---

## 🔄 Migration Guide: Legacy → Firebase

If you're currently using the legacy backend and want to switch to Firebase:

### Step 1: Set up Firebase Authentication

1. Create Firebase project: https://console.firebase.google.com
2. Enable Authentication → Email/Password provider
3. Copy Firebase config to `Onchainweb/.env`

### Step 2: Create Master Account in Firebase

1. Go to Authentication → Users
2. Add user with email: `master@yourdomain.com`
3. Set a strong password
4. Save credentials securely

### Step 3: Configure Frontend

**File**: `Onchainweb/.env`
```dotenv
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ALLOWLIST=master@yourdomain.com
```

### Step 4: Test Login

```bash
cd Onchainweb
npm run dev
# Open http://localhost:5173/master-admin
# Login with your Firebase email/password
```

### Step 5: Deprecate Legacy Backend

- Stop using `VITE_API_BASE` in frontend
- Remove backend environment variables
- Keep backend for historical data access only

---

## 📚 Related Documentation

- [MASTER_ACCOUNT_ACCESS_GUIDE.md](docs/admin/MASTER_ACCOUNT_ACCESS_GUIDE.md) - Legacy backend credentials
- [HOW_TO_CREATE_ADMIN_CREDENTIALS.md](HOW_TO_CREATE_ADMIN_CREDENTIALS.md) - Firebase admin setup
- [ADMIN_USER_GUIDE.md](ADMIN_USER_GUIDE.md) - Admin features and permissions
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - Initial setup
- [BACKEND_REPLACEMENT.md](BACKEND_REPLACEMENT.md) - Why Firebase?

---

## ✅ Summary Checklist

### To Check Firebase Master Account:

- [ ] Check `Onchainweb/.env` for `VITE_ADMIN_ALLOWLIST`
- [ ] Verify email exists in Firebase Console → Authentication → Users
- [ ] Test login at /master-admin route
- [ ] Reset password in Firebase Console if forgotten

### To Check Legacy Backend Credentials:

- [ ] Check `backend/.env` or Render.com environment for `MASTER_USERNAME` and `MASTER_PASSWORD`
- [ ] Refer to `docs/admin/MASTER_ACCOUNT_ACCESS_GUIDE.md` for current credentials
- [ ] Test API login with curl command
- [ ] Consider migrating to Firebase

---

## 🔒 Security Reminders

- ✅ **DO**: Use password managers for credential storage
- ✅ **DO**: Enable Firebase 2FA if available
- ✅ **DO**: Rotate passwords every 90 days
- ✅ **DO**: Use strong passwords (16+ characters)
- ❌ **DON'T**: Commit credentials to git
- ❌ **DON'T**: Share credentials via email/chat
- ❌ **DON'T**: Use weak or reused passwords
- ❌ **DON'T**: Store passwords in plain text

---

**Need Help?**
- Check Firebase Console for account status
- Review browser console for error messages
- Test with curl for API issues
- Open a GitHub issue in the repository for support
