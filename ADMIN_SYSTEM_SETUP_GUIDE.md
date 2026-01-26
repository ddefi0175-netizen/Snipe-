# Admin System Setup and Testing Guide

## Overview
This guide will help you set up and test the new admin control system with automatic user registration and master account management.

## Prerequisites
1. Firebase project configured
2. Firebase credentials in `.env` file
3. Admin feature enabled in `.env`

## Step 1: Environment Configuration

Edit `Onchainweb/.env` and ensure these variables are set:

```bash
# Enable Admin Features
VITE_ENABLE_ADMIN=true

# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Admin Allowlist (Required for admin access)
# Add master email - should start with 'master@' for auto-detection
VITE_ADMIN_ALLOWLIST=master@admin.yourdomain.com,admin1@admin.yourdomain.com

# Optional: Customize routes
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin
```

## Step 2: Install Dependencies

```bash
cd Onchainweb
npm install
```

## Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Step 4: Set Up Master Account

### First Time Setup

1. Navigate to: `http://localhost:5173/master-admin`

2. You'll see the Master Account Setup screen

3. Fill in:
   - **Master Email**: Use the email from `VITE_ADMIN_ALLOWLIST` (e.g., `master@admin.yourdomain.com`)
   - **Password**: Create a secure password (min 8 characters)
   - **Confirm Password**: Re-enter the password

4. Click "Create Master Account"

5. The system will:
   - Create the account in Firebase Authentication
   - Create an admin document in Firestore
   - Set up master permissions (all access)

6. You'll be redirected to the login page

### Subsequent Logins

1. Navigate to: `http://localhost:5173/master-admin`

2. The system will check if you're already authenticated

3. If not, you'll see the login screen

4. Enter:
   - **Username or Email**: Your master email
   - **Password**: Your master password

5. Click "Sign In"

## Step 5: Create Admin Accounts

Once logged in as master:

1. Click on "Activity & Logs" → "Admin Roles" in the sidebar

2. Fill in the "Add New Admin" form:
   - **Username**: Admin's username (e.g., "john_admin")
   - **Email**: Admin's email (e.g., "john@admin.yourdomain.com")
   - **Password**: Secure password (min 8 characters)
   - **User Access Mode**: 
     - "All Users" - Can manage any user
     - "Assigned Only" - Can only manage specifically assigned users
   - **Permissions**: Select which features this admin can access
   - **Max Users**: Maximum number of users this admin can manage (0 = unlimited)

3. Click "Create Admin Account"

4. The system will:
   - Create the account in Firebase Authentication
   - Create an admin document in Firestore with permissions
   - Show success message with login details

5. The new admin will appear in the admin list automatically

## Step 6: Test User Auto-Registration

1. Open the main app: `http://localhost:5173`

2. Click "Connect Wallet"

3. Select a wallet and connect

4. The system will automatically:
   - Create a user document in Firestore
   - Assign a unique user ID
   - Set up initial balance and profile
   - Trigger notification to admins

5. Go back to the Master Dashboard

6. Click "User Management" → "Users"

7. You should see the newly connected user in the list with:
   - Wallet address
   - Connection time
   - Initial balance (0)
   - VIP level (1)

## Step 7: Test Admin Login

1. Open a new incognito/private window

2. Navigate to: `http://localhost:5173/admin`

3. You'll see the Admin Login screen

4. Enter the credentials for the admin you created in Step 5

5. Click "Sign In"

6. You should see the Admin Panel with:
   - Only the permissions granted by master
   - Access to manage users (based on User Access Mode)
   - Limited features based on selected permissions

## Features Implemented

### ✅ Master Account System
- Automatic master account creation on first run
- Master account setup UI
- Master role with full permissions
- Secure password-based authentication

### ✅ Admin Management
- Create admin accounts from master dashboard
- Customize admin permissions (granular control)
- Set user access mode (all users vs assigned only)
- Set max user quota per admin
- Real-time admin list updates
- Admin activity logging

### ✅ User Auto-Registration
- Automatic user creation on wallet connect
- User documents stored in Firestore
- Real-time user list in admin dashboards
- User metadata (balance, VIP level, status)
- Referral code generation

### ✅ Login System
- Password-based login for admins and master
- No wallet connection required for admin access
- Session management with Firebase Auth
- Protected routes with authentication guards
- Automatic redirect after authentication

### ✅ Permission System
- Granular permission control per admin
- Master has all permissions by default
- Permissions enforced in UI and backend
- Real-time permission updates

## Firestore Collections Used

### `admins`
Stores admin account information:
```javascript
{
  uid: string,
  email: string,
  username: string,
  role: 'master' | 'admin',
  permissions: string[],
  userAccessMode: 'all' | 'assigned',
  assignedUserIds: string[],
  maxUsers: number,
  currentUserCount: number,
  status: 'active' | 'inactive',
  createdBy: string,
  createdAt: timestamp,
  lastLoginAt: timestamp
}
```

### `users`
Stores user account information:
```javascript
{
  wallet: string,
  walletNormalized: string,
  username: string,
  email: string | null,
  balance: number,
  points: number,
  vipLevel: number,
  status: 'active' | 'inactive',
  kycStatus: string,
  referralCode: string,
  createdAt: timestamp,
  lastConnectedAt: timestamp
}
```

## Troubleshooting

### Error: "Firebase not available"
- Check that all Firebase env variables are set
- Verify Firebase credentials are correct
- Check browser console for Firebase initialization errors

### Error: "Email not in admin allowlist"
- Verify `VITE_ADMIN_ALLOWLIST` includes the email
- Ensure emails are comma-separated with no spaces
- Restart dev server after changing `.env`

### Error: "Admin account not found in Firebase"
- Check Firebase Console → Authentication
- Verify the user exists
- Ensure email matches exactly

### Master account already exists
- This is normal for subsequent visits
- Just proceed to login with existing credentials

### Admin can't see users
- Check admin permissions in master dashboard
- Verify `userAccessMode` setting
- Check if user limit (`maxUsers`) has been reached

## Security Notes

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use strong passwords** - Min 8 characters, mix of letters, numbers, symbols
3. **Limit admin permissions** - Only grant necessary permissions
4. **Monitor admin activity** - Check activity logs regularly
5. **Review user access** - Audit admin access to user data
6. **Firestore Security Rules** - Ensure proper rules are set in Firebase Console

## Next Steps

After testing:
1. Set up Firestore security rules in Firebase Console
2. Configure proper indexes for queries
3. Set up monitoring and alerts
4. Configure backup strategy
5. Deploy to production

## Support

For issues or questions:
1. Check this guide
2. Review console logs in browser
3. Check Firebase Console for errors
4. Review the implementation code in:
   - `src/services/adminService.js`
   - `src/services/userService.js`
   - `src/components/AdminLogin.jsx`
   - `src/components/MasterAccountSetup.jsx`
   - `src/components/AdminRouteGuard.jsx`
