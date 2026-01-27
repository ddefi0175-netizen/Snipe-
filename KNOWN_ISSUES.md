# Known Issues and Limitations

This document tracks known issues, limitations, and technical debt in the Snipe project.

## Security Issues

### Dev Dependency Vulnerabilities (Low Priority)

**Status:** Known, Documented, Deferred

**Issue:**
- 2 moderate severity vulnerabilities in esbuild (≤0.24.2) and vite (0.11.0 - 6.1.6)
- Vulnerability: esbuild enables any website to send requests to the development server
- Advisory: https://github.com/advisories/GHSA-67mh-4wv8-2f99

**Impact:**
- **Development environment only** - does not affect production builds or deployed code
- The vulnerability only affects the dev server during local development
- Production builds are not affected as esbuild is a dev dependency

**Resolution Plan:**
```bash
# To fix requires breaking changes:
npm audit fix --force
# This will update vite from 5.4.21 to 7.x.x (major version bump)
```

**Why Not Fixed Now:**
- Vite 7.x is a major version upgrade requiring:
  - Testing all build configurations
  - Potential changes to vite.config.js
  - Verification of all plugins compatibility
  - Testing across all deployment targets
- Risk vs benefit: Low risk (dev only) vs high testing effort (breaking changes)

**Recommendation:**
- Schedule for next major version (v2.0.0)
- Keep dependencies updated regularly with patch/minor versions
- Developers should only run dev server on trusted networks

**Workaround:**
- Only run `npm run dev` on localhost or trusted networks
- Do not expose dev server to public internet
- Use environment variables to restrict dev server access if needed

---

## Code Quality Issues

### Console Statements
**Status:** Mostly Fixed (2026-01-27)

- ✅ Removed 30+ debug console.log statements from production code
- ⚠️ Console.error and console.warn kept for important error logging
- Recommendation: Consider implementing a proper logging framework for production

### Password Requirements
**Status:** Fixed (2026-01-27)

- ✅ Implemented strong password complexity requirements
- ✅ Minimum 8 characters with uppercase, lowercase, numbers, and special characters
- Note: Users with existing passwords created before this update will need to meet new requirements on password change

---

## Technical Debt

### Legacy Backend
**Status:** Deprecated

The MongoDB + Express.js backend in `/backend` is deprecated:
- Firebase is now the primary backend
- Legacy API endpoints kept for backward compatibility
- New features should use Firebase only
- See BACKEND_REPLACEMENT.md for migration guide

### TODO Items in Code
**Location:** Various files

Several TODO comments exist in the codebase:
- `services/adminService.js`: Recovery logic for failed operations
- Consider addressing these in future sprints

---

## Browser Compatibility

### Known Limitations

**Audio Playback:**
- Browser autoplay policies may block notification sounds
- This is expected behavior and properly handled with try/catch
- No action needed - browsers require user interaction for audio

**LocalStorage:**
- App requires localStorage for Firebase persistence
- Error shown if localStorage is blocked or unavailable
- Alternative: Firebase in-memory persistence (reduced functionality)

---

## Performance

### Bundle Size
- Main bundle: ~877 KB (gzipped: ~207 KB)
- Index bundle: ~491 KB (gzipped: ~152 KB)
- Current chunk size limit: 1000 KB (configured in vite.config.js)
- Consider: Code splitting for larger features in future

### Real-time Data
- Firebase listeners are efficient but scale with data volume
- Monitor Firestore read/write quotas as user base grows
- Consider pagination for large collections (1000+ items)

---

## Future Enhancements

### Security
1. **Rate Limiting** - Add rate limiting on authentication endpoints
2. **Session Management** - Implement token refresh and session revocation
3. **Audit Logging** - Persistent audit trail for security events
4. **2FA** - Two-factor authentication for admin accounts

### Features
1. **Notifications** - Push notifications for important events
2. **Analytics** - Enhanced analytics dashboard
3. **Mobile App** - Native mobile applications
4. **API Rate Limiting** - Protect against API abuse

---

**Last Updated:** 2026-01-27
**Next Review:** 2026-02-27
