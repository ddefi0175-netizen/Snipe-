# Content Security Policy Configuration

## Overview

This document explains the Content Security Policy (CSP) configuration implemented to prevent 'eval' blocking issues while maintaining security.

## Problem Statement

The application was experiencing CSP errors blocking the use of 'eval' in JavaScript, preventing the master account domain from opening on computers. This was caused by:

1. **Terser minification**: The previous Vite configuration used terser for minification, which can generate code patterns that require `unsafe-eval` in CSP
2. **Missing CSP headers**: No explicit CSP headers were configured, causing browser defaults or hosting platform policies to block necessary operations

## Solution Implemented

### 1. Switched to esbuild Minifier

**File**: `Onchainweb/vite.config.js`

Changed from:
```javascript
build: {
  minify: 'terser',
  terserOptions: { ... }
}
```

To:
```javascript
build: {
  minify: 'esbuild',
  // Use esbuild instead of terser to avoid CSP issues with eval
  // esbuild minification is CSP-safe and doesn't require 'unsafe-eval'
}
```

**Benefits**:
- esbuild doesn't generate code requiring `unsafe-eval`
- Faster build times
- CSP-compliant output
- Maintains good compression ratios

### 2. Added Explicit CSP Headers

**Files**: `vercel.json` and `Onchainweb/vercel.json`

Added comprehensive security headers including CSP:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://vitals.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://vitals.vercel-insights.com wss://*.walletconnect.com https://*.walletconnect.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
        }
      ]
    }
  ]
}
```

## CSP Directives Explained

### Script Sources (`script-src`)
- `'self'`: Allow scripts from same origin
- `'unsafe-inline'`: Required for inline scripts (SPA requirements)
- `https://www.googletagmanager.com`: Google Analytics
- `https://vitals.vercel-insights.com`: Vercel Analytics

**Note**: Does NOT include `'unsafe-eval'` - our code doesn't require it!

### Connection Sources (`connect-src`)
- `'self'`: API calls to same origin
- `https://*.firebaseio.com`: Firebase Realtime Database
- `https://*.googleapis.com`: Firebase services
- `wss://*.walletconnect.com`: WalletConnect WebSocket
- `https://*.walletconnect.com`: WalletConnect HTTP

### Style Sources (`style-src`)
- `'self'`: Stylesheets from same origin
- `'unsafe-inline'`: Required for dynamic styles and Tailwind

### Image Sources (`img-src`)
- `'self'`: Images from same origin
- `data:`: Data URLs for inline images
- `https:`: Any HTTPS image source (wallet logos, etc.)

### Additional Security Headers

1. **X-Content-Type-Options**: `nosniff`
   - Prevents MIME type sniffing

2. **X-Frame-Options**: `DENY`
   - Prevents clickjacking attacks

3. **X-XSS-Protection**: `1; mode=block`
   - Enables XSS filtering in older browsers

4. **Referrer-Policy**: `strict-origin-when-cross-origin`
   - Controls referrer information

## Build Verification

After changes, verify no eval patterns exist in the build:

```bash
cd Onchainweb
npm run build
cd dist
grep -E "new Function\(|eval\(" assets/js/*.js
# Should return no results
```

## Testing

### Local Development
```bash
cd Onchainweb
npm run dev
# Open http://localhost:5173
```

### Production Preview
```bash
cd Onchainweb
npm run build
npm run preview
# Open http://localhost:4173
```

### Browser Console
Check for CSP violations in browser console:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for CSP-related errors (should be none)

## Deployment

### Vercel
The CSP headers are automatically applied via `vercel.json` configuration. After deployment:

1. Verify headers are applied:
```bash
curl -I https://your-domain.vercel.app
```

2. Check for CSP header in response
3. Test master account login

### Cloudflare Pages
If deploying to Cloudflare Pages, add a `_headers` file to the `public/` directory:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; ...
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

## Troubleshooting

### Issue: "Refused to evaluate a string as JavaScript"
**Cause**: Code trying to use `eval()` or `Function()` constructor  
**Solution**: Check dependencies for eval usage, update or replace them

### Issue: WalletConnect not working
**Cause**: Missing WebSocket domain in `connect-src`  
**Solution**: Verify `wss://*.walletconnect.com` is in CSP

### Issue: Firebase errors
**Cause**: Missing Firebase domains in `connect-src`  
**Solution**: Verify Firebase domains are allowed:
- `https://*.firebaseio.com`
- `https://*.googleapis.com`

### Issue: Inline styles not working
**Cause**: `'unsafe-inline'` missing from `style-src`  
**Solution**: Already included - check for typos in CSP header

## Security Considerations

### Why `'unsafe-inline'` for scripts?
- Required for Single Page Applications (SPA)
- React apps inject scripts dynamically
- Without it, the app won't load

### Why NOT `'unsafe-eval'`?
- Not needed with esbuild minification
- Significant security risk
- Opens door to code injection attacks

### Future Improvements

1. **Nonce-based CSP**: Use cryptographic nonces for inline scripts
   - Requires server-side rendering or build-time injection
   - More secure than `'unsafe-inline'`

2. **Stricter Image Sources**: Whitelist specific domains
   - Replace `https:` with specific wallet provider domains
   - Requires maintaining list of allowed image sources

3. **Report-Only Mode**: Monitor CSP violations
   - Add `Content-Security-Policy-Report-Only` header
   - Send violation reports to monitoring service

## References

- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Vite Security](https://vitejs.dev/guide/features.html#build-optimizations)
- [esbuild vs terser](https://esbuild.github.io/faq/#minification)
- [Firebase CSP Requirements](https://firebase.google.com/docs/hosting/reserved-urls#content-security-policy)

## Changelog

**2026-01-29**: Initial CSP configuration implemented
- Switched from terser to esbuild minification
- Added comprehensive CSP headers to Vercel configuration
- Verified no eval patterns in production build
- Documented security headers and CSP directives
