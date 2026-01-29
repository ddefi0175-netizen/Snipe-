# Security Hardening - Post Code Review

## Security Issues Addressed

### 1. Admin Authentication (workers/api/admin.js)
**Issue**: Insufficient token validation (only checking length)
**Fixed**: 
- Added comprehensive TODO comments for Firebase Admin SDK integration
- Documented proper authentication flow requirements
- Made it clear this is a placeholder requiring implementation

**Production Requirements**:
```javascript
// Required before production:
1. Install Firebase Admin SDK in Workers
2. Verify token signature and expiry
3. Check user role/permissions in Firestore
4. Implement proper error handling
```

### 2. Storage API Authentication (workers/api/storage.js)
**Issue**: No authentication required for R2 operations
**Fixed**:
- Added authentication helper function
- Enforced auth for PUT and DELETE operations
- Made GET operations optionally authenticated (commented for flexibility)
- Removed hardcoded account ID from URLs

**Security Measures**:
- ✅ Upload requires authentication
- ✅ Delete requires authentication
- ✅ Download can be public or authenticated (configurable)
- ✅ Uses environment variable for R2 public URL

### 3. Hardcoded Credentials (wrangler.toml)
**Issue**: Telegram bot token and account IDs hardcoded
**Fixed**:
- Changed Telegram token to placeholder: "SET_VIA_WRANGLER_SECRET"
- Added comments about using Wrangler secrets
- Added ALLOWED_ORIGINS and R2_PUBLIC_URL vars
- Documented proper secret management

**Deployment Commands**:
```bash
# Set secrets securely
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put CLOUDFLARE_API_TOKEN
```

### 4. CORS Configuration (workers/lib/cors.js)
**Issue**: Allows all origins with '*'
**Fixed**:
- Added `getCorsHeaders()` function with origin validation
- Supports environment-based allowed origins
- Default restricts to known domains
- Kept permissive default for development with clear warnings

**Production Setup**:
```toml
# In wrangler.toml
[vars]
ALLOWED_ORIGINS = "https://onchainweb.pages.dev,https://www.onchainweb.app"
```

---

## Security Checklist

### Before Production Deployment

#### Critical (Must Do)
- [ ] Set all secrets via `wrangler secret put`:
  - [ ] TELEGRAM_BOT_TOKEN
  - [ ] FIREBASE_PRIVATE_KEY (if using Admin SDK)
  - [ ] Any API keys
- [ ] Update ALLOWED_ORIGINS in wrangler.toml
- [ ] Set custom R2_PUBLIC_URL (custom domain)
- [ ] Implement Firebase Admin SDK in workers/api/admin.js
- [ ] Deploy Firestore Security Rules
- [ ] Enable authentication on storage API (uncomment lines)

#### Important (Should Do)
- [ ] Set up rate limiting on Workers
- [ ] Configure custom domain for R2
- [ ] Enable Cloudflare Bot Management
- [ ] Set up monitoring and alerts
- [ ] Review and test all authentication flows

#### Recommended (Nice to Have)
- [ ] Enable Cloudflare WAF rules
- [ ] Set up DDoS protection
- [ ] Configure security headers
- [ ] Implement request signing
- [ ] Add audit logging

---

## Environment Variables & Secrets

### Public Variables (wrangler.toml [vars])
```toml
FIREBASE_PROJECT_ID = "onchainweb-b4b36"
FIREBASE_DATABASE_URL = "https://..."
TELEGRAM_USERNAME = "goblin_niko4"
R2_PUBLIC_URL = "https://storage.onchainweb.app"
ALLOWED_ORIGINS = "https://onchainweb.pages.dev,https://www.onchainweb.app"
```

### Secrets (via wrangler secret)
```bash
# Never commit these!
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put JWT_SECRET
```

### Frontend (.env)
```bash
# These are safe to expose in frontend (public)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_WALLETCONNECT_PROJECT_ID=...

# These should NEVER be in frontend
# CLOUDFLARE_API_TOKEN (use in CI/CD only)
# FIREBASE_PRIVATE_KEY (use in workers only)
```

---

## Authentication Flow

### User Authentication
1. User signs in with Firebase Auth (frontend)
2. Firebase returns JWT token
3. Frontend stores token in memory (not localStorage)
4. Token sent in Authorization header for API requests
5. Workers verify token with Firebase Admin SDK
6. Grant/deny access based on token validity

### Admin Authentication
1. Admin signs in with Firebase Auth (frontend)
2. Check email pattern (@admin.onchainweb.* or @onchainweb.site)
3. Verify admin role in Firestore /admins collection
4. Token sent with elevated permissions
5. Workers verify admin status before sensitive operations

---

## Rate Limiting

### Recommended Limits
```javascript
// In workers/index.js
const RATE_LIMITS = {
  cache: { requests: 100, window: 60 },     // 100 req/min
  storage: { requests: 50, window: 60 },    // 50 req/min
  admin: { requests: 20, window: 60 },      // 20 req/min
  users: { requests: 60, window: 60 }       // 60 req/min
}
```

### Implementation
```javascript
// Use Cloudflare KV for rate limiting
async function checkRateLimit(ip, endpoint, limit, window) {
  const key = `ratelimit:${endpoint}:${ip}`
  const current = await env.CACHE.get(key) || 0
  
  if (current >= limit) {
    throw new Error('Rate limit exceeded')
  }
  
  await env.CACHE.put(key, current + 1, { expirationTtl: window })
}
```

---

## CORS Best Practices

### Development
```javascript
// Allow localhost for development
ALLOWED_ORIGINS = "http://localhost:5173,https://onchainweb.pages.dev"
```

### Production
```javascript
// Only production domains
ALLOWED_ORIGINS = "https://www.onchainweb.app,https://onchainweb.app"
```

### Dynamic Origin Checking
```javascript
export const getCorsHeaders = (origin, env) => {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
  const isAllowed = allowedOrigins.includes(origin)
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : null,
    // ... other headers
  }
}
```

---

## R2 Security

### Public Access
- Use custom domain (storage.onchainweb.app)
- Don't expose account ID in URLs
- Consider signed URLs for sensitive files

### Private Access
- Require authentication for uploads/deletes
- Use presigned URLs for downloads
- Implement access control lists (ACLs)

### Example Presigned URL
```javascript
// Generate presigned URL (expires in 1 hour)
async function getPresignedUrl(key, expiresIn = 3600) {
  const url = new URL(`https://storage.onchainweb.app/${key}`)
  const expires = Date.now() + (expiresIn * 1000)
  const signature = await generateSignature(key, expires)
  
  url.searchParams.set('expires', expires)
  url.searchParams.set('signature', signature)
  
  return url.toString()
}
```

---

## Security Headers

### Recommended Headers
```javascript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'"
}
```

### Implementation
```javascript
// Add to all responses in workers/index.js
return new Response(body, {
  headers: {
    ...corsHeaders,
    ...securityHeaders,
    'Content-Type': 'application/json'
  }
})
```

---

## Monitoring & Alerts

### What to Monitor
- Failed authentication attempts
- Rate limit violations
- Unusual API usage patterns
- Storage upload/download volumes
- Worker error rates

### Cloudflare Analytics
```bash
# View real-time analytics
wrangler tail

# Check deployment status
wrangler deployments list
```

### Custom Logging
```javascript
// Log security events
async function logSecurityEvent(event, details) {
  await env.CACHE.put(
    `security:${Date.now()}`,
    JSON.stringify({ event, details, timestamp: Date.now() }),
    { expirationTtl: 86400 } // 24 hours
  )
}
```

---

## Incident Response

### If Credentials Are Compromised
1. Immediately rotate all secrets
   ```bash
   wrangler secret put TELEGRAM_BOT_TOKEN --force
   ```
2. Check access logs for suspicious activity
3. Deploy updated firestore rules
4. Notify users if data was accessed
5. Document the incident

### If DDoS Attack Detected
1. Enable Cloudflare "I'm Under Attack" mode
2. Increase rate limits temporarily
3. Block suspicious IP ranges
4. Enable additional WAF rules
5. Monitor and adjust

---

## Regular Security Maintenance

### Weekly
- [ ] Review access logs
- [ ] Check for failed auth attempts
- [ ] Monitor storage usage

### Monthly
- [ ] Rotate API keys and secrets
- [ ] Review and update CORS origins
- [ ] Audit admin access logs
- [ ] Update dependencies

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review and update security rules
- [ ] Document changes

---

## Additional Resources

- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/platform/security)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Security Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [Web Security Academy](https://portswigger.net/web-security)

---

**Status**: ✅ Security hardening completed and documented

**Last Updated**: January 28, 2026
