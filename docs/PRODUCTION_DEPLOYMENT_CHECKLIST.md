# Production Deployment Checklist

This checklist ensures all security and configuration requirements are met before deploying to production.

## 🔒 Security Requirements

### Firebase Configuration
- [ ] Using **production** Firebase project (not dev/test)
- [ ] Firebase API key is production key
- [ ] Firestore security rules deployed and tested
- [ ] Firebase Authentication configured and tested
- [ ] Firebase App Check enabled (recommended)
- [ ] Rate limiting enabled in Firestore rules

### Authentication & Authorization
- [ ] Admin allowlist configured (`VITE_ADMIN_ALLOWLIST`)
- [ ] Master admin account created and tested
- [ ] Firebase Admin SDK credentials set (for Workers)
- [ ] All admin endpoints require authentication
- [ ] Storage API authentication enabled

### Rate Limiting
- [ ] Firestore rate limiting rules deployed
- [ ] Cloudflare Workers rate limiting configured
- [ ] Rate limits tested (100 reads/min, 50 writes/min)
- [ ] Rate limit responses return proper HTTP 429 status

### Secrets Management
- [ ] No secrets in source code
- [ ] No secrets in environment files (use platform secrets)
- [ ] Firebase private key set via `wrangler secret put`
- [ ] Telegram bot token (if used) set via secrets
- [ ] All API keys rotated from dev to production

## 🔧 Configuration

### Environment Variables
- [ ] All required `VITE_FIREBASE_*` variables set
- [ ] `VITE_WALLETCONNECT_PROJECT_ID` set (production ID)
- [ ] `VITE_ENABLE_DEBUG` set to `false`
- [ ] `VITE_LOG_LEVEL` set to `error`
- [ ] Production deposit addresses configured
- [ ] `VITE_ENABLE_STRICT_AUTH` set to `true`
- [ ] `VITE_APP_URL` matches production domain

### Cloudflare Workers (if using)
- [ ] KV namespaces created
- [ ] R2 buckets created
- [ ] Secrets set via `wrangler secret put`
- [ ] Workers deployed to production environment
- [ ] CORS configured for production domain

### Database
- [ ] Firestore indexes deployed
- [ ] Data migration completed (if from MongoDB)
- [ ] Test data removed
- [ ] Backup strategy in place

## 📦 Build & Deployment

### Pre-deployment
- [ ] All tests passing
- [ ] Linting passes with no errors
- [ ] Build completes successfully
- [ ] No console.log in production build
- [ ] Bundle size acceptable (< 500KB gzipped)
- [ ] Source maps generated (for debugging)

### Deployment Platform
- [ ] Environment variables set in deployment platform
- [ ] Custom domain configured (if using)
- [ ] SSL/TLS certificate active
- [ ] CDN configured (if applicable)
- [ ] Deployment preview tested

### Post-deployment
- [ ] Production site accessible
- [ ] Authentication working
- [ ] Wallet connection working
- [ ] Trading functionality working
- [ ] Admin panel accessible
- [ ] No console errors in browser
- [ ] Performance metrics acceptable

## 🔍 Testing

### Functionality Tests
- [ ] User registration works
- [ ] Login/logout works
- [ ] Wallet connection works (all providers)
- [ ] Deposits work
- [ ] Withdrawals work (if enabled)
- [ ] Trading works
- [ ] Admin functions work
- [ ] Real-time updates working

### Security Tests
- [ ] Unauthenticated users cannot access protected routes
- [ ] Rate limiting blocks after threshold
- [ ] Storage API requires authentication
- [ ] Admin API verifies tokens correctly
- [ ] Invalid tokens return 401
- [ ] SQL injection protection (N/A for Firestore)

### Performance Tests
- [ ] Page load < 3 seconds
- [ ] First contentful paint < 1.5 seconds
- [ ] Time to interactive < 3 seconds
- [ ] No memory leaks
- [ ] Real-time updates performant

## 📊 Monitoring

### Setup Monitoring
- [ ] Error tracking enabled (e.g., Sentry)
- [ ] Performance monitoring enabled
- [ ] Firebase usage monitoring enabled
- [ ] Cloudflare analytics enabled (if using)
- [ ] Uptime monitoring configured

### Alerts
- [ ] Error rate alerts configured
- [ ] High usage alerts configured
- [ ] Budget alerts configured (Firebase/Cloudflare)
- [ ] Security alerts configured
- [ ] On-call rotation defined (if applicable)

## 📚 Documentation

### Required Documentation
- [ ] Deployment instructions documented
- [ ] Environment variables documented
- [ ] Architecture documented
- [ ] API endpoints documented
- [ ] Security measures documented
- [ ] Incident response plan documented

### User Documentation
- [ ] User guide created
- [ ] FAQ created
- [ ] Support contact information available
- [ ] Terms of service available
- [ ] Privacy policy available

## 🚀 Launch

### Pre-launch
- [ ] All checklist items above completed
- [ ] Stakeholders notified of launch
- [ ] Support team ready
- [ ] Rollback plan prepared
- [ ] Communication plan ready

### Launch Day
- [ ] Production deployment successful
- [ ] Smoke tests passed
- [ ] All critical features working
- [ ] No critical errors in logs
- [ ] Users can access the site

### Post-launch
- [ ] Monitor error rates (first 24 hours)
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Address critical issues immediately
- [ ] Document lessons learned

## ⚠️ Common Pitfalls

### Avoid These Mistakes
- ❌ Using dev/test Firebase project in production
- ❌ Committing secrets to git
- ❌ Leaving debug logging enabled
- ❌ Not testing rate limiting
- ❌ Not setting up monitoring
- ❌ Not having a rollback plan
- ❌ Using default/example deposit addresses
- ❌ Not rotating credentials from dev to prod

## 📞 Emergency Contacts

In case of production issues:

1. **Critical Security Issue**: [Contact security team]
2. **Site Down**: [Contact DevOps]
3. **Firebase Issues**: Check Firebase Status Dashboard
4. **Cloudflare Issues**: Check Cloudflare Status

## 🔄 Rollback Plan

If deployment fails:

1. Revert to previous deployment
2. Check error logs
3. Identify root cause
4. Fix issue
5. Test in staging
6. Redeploy

## ✅ Sign-off

Before marking deployment complete:

- [ ] Technical lead reviewed
- [ ] Security reviewed
- [ ] Product owner approved
- [ ] All critical tests passed
- [ ] Documentation updated
- [ ] Team notified

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained By**: DevOps Team
