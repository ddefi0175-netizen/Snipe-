# Environment Variables Documentation

Complete reference for all environment variables used in the Snipe platform.

## 📋 Table of Contents

- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Workers Variables](#workers-variables)
- [Security Variables](#security-variables)
- [Platform-Specific Setup](#platform-specific-setup)

---

## Required Variables

These environment variables **MUST** be set for the application to function.

### Firebase Configuration

#### `VITE_FIREBASE_API_KEY`
- **Required**: Yes
- **Description**: Firebase Web API key
- **Example**: `AIzaSyC1234567890abcdefghijklmnopqrs`
- **Where to get**: Firebase Console → Project Settings → General → Web API Key
- **Security**: Can be public (restricted by Firebase security rules)

#### `VITE_FIREBASE_AUTH_DOMAIN`
- **Required**: Yes
- **Description**: Firebase authentication domain
- **Example**: `your-project.firebaseapp.com`
- **Where to get**: Firebase Console → Project Settings → General

#### `VITE_FIREBASE_PROJECT_ID`
- **Required**: Yes
- **Description**: Firebase project ID
- **Example**: `your-project-id`
- **Where to get**: Firebase Console → Project Settings → General

#### `VITE_FIREBASE_STORAGE_BUCKET`
- **Required**: Yes
- **Description**: Firebase Storage bucket name
- **Example**: `your-project.appspot.com`
- **Where to get**: Firebase Console → Project Settings → General

#### `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Required**: Yes
- **Description**: Firebase Cloud Messaging sender ID
- **Example**: `123456789012`
- **Where to get**: Firebase Console → Project Settings → Cloud Messaging

#### `VITE_FIREBASE_APP_ID`
- **Required**: Yes
- **Description**: Firebase app ID
- **Example**: `1:123456789012:web:abcdef1234567890`
- **Where to get**: Firebase Console → Project Settings → General

### WalletConnect

#### `VITE_WALLETCONNECT_PROJECT_ID`
- **Required**: Yes
- **Description**: WalletConnect Cloud project ID
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **Where to get**: [WalletConnect Cloud](https://cloud.walletconnect.com)
- **Note**: Free plan available; required for WalletConnect QR code connections

---

## Optional Variables

These variables enhance functionality but aren't required for basic operation.

### Application Configuration

#### `VITE_APP_NAME`
- **Required**: No
- **Default**: `OnchainWeb`
- **Description**: Application display name
- **Example**: `Snipe Trading Platform`

#### `VITE_APP_URL`
- **Required**: No
- **Default**: `https://onchainweb.app`
- **Description**: Public URL for meta tags and sharing
- **Example**: `https://your-domain.com`

### Admin Configuration

#### `VITE_ENABLE_ADMIN`
- **Required**: No
- **Default**: `false`
- **Description**: Enable admin and master admin routes
- **Values**: `true` | `false`
- **Production**: Should be `true` for platforms requiring admin access

#### `VITE_ADMIN_ROUTE`
- **Required**: No
- **Default**: `/admin`
- **Description**: URL path for admin panel
- **Example**: `/dashboard/admin`

#### `VITE_MASTER_ADMIN_ROUTE`
- **Required**: No
- **Default**: `/master-admin`
- **Description**: URL path for master admin panel
- **Example**: `/dashboard/master`

#### `VITE_ADMIN_ALLOWLIST`
- **Required**: No (Required if admin enabled)
- **Description**: Comma-separated list of allowed admin emails
- **Example**: `master@onchainweb.site,admin1@company.com`
- **Note**: Emails must match Firebase Auth emails

### Telegram Integration

#### `VITE_TELEGRAM_BOT_TOKEN`
- **Required**: No
- **Description**: Telegram bot token for notifications
- **Example**: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
- **Where to get**: [@BotFather](https://t.me/botfather) on Telegram

#### `VITE_TELEGRAM_CHAT_ID`
- **Required**: No (Required if bot token set)
- **Description**: Telegram chat/channel ID for messages
- **Example**: `123456789` or `@channel_name`
- **Where to get**: Use [@userinfobot](https://t.me/userinfobot) to get your chat ID

### Cloudflare TURN Server

#### `VITE_CLOUDFLARE_TURN_SERVER_NAME`
- **Required**: No
- **Description**: Cloudflare TURN server name for WebRTC
- **Example**: `turn.example.com`
- **Where to get**: Cloudflare Dashboard → Calls

#### `VITE_CLOUDFLARE_TURN_TOKEN_ID`
- **Required**: No (Required if TURN server set)
- **Description**: Cloudflare TURN token ID
- **Where to get**: Cloudflare Dashboard → Calls

#### `VITE_CLOUDFLARE_TURN_API_TOKEN`
- **Required**: No (Required if TURN server set)
- **Description**: Cloudflare TURN API token
- **Where to get**: Cloudflare Dashboard → Calls

---

## Security Variables

### Logging and Debugging

#### `VITE_ENABLE_DEBUG`
- **Required**: No
- **Default**: `false`
- **Description**: Enable debug logging
- **Values**: `true` | `false`
- **Production**: **MUST** be `false`
- **Development**: Can be `true`

#### `VITE_LOG_LEVEL`
- **Required**: No
- **Default**: `error`
- **Description**: Logging level
- **Values**: `debug` | `info` | `warn` | `error`
- **Production**: Should be `error`
- **Development**: Can be `debug`

### Deposit Addresses

#### `VITE_DEPOSIT_BTC`
- **Required**: No (Recommended for production)
- **Description**: Bitcoin deposit address
- **Example**: `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`
- **Note**: Falls back to hardcoded default if not set

#### `VITE_DEPOSIT_USDT_TRC20`
- **Required**: No (Recommended for production)
- **Description**: USDT (TRC-20) deposit address
- **Example**: `TXrvyV2A4sA41Z2V1Z2v4Z1v2Z2V1Z2v4Z`

#### `VITE_DEPOSIT_USDT_ERC20`
- **Required**: No (Recommended for production)
- **Description**: USDT (ERC-20) deposit address
- **Example**: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

### Authentication

#### `VITE_ENABLE_STRICT_AUTH`
- **Required**: No
- **Default**: `true`
- **Description**: Enable strict authentication checks
- **Values**: `true` | `false`
- **Production**: **MUST** be `true`

#### `VITE_RATE_LIMIT_PER_MINUTE`
- **Required**: No
- **Default**: `100`
- **Description**: Rate limit for API requests
- **Example**: `100`
- **Note**: Enforced by Cloudflare Workers

---

## Workers Variables

These variables are used by Cloudflare Workers for server-side operations.

### Firebase Admin SDK

#### `FIREBASE_PRIVATE_KEY`
- **Required**: Yes (for Workers)
- **Description**: Firebase Admin SDK private key
- **Where to get**: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- **Security**: **MUST** be set via `wrangler secret put`, never in .env
- **Format**: Full private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

#### `FIREBASE_CLIENT_EMAIL`
- **Required**: Yes (for Workers)
- **Description**: Firebase Admin SDK service account email
- **Example**: `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
- **Where to get**: Same JSON file as private key
- **Security**: Can be set via `wrangler secret put` or in wrangler.toml vars

#### `FIREBASE_PROJECT_ID`
- **Required**: Yes (for Workers)
- **Description**: Firebase project ID (same as frontend)
- **Example**: `your-project-id`
- **Security**: Public, can be in wrangler.toml

### Rate Limiting

#### `RATE_LIMIT_REQUESTS_PER_MINUTE`
- **Required**: No
- **Default**: `100`
- **Description**: Maximum requests per minute per IP
- **Example**: `100`

#### `RATE_LIMIT_WINDOW_SECONDS`
- **Required**: No
- **Default**: `60`
- **Description**: Time window for rate limiting
- **Example**: `60`

### Storage Security

#### `ENABLE_STORAGE_AUTH`
- **Required**: No
- **Default**: `true`
- **Description**: Require authentication for storage operations
- **Values**: `true` | `false`
- **Production**: **MUST** be `true`

#### `REQUIRE_WALLET_SIGNATURE`
- **Required**: No
- **Default**: `false`
- **Description**: Require wallet signature for write operations
- **Values**: `true` | `false`

---

## Platform-Specific Setup

### Vercel

1. Go to Project Settings → Environment Variables
2. Add all `VITE_*` variables
3. Set environment: Production, Preview, or Development
4. Redeploy to apply changes

### Cloudflare Pages

1. Go to Pages Project → Settings → Environment Variables
2. Add all `VITE_*` variables
3. Set environment: Production or Preview
4. Redeploy to apply changes

### Firebase Hosting

Firebase Hosting doesn't support environment variables directly. Build locally:

```bash
# Set variables in .env file
cp .env.example .env
# Edit .env with your values

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

### Netlify

1. Go to Site Settings → Build & Deploy → Environment
2. Add all `VITE_*` variables
3. Redeploy to apply changes

### Cloudflare Workers

For Cloudflare Workers, set secrets via CLI:

```bash
# Set secrets (not in wrangler.toml)
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put TELEGRAM_BOT_TOKEN

# Public variables can go in wrangler.toml [vars] section
```

---

## Validation

The application validates required environment variables on startup. Missing variables will prevent the app from starting with a clear error message.

To test validation:

```bash
# Should show error about missing variables
npm run dev
```

---

## Security Best Practices

### ✅ DO
- Use different Firebase projects for dev/staging/production
- Set `VITE_ENABLE_DEBUG=false` in production
- Set `VITE_LOG_LEVEL=error` in production
- Use platform environment variables (not .env files in production)
- Rotate credentials regularly
- Use Cloudflare Workers secrets for sensitive data

### ❌ DON'T
- Commit .env files to git
- Use dev credentials in production
- Enable debug logging in production
- Share credentials via insecure channels
- Use default/example values in production
- Store secrets in wrangler.toml (use secrets instead)

---

## Troubleshooting

### App won't start
- Check console for missing environment variables
- Verify all required variables are set
- Check Firebase credentials are correct

### Authentication not working
- Verify `VITE_FIREBASE_*` variables are correct
- Check Firebase Authentication is enabled
- Verify domain is whitelisted in Firebase Console

### WalletConnect not working
- Verify `VITE_WALLETCONNECT_PROJECT_ID` is set
- Check project ID is valid on WalletConnect Cloud
- Verify domain is whitelisted in WalletConnect project

### Admin panel not accessible
- Verify `VITE_ENABLE_ADMIN=true`
- Check email is in `VITE_ADMIN_ALLOWLIST`
- Verify admin document exists in Firestore

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained By**: DevOps Team
