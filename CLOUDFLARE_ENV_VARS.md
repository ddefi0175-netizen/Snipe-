# Environment Variables for Cloudflare Pages

Copy and paste these into **Cloudflare Pages → Settings → Environment variables**

## Required Variables (2 total)

### Cloudflare Workers Configuration (1 variable)
Set this to your deployed Workers URL:

```
VITE_CLOUDFLARE_WORKER_URL=https://snipe-onchainweb.your-subdomain.workers.dev
```

Replace `your-subdomain` with your actual Cloudflare Workers subdomain after deployment.

### WalletConnect (1 variable)
Get your own free project ID from https://cloud.walletconnect.com

```
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

## Optional Variables

### App Configuration
```
VITE_APP_NAME=OnchainWeb
VITE_APP_URL=https://your-site.pages.dev
```

## How to Set in Cloudflare Pages

1. Go to your Cloudflare Pages project
2. Click **Settings** → **Environment variables**
3. Click **Add variable**
4. Enter variable name (e.g., `VITE_CLOUDFLARE_WORKER_URL`)
5. Enter value
6. Select environment (Production and/or Preview)
7. Click **Save**
8. Repeat for all variables
9. Trigger a new deployment (or push to your repo)

## Verification

After setting variables and deploying:
- Open browser console on your deployed site
- Look for "Cloudflare API initialized successfully" message
- Test wallet connection with MetaMask or WalletConnect
- Test chat functionality

## Important Notes

- All variables MUST start with `VITE_` for Vite to expose them
- Changes require a new deployment to take effect
- Set variables for both "Production" and "Preview" environments
- Never commit .env files to git (they contain secrets)

For detailed setup instructions, see `CLOUDFLARE_PAGES_SETUP.md`

