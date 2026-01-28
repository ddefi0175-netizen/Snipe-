# Step 4: Admin Setup

**Estimated time:** 5 minutes

## Overview

Create the master admin account securely to manage the platform.

## 🚨 Security Alert

**IMPORTANT:** Do NOT use any password mentioned in chat history. Always generate a new, secure password using the provided script.

## Prerequisites

- ✅ Application deployed (Step 3)
- ✅ Admin email in `VITE_ADMIN_ALLOWLIST`
- ✅ Production URL accessible: https://onchainweb.site

## Secure Setup Method (Recommended)

### Step 1: Run Secure Setup Script

```bash
./setup-master-account-secure.sh
```

This generates a NEW secure password and saves it to a temporary file.

### Step 2: Save to Password Manager

Copy the password from `master-credentials-SECURE.txt` and save to:
- 1Password
- Bitwarden
- LastPass
- Other secure password manager

### Step 3: Create in Firebase Console

1. Visit: https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users
2. Click "Add user"
3. Enter:
   - Email: `master@onchainweb.site`
   - Password: [From secure file]
4. Click "Add user"

### Step 4: Delete Credentials File

```bash
rm master-credentials-SECURE.txt
```

### Step 5: Login

1. Visit: https://onchainweb.site/master-admin
2. Enter credentials from password manager
3. ✅ Access granted!

## Alternative: Manual Setup

### 1. Navigate to Master Admin Page

Visit:

```
https://onchainweb.site/master-admin
```

### 2. Create Master Account

If no master account exists, you'll see the setup form.

Fill in:
- **Email:** Use the email from `VITE_ADMIN_ALLOWLIST`
- **Password:** Create a strong password (min 12 characters)
- **Confirm Password:** Re-enter the same password

### 3. Submit Form

Click "Create Master Account"

The system will:
1. Create account in Firebase Authentication
2. Create admin document in Firestore with master role
3. Redirect to login page

### 4. Login as Master

Enter your credentials and click "Login"

You'll be redirected to the Master Admin Dashboard.

## Master Account Details

```
Domain:   onchainweb.site
URL:      https://onchainweb.site/master-admin
Email:    master@onchainweb.site
Username: master
Password: [Secure password from setup script]
```

## Create Additional Admins

After logging in as master:
1. Navigate to "Admin Management" tab
2. Click "Create Admin"
3. Fill in details
4. Assign permissions
5. New admin can login at: https://onchainweb.site/admin

## Master Account Capabilities

As master admin, you can:
- ✅ Manage all users
- ✅ Approve/reject deposits
- ✅ Process withdrawals
- ✅ Create additional admin accounts
- ✅ Configure system settings
- ✅ View analytics and logs
- ✅ Real-time user registration notifications
- ✅ Customer service chat management

## Security Best Practices

✅ **DO:**
- Use password manager
- Generate strong passwords (16+ characters)
- Enable 2FA in Firebase Console
- Rotate passwords every 90 days
- Monitor Firebase Console for suspicious activity

❌ **DON'T:**
- Share credentials
- Store in plain text
- Use simple passwords
- Commit credentials to git
- Reuse passwords

### Password Requirements
- Minimum 16 characters (recommended)
- Mix of uppercase, lowercase, numbers, symbols
- Use a password manager
- Never share credentials
- Rotate every 90 days

## Verification

✅ Master account created successfully
✅ Login works
✅ Dashboard loads
✅ Admin functions accessible
✅ Real-time notifications work
✅ Can create additional admins

## Troubleshooting

### Cannot Access Dashboard

1. Clear browser cache and localStorage
2. Verify email is in `VITE_ADMIN_ALLOWLIST`
3. Check Firebase Console → Authentication
4. Review browser console for errors

### Password Not Working

1. Reset password in Firebase Console
2. Use "Forgot Password" link (if configured)
3. Create new account using secure script

## Next Step

[Step 5: Verification →](5-VERIFICATION.md)

