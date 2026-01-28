# Admin and Master Account Setup Guide

## Overview

This guide explains how to set up and configure admin and master accounts for the Snipe trading platform. Admin accounts use Firebase Authentication with email/password (no wallet required).

## Prerequisites

- Firebase project with Authentication enabled
- Firebase credentials configured in `.env` file
- Email/Password authentication provider enabled in Firebase Console

## Architecture

### Dual Authentication System

The platform supports two separate authentication methods:

1. **Regular Users**: Wallet-based authentication (MetaMask, Trust Wallet, etc.)
2. **Admin/Master Accounts**: Firebase email/password authentication (no wallet needed)

### Admin Hierarchy

- **Master Account**: Full platform control, can create admins, manage all settings
- **Admin Accounts**: Customizable permissions, can manage specific aspects or users

## Setup Instructions

### Step 1: Enable Email/Password Authentication in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `YOUR_FIREBASE_PROJECT_ID`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. Enable both:
   - ✅ Email/Password
   - ✅ Email link (passwordless sign-in) - Optional
6. Click **Save**

### Step 2: Create Admin Accounts in Firebase

#### Create Master Account

1. In Firebase Console, go to **Authentication** → **Users**
2. Click **Add user**
3. Enter credentials:
   - **Email**: `master@admin.onchainweb.app` (or your custom domain)
   - **Password**: Strong password (minimum 8 characters)
4. Click **Add user**
5. **Important**: Save these credentials securely!

#### Create Additional Admin Accounts (Optional)

Repeat the process for additional admins:
- **Email**: `admin1@admin.onchainweb.app`
- **Email**: `admin2@admin.onchainweb.app`
- etc.

**Email Format Guidelines**:
- For master: Use `master` prefix (e.g., `master@domain.com`)
- For admins: Use any name (e.g., `john@domain.com`, `support@domain.com`)
- Must be valid email format
- Use consistent domain (e.g., `@admin.onchainweb.app`)

### Step 3: Configure Environment Variables

Edit `Onchainweb/.env` file:

```bash
# Enable admin features
VITE_ENABLE_ADMIN=true

# Admin routes (keep default or customize)
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin

# Add all admin emails (comma-separated, lowercase)
VITE_ADMIN_ALLOWLIST=master@admin.onchainweb.app,admin1@admin.onchainweb.app
```

**Important Notes**:
- Emails must match exactly (case-insensitive)
- Use comma separation without spaces
- Must match Firebase Authentication user emails
- Master email should include "master" for automatic role detection

### Step 4: Restart the Development Server

```bash
cd Onchainweb
npm run dev
```

The admin routes will now be accessible.

### Step 5: Access Admin Dashboards

#### Master Admin Dashboard

1. Navigate to: `http://localhost:5173/master-admin`
2. Login with master credentials:
   - **Username**: `master` (or full email `master@admin.onchainweb.app`)
   - **Password**: Your Firebase password

#### Admin Panel

1. Navigate to: `http://localhost:5173/admin`
2. Login with admin credentials:
   - **Username**: `admin1` (or full email)
   - **Password**: Your Firebase password

## Features

### Master Account Capabilities

✅ **Full Platform Control**:
- Create and manage admin accounts
- View and edit all users
- Manage deposits and withdrawals
- Control trading parameters
- Access all system settings
- View real-time data from Firebase

✅ **Real-Time Data Access**:
- Live user list with real-time updates
- Active trades monitoring
- Deposit/withdrawal requests
- Chat messages from users
- Activity logs and audit trails

### Admin Account Capabilities

Admins have customizable permissions (set by master):
- `manageUsers` - View and edit user profiles
- `manageBalances` - Modify user balances
- `manageKYC` - Review KYC submissions
- `manageTrades` - Monitor trades
- `viewReports` - Access analytics
- `manageDeposits` - Process deposits
- `manageWithdrawals` - Approve withdrawals
- `customerService` - Support tickets
- `viewLogs` - System audit logs
- `siteSettings` - Platform settings
- `createAdmins` - Create admin accounts

## Real-Time Data

All admin and master dashboards use **Firebase Firestore** with real-time listeners:

### Data Sources

- **Users**: Real-time synchronization via `subscribeToUsers()`
- **Deposits**: Instant updates via `subscribeToDeposits()`
- **Withdrawals**: Live notifications via `subscribeToWithdrawals()`
- **Trades**: Real-time monitoring via `subscribeToTrades()`
- **Chat**: WebSocket-based chat via `subscribeToChatMessages()`

### Performance

- Updates delivered in < 50ms (WebSocket)
- No polling required
- Automatic reconnection on connection loss
- Efficient bandwidth usage

## Security

### Best Practices

1. **Strong Passwords**:
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Never share or commit to code

2. **Allowlist Management**:
   - Only add trusted admin emails
   - Review allowlist regularly
   - Remove inactive admins promptly

3. **Firebase Security**:
   - Enable 2FA for Firebase Console access
   - Use Firebase Security Rules
   - Monitor Authentication logs
   - Set up alerts for suspicious activity

4. **Environment Variables**:
   - Never commit `.env` file to repository
   - Use different credentials for dev/staging/prod
   - Rotate passwords regularly

### Firebase Security Rules

Ensure your `firestore.rules` file includes proper admin access controls:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admin access only to authenticated admin users
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email.matches('.*@admin\\.onchainweb\\.app$');
    }
    
    function isMaster() {
      return request.auth != null && 
             request.auth.token.email.matches('^master@.*');
    }
    
    // Users collection - admin read access
    match /users/{userId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Deposits collection - admin access
    match /deposits/{depositId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Admins collection - master only
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if isMaster();
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Troubleshooting

### Issue: Cannot Access Admin Routes

**Symptoms**: 404 error or redirect to home page

**Solutions**:
1. Verify `VITE_ENABLE_ADMIN=true` in `.env`
2. Restart dev server after changing `.env`
3. Check browser console for errors
4. Verify Firebase credentials are correct

### Issue: Login Fails

**Symptoms**: "Admin account not found" or "Incorrect password"

**Solutions**:
1. Verify email exists in Firebase Authentication
2. Check email spelling (case-insensitive)
3. Ensure email is in `VITE_ADMIN_ALLOWLIST`
4. Try full email instead of username
5. Reset password in Firebase Console if needed

### Issue: "Not Authorized" After Login

**Symptoms**: Login succeeds but shows authorization error

**Solutions**:
1. Check email is in `VITE_ADMIN_ALLOWLIST`
2. Verify allowlist format (comma-separated, no spaces)
3. Ensure lowercase emails in allowlist
4. Clear browser localStorage and try again

### Issue: Real-Time Data Not Loading

**Symptoms**: Dashboard shows loading or empty data

**Solutions**:
1. Check browser console for Firebase errors
2. Verify Firestore security rules allow admin access
3. Check Firebase project is active
4. Ensure network connection is stable
5. Test Firestore connection in Firebase Console

### Issue: Firebase Authentication Not Configured

**Symptoms**: "Firebase not available" error

**Solutions**:
1. Verify all `VITE_FIREBASE_*` variables are set in `.env`
2. Check Firebase configuration is correct
3. Ensure Firebase project exists
4. Test Firebase initialization in browser console

## Testing

### Manual Testing Checklist

#### Master Login Test
- [ ] Navigate to `/master-admin`
- [ ] Enter master credentials
- [ ] Verify successful login
- [ ] Check dashboard loads with data
- [ ] Verify real-time updates work
- [ ] Test logout functionality

#### Admin Login Test
- [ ] Navigate to `/admin`
- [ ] Enter admin credentials
- [ ] Verify successful login
- [ ] Check permissions are correct
- [ ] Verify assigned data loads
- [ ] Test logout functionality

#### Real-Time Data Test
- [ ] Create test user in Firebase
- [ ] Verify appears in admin dashboard
- [ ] Update user balance
- [ ] Check real-time update in dashboard
- [ ] Create test deposit
- [ ] Verify appears in pending list

### Automated Testing

Run the verification script:

```bash
cd /home/runner/work/Snipe-/Snipe-
./test-login-functionality.sh
```

Expected output:
```
✅ Firebase Authentication setup complete
✅ Admin routes are enabled
✅ Admin allowlist configured
✅ Login functionality working
```

## Production Deployment

### Vercel Deployment

1. **Set Environment Variables in Vercel**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all `VITE_*` variables from `.env`
   - **Important**: Set `VITE_ENABLE_ADMIN=true` only for production
   - Add `VITE_ADMIN_ALLOWLIST` with production admin emails

2. **Deploy**:
   ```bash
   git push origin main
   ```

3. **Verify**:
   - Visit `https://yourdomain.com/master-admin`
   - Test login with production credentials
   - Verify real-time data works

### Security Considerations for Production

1. **Use HTTPS Only**: Admin routes must use HTTPS in production
2. **Strong Passwords**: Enforce strong password policy
3. **IP Allowlisting**: Consider adding IP-based restrictions
4. **Audit Logging**: Enable Firebase audit logs
5. **Regular Backups**: Back up Firestore data regularly
6. **Monitor Activity**: Set up alerts for admin actions

## Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Admin User Guide](ADMIN_USER_GUIDE.md)
- [Real-Time Data Architecture](REALTIME_DATA_ARCHITECTURE.md)
- [Backend Replacement Guide](BACKEND_REPLACEMENT.md)

## Support

For issues or questions:
- Check Firebase Console logs
- Review browser console errors
- Test API endpoints manually
- Contact: ddefi0175@gmail.com

---

**Last Updated**: January 2026  
**Version**: 2.0.0
