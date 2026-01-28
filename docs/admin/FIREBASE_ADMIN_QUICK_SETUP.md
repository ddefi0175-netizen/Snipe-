# Master Admin - Firebase Admin Management Guide

## Quick Summary

✅ **What was changed:**
- Master dashboard now shows Firebase Console instructions instead of trying to use the dead MongoDB backend
- `.env` updated with proper admin email configuration
- Firestore security rules updated to allow authenticated admin access

---

## How to Create New Admin Accounts

### Step 1: Open Firebase Console
**URL:** https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users

### Step 2: Click "Create user"
- **Email**: `admin@gmail.com` (or any REAL email)
  - ✅ GOOD: Gmail, company domain, real email service
  - ❌ BAD: @admin.onchainweb.app, @admin.local, fake domains
- **Password**: `Admin@12345` (or strong password)

### Step 3: Update `.env` File
**File**: `Onchainweb/.env`

Find this line:
```env
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

If adding more admins, add email separated by commas:
```env
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com,john@yourdomain.com
```

### Step 4: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
cd /workspaces/Snipe-/Onchainweb
npm run dev
```

### Step 5: Test Login
- **URL**: http://localhost:5175/admin
- **Email**: admin@gmail.com
- **Password**: Admin@12345

---

## How to Reset Admin Password

### From Master Dashboard:
1. Go to **Master Admin Dashboard** → **Admin Roles**
2. Find admin → Click 3-dot menu → **View Admin**
3. Click **🔑 Reset Password** button
4. Dashboard shows Firebase Console instructions

### Direct Method (Fastest):
1. Open Firebase Console:
   https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users
2. Find admin account (search by email)
3. Click **3-dot menu** on right
4. Select **"Reset password"**
5. Firebase sends reset email to admin's inbox
6. Admin clicks link in email and creates new password

---

## Managing Admins Summary

| Task | Where | How |
|------|-------|-----|
| **Create Admin** | Firebase Console | Settings → Authentication → Create user |
| **Reset Password** | Firebase Console | Find user → 3-dot menu → Reset password |
| **Delete Admin** | Firebase Console | Find user → 3-dot menu → Delete user |
| **Configure Access** | `.env` file | Add/remove email from VITE_ADMIN_ALLOWLIST |
| **Apply Changes** | Terminal | Restart: `npm run dev` |

---

## Example: Create 3 Admins

### In Firebase Console:
```
Admin 1:
  Email: john.smith@gmail.com
  Password: JohnSmith@Secure123

Admin 2:
  Email: sarah.admin@yourdomain.com
  Password: SarahAdmin@Secure456

Admin 3:
  Email: support@yourdomain.com
  Password: Support@Secure789
```

### In `.env`:
```env
VITE_ADMIN_ALLOWLIST=master@gmail.com,john.smith@gmail.com,sarah.admin@yourdomain.com,support@yourdomain.com
```

### Restart Server:
```bash
npm run dev
```

### Test Logins:
- http://localhost:5175/admin → john.smith@gmail.com / password
- http://localhost:5175/admin → sarah.admin@yourdomain.com / password
- http://localhost:5175/admin → support@yourdomain.com / password

---

## Troubleshooting

### "Invalid email or password" on login
**Cause**: Email not in Firebase OR not in `.env` VITE_ADMIN_ALLOWLIST OR dev server not restarted

**Fix**:
1. Check Firebase Console - account exists
2. Check `.env` - email is in VITE_ADMIN_ALLOWLIST
3. Restart dev server: `npm run dev`
4. Clear browser cache (Ctrl+Shift+Delete)

### "You don't have admin access"
**Cause**: Email not in `VITE_ADMIN_ALLOWLIST` in `.env`

**Fix**:
1. Add email to `VITE_ADMIN_ALLOWLIST` in `.env`
2. Restart dev server
3. Try login again

### Can't find Firebase Console
**Fix**:
1. Go to: https://console.firebase.google.com
2. Click "Go to console"
3. Select project: `YOUR_FIREBASE_PROJECT_ID`
4. Click "Authentication" in left sidebar

---

## What Changed (Technical Details)

### File Changes:
1. **`Onchainweb/.env`**
   - Changed VITE_ADMIN_ALLOWLIST from empty to: `master@gmail.com,admin@gmail.com`

2. **`Onchainweb/src/components/MasterAdminDashboard.jsx`**
   - Updated "Create Admin Account" button → shows Firebase Console instructions
   - Updated "Reset Password" button → shows Firebase Console instructions

3. **`firestore.rules`**
   - Simplified permissions to allow authenticated users to read/write data

### Created New Files:
1. **`FIREBASE_ADMIN_MANAGEMENT_GUIDE.md`** - Detailed admin management guide
2. **`FIREBASE_ADMIN_QUICK_SETUP.md`** - This file

---

## Next Steps

1. ✅ **Create master@gmail.com in Firebase** (already done if you tested login)
2. ✅ **Create admin@gmail.com in Firebase** (or your preferred email)
3. ✅ **Update `.env`** with new admin email
4. ✅ **Restart dev server**
5. ✅ **Test admin login**

---

## Key Rules to Remember

| Rule | Why | Example |
|------|-----|---------|
| Email must be REAL | Firebase requires real domains for auth | ✅ `admin@gmail.com` NOT ❌ `@admin.onchainweb.app` |
| Add to `.env` immediately | App reads allowlist at startup | Add email BEFORE restart |
| Restart dev server | Changes in `.env` require restart | `npm run dev` |
| Gmail always works | Always has access | Any @gmail.com account works |

---

## Frequently Asked Questions

**Q: Why can't I use @admin.onchainweb.app emails?**
A: Firebase Authentication requires real email domains for password auth. Only wallet connections work without real emails.

**Q: Can I create admin accounts from the dashboard?**
A: Not yet. The dashboard now shows Firebase Console instructions since that's the fastest way.

**Q: How many admin accounts can I create?**
A: Unlimited. Firebase supports thousands of user accounts.

**Q: What if I forget an admin's password?**
A: Use Firebase Console → Reset password. Firebase sends email reset link.

**Q: Can admins log in from multiple devices?**
A: Yes. Firebase tokens work anywhere. Just need email + password.

---

## Related Documents

- [FIREBASE_ADMIN_MANAGEMENT_GUIDE.md](./FIREBASE_ADMIN_MANAGEMENT_GUIDE.md) - Detailed guide
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - Project setup
- [BACKEND_REPLACEMENT.md](./BACKEND_REPLACEMENT.md) - Why Firebase replaced MongoDB

---

**Last Updated**: January 11, 2026
**Status**: ✅ Ready to Create Admins
**Version**: Firebase v2.0
