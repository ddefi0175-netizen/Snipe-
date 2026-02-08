# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately to the project maintainers.

**DO NOT** open a public issue for security vulnerabilities.

## Security Measures Implemented

### Authentication & Authorization
- ✅ Firebase Authentication with email/password
- ✅ Admin role-based access control (RBAC)
- ✅ Firestore security rules for data protection
- ✅ JWT token validation in Cloudflare Workers
- ✅ Admin email allowlist for privileged access
- ✅ Wallet-based authentication for users

### Rate Limiting
- ✅ Basic rate limiting in Firestore rules (1 request per second)
- ✅ Cloudflare Workers rate limiting (production recommended)
- ⚙️ Configurable limit: 100 requests per minute per user
- 📝 Note: For production, implement distributed rate limiting using Cloudflare Workers KV

### Data Protection
- ✅ No credentials stored in code
- ✅ Environment variable validation at startup
- ✅ Secure storage authentication in Cloudflare Workers
- ✅ Encrypted data at rest (Firebase/Firestore)
- ✅ HTTPS/TLS for all communications
- ✅ CORS configuration for API endpoints

### Logging & Monitoring
- ✅ Production logging disabled (no sensitive data in console)
- ✅ Error tracking configured
- ✅ Admin activity logging in Firestore
- ✅ Conditional logging based on environment

### Code Security
- ✅ No hardcoded secrets or credentials
- ✅ Environment-based configuration
- ✅ Input validation on all user inputs
- ✅ XSS protection via React's built-in escaping
- ✅ CSRF protection via Firebase Authentication

### Infrastructure Security
- ✅ Serverless architecture (Firebase + Cloudflare)
- ✅ Automatic security patches (managed services)
- ✅ DDoS protection via Cloudflare
- ✅ Zero-trust network architecture

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env` files (already in `.gitignore`)
   - Use Cloudflare Workers secrets for production
   - Use Firebase environment configuration

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Use the logger utility**
   - Import from `@/utils/logger`
   - Automatically suppresses logs in production
   - Prevents leaking sensitive information

4. **Follow the principle of least privilege**
   - Grant minimum necessary permissions
   - Use role-based access control
   - Regularly audit admin access

5. **Validate all inputs**
   - Never trust user input
   - Use Firebase security rules for server-side validation
   - Sanitize data before storage

### For Deployment

1. **Environment Variables**
   - Set all required environment variables (see `.env.example`)
   - Use strong, unique values for production
   - Never expose Firebase API keys (they're restricted by domain)

2. **Firestore Security Rules**
   - Review and test rules before deployment
   - Use the Firebase Emulator for local testing
   - Deploy rules separately from code: `firebase deploy --only firestore:rules`

3. **Cloudflare Configuration**
   - Create separate KV namespaces for dev/staging/prod
   - Use Cloudflare secrets for sensitive tokens
   - Enable WAF (Web Application Firewall) rules

4. **Monitoring**
   - Enable Firebase Performance Monitoring
   - Set up Cloudflare Analytics
   - Configure alerts for suspicious activity

## Known Security Considerations

### Rate Limiting (Current Implementation)
The current Firestore rate limiting is **basic** and checks if a request comes more than 1 second after the last request. This is not production-grade rate limiting.

**Recommendation**: Implement proper rate limiting using Cloudflare Workers KV for distributed rate limiting across multiple requests and better accuracy.

### Firebase Admin SDK in Workers
The Cloudflare Workers currently use a placeholder for Firebase Admin SDK token verification. For production:
- Implement full JWT verification with Firebase public keys
- Use Firebase Admin SDK where possible
- Add token expiry and signature validation

### Storage Authentication
Storage operations now require authentication. Ensure:
- All clients include valid Firebase Auth tokens
- Tokens are refreshed before expiry
- Failed auth attempts are logged and monitored

## Compliance

### GDPR
- User data stored in Firebase (EU region available)
- Users can request data deletion via admin panel
- Data retention policies configurable

### Data Residency
- Firebase supports multiple regions
- Cloudflare has global data centers
- Configure regions in Firebase Console

## Security Checklist for Production

- [ ] All required environment variables set
- [ ] Firestore security rules deployed
- [ ] Cloudflare KV namespaces created
- [ ] Cloudflare R2 buckets created
- [ ] Cloudflare Worker secrets configured
- [ ] Firebase Auth configured with email/password
- [ ] Admin allowlist configured
- [ ] Rate limiting tested under load
- [ ] CORS origins configured correctly
- [ ] HTTPS enforced on all endpoints
- [ ] Error tracking service integrated (e.g., Sentry)
- [ ] Monitoring and alerts configured
- [ ] Security audit completed
- [ ] Dependency audit completed (`npm audit`)
- [ ] Environment variable validation tested

## Vulnerability Disclosure

We appreciate security researchers and users who report vulnerabilities responsibly. 

When reporting a vulnerability:
1. Provide a detailed description of the issue
2. Include steps to reproduce
3. Suggest a fix if possible
4. Allow reasonable time for a fix before public disclosure

## Updates

This security documentation is updated regularly. Last updated: 2026-02-08

For questions or concerns about security, please contact the project maintainers.
