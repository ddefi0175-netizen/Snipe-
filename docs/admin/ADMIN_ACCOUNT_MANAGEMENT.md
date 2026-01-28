# Admin Account Management - Quick Reference

## Current Status

✅ **Admin Management Method**: Firebase Console (manual creation)
✅ **Firebase Plan**: Spark (free tier, $0/month)
✅ **Build Status**: Passing ✓
✅ **Firestore Rules**: Deployed ✓

---

## 🔐 Creating a New Admin Account

### Step 1: Go to Firebase Console
```
https://console.firebase.google.com
```

### Step 2: Select Project
```
Project: YOUR_FIREBASE_PROJECT_ID
```

### Step 3: Navigate to Authentication
```
Path: Authentication → Users Tab
```

### Step 4: Create User
```
Click "Add user"

Email:    newadmin@example.com
Password: TemporaryPass123!

Click "Add user"
```

### Step 5: Update .env File
```
File: Onchainweb/.env

Find: VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com

Update to: VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com,newadmin@example.com

Save file
```

### Step 6: Restart Dev Server
```bash
cd Onchainweb
npm run dev
```

### Step 7: Admin Login
```
URL: http://localhost:5173/admin

Email: newadmin@example.com
Password: TemporaryPass123!
```

### Step 8: Set Permissions (as Master)
```
After admin logs in:
1. Go to http://localhost:5173/master-admin
2. Find the new admin in "Existing Administrators"
3. Click to view admin details
4. Set required permissions
5. Save
```

---

## 🔑 Resetting Admin Password

### For Admin User
```
1. Admin goes to: https://www.onchainweb.app/admin
2. Click "Forgot Password"
3. Firebase sends password reset email
4. Admin clicks link in email to set new password
5. Admin logs in with new password
```

### For Master (if you have admin email)
```
1. Go to Firebase Console
2. Navigate to: Authentication → Users
3. Find admin by email
4. Click three-dot menu (⋮)
5. Select "Reset password"
6. Firebase sends email to admin
7. Admin uses link to set new password
```

---

## 🚀 Deploying to Production

### Build for Production
```bash
cd /workspaces/Snipe-/Onchainweb
npm run build
```

### Deploy to Firebase
```bash
firebase deploy --project YOUR_FIREBASE_PROJECT_ID
```

### Verify Deployment
```
https://YOUR_FIREBASE_PROJECT_ID.web.app
```

---

## 📋 Admin Permissions

Master can grant these permissions to admins:

| Permission | Description |
|-----------|-------------|
| `manageUsers` | View and edit user profiles |
| `manageBalances` | Modify user balances |
| `manageKYC` | Review KYC submissions |
| `manageTrades` | Monitor and control trades |
| `manageDeposits` | Process deposits |
| `manageWithdrawals` | Approve withdrawals |
| `viewReports` | Access analytics |
| `siteSettings` | Modify platform settings |

---

## 🔍 Troubleshooting

### Admin Can't Login
**Problem**: Email not in VITE_ADMIN_ALLOWLIST

**Solution**:
1. Check `.env` file: `VITE_ADMIN_ALLOWLIST=...`
2. Add email if missing
3. Restart dev server: `npm run dev`

### Admin Email Not Found
**Problem**: User exists in Firebase but not allowed

**Solution**:
1. Verify Firebase Console has the user
2. Update `.env` with correct email
3. Restart dev server

### Firestore Access Error
**Problem**: Security rules blocking access

**Solution**:
1. Rules are deployed: ✅
2. Verify user is authenticated
3. Check browser console for specific error
4. Review firestore.rules file

### Build Fails
**Problem**: Import errors after changes

**Solution**:
```bash
cd Onchainweb
npm install
npm run build
```

---

## 📚 Related Documentation

- **Setup Guide**: [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
- **Firebase Guide**: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **Admin Guide**: [ADMIN_USER_GUIDE.md](ADMIN_USER_GUIDE.md)
- **Full Status**: [PROJECT_STATUS.md](PROJECT_STATUS.md)

---

## ✅ Checklist for New Admin

- [ ] User created in Firebase Console
- [ ] Email added to `VITE_ADMIN_ALLOWLIST` in `.env`
- [ ] Dev server restarted (`npm run dev`)
- [ ] Admin can login at `/admin`
- [ ] Master can set permissions in Master Dashboard
- [ ] Admin can access user management features

---

## 🎯 Quick Commands

```bash
# View current environment
cat Onchainweb/.env | grep VITE_ADMIN_ALLOWLIST

# Restart dev server
cd Onchainweb && npm run dev

# Build for production
cd Onchainweb && npm run build

# Deploy to Firebase
firebase deploy --project YOUR_FIREBASE_PROJECT_ID

# View Firebase logs
firebase logging:read --project YOUR_FIREBASE_PROJECT_ID
```

---

**Last Updated**: January 2026
**Firebase Plan**: Spark (Free - $0/month)
**Admin Method**: Firebase Console + .env allowlist
**Status**: ✅ Production Ready
