# Cloudflare Pages Deployment Guide

This guide will help you deploy Snipe to Cloudflare Pages with the correct configuration and environment variables.

## Prerequisites

1. A Cloudflare account ([Sign up here](https://dash.cloudflare.com/sign-up))
2. A Firebase project ([Create one here](https://console.firebase.google.com))
3. A WalletConnect project ID ([Get one here](https://cloud.walletconnect.com))
4. Your GitHub repository connected to Cloudflare Pages

## Step 1: Configure Cloudflare Pages Build Settings

### Build Configuration
- **Build command**: `cd Onchainweb && npm install && npm run build`
- **Build output directory**: `Onchainweb/dist`
- **Root directory**: `/` (leave as project root)
- **Node.js version**: 20.x or higher

### Framework preset
- Select: **None** (we're using Vite, which is handled automatically)

## Step 2: Set Environment Variables in Cloudflare Pages

Go to your Cloudflare Pages project → **Settings** → **Environment variables** and add the following:

### Required: Firebase Configuration

These are **REQUIRED** for the app to function. Get them from [Firebase Console](https://console.firebase.google.com) → Your Project → Project Settings → General → Your apps → SDK setup and configuration.

```bash
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Required: WalletConnect Configuration

Required for wallet connections to work. Get from [WalletConnect Cloud](https://cloud.walletconnect.com).

```bash
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### Optional: App Configuration

```bash
VITE_APP_NAME=OnchainWeb
VITE_APP_URL=https://your-domain.pages.dev
```

### Optional: Admin Configuration

If you want to enable admin features:

```bash
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin
VITE_ADMIN_ALLOWLIST=master@admin.example.com,admin@admin.example.com
```

**Important**: Create these admin accounts in Firebase Console → Authentication → Users first, then add their emails to the allowlist (comma-separated).

### Optional: Feature Flags

```bash
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

## Step 3: Deploy

1. **Push your changes** to your GitHub repository
2. Cloudflare Pages will **automatically build and deploy**
3. Monitor the build logs in the Cloudflare Pages dashboard

## Step 4: Verify Deployment

After deployment completes:

1. ✅ Visit your deployed URL (e.g., `https://your-project.pages.dev`)
2. ✅ Check browser console for any errors
3. ✅ Test wallet connection (MetaMask, WalletConnect, etc.)
4. ✅ If admin enabled, test admin login at `/admin` or `/master-admin`

## Troubleshooting

### Build Fails with "Missing environment variables"

**Solution**: Ensure all required Firebase variables are set in Cloudflare Pages environment variables.

### "Firebase not available" warning in console

**Solution**: Check that all 7 Firebase environment variables are correctly set and start with `VITE_`.

### Wallet connections not working

**Solution**: Verify `VITE_WALLETCONNECT_PROJECT_ID` is set correctly.

### Admin panel not accessible

**Solution**: 
1. Set `VITE_ENABLE_ADMIN=true`
2. Create admin accounts in Firebase Authentication first
3. Add their emails to `VITE_ADMIN_ALLOWLIST` (comma-separated)

### Build succeeds but site shows blank page

**Solution**: Check browser console for errors. Usually this means environment variables are missing or incorrect.

## Environment Variables Checklist

Use this checklist when setting up Cloudflare Pages:

- [ ] `VITE_FIREBASE_API_KEY` - From Firebase Console
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - From Firebase Console
- [ ] `VITE_FIREBASE_PROJECT_ID` - From Firebase Console
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - From Firebase Console
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - From Firebase Console
- [ ] `VITE_FIREBASE_APP_ID` - From Firebase Console
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` - From Firebase Console
- [ ] `VITE_WALLETCONNECT_PROJECT_ID` - From WalletConnect Cloud
- [ ] `VITE_ENABLE_ADMIN` - Optional, set to `true` if needed
- [ ] `VITE_ADMIN_ALLOWLIST` - Optional, comma-separated admin emails

## Firebase Setup

If you haven't set up Firebase yet:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable **Firestore Database** (in Build → Firestore Database)
4. Enable **Authentication** (in Build → Authentication → Get started)
5. Add **Email/Password** as a sign-in provider
6. Copy your Firebase configuration values to Cloudflare Pages environment variables

## Important Notes

- **All environment variables must start with `VITE_`** for Vite to expose them to the browser
- Environment variables are set **per environment** in Cloudflare Pages (Production vs Preview)
- Changes to environment variables require a **new deployment** to take effect
- The `wrangler.toml` file in the repository root contains the build configuration

## Need Help?

- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Check the [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- Review the [WalletConnect Documentation](https://docs.walletconnect.com)
- See `DEPLOYMENT.md` for general deployment information
- See `QUICK_START_GUIDE.md` for local development setup
