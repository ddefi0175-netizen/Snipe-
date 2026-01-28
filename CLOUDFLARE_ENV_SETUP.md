# Cloudflare Pages Environment Variables Setup

## ⚠️ IMPORTANT: Build Settings First!

**Before setting environment variables, ensure your build settings are correct:**

Go to: **Cloudflare Dashboard → Pages → Your Project → Settings → Builds & deployments**

Set these values:
- **Build command:** `cd Onchainweb && npm install && npm run build`
- **Build output directory:** `Onchainweb/dist`
- **Root directory:** `/` (leave as project root)

❌ **Common Error:** If you see `npm error path /opt/buildhome/repo/package.json`, your build command is incorrect. Make sure it starts with `cd Onchainweb &&`

---

## Environment Variables Setup

Go to: **Cloudflare Dashboard → Pages → Your Project → Settings → Environment variables**

Click **"Add variable"** for each entry below:

---

## Required Variables (8 total)

### Variable 1: Firebase API Key
- **Name:** `VITE_FIREBASE_API_KEY`
- **Value:** `YOUR_FIREBASE_API_KEY_HERE`

### Variable 2: Firebase Auth Domain
- **Name:** `VITE_FIREBASE_AUTH_DOMAIN`
- **Value:** `onchainweb-37d30.firebaseapp.com`

### Variable 3: Firebase Project ID
- **Name:** `VITE_FIREBASE_PROJECT_ID`
- **Value:** `onchainweb-37d30`

### Variable 4: Firebase Storage Bucket
- **Name:** `VITE_FIREBASE_STORAGE_BUCKET`
- **Value:** `onchainweb-37d30.firebasestorage.app`

### Variable 5: Firebase Messaging Sender ID
- **Name:** `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value:** `766146811888`

### Variable 6: Firebase App ID
- **Name:** `VITE_FIREBASE_APP_ID`
- **Value:** `1:766146811888:web:a96012963dffe31508ef35`

### Variable 7: Firebase Measurement ID
- **Name:** `VITE_FIREBASE_MEASUREMENT_ID`
- **Value:** `G-1QDHSDQKDY`

### Variable 8: WalletConnect Project ID
- **Name:** `VITE_WALLETCONNECT_PROJECT_ID`
- **Value:** `N64KYvAPcdvA92IVWUverUJwtTmNW00jMX2JTYoI`

---

## Optional Admin Variables (if you need admin access)

### Variable 9: Enable Admin
- **Name:** `VITE_ENABLE_ADMIN`
- **Value:** `true`

### Variable 10: Admin Route
- **Name:** `VITE_ADMIN_ROUTE`
- **Value:** `/admin`

### Variable 11: Master Admin Route
- **Name:** `VITE_MASTER_ADMIN_ROUTE`
- **Value:** `/master-admin`

---

## Step-by-Step Instructions

1. Log in to **Cloudflare Dashboard**
2. Go to **Pages** → Select your project
3. Click **Settings** → **Environment variables**
4. For each variable above:
   - Click **"Add variable"**
   - Copy the **Name** (e.g., `VITE_FIREBASE_API_KEY`)
   - Copy the **Value** (e.g., `YOUR_FIREBASE_API_KEY_HERE`)
   - Select environment: **Production** (and **Preview** if needed)
   - Click **Save**
5. After adding all variables, trigger a new deployment

---

## Quick Copy-Paste Format (All 8 Required Variables)

If your Cloudflare interface supports bulk import, use this format:

```
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=onchainweb-37d30.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=onchainweb-37d30
VITE_FIREBASE_STORAGE_BUCKET=onchainweb-37d30.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=766146811888
VITE_FIREBASE_APP_ID=1:766146811888:web:a96012963dffe31508ef35
VITE_FIREBASE_MEASUREMENT_ID=G-1QDHSDQKDY
VITE_WALLETCONNECT_PROJECT_ID=N64KYvAPcdvA92IVWUverUJwtTmNW00jMX2JTYoI
```

---

## Verification

After setting all variables and deploying:
- ✅ Site should load without errors
- ✅ Browser console shows "Firebase initialized successfully"
- ✅ Wallet connections work (MetaMask, WalletConnect)

---

## Troubleshooting Common Build Errors

### Error: "Could not read package.json: ENOENT"
```
npm error path /opt/buildhome/repo/package.json
npm error errno -2
npm error enoent Could not read package.json
```

**Cause:** Build command is not pointing to the Onchainweb directory.

**Solution:**
1. Go to **Cloudflare Dashboard → Pages → Your Project → Settings → Builds & deployments**
2. Click **"Edit configuration"**
3. Set **Build command** to: `cd Onchainweb && npm install && npm run build`
4. Set **Build output directory** to: `Onchainweb/dist`
5. Click **Save**
6. Trigger a new deployment

### Error: "Cannot use assets with a binding in an assets-only Worker"
```
✘ [ERROR] Cannot use assets with a binding in an assets-only Worker.
Please remove the asset binding from your configuration file
```

**Cause:** The `wrangler.jsonc` file has an assets binding which conflicts with Pages-only deployment.

**Solution:** This PR fixes this issue by removing the `binding` property from `wrangler.jsonc`. The configuration now correctly deploys as a static Pages site.

If you see this error:
1. Ensure you've merged this PR (commit f0a95f8 or later)
2. Trigger a new deployment

### Error: "Invalid _redirects configuration: Infinite loop detected"
```
✘ [ERROR] Invalid _redirects configuration:
Line 1: Infinite loop detected in this rule
```

**Cause:** The `_redirects` file contains a catch-all rule (`/*`) that Cloudflare Pages detects as causing an infinite loop.

**Solution:** This PR fixes this by removing the `_redirects` file. Cloudflare Pages automatically handles SPA routing using the `404.html` file as a fallback for client-side routing.

### Error: "Rollup failed to resolve import firebase/app"
**Cause:** Environment variables not set or Firebase package missing.

**Solution:**
1. Ensure all 8 environment variables are set (see above)
2. Verify the Firebase package is in dependencies (this PR adds it)
3. Trigger a new deployment

---

## Important Notes

- **All variable names must be EXACTLY as shown** (case-sensitive)
- **All variables must start with `VITE_`** (Vite requirement)
- Set variables for **both Production and Preview** environments
- After adding variables, you must **trigger a new deployment** for changes to take effect
