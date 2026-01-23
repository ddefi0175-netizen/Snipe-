# 🔐 Admin Login Setup Guide

## Overview

Both **Admin Panel** (`/admin`) and **Master Admin Dashboard** (`/master-admin`) now use **Firebase Authentication** with email/password login. This guide will help you set up admin accounts correctly.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Configure Environment Variables

Edit `Onchainweb/.env` file:

```env
# Enable admin features
VITE_ENABLE_ADMIN=true

# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=AIzaSyA56Pq_WcE6TehQDayLTZ0ibCHCwZkUUlw
VITE_FIREBASE_AUTH_DOMAIN=onchainweb-37d30.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=onchainweb-37d30
VITE_FIREBASE_STORAGE_BUCKET=onchainweb-37d30.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=766146811888
VITE_FIREBASE_APP_ID=1:766146811888:web:a96012963dffe31508ef35
VITE_FIREBASE_MEASUREMENT_ID=G-1QDHSDQKDY

# Admin Allowlist (IMPORTANT: Use real email addresses)
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

**⚠️ IMPORTANT:** Use REAL email addresses (Gmail, your domain, or Firebase domain). Do NOT use fake domains like `@admin.onchainweb.app`.

---

### Step 2: Create Admin Accounts in Firebase Console

#### A. Open Firebase Console
1. Go to: https://console.firebase.google.com
2. Select project: `onchainweb-37d30`
3. Navigate to: **Authentication → Users**

#### B. Create Master Account
1. Click **"Add user"** button
2. Enter:
   - **Email**: `master@gmail.com` (must match VITE_ADMIN_ALLOWLIST)
   - **Password**: Create a strong password (min 6 characters)
   - Example: `Master2026!Secure`
3. Click **"Add user"**

#### C. Create Admin Account (Optional)
1. Click **"Add user"** again
2. Enter:
   - **Email**: `admin@gmail.com` (must match VITE_ADMIN_ALLOWLIST)
   - **Password**: Create a strong password
   - Example: `Admin2026!Secure`
3. Click **"Add user"**

---

### Step 3: Verify Setup

Check Firebase Console shows your accounts:

```
┌─────────────────────────────────────────┬──────────────┬──────────────┐
│ Email (Identifier)                      │ Provider     │ Created      │
├─────────────────────────────────────────┼──────────────┼──────────────┤
│ master@gmail.com                         │ Password     │ Just now     │
│ admin@gmail.com                          │ Password     │ Just now     │
└─────────────────────────────────────────┴──────────────┴──────────────┘
```

---

### Step 4: Start Development Server

```bash
cd Onchainweb
npm install
npm run dev
```

Server starts at: http://localhost:5173

---

### Step 5: Login

#### Master Admin Dashboard
- **URL**: http://localhost:5173/master-admin
- **Username**: `master@gmail.com` (full email address)
- **Password**: [the password you created]

#### Admin Panel
- **URL**: http://localhost:5173/admin
- **Username**: `admin@gmail.com` (full email address)
- **Password**: [the password you created]

---

## 📋 Email Format Requirements

### ✅ Valid Email Formats

| Format | Example | Works? |
|--------|---------|--------|
| Gmail | `master@gmail.com` | ✅ Yes |
| Your domain | `admin@yourdomain.com` | ✅ Yes |
| Firebase domain | `master@onchainweb-37d30.firebaseapp.com` | ✅ Yes |
| Fake domain | `master@admin.onchainweb.app` | ❌ No (Firebase rejects) |

### How It Works

1. You enter username or email (e.g., `master@gmail.com` or just `master`)
2. System checks VITE_ADMIN_ALLOWLIST for matching email
3. If found, uses that email for Firebase authentication
4. If not found, login is rejected BEFORE Firebase call

**Example:**

```env
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@yourdomain.com
```

- Login with `master@gmail.com` → ✅ Allowed
- Login with `master` → System finds `master@gmail.com` in allowlist → ✅ Allowed
- Login with `admin@yourdomain.com` → ✅ Allowed
- Login with `admin` → System finds `admin@yourdomain.com` in allowlist → ✅ Allowed
- Login with `hacker@evil.com` → ❌ Not in allowlist, rejected immediately

---

## 🔍 How Authentication Works

### Unified Firebase Authentication

Both dashboards now use the same authentication flow:

```mermaid
graph TD
    A[User enters username/email] --> B[Convert to email]
    B --> C{Email in allowlist?}
    C -->|No| D[Reject with error]
    C -->|Yes| E[Firebase Authentication]
    E --> F{Account exists?}
    F -->|No| G[Show account creation guide]
    F -->|Yes| H[Verify password]
    H --> I{Password correct?}
    I -->|No| J[Wrong password error]
    I -->|Yes| K[Login successful]
    K --> L[Store Firebase ID token]
    L --> M[Determine role: master/admin]
    M --> N[Load dashboard]
```

### Authentication Details

| Step | AdminPanel | MasterAdmin | Status |
|------|------------|-------------|--------|
| Method | Firebase Auth | Firebase Auth | ✅ Unified |
| Email validation | BEFORE login | BEFORE login | ✅ Unified |
| Token type | Firebase ID token | Firebase ID token | ✅ Unified |
| Token storage | `adminToken` | `adminToken` | ✅ Unified |
| UID storage | `firebaseAdminUid` | `firebaseAdminUid` | ✅ Unified |
| Allowlist check | BEFORE Firebase | BEFORE Firebase | ✅ Unified |

---

## 🛠️ Troubleshooting

### Error: "Email not in admin allowlist"

**Cause:** The email you entered is not in `VITE_ADMIN_ALLOWLIST`

**Fix:**
1. Check your `.env` file: `VITE_ADMIN_ALLOWLIST=...`
2. Add the email to the allowlist (comma-separated)
3. Restart dev server: `npm run dev`

### Error: "Admin account not found in Firebase"

**Cause:** Firebase user account doesn't exist

**Fix:**
1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Create account with the email from allowlist
4. Try logging in again

### Error: "Firebase authentication is not configured"

**Cause:** Missing Firebase environment variables

**Fix:**
1. Check `Onchainweb/.env` has all VITE_FIREBASE_* variables
2. Copy from `.env.example` if needed
3. Get values from Firebase Console → Project Settings
4. Restart dev server

### Error: "Incorrect password"

**Cause:** Password doesn't match Firebase account

**Fix:**
1. Go to Firebase Console → Authentication → Users
2. Find the user account
3. Click three dots (⋮) → "Reset password"
4. Enter new password
5. Try logging in with new password

### Error: "Too many failed login attempts"

**Cause:** Firebase rate limiting after multiple failed attempts

**Fix:**
1. Wait 10-15 minutes
2. Try logging in again
3. Or reset password in Firebase Console

---

## 🔒 Security Best Practices

### 1. Strong Passwords

Use passwords with:
- At least 12 characters
- Mix of uppercase and lowercase
- Numbers and special characters
- Example: `Snipe2026!@MasterAdmin`

### 2. Allowlist Management

```env
# Production - Use separate emails for each admin
VITE_ADMIN_ALLOWLIST=master@yourdomain.com,admin1@yourdomain.com,admin2@yourdomain.com

# Development - Can use Gmail for testing
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

### 3. Firebase Security Rules

Ensure `firestore.rules` protects admin data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated admins can access admin collections
    match /adminUsers/{adminId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Password Management

- Don't commit passwords to git
- Use a password manager
- Different password for each account
- Change passwords regularly

---

## 🎯 Admin Roles

### Master Admin (`master@...`)

- **Full system access**
- Can create/delete admin accounts
- Can manage all users and settings
- Access via: `/master-admin`

**Permissions:**
- All permissions (role: `master`)

### Regular Admin (`admin@...`)

- **Limited access based on permissions**
- Cannot create other admins
- Can manage assigned users
- Access via: `/admin`

**Default Permissions:**
- `manageUsers` - User management
- `manageBalances` - Balance updates
- `manageKYC` - KYC verification
- `manageTrades` - Trade management
- `viewReports` - View reports

---

## 📊 Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  User visits /admin or /master-admin                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Enter username/email       │
        │  Enter password             │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Convert to email address   │
        │  (e.g., master → master@...)│
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Check against allowlist    │
        └─────────┬───────────┬───────┘
                  │           │
            ❌ Not Found   ✅ Found
                  │           │
                  ▼           ▼
        ┌─────────────┐  ┌─────────────────────┐
        │  Reject     │  │  Firebase Auth      │
        │  Error      │  └─────────┬───────────┘
        └─────────────┘            │
                                   ▼
                        ┌──────────────────────┐
                        │  Check account       │
                        └─────┬────────┬───────┘
                              │        │
                        ❌ Not Found  ✅ Found
                              │        │
                              ▼        ▼
                    ┌─────────────┐  ┌──────────────┐
                    │  Show setup │  │  Verify pwd  │
                    │  guide      │  └──────┬───────┘
                    └─────────────┘         │
                                            ▼
                                  ┌──────────────────┐
                                  │  Store token     │
                                  │  Load dashboard  │
                                  └──────────────────┘
```

---

## 🔄 Migration from Backend API Auth

If you were using the old Backend API authentication, here's what changed:

### Old System (Deprecated)

```javascript
// MasterAdminDashboard.jsx - OLD
fetch('https://snipe-api.onrender.com/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
})
```

**Problems:**
- Backend server sleeps (Render free tier)
- 30-second timeouts
- Inconsistent with AdminPanel
- No allowlist validation

### New System (Current)

```javascript
// Both AdminPanel & MasterAdminDashboard - NEW
const email = convertToAdminEmail(username)  // Validates allowlist
const userCredential = await firebaseSignIn(email, password)
const token = await userCredential.user.getIdToken()
```

**Benefits:**
- ✅ No server wakeup delays
- ✅ Instant authentication
- ✅ Consistent across both dashboards
- ✅ Allowlist validation before login
- ✅ Better error messages

---

## 📞 Support

### Still Having Issues?

1. **Check browser console (F12)** for error messages
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Try incognito/private mode**
4. **Verify Firebase project is active**
5. **Check Firebase billing** (if using paid features)

### Common Issues Checklist

- [ ] Firebase credentials in `.env` file
- [ ] Admin emails in `VITE_ADMIN_ALLOWLIST`
- [ ] Accounts created in Firebase Console
- [ ] Dev server restarted after `.env` changes
- [ ] Using full email address to login (not just username)
- [ ] Password matches Firebase account

---

## 📚 Related Documentation

- [FIX_ADMIN_LOGIN_ERROR.md](./FIX_ADMIN_LOGIN_ERROR.md) - Detailed error troubleshooting
- [ADMIN_USER_GUIDE.md](./ADMIN_USER_GUIDE.md) - Admin features guide
- [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md) - Complete admin setup
- [Firebase Auth Docs](https://firebase.google.com/docs/auth) - Official Firebase documentation

---

**Last Updated:** January 23, 2026  
**System Version:** 2.0 (Unified Firebase Auth)
