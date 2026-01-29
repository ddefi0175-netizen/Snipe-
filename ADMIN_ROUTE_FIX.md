# Admin Route Fix Guide

## Issue
The `/master-admin` and `/admin` routes were not accessible (404 or blank page).

## Root Cause
The admin routes are conditionally rendered based on the `VITE_ENABLE_ADMIN` environment variable. Without a `.env` file in the `Onchainweb/` directory with this variable set to `true`, the routes were not being rendered in the application.

## Solution

### Step 1: Create Environment File
Create a `.env` file in the `Onchainweb/` directory:

```bash
cd Onchainweb
cp .env.example .env
```

### Step 2: Enable Admin Routes
Open the `.env` file and ensure these lines are present:

```bash
# Enable admin and master routes
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin
VITE_ADMIN_ALLOWLIST=master@onchainweb.site
```

### Step 3: Configure Firebase (Required)
The admin system requires Firebase Authentication. Add your Firebase configuration to the `.env` file:

```bash
VITE_FIREBASE_API_KEY=your-firebase-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

Get your Firebase credentials from: https://console.firebase.google.com
- Go to Project Settings → General → Your apps → SDK setup and configuration

### Step 4: Restart Development Server
```bash
npm run dev
```

## Verification

After following these steps, you should be able to access:

1. **Master Admin Portal**: http://localhost:5173/master-admin
   - Requires master role authentication
   - Shows login page for authorized personnel

2. **Regular Admin Panel**: http://localhost:5173/admin
   - Requires admin role authentication
   - Shows login page for admin users

## Security Notes

⚠️ **Important Security Considerations:**

1. The `.env` file is automatically excluded from git via `.gitignore`
2. Never commit `.env` files with real credentials to version control
3. Use different credentials for development and production
4. The `VITE_ADMIN_ALLOWLIST` controls which email addresses can access admin routes
5. Admin authentication is handled through Firebase Auth

## Architecture

The admin system works as follows:

1. **Environment Check**: `constants.js` reads `VITE_ENABLE_ADMIN` from environment
2. **Route Configuration**: `main.jsx` conditionally renders admin routes based on `ADMIN_GUARD.ENABLED`
3. **Authentication Guard**: `AdminRouteGuard.jsx` verifies user authentication and role
4. **Firebase Integration**: Admin users must authenticate through Firebase Auth
5. **Role-Based Access**: Master admins have full access, regular admins have limited access

## Files Involved

- `Onchainweb/.env` - Environment configuration (create from `.env.example`)
- `Onchainweb/src/config/constants.js` - Reads and exports configuration
- `Onchainweb/src/main.jsx` - Defines routes conditionally
- `Onchainweb/src/components/AdminRouteGuard.jsx` - Handles authentication
- `Onchainweb/src/components/MasterAdminDashboard.jsx` - Master admin interface
- `Onchainweb/src/components/AdminPanel.jsx` - Regular admin interface

## Troubleshooting

### Routes still not accessible?

1. **Check environment variable is loaded:**
   ```bash
   # In browser console on the admin route
   console.log(import.meta.env.VITE_ENABLE_ADMIN)
   ```
   Should output: `"true"`

2. **Verify server restart:**
   - Stop the dev server (Ctrl+C)
   - Start it again: `npm run dev`
   - Vite must be restarted for .env changes to take effect

3. **Check .env file location:**
   - Must be in `Onchainweb/.env` (not in root directory)
   - Must not have any extra spaces or quotes around values

4. **Verify Firebase configuration:**
   - Check browser console for Firebase initialization errors
   - Ensure all Firebase environment variables are set correctly

### Login page shows but can't login?

This is expected behavior. The admin system requires:
1. Firebase project to be properly configured
2. Admin user accounts to be created in Firebase Auth
3. Admin documents to be created in Firestore `admins` collection

Refer to `ADMIN_SYSTEM_SETUP_GUIDE.md` for complete setup instructions.

## Production Deployment

For production deployment (Vercel/Netlify/etc.):

1. Add environment variables in your hosting platform's dashboard
2. Never use `.env` files in production - use platform environment variables
3. Ensure `VITE_ENABLE_ADMIN=true` is set in production environment
4. Update `VITE_ADMIN_ALLOWLIST` with production admin emails

## Related Documentation

- [ADMIN_SYSTEM_SETUP_GUIDE.md](./ADMIN_SYSTEM_SETUP_GUIDE.md) - Complete admin system setup
- [ADMIN_USER_GUIDE.md](./ADMIN_USER_GUIDE.md) - Admin user guide
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - General setup guide
- [BACKEND_REPLACEMENT.md](./BACKEND_REPLACEMENT.md) - Firebase architecture
