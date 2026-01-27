# 🔐 Master Account Password Setup Guide

> **Complete step-by-step guide for setting up your master account password for the Snipe platform**

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Setup (Recommended)](#quick-setup-recommended)
3. [Manual Setup](#manual-setup)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)
6. [Security Best Practices](#security-best-practices)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Firebase project created and configured
- ✅ Firebase credentials set in `Onchainweb/.env` file
- ✅ Access to Firebase Console
- ✅ A secure password manager (1Password, Bitwarden, LastPass, etc.)

---

## Quick Setup (Recommended)

### Method 1: Using the Automated Script

This is the **easiest and most secure** method:

```bash
# Run from the repository root
./setup-master-account-secure.sh
```

**What this script does:**
1. ✅ Generates a cryptographically secure password (18+ characters)
2. ✅ Saves credentials to a temporary file
3. ✅ Opens Firebase Console in your browser
4. ✅ Provides step-by-step instructions

**Follow the prompts:**

1. Script will display a secure password like: `M@sterX7k9Lm2pQw3Rs42026!`
2. Press `y` to save it to `master-credentials-SECURE.txt`
3. **IMMEDIATELY** copy the password to your password manager
4. Follow the Firebase Console instructions (shown in terminal)
5. Delete the temporary file: `rm master-credentials-SECURE.txt`

---

## Manual Setup

If you prefer to set everything up manually:

### Step 1: Choose Your Master Email

Your master email must start with `master@` or `master.` to be automatically recognized as a master account.

**Recommended formats:**
- `master@onchainweb.site`
- `master@yourdomain.com`
- `master.admin@yourdomain.com`

### Step 2: Generate a Strong Password

**Option A: Use a Password Generator Website**
1. Visit: https://passwordsgenerator.net/
2. Configure settings:
   - Length: **16+ characters** (20+ recommended)
   - ✅ Uppercase letters (A-Z)
   - ✅ Lowercase letters (a-z)
   - ✅ Numbers (0-9)
   - ✅ Special characters (!@#$%^&*)
3. Click "Generate Password"
4. Copy and save immediately to your password manager

**Option B: Use Command Line**
```bash
# Generate a secure random password
openssl rand -base64 16 | tr -d "=+/" | cut -c1-20
```

**Example of a strong password:**
```
M@sterSecure2026!xK9pQw#7
```

### Step 3: Configure Environment Variables

Edit your environment configuration file:

**File:** `Onchainweb/.env`

Add or update these lines:
```dotenv
# Enable admin features
VITE_ENABLE_ADMIN=true

# Admin routes
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin

# Master email allowlist
VITE_ADMIN_ALLOWLIST=master@onchainweb.site
```

**Important Notes:**
- Replace `master@onchainweb.site` with your chosen email
- Multiple emails can be added, separated by commas (no spaces)
- Save the file after editing

### Step 4: Create Account in Firebase Console

1. **Open Firebase Console:**
   - Visit: https://console.firebase.google.com
   - Select your project (or create one if needed)

2. **Navigate to Authentication:**
   - Click **"Authentication"** in the left sidebar
   - Click **"Users"** tab at the top
   - Click the **"Add user"** button

3. **Create the Master User:**
   - **Email:** Enter your master email (e.g., `master@onchainweb.site`)
   - **Password:** Paste the strong password you generated
   - Click **"Add user"**
   - ✅ You should see a success message

4. **Save Your Credentials:**
   
   Store these details in your password manager:
   ```
   Service: Snipe Master Admin
   URL: https://onchainweb.site/master-admin
   Username: master
   Email: master@onchainweb.site
   Password: [Your secure password]
   Created: [Today's date]
   ```

### Step 5: Verify Environment Variables Match

Double-check that your `.env` file contains the master email:

```bash
# From the repository root
grep VITE_ADMIN_ALLOWLIST Onchainweb/.env
```

Should output:
```
VITE_ADMIN_ALLOWLIST=master@onchainweb.site
```

### Step 6: Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd Onchainweb
npm run dev
```

---

## Verification

### Test Your Master Account Login

1. **Open your browser** and navigate to:
   - **Local:** http://localhost:5173/master-admin
   - **Production:** https://onchainweb.site/master-admin

2. **Enter your credentials:**
   - Email/Username: `master@onchainweb.site` (or your master email)
   - Password: [Your secure password from password manager]

3. **Click "Sign In"**

4. **Expected Result:**
   - ✅ You should be logged in successfully
   - ✅ You should see the Master Dashboard
   - ✅ All admin features should be accessible

### What You Should See

After successful login, the Master Dashboard includes:

- **User Management** - View and manage all users
- **Admin Management** - Create and manage admin accounts
- **Deposit Approvals** - Approve/reject deposits
- **Withdrawal Processing** - Process withdrawal requests
- **Analytics & Reports** - View platform statistics
- **System Settings** - Configure platform settings

---

## Troubleshooting

### Error: "Email not in admin allowlist"

**Solution:**
1. Check `Onchainweb/.env` file
2. Verify `VITE_ADMIN_ALLOWLIST` contains your email
3. Ensure no typos in the email address
4. Restart the development server: `npm run dev`

### Error: "Admin account not found in Firebase"

**Solution:**
1. Go to Firebase Console → Authentication → Users
2. Verify the user account exists
3. Check that the email matches exactly (case-insensitive)
4. If missing, create the account using Step 4 above

### Error: "Invalid credentials" or "Wrong password"

**Solution:**
1. Double-check your password in password manager
2. Ensure no extra spaces when copying/pasting
3. Try resetting password in Firebase Console:
   - Go to Authentication → Users
   - Click three dots next to user → "Reset Password"
   - Check your email for reset link

### Error: "Firebase not available"

**Solution:**
1. Check that all Firebase environment variables are set in `Onchainweb/.env`:
   ```bash
   grep VITE_FIREBASE Onchainweb/.env
   ```
2. Verify you have all 7 Firebase variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
3. See [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) for Firebase setup

### Cannot Access Dashboard After Login

**Solution:**
1. Clear browser cache and localStorage:
   - Open browser DevTools (F12)
   - Go to Application → Storage
   - Click "Clear site data"
2. Try logging in again
3. Check browser console for any errors

---

## Security Best Practices

### ✅ DO:

1. **Use a Password Manager**
   - Store credentials in 1Password, Bitwarden, or LastPass
   - Never store passwords in plain text files

2. **Create Strong Passwords**
   - Minimum 16 characters (20+ recommended)
   - Mix uppercase, lowercase, numbers, and special characters
   - Use password generator tools

3. **Enable Two-Factor Authentication (2FA)**
   - Go to Firebase Console → Authentication settings
   - Enable 2FA for additional security

4. **Rotate Passwords Regularly**
   - Change master password every 90 days
   - Update immediately if compromised

5. **Monitor Activity**
   - Review Firebase Console → Authentication → Users
   - Check last sign-in dates regularly
   - Disable inactive accounts

6. **Limit Access**
   - Only add necessary emails to allowlist
   - Create separate admin accounts with limited permissions
   - Don't share master account credentials

### ❌ DON'T:

1. **Never Share Credentials**
   - Don't send passwords via email, chat, or SMS
   - Don't write passwords on paper
   - Don't share screen while password is visible

2. **Never Store in Plain Text**
   - Don't save passwords in text files
   - Don't commit `.env` files to git (already in `.gitignore`)
   - Don't store in browser auto-fill without master password

3. **Never Use Weak Passwords**
   - Don't use "password123" or similar
   - Don't use personal information (birthdays, names)
   - Don't reuse passwords from other services

4. **Never Commit Secrets to Git**
   - `.env` file is in `.gitignore` - keep it there
   - Never commit credentials to version control
   - Use environment variables for deployment

---

## Creating Additional Admin Accounts

Once logged in as master, you can create additional admin accounts:

### From Master Dashboard:

1. Navigate to **"Admin Management"** section
2. Click **"Create Admin"** button
3. Fill in the form:
   - **Email:** New admin's email (e.g., `admin1@onchainweb.site`)
   - **Username:** Admin username (e.g., `admin1`)
   - **Password:** Generate a new secure password
   - **Permissions:** Select what features they can access
   - **User Access Mode:**
     - "All Users" - Can manage any user
     - "Assigned Only" - Can only manage specific users
4. Click **"Create Admin Account"**
5. Share credentials securely with the new admin (via password manager sharing feature)

### Admin vs Master Permissions:

| Feature | Master | Admin |
|---------|--------|-------|
| User Management | ✅ All users | ✅ Limited/Assigned |
| Admin Management | ✅ Yes | ❌ No |
| Financial Controls | ✅ Full | ⚠️ Configurable |
| System Settings | ✅ Yes | ❌ No |
| View Reports | ✅ Yes | ✅ Yes |
| Activity Logs | ✅ All | ✅ Own only |

---

## Post-Setup Checklist

After setting up your master account:

- [ ] Master account created in Firebase Console
- [ ] Password saved securely in password manager
- [ ] Environment variables configured in `.env`
- [ ] Able to login at `/master-admin` route
- [ ] Master Dashboard loads successfully
- [ ] All admin features accessible
- [ ] Temporary credential files deleted
- [ ] Firebase 2FA enabled (if available)
- [ ] Backup access configured (optional second master)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│  MASTER ACCOUNT QUICK REFERENCE                 │
├─────────────────────────────────────────────────┤
│  Email Format:  master@yourdomain.com           │
│  Password:      16+ chars, strong & unique      │
│  Local URL:     http://localhost:5173/master-admin │
│  Prod URL:      https://onchainweb.site/master-admin │
│  Role:          master (full permissions)       │
│  Storage:       Password manager (required)     │
└─────────────────────────────────────────────────┘
```

---

## Related Documentation

- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - Initial project setup
- [ADMIN_SYSTEM_SETUP_GUIDE.md](./ADMIN_SYSTEM_SETUP_GUIDE.md) - Full admin system details
- [ADMIN_USER_GUIDE.md](./ADMIN_USER_GUIDE.md) - How to use admin features
- [HOW_TO_CREATE_ADMIN_CREDENTIALS.md](./HOW_TO_CREATE_ADMIN_CREDENTIALS.md) - Additional admin setup info
- [SECURITY.md](./SECURITY.md) - Security policies and guidelines

---

## Support & Help

### If you're stuck:

1. **Check the Troubleshooting section** above
2. **Review browser console** for error messages (F12)
3. **Check Firebase Console logs** for authentication errors
4. **Verify all environment variables** are set correctly
5. **See existing documentation** in the links above

### Common Questions:

**Q: Can I change the master email later?**  
A: Yes, but you'll need to create a new Firebase user and update `VITE_ADMIN_ALLOWLIST`.

**Q: What if I forget my password?**  
A: Use Firebase Console → Authentication → Users → Reset Password, or create a new account.

**Q: Can I have multiple master accounts?**  
A: Yes, any email starting with `master@` or `master.` in the allowlist becomes a master account.

**Q: Is the backend/MongoDB required?**  
A: No, the platform now uses Firebase exclusively. The legacy backend is deprecated.

---

**Last Updated:** January 27, 2026  
**Version:** 2.0 (Firebase-first architecture)  
**Status:** ✅ Production Ready

---

## What's Next?

After setting up your master account:

1. ✅ **Create additional admin accounts** for your team
2. ✅ **Set up Firestore security rules** in Firebase Console
3. ✅ **Configure backup access** (second master account)
4. ✅ **Test all admin features** thoroughly
5. ✅ **Deploy to production** (see [DEPLOYMENT.md](./DEPLOYMENT.md))

---

**🎉 Congratulations!** You've successfully set up your master account password. You now have full control over the Snipe platform administration.
