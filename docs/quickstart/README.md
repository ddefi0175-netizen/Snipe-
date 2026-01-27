# Snipe - 5-Step Quick Start Guide

Complete deployment in 25 minutes following these steps:

## Quick Start Steps

1. **[Environment Setup](1-ENVIRONMENT-SETUP.md)** (5 min)
   - Configure Firebase credentials
   - Set admin allowlist
   - Validate configuration

2. **[Firestore Deployment](2-FIRESTORE-DEPLOYMENT.md)** (2 min)
   - Deploy security rules
   - Deploy database indexes

3. **[Application Deployment](3-APPLICATION-DEPLOYMENT.md)** (5 min)
   - Build application
   - Deploy to hosting platform

4. **[Admin Setup](4-ADMIN-SETUP.md)** (2 min)
   - Create master account
   - Configure permissions

5. **[Verification](5-VERIFICATION.md)** (10 min)
   - Run smoke tests
   - Verify real-time data
   - Test admin controls

## Quick Deploy Command

```bash
./deploy-complete.sh
```

This automated script runs all 5 steps with validation.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Git repository cloned

## Manual vs Automated

### Automated Deployment (Recommended)
Use the `deploy-complete.sh` script for a guided deployment process with validation at each step.

### Manual Deployment
Follow each numbered guide in order for more control and understanding of the process.

## Getting Help

- **Issues?** Check the [Troubleshooting](../KNOWN_ISSUES.md) guide
- **Questions?** Review the [Admin User Guide](../ADMIN_USER_GUIDE.md)
- **Advanced?** See the [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)

## Next Steps

After completing the quick start:
1. Create your master admin account
2. Test wallet connections
3. Configure admin permissions
4. Monitor Firebase Console for activity

---

[Start with Step 1: Environment Setup →](1-ENVIRONMENT-SETUP.md)
