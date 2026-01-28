# Firebase Admin Management Guide

## Overview

Since Snipe Platform uses Firebase for authentication and data storage, admin accounts are managed directly in Firebase Console instead of through the dashboard.

---

## Creating New Admin Accounts

### Step 1: Create User in Firebase Console

1. Go to: https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users
2. Click **"Create user"** button
3. Enter:
   - **Email**: Use a REAL email address
     - ✅ GOOD: `admin@gmail.com`, `admin@yourdomain.com`, `john@example.com`
     - ❌ BAD: `admin@admin.onchainweb.app`, `@admin.local`
   - **Password**: Strong password (8+ characters, mix of upper/lower/numbers)
4. Click **Create**

**Example for creating multiple admins:**
```
Email: john.smith@gmail.com       → Password: JohnSmith@12345
Email: sarah.admin@yourdomain.com → Password: SarahAdmin@12345
Email: support@yourdomain.com     → Password: Support@12345
```

---

## Step 2: Update `.env` File

Add the new admin email to `VITE_ADMIN_ALLOWLIST`:

**File**: `Onchainweb/.env`

```env
# Before:
VITE_ADMIN_ALLOWLIST=master@gmail.com

# After (if adding john.smith@gmail.com):
VITE_ADMIN_ALLOWLIST=master@gmail.com,john.smith@gmail.com

# If adding multiple:
VITE_ADMIN_ALLOWLIST=master@gmail.com,john.smith@gmail.com,sarah.admin@yourdomain.com
```

---

## Step 3: Restart Dev Server

After updating `.env`:

```bash
# Stop current server (Ctrl+C)

# Restart:
cd /workspaces/Snipe-/Onchainweb
npm run dev
```

---

## Resetting Admin Passwords

### Method 1: Firebase Console (Recommended)

1. Go to: https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users
2. Find the admin account (search by email)
3. Click the **3-dot menu** on the right side
4. Select **"Reset password"**
5. Firebase sends password reset email to their inbox
6. They click the reset link and create new password

### Method 2: Self-Service (If implemented)

If you want admins to reset their own passwords through the app, they can use the password reset flow on the login page.

---

## Deleting Admin Accounts

### To remove an admin:

1. Go to: https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users
2. Find the admin account
3. Click the **3-dot menu** on the right
4. Select **"Delete user"**
5. Confirm deletion
6. Remove the email from `VITE_ADMIN_ALLOWLIST` in `.env`
7. Restart dev server

---

## Testing Admin Login

### Test Master Account

1. URL: `http://localhost:5175/master-admin`
2. Email: `master@gmail.com`
3. Password: (the password you set in Firebase)
4. Should see: User Management, Deposits, Trades, etc.

### Test Regular Admin Account

1. URL: `http://localhost:5175/admin`
2. Email: `john.smith@gmail.com` (or your admin email)
3. Password: (the password they set)
4. Should see: Their assigned section (or all sections if configured)

---

## Troubleshooting

### "Invalid email or password" error

**Causes:**
- Email not created in Firebase Console
- Email not added to `VITE_ADMIN_ALLOWLIST` in `.env`
- Typo in email address
- Password is wrong

**Fix:**
1. Verify email exists in Firebase Console
2. Verify email is in `.env` `VITE_ADMIN_ALLOWLIST`
3. Check capitalization (Gmail addresses are case-insensitive, but be consistent)
4. Use Firebase "Reset password" to set a known password

### "You don't have admin access"

**Causes:**
- Email not added to `VITE_ADMIN_ALLOWLIST` in `.env`
- Dev server not restarted after updating `.env`

**Fix:**
1. Add email to `VITE_ADMIN_ALLOWLIST` in `.env`
2. Restart dev server: `npm run dev`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try login again

### Can't access Firebase Console

**Fix:**
1. Make sure you're logged into Google account
2. Go to: https://console.firebase.google.com
3. Select project: `YOUR_FIREBASE_PROJECT_ID`
4. Click "Authentication" in left sidebar

---

## Admin Levels (Coming Soon)

In a future update, admin roles and permissions can be managed via Firestore, allowing:
- Role-based access (Super Admin, Support, Moderator, etc.)
- Permission-based features
- Per-user admin settings in dashboard

For now, all admin emails in `VITE_ADMIN_ALLOWLIST` have full master access.

---

## FAQ

**Q: Can I use accounts with fake email domains?**
A: No. Firebase requires real email domains for password authentication. Use Gmail, your company domain, or an email service.

**Q: Can I create admin accounts from the dashboard?**
A: Not yet (would require Cloud Functions). Use Firebase Console for now.

**Q: Can admins change their own password?**
A: Yes, through the password reset flow or Firebase account settings.

**Q: How many admin accounts can I create?**
A: Unlimited. Firebase allows thousands of user accounts.

**Q: Are admin credentials stored securely?**
A: Yes. Firebase Authentication is Google-managed with enterprise security. Passwords are hashed and never stored in plaintext.

---

## Best Practices

1. ✅ Use strong, unique passwords for each admin
2. ✅ Use real email addresses so they can reset passwords
3. ✅ Add emails to `VITE_ADMIN_ALLOWLIST` immediately after creating account
4. ✅ Test login before telling admin about the account
5. ✅ Delete unused admin accounts regularly
6. ✅ Keep `.env` file updated with current admin emails

---

**Last Updated**: January 11, 2026
**Firebase Project**: YOUR_FIREBASE_PROJECT_ID
**Version**: Firebase Auth v2.0
