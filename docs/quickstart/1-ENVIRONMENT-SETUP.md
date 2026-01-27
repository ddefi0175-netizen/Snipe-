# Step 1: Environment Setup

**Estimated time:** 5 minutes

## Overview

Configure Firebase credentials and environment variables for your application.

## Prerequisites

- Firebase project created
- Firebase CLI installed
- Node.js 18+ installed

## Steps

### 1. Create Environment File

```bash
cd Onchainweb
cp .env.example .env
```

If `.env.example` doesn't exist, create a new `.env` file:

```bash
touch .env
```

### 2. Configure Firebase Credentials

Add these required variables to `Onchainweb/.env`:

```env
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# WalletConnect (Required for wallet connections)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Admin Access Control (Required)
VITE_ADMIN_ALLOWLIST=admin@yourdomain.com,master@yourdomain.com
```

### 3. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon → Project settings
4. Scroll to "Your apps" section
5. If no web app exists, click "Add app" → Web
6. Copy the config values to your `.env` file

### 4. Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign in or create an account
3. Create a new project
4. Copy the Project ID to `VITE_WALLETCONNECT_PROJECT_ID`

### 5. Configure Admin Allowlist

Set the master admin email in `VITE_ADMIN_ALLOWLIST`:

```env
VITE_ADMIN_ALLOWLIST=master@yourdomain.com
```

**Important:**
- Use a real email you control
- Multiple emails can be comma-separated
- This email will be used to create the master account

### 6. Validate Configuration

Run the validation script:

```bash
cd ..
./validate-config.sh
```

Or use the automated setup:

```bash
./setup-environment.sh
```

## Verification

✅ `.env` file exists in `Onchainweb/` directory
✅ All 8 Firebase variables are set
✅ WalletConnect Project ID is set
✅ Admin allowlist contains at least one email
✅ Validation script passes

## Next Step

[Step 2: Firestore Deployment →](2-FIRESTORE-DEPLOYMENT.md)
