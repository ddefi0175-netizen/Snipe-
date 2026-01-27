# Security Best Practices for Snipe

This document outlines security measures and best practices for the Snipe trading platform.

## 🔐 Critical Security Updates

### Password Security

**✅ IMPLEMENTED:**
- Admin passwords are now hashed using bcrypt with 10 salt rounds
- Automatic migration: existing plaintext passwords are upgraded to hashed versions on first login
- Minimum password length: 8 characters (enforced for new admins and password resets)
- **NEW:** Password complexity requirements enforced:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Cryptographically secure random number generation for referral codes and tokens

**⚠️ IMPORTANT:**
- Master account password is stored in environment variable `MASTER_PASSWORD`
- Never commit real passwords to the repository
- Use strong, unique passwords for all accounts

### Authentication & Authorization

**Master Account:**
- Username: `master` (hardcoded)
- Password: Set via `MASTER_PASSWORD` environment variable
- Has full platform control and can create/manage all admins

**Admin Accounts:**
- Stored in MongoDB with bcrypt-hashed passwords
- Granular permissions system
- Can be assigned to specific users or have access to all users

### Environment Variables

**Required for Backend:**
```bash
# Never commit these values to git!
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/snipe
JWT_SECRET=your-secure-random-string-minimum-32-characters
MASTER_USERNAME=master
MASTER_PASSWORD=YourSecurePasswordHere-ChangeThis!
```

**Security Checklist:**
- [ ] Change default `MASTER_PASSWORD` immediately after deployment
- [ ] Use strong JWT_SECRET (minimum 32 characters, random)
- [ ] Never share or commit `.env` files
- [ ] Rotate JWT_SECRET periodically
- [ ] Use different credentials for each environment (dev, staging, prod)

## 🛡️ Security Features

### Password Hashing
- **Algorithm**: bcrypt with 10 salt rounds
- **Storage**: Hashed passwords in MongoDB for admin accounts
- **Migration**: Automatic upgrade from plaintext to hashed on login

### Token Security
- **JWT tokens** with 24-hour expiration
- Tokens include user role and permissions
- Server-side validation on every authenticated request

### CORS Protection
- Whitelist of allowed origins
- Automatic approval of Vercel preview URLs
- Credentials support enabled for authenticated requests

## 🚨 Known Security Considerations

### Areas Requiring Additional Security (Future Enhancements)

1. **Rate Limiting**
   - No rate limiting on authentication endpoints (should be added)
   - Vulnerable to brute force attacks

2. **Password Policies**
   - ✅ Minimum 8 characters enforced
   - ✅ **IMPLEMENTED:** Uppercase, lowercase, number, special character requirements
   - Password expiration policies not implemented (consider for future)

3. **Session Management**
   - JWT tokens valid for 24 hours
   - No token refresh mechanism
   - No session revocation capability

4. **Input Validation**
   - ✅ Strong password validation with complexity requirements
   - ✅ Safe DOM manipulation (no unsafe innerHTML with user data)
   - ✅ Error handling improvements (no silent error swallowing)
   - Consider adding stronger input sanitization for other fields

5. **Audit Logging**
   - Login attempts are logged to console
   - No persistent audit trail for security events

## 🔒 Secure Deployment Checklist

### Before Going Live:

- [ ] Set strong `MASTER_PASSWORD` (16+ characters, mixed case, numbers, symbols)
- [ ] Generate secure `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Run database seed with secure passwords: `SEED_ADMIN_PASSWORD='secure-pwd' node seed.js`
- [ ] Verify all `.env` files are in `.gitignore`
- [ ] Test admin login with new credentials
- [ ] Delete or secure test scripts with embedded credentials
- [ ] Enable HTTPS only (no HTTP)
- [ ] Review and limit CORS allowed origins
- [ ] Set up monitoring for failed login attempts
- [ ] Configure firewall rules for MongoDB

### Testing Credentials:

**NEVER use production credentials in tests!**

Use environment variables for all test scripts:
```bash
# Example
MASTER_PASSWORD='your-test-password' ./test-admin-creation.sh
```

## 📝 Security Incident Response

If you suspect a security breach:

1. **Immediate Actions:**
   - Rotate all credentials immediately (MASTER_PASSWORD, JWT_SECRET)
   - Check MongoDB access logs for unauthorized access
   - Review application logs for suspicious activity
   - Disable affected admin accounts

2. **Investigation:**
   - Identify the scope of the breach
   - Check which data may have been compromised
   - Review recent code changes

3. **Recovery:**
   - Update all passwords
   - Regenerate JWT secrets
   - Force logout of all users (new JWT_SECRET does this automatically)
   - Patch any identified vulnerabilities

4. **Post-Incident:**
   - Document the incident
   - Implement additional security measures
   - Consider security audit

## 🔍 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email the maintainers privately with details
3. Allow time for the issue to be fixed before public disclosure
4. Responsible disclosure is appreciated

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

**Last Updated:** 2026-01-27
**Security Review Date:** 2026-01-27

## Recent Security Improvements (2026-01-27)

1. **Fixed Critical Issues:**
   - Replaced unsafe `innerHTML` usage with safe DOM manipulation methods
   - Fixed empty catch blocks that silently swallowed errors
   - Implemented cryptographically secure random number generation (crypto.getRandomValues)
   - Added proper error logging for debugging and security monitoring

2. **Code Quality Improvements:**
   - Removed 30+ debug console.log statements from production code
   - Improved error context in catch blocks for better diagnostics
   - Enforced stronger password complexity requirements

3. **Known Issues:**
   - Dev dependency vulnerabilities (esbuild/vite) - affects development environment only
   - These require breaking changes to update (consider for next major version)
