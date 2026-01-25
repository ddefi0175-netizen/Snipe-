# Environment Variables for Cloudflare Pages

Copy and paste these into **Cloudflare Pages → Settings → Environment variables**

## Required Variables (8 total)

### Firebase Configuration (7 variables)
Get from: Firebase Console → Project Settings → General → Your apps → SDK setup

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### WalletConnect (1 variable)
Get from: https://cloud.walletconnect.com

```
VITE_WALLETCONNECT_PROJECT_ID=abc123...
```

## Optional Variables

### Admin Features
```
VITE_ENABLE_ADMIN=true
VITE_ADMIN_ALLOWLIST=admin@example.com,master@example.com
```

### App Configuration
```
VITE_APP_NAME=OnchainWeb
VITE_APP_URL=https://your-site.pages.dev
```

## How to Set in Cloudflare Pages

1. Go to your Cloudflare Pages project
2. Click **Settings** → **Environment variables**
3. Click **Add variable**
4. Enter variable name (e.g., `VITE_FIREBASE_API_KEY`)
5. Enter value
6. Select environment (Production and/or Preview)
7. Click **Save**
8. Repeat for all variables
9. Trigger a new deployment (or push to your repo)

## Verification

After setting variables and deploying:
- Open browser console on your deployed site
- Look for "Firebase initialized successfully" message
- No "Firebase config incomplete" warnings should appear

## Important Notes

- All variables MUST start with `VITE_` for Vite to expose them
- Changes require a new deployment to take effect
- Set variables for both "Production" and "Preview" environments
- Never commit .env files to git (they contain secrets)

For detailed setup instructions, see `CLOUDFLARE_PAGES_SETUP.md`
