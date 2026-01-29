# Master Account Setup Guide

**Last Updated:** 2026-01-29  
**Status:** ✅ Complete Setup Instructions

---

## Overview

This guide will walk you through setting up master account access for the Snipe platform. Master accounts have full administrative privileges and can manage all aspects of the platform.

---

## Prerequisites

1. **Firebase Project**: You need a Firebase project with Authentication enabled
2. **Firebase Credentials**: API keys and configuration from Firebase Console
3. **Text Editor**: To edit the `.env` file
4. **Terminal/Command Line**: To run the development server

---

## Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** (or select existing project)
3. Follow the wizard to create your project:
   - Enter project name (e.g., "Snipe Platform")
   - Enable/disable Google Analytics (optional)
   - Click **"Create project"**

### Step 2: Enable Firebase Authentication

1. In Firebase Console, go to **Build** > **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"** provider:
   - Click on "Email/Password"
   - Toggle **"Enable"** to ON
   - Click **"Save"**

### Step 3: Create Master Account in Firebase

1. In Firebase Console, go to **Authentication** > **Users**
2. Click **"Add user"** button
3. Enter master account details:
   - **Email**: `master@onchainweb.site` (or your custom domain)
   - **Password**: Choose a strong password (minimum 8 characters required by Firebase, but 12+ characters recommended for security)
   - **Note**: Email MUST start with `master@` to be recognized as master account
4. Click **"Add user"**
5. **Save your password** - you'll need it to login

### Step 4: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) > **Project settings**
2. Scroll down to **"Your apps"** section
3. If no web app exists, click **"Add app"** > Web icon (`</>`)
   - App nickname: "Snipe Web App"
   - Firebase Hosting: Optional
   - Click **"Register app"**
4. Copy the `firebaseConfig` object values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",           // Copy this
     authDomain: "your-project.firebaseapp.com",  // Copy this
     projectId: "your-project",   // Copy this
     storageBucket: "your-project.appspot.com",   // Copy this
     messagingSenderId: "123456", // Copy this
     appId: "1:123:web:abc",      // Copy this
     measurementId: "G-ABC123"    // Copy this (optional)
   };
   ```

### Step 5: Configure Environment Variables

1. Navigate to the `Onchainweb` directory:
   ```bash
   cd /path/to/Snipe-/Onchainweb
   ```

2. Open the `.env` file in a text editor:
   ```bash
   nano .env
   # or
   code .env
   # or use any text editor
   ```

3. Update the Firebase configuration with your values:
   ```env
   # Enable Admin Features
   VITE_ENABLE_ADMIN=true
   
   # Admin Routes
   VITE_ADMIN_ROUTE=/admin
   VITE_MASTER_ADMIN_ROUTE=/master-admin
   
   # Master Account Allowlist
   VITE_ADMIN_ALLOWLIST=master@onchainweb.site
   
   # Firebase Configuration (paste your values)
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456
   VITE_FIREBASE_APP_ID=1:123:web:abc
   VITE_FIREBASE_MEASUREMENT_ID=G-ABC123
   
   # WalletConnect (optional but recommended)
   VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
   ```

4. Save the file

### Step 6: Install Dependencies

```bash
cd Onchainweb
npm install
```

### Step 7: Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5173`

### Step 8: Access Master Admin Dashboard

1. Open your browser and go to:
   ```
   http://localhost:5173/master-admin
   ```

2. You'll see the Master Admin Login page

3. Enter your credentials:
   - **Username**: `master` (or full email `master@onchainweb.site`)
   - **Password**: [the password you set in Firebase]

4. Click **"Sign In"**

5. You should now see the **Master Admin Dashboard** 🎉

---

## Master Account Email Format

**IMPORTANT:** Master accounts are identified by email prefix.

✅ **Valid Master Account Emails:**
- `master@gmail.com`
- `master@onchainweb.site`
- `master@yourdomain.com`
- `master@admin.example.com`

❌ **NOT Valid Master Account Emails:**
- `masteradmin@gmail.com` (doesn't start with `master@`)
- `admin@master.com` (doesn't start with `master@`)
- `john.master@gmail.com` (doesn't start with `master@`)
- `master.admin@gmail.com` (has `.` after master)

---

## Configuration Validator

The app includes a **Configuration Validator** that appears in development mode. It will show warnings if:

- Firebase credentials are missing
- Admin features are disabled
- Admin allowlist is empty
- No master account in allowlist

Look for the validator in the bottom-right corner of the screen.

---

## Troubleshooting

### Issue: "Admin features are disabled"

**Cause:** `VITE_ENABLE_ADMIN` is not set to `true`

**Solution:**
1. Open `Onchainweb/.env`
2. Set `VITE_ENABLE_ADMIN=true`
3. Save the file
4. Restart dev server: `npm run dev`

### Issue: "Email not in admin allowlist"

**Cause:** The email is not in `VITE_ADMIN_ALLOWLIST`

**Solution:**
1. Open `Onchainweb/.env`
2. Add your email to `VITE_ADMIN_ALLOWLIST`:
   ```env
   VITE_ADMIN_ALLOWLIST=master@onchainweb.site,admin@example.com
   ```
3. Save the file
4. Restart dev server

### Issue: "Admin account not found in Firebase"

**Cause:** The account doesn't exist in Firebase Authentication

**Solution:**
1. Go to Firebase Console > Authentication > Users
2. Create the account with the email from your allowlist
3. Make sure the email matches exactly (case-insensitive)
4. Try logging in again

### Issue: "Incorrect password"

**Cause:** Wrong password or account locked

**Solution:**
1. Go to Firebase Console > Authentication > Users
2. Find your account
3. Click the 3-dot menu > **"Reset password"**
4. Send password reset email or manually set a new password
5. Try logging in with the new password

### Issue: "404 Not Found" on /master-admin

**Cause:** Admin routes not enabled or server not restarted

**Solution:**
1. Check `VITE_ENABLE_ADMIN=true` in `.env`
2. Restart dev server completely:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
3. Clear browser cache if needed
4. Try accessing the route again

### Issue: "Firebase not available"

**Cause:** Firebase credentials are missing or incorrect

**Solution:**
1. Verify all Firebase env vars are set in `.env`
2. Check Firebase Console for correct values
3. Make sure there are no typos in the values
4. Restart dev server after changes

---

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** - Minimum 12 characters with mixed case, numbers, symbols
3. **Rotate credentials regularly** - Change passwords every 90 days
4. **Limit admin access** - Only add trusted emails to allowlist
5. **Monitor Firebase Auth logs** - Check for suspicious login attempts
6. **Enable 2FA** - Consider enabling multi-factor authentication in Firebase

---

## Production Deployment

For production deployment:

1. Create a separate Firebase project for production
2. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
3. Use different master account email for production
4. Enable Firebase App Check for additional security
5. Set up monitoring and alerts

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

---

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [FIX_MASTER_ACCOUNT_DOMAIN_LOGIN.md](./FIX_MASTER_ACCOUNT_DOMAIN_LOGIN.md) - Technical details about the fix
- [ADMIN_USER_GUIDE.md](./ADMIN_USER_GUIDE.md) - Complete admin feature guide
- [ADMIN_SYSTEM_SETUP_GUIDE.md](./ADMIN_SYSTEM_SETUP_GUIDE.md) - System setup guide

---

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Check the Configuration Validator warnings
3. Review the troubleshooting section above
4. Check Firebase Console for account status
5. Verify all environment variables are correctly set

---

**Status:** ✅ Ready to Use  
**Version:** 2.0  
**Last Updated:** January 29, 2026
