# Master Account - Quick Reference Guide

**Generated**: February 8, 2026  
**For**: Snipe Trading Platform

---

## 🚀 Quick Access

### Master Account Domain Name

**Primary Domain**: `onchainweb.site`

**Master Dashboard URL**: https://onchainweb.site/master-admin

### Default Master Account Email

```
master@onchainweb.site
```

(Configured in `VITE_ADMIN_ALLOWLIST` environment variable)

---

## 🔐 Login Process

### Step-by-Step Login Instructions

1. **Navigate to Master Dashboard**
   ```
   https://onchainweb.site/master-admin
   ```

2. **Enter Credentials**
   - Email: `master@onchainweb.site` (or your configured master email)
   - Password: Your secure password (set during account creation)

3. **Click Login**
   - System verifies email is in allowlist
   - Firebase authenticates credentials
   - Firestore confirms master role
   - Access granted to dashboard

### Username and Password Authentication

✅ **Master and admin accounts use EMAIL + PASSWORD login**  
✅ **NO wallet connection required for admin/master accounts**  
✅ **Regular users still use wallet connection**

---

## 🔍 Verification Steps

### Check if Master Account Exists

Run the verification script:
```bash
./verify-master-login.sh
```

Or manually verify:

**1. Firebase Console - Authentication**
- Go to: https://console.firebase.google.com
- Navigate to Authentication → Users
- Look for: `master@onchainweb.site`
- Status should be: ✅ Enabled

**2. Firebase Console - Firestore Database**
- Go to: Firestore Database → admins collection
- Find document where `email == "master@onchainweb.site"`
- Verify fields:
  - `role: "master"`
  - `permissions: ["all"]`
  - `uid: [firebase-auth-uid]`

---

## 📋 Configuration Summary

### Required Environment Variables

```bash
# Enable admin features
VITE_ENABLE_ADMIN=true

# Master email in allowlist
VITE_ADMIN_ALLOWLIST=master@onchainweb.site

# Firebase configuration (get from Firebase Console)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Key URLs

| Purpose | URL |
|---------|-----|
| **Production Website** | https://onchainweb.site |
| **Master Dashboard** | https://onchainweb.site/master-admin |
| **Admin Dashboard** | https://onchainweb.site/admin |
| **Local Development** | http://localhost:5173/master-admin |

---

## 🛠️ How Login Works (Technical)

### Authentication Flow

```
1. User accesses /master-admin route
   ↓
2. AdminRouteGuard checks if master account exists
   ↓
3. If not authenticated, shows AdminLogin form
   ↓
4. User enters email + password
   ↓
5. System checks:
   - Email in VITE_ADMIN_ALLOWLIST? ✓
   - Firebase Auth successful? ✓
   - Firestore admin doc exists? ✓
   - Role is "master"? ✓
   ↓
6. Access Granted → Master Dashboard
```

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Route Guard | `AdminRouteGuard.jsx` | Protects admin routes |
| Login Form | `AdminLogin.jsx` | Email/password form |
| Auth Logic | `adminAuth.js` | Validates credentials |
| Firebase Service | `adminService.js` | Database operations |
| Master Setup | `MasterAccountSetup.jsx` | Initial creation |

---

## 📊 Master Account Capabilities

### Full Platform Control

✅ **User Management**
- View all users
- Edit user balances
- Freeze/unfreeze accounts
- Manage KYC status

✅ **Admin Management**
- Create new admin accounts
- Set permissions
- Delete admin accounts

✅ **Financial Operations**
- Approve deposits
- Process withdrawals
- Adjust balances

✅ **System Settings**
- Platform configuration
- View logs
- Analytics

---

## 🔧 Troubleshooting

### Common Issues

**Issue**: "Admin Features Disabled"
- **Cause**: `VITE_ENABLE_ADMIN` not set
- **Fix**: Set `VITE_ENABLE_ADMIN=true` in .env

**Issue**: "Invalid credentials"
- **Cause**: Email not in allowlist
- **Fix**: Add email to `VITE_ADMIN_ALLOWLIST`

**Issue**: "Master account not found"
- **Cause**: No Firestore document
- **Fix**: Create account via setup form or Firebase Console

**Issue**: Firebase rejects login
- **Cause**: Using fake email domain
- **Fix**: Use real domain (gmail.com, onchainweb.site, etc.)

---

## 📚 Complete Documentation

For detailed information, see:
- **Full Guide**: `MASTER_ACCOUNT_DOMAIN_AND_LOGIN_SUMMARY.md`
- **Login Fix**: `MASTER_ACCOUNT_LOGIN_FIX.md`
- **Quick Start**: `MASTER_LOGIN_QUICK_START.md`
- **Admin Guide**: `docs/admin/ADMIN_SETUP_GUIDE.md`

---

## ✅ Quick Checklist

Before attempting login:
- [ ] `.env` file configured with all Firebase variables
- [ ] `VITE_ENABLE_ADMIN=true`
- [ ] Master email in `VITE_ADMIN_ALLOWLIST`
- [ ] Firebase Auth user exists
- [ ] Firestore admin document exists with role="master"
- [ ] Navigate to correct URL: `/master-admin`

---

**Last Updated**: February 8, 2026  
**Status**: ✅ Production Ready  
**Platform**: Snipe Trading Platform
