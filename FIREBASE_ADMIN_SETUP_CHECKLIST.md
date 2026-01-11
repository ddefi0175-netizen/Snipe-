# ✅ Firebase Admin Setup Checklist

## Phase 1: Master Account (Already Done)

- [x] Created master@gmail.com in Firebase Console
- [x] Updated `.env` with VITE_ADMIN_ALLOWLIST=master@gmail.com
- [x] Restarted dev server
- [x] Tested master login at http://localhost:5175/master-admin
- [x] Verified master dashboard loads (with Firebase permission notes)

---

## Phase 2: Create First Admin Account

### Step 1: Firebase Console Setup
- [ ] Open: https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users
- [ ] Click "Create user"
- [ ] Enter email: **admin@gmail.com** (or your preferred email)
- [ ] Enter password: (choose strong password)
- [ ] Click "Create"
- [ ] Verify: You see the new account in the users list

### Step 2: Update `.env`
- [ ] Open: `Onchainweb/.env`
- [ ] Find line: `VITE_ADMIN_ALLOWLIST=master@gmail.com`
- [ ] Change to: `VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com`
- [ ] Save file

### Step 3: Restart Dev Server
- [ ] Stop current server (Ctrl+C)
- [ ] Run: `cd /workspaces/Snipe-/Onchainweb && npm run dev`
- [ ] Verify: Server shows "ready at http://localhost:5175"

### Step 4: Test Admin Login
- [ ] Open: http://localhost:5175/admin
- [ ] Enter email: admin@gmail.com
- [ ] Enter password: (the password you set)
- [ ] Click "Login"
- [ ] **Result**: Should see admin dashboard with User Management sections

### Step 5: Verify Admin Can Access Features
- [ ] Click "User Management" tab
- [ ] Verify: User list appears (may be empty initially)
- [ ] No error messages in browser console

---

## Phase 3: Test Admin Actions (New Functionality)

### Create Another Admin
- [ ] From Master Dashboard, click "Admin Roles" tab
- [ ] Click "➕ Create Admin Account"
- [ ] **Expected**: Popup shows Firebase Console instructions
- [ ] Follow instructions to create second admin in Firebase

### Reset Admin Password
- [ ] From Master Dashboard, open any admin account details
- [ ] Click "🔑 Reset Password"
- [ ] **Expected**: Popup shows Firebase Console instructions
- [ ] Follow instructions to reset password in Firebase

---

## Phase 4: Multiple Admins Setup (Optional)

### Create 2nd Admin
- [ ] Firebase Console: Create user
  - Email: `john@gmail.com`
  - Password: (your choice)
- [ ] Update `.env`:
  ```
  VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com,john@gmail.com
  ```
- [ ] Restart dev server
- [ ] Test login: http://localhost:5175/admin

### Create 3rd Admin
- [ ] Firebase Console: Create user
  - Email: `sarah@yourdomain.com`
  - Password: (your choice)
- [ ] Update `.env`:
  ```
  VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com,john@gmail.com,sarah@yourdomain.com
  ```
- [ ] Restart dev server
- [ ] Test login: http://localhost:5175/admin

---

## Phase 5: Verify Everything Works

### Test Master Dashboard Features
- [ ] Login as master@gmail.com to master-admin
- [ ] Navigate to "Admin Roles" tab
- [ ] Verify: Existing admin accounts appear
- [ ] Click on admin → Should see details panel

### Test Admin Dashboard
- [ ] Login as any created admin to admin page
- [ ] Navigate to "User Management"
- [ ] Verify: Can view user list (or empty if no users)

### Test From Different Browser
- [ ] Open different browser (or incognito)
- [ ] Go to http://localhost:5175/admin
- [ ] Login with admin@gmail.com
- [ ] **Result**: Should work seamlessly

---

## Phase 6: Password Reset Workflow

### Test Password Reset
- [ ] From Master Dashboard, find an admin
- [ ] Click "🔑 Reset Password" button
- [ ] **Expected**: Instructions popup
- [ ] Go to Firebase Console
- [ ] Find the admin email
- [ ] Click 3-dot menu → "Reset password"
- [ ] Firebase sends reset email
- [ ] Open reset email link
- [ ] Set new password
- [ ] Test login with new password

---

## Troubleshooting Checklist

### Login Not Working
- [ ] Check email exists in Firebase Console
- [ ] Check email is in `.env` VITE_ADMIN_ALLOWLIST
- [ ] Check dev server was restarted
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Try incognito/private window

### Features Not Working
- [ ] Check browser console (F12) for errors
- [ ] Check Firebase security rules are deployed
- [ ] Check internet connection to Firebase
- [ ] Try refreshing page (F5)

### Admin Not Appearing in List
- [ ] Refresh master dashboard
- [ ] Check admin email is in Firebase Console
- [ ] Verify email matches exactly (case-sensitive in code, not in Firebase)

---

## Quick Reference

### Firebase Console URL
```
https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users
```

### Dev Server Command
```bash
cd /workspaces/Snipe-/Onchainweb && npm run dev
```

### Master Dashboard
```
http://localhost:5175/master-admin
Email: master@gmail.com
```

### Admin Dashboard
```
http://localhost:5175/admin
Email: admin@gmail.com (or other admin email)
```

### `.env` Location
```
/workspaces/Snipe-/Onchainweb/.env
```

---

## Success Criteria

You'll know everything is working when:

✅ Master can login to master-admin
✅ Master can view admin list
✅ Admin can login to admin page
✅ Admin can see user management features
✅ "Create Admin" button shows Firebase instructions
✅ "Reset Password" button shows Firebase instructions
✅ No console errors (F12)
✅ Can create new admin accounts via Firebase Console + `.env` update
✅ Can reset admin passwords via Firebase Console

---

## Next Steps After Setup

1. **Set up permanent admin accounts** with real company emails
2. **Document admin login credentials** securely
3. **Set up user wallet connections** to test user creation
4. **Monitor Firestore data** in Firebase Console
5. **Configure user permissions** (future feature)

---

**Last Updated**: January 11, 2026
**Estimated Setup Time**: 10-15 minutes
**Difficulty**: Easy ✅
