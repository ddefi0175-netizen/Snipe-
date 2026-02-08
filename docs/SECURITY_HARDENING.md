# Security Hardening Guide

Comprehensive guide for securing the Snipe platform in production.

## 🔒 Overview

This guide covers all security measures implemented in the platform and how to configure them properly for production deployment.

---

## 🛡️ Authentication & Authorization

### Firebase Authentication

**Configuration:**
1. Enable Firebase Authentication in Firebase Console
2. Configure sign-in methods (Email/Password recommended)
3. Set up password requirements (min 8 characters, complexity)
4. Enable email verification
5. Configure authorized domains

**Security Rules:**
```javascript
// Firestore security rules enforce authentication
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Admin Access Control

**Role-Based Access Control (RBAC):**
- **Master Admin**: Full platform access, can create admins
- **Admin**: Limited administrative access
- **User**: Standard user access

**Configuration:**
```env
# Set in environment variables
VITE_ADMIN_ALLOWLIST=master@onchainweb.site,admin@company.com
```

**Firestore Admin Document:**
```javascript
// Collection: admins/{userId}
{
  email: "admin@company.com",
  role: "admin", // or "master"
  permissions: ["view_users", "update_balances"],
  createdAt: timestamp,
  createdBy: "master-admin-uid"
}
```

### Token Verification

**Frontend (Firebase SDK):**
- Uses Firebase Authentication tokens
- Tokens auto-refreshed by SDK
- Secure token storage in browser

**Workers (Firebase Admin):**
- Full JWT verification with signature validation
- Token expiry checks
- Issuer and audience validation
- Role-based access checks

**Implementation:**
```javascript
// workers/lib/firebaseAdmin.js
const result = await verifyFirebaseToken(token, env);
if (!result.valid) {
  return new Response('Unauthorized', { status: 401 });
}
```

---

## 🚦 Rate Limiting

### Firestore Rules Rate Limiting

**Implementation:**
```javascript
// firestore.rules
function isNotRateLimited(userId, action) {
  let rateLimitPath = /databases/$(database)/documents/users/$(userId)/rateLimits/$(action);
  
  if (!exists(rateLimitPath)) return true;
  
  let rateLimitDoc = get(rateLimitPath);
  let currentTime = request.time.toMillis();
  let oneMinuteAgo = currentTime - 60000;
  
  if (rateLimitDoc.data.windowStart < oneMinuteAgo) return true;
  
  let maxRequests = (action == 'read') ? 100 : 50;
  return rateLimitDoc.data.count < maxRequests;
}
```

**Limits:**
- Read operations: 100 per minute per user
- Write operations: 50 per minute per user
- Time window: 60 seconds
- Tracked per user per action type

### Cloudflare Workers Rate Limiting

**Implementation:**
```javascript
// workers/cache.js
const rateLimitResult = await checkRateLimit(
  env.CACHE, 
  clientIP, 
  100, // maxRequests
  60   // windowSeconds
);

if (!rateLimitResult.allowed) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

**Configuration:**
```env
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_WINDOW_SECONDS=60
```

**Features:**
- Per-IP rate limiting
- Distributed counting using KV storage
- Proper HTTP 429 responses
- Retry-After headers

---

## 🔐 Data Protection

### Firestore Security Rules

**Production-Hardened Rules:**

```javascript
// Users can only access their own data
match /users/{userId} {
  allow read: if request.auth.uid == userId || isAdmin();
  allow write: if request.auth.uid == userId && isNotRateLimited(userId, 'write');
}

// Trades accessible only to owner or admin
match /trades/{tradeId} {
  allow read: if resource.data.userId == request.auth.uid || isAdmin();
  allow create: if request.resource.data.userId == request.auth.uid;
}

// Admin-only operations
match /admins/{adminId} {
  allow read: if isAdmin();
  allow write: if isMasterAdmin();
}
```

**Key Features:**
- Authentication required for all operations
- User data isolation
- Admin-only administrative operations
- Rate limiting on write operations

### Data Validation

**User Data Validation:**
```javascript
function isValidUserData() {
  return request.resource.data.keys().hasAll(['walletAddress']) &&
         request.resource.data.walletAddress is string &&
         request.resource.data.walletAddress.size() == 42;
}
```

**Trade Data Validation:**
- Validate numeric fields (amount, entryPrice)
- Validate enum fields (direction: 'up' | 'down')
- Validate required fields
- Sanitize user inputs

---

## 📦 Storage Security

### Cloudflare R2 Storage

**Authentication Enforcement:**
```javascript
// workers/api/storage.js

// GET: Public for public/, authenticated for others
if (request.method === 'GET') {
  if (!key.startsWith('public/') && !token) {
    return new Response('Unauthorized', { status: 401 });
  }
}

// PUT/DELETE: Admin only
if (request.method === 'PUT' || request.method === 'DELETE') {
  const authResult = await verifyFirebaseToken(token, env);
  if (!authResult.valid || !isAdmin(authResult.claims)) {
    return new Response('Forbidden', { status: 403 });
  }
}
```

**File Upload Restrictions:**
- File size limit: 10MB
- Admin-only uploads
- File type validation (optional)
- Virus scanning (recommended for production)

**Configuration:**
```env
ENABLE_STORAGE_AUTH=true
REQUIRE_WALLET_SIGNATURE=false  # Enable for additional security
```

---

## 🚫 Input Sanitization

### XSS Prevention

**React Auto-Escaping:**
- React automatically escapes all text content
- Use `dangerouslySetInnerHTML` sparingly
- Sanitize HTML if needed using DOMPurify

**Example:**
```javascript
// Safe - auto-escaped
<div>{userInput}</div>

// Unsafe - avoid
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Safe with sanitization
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### SQL Injection Prevention

**Not applicable** - Firestore is a NoSQL database that doesn't use SQL queries. However:

- Use parameterized queries for Firebase
- Avoid string concatenation in queries
- Validate all user inputs

---

## 🔍 Logging & Monitoring

### Production-Safe Logging

**Logger Implementation:**
```javascript
// Onchainweb/src/utils/logger.js
const isDevelopment = import.meta.env.MODE === 'development';
const isDebugEnabled = import.meta.env.VITE_ENABLE_DEBUG === 'true';

export const logger = {
  debug: (...args) => {
    if (isDevelopment || isDebugEnabled) console.log(...args);
  },
  error: (...args) => {
    console.error(...args);
    // Send to error tracking in production
  }
};
```

**Configuration:**
```env
# Production
VITE_ENABLE_DEBUG=false
VITE_LOG_LEVEL=error

# Development
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=debug
```

**Best Practices:**
- Never log sensitive data (tokens, passwords, private keys)
- Use structured logging
- Send errors to tracking service (Sentry, etc.)
- Log security events (failed auth, rate limiting)

### Error Tracking

**Recommended Services:**
- **Sentry**: Comprehensive error tracking
- **LogRocket**: Session replay with errors
- **Firebase Crashlytics**: Mobile-focused

**Integration:**
```javascript
// TODO: Integrate with Sentry
if (!isDevelopment) {
  Sentry.captureException(error);
}
```

---

## 🌐 CORS Configuration

### Cloudflare Workers CORS

**Implementation:**
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Restrict in production
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

**Production Configuration:**
```javascript
// Restrict to specific origins
const allowedOrigins = [
  'https://onchainweb.app',
  'https://www.onchainweb.app'
];

const origin = request.headers.get('Origin');
if (allowedOrigins.includes(origin)) {
  corsHeaders['Access-Control-Allow-Origin'] = origin;
}
```

---

## 🔑 Secrets Management

### Environment Variables

**Never commit:**
- `.env` files
- Firebase private keys
- API tokens
- Wallet private keys

**Use platform secrets:**

**Vercel:**
```bash
vercel env add VITE_FIREBASE_API_KEY
```

**Cloudflare Workers:**
```bash
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put FIREBASE_CLIENT_EMAIL
```

**Firebase:**
```bash
firebase functions:config:set telegram.token="YOUR_TOKEN"
```

### Credential Rotation

**Schedule:**
- Firebase API keys: Rotate quarterly
- Admin passwords: Rotate monthly
- Service account keys: Rotate quarterly
- API tokens: Rotate monthly

**Process:**
1. Generate new credentials
2. Update in all environments
3. Test thoroughly
4. Revoke old credentials
5. Document rotation

---

## 🛡️ Web Security Headers

### Content Security Policy (CSP)

**Recommended CSP:**
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.walletconnect.org;
  font-src 'self';
  frame-src https://accounts.google.com;
```

### Other Security Headers

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Implementation in Vercel:**
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

---

## 🔒 Firebase Security

### Firebase App Check

**Setup:**
1. Enable App Check in Firebase Console
2. Register your domain
3. Configure enforcement level (optional for dev)

**Benefits:**
- Prevents abuse from unauthorized clients
- Rate limiting at Firebase level
- Protection against bots

### Firestore Indexes

**Security through performance:**
- Create indexes for all queries
- Prevent slow queries that could be DoS vectors
- Deploy indexes before security rules

```bash
firebase deploy --only firestore:indexes
```

---

## 🚨 Incident Response

### Security Incident Plan

**Detection:**
- Monitor error rates
- Track failed authentication attempts
- Watch for rate limit violations
- Review access logs

**Response:**
1. Identify the issue
2. Contain the threat
3. Investigate root cause
4. Fix vulnerability
5. Deploy fix
6. Document incident

**Communication:**
- Internal team notification
- User notification (if data breach)
- Regulatory compliance (if required)

---

## ✅ Security Checklist

### Before Production Launch

- [ ] All secrets set via platform secrets
- [ ] Debug logging disabled (`VITE_ENABLE_DEBUG=false`)
- [ ] Rate limiting tested and working
- [ ] Firestore security rules deployed
- [ ] Storage authentication enabled
- [ ] Admin access restricted to allowlist
- [ ] CORS restricted to production domains
- [ ] Security headers configured
- [ ] Firebase App Check enabled
- [ ] Error tracking configured
- [ ] Monitoring and alerts set up
- [ ] Incident response plan documented
- [ ] Security audit completed

### Ongoing Security

- [ ] Review logs weekly
- [ ] Rotate credentials quarterly
- [ ] Update dependencies monthly
- [ ] Run security scans monthly
- [ ] Review access controls monthly
- [ ] Test rate limiting monthly
- [ ] Update security rules as needed
- [ ] Monitor Firebase usage
- [ ] Review error tracking alerts

---

## 📚 Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/platform/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Headers](https://securityheaders.com/)

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained By**: Security Team
