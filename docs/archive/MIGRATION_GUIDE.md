# Migration Guide: Security Updates

This guide helps you migrate your existing Snipe deployment to use the new security features.

## Overview

This update introduces critical security improvements:
- ✅ Bcrypt password hashing for admin accounts
- ✅ Automatic migration from plaintext passwords
- ✅ Removal of hardcoded credentials
- ✅ Environment variable-based configuration

## Migration Steps

### For Existing Deployments

#### Step 1: Update Backend Code
```bash
cd backend
git pull origin main  # or your branch with security fixes
npm install  # ensure bcryptjs is installed
```

#### Step 2: Set Environment Variables

**On Render.com (or your hosting provider):**

1. Go to your backend service settings
2. Update environment variables:
   ```
   MASTER_PASSWORD=YourNewSecurePassword123!
   JWT_SECRET=your-32-character-minimum-secret
   ```
3. **IMPORTANT:** Change `MASTER_PASSWORD` from the old default

**Local Development:**
```bash
cd backend
cp .env.example .env
# Edit .env and set secure values
nano .env
```

#### Step 3: Automatic Password Migration

**Good News:** Existing admin accounts will be automatically upgraded!

When an admin with a plaintext password logs in:
1. The system detects the password is not hashed (doesn't start with `$2`)
2. Password is validated against plaintext
3. If valid, password is immediately hashed with bcrypt
4. Hashed password is saved to database
5. Future logins use bcrypt comparison

**No manual migration needed!** Just ensure admins log in once after deployment.

#### Step 4: Verify Migration

Test the migration:

```bash
# 1. Deploy new code to production

# 2. Test master login with new password
curl -X POST https://your-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"master","password":"YourNewSecurePassword123!"}'

# 3. Have each admin log in once to trigger migration
# Their passwords will be automatically upgraded

# 4. Check logs for migration messages:
# Look for: "[LOGIN] Upgrading plaintext password to hashed for admin: username"
```

#### Step 5: Create New Admins (Optional)

If you want to create fresh admin accounts with hashed passwords:

```bash
# Login as master to get token
MASTER_TOKEN="your-token-here"

# Create new admin with strong password
curl -X POST https://your-api-url.com/api/auth/admin \
  -H "Authorization: Bearer $MASTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin",
    "password": "SecurePassword123!",
    "email": "admin@example.com"
  }'
```

### For Fresh Deployments

#### Step 1: Set Environment Variables

**Render.com:**
```
MONGO_URI=your-mongodb-uri
JWT_SECRET=use-openssl-rand-base64-32
MASTER_USERNAME=master
MASTER_PASSWORD=YourSecurePassword123!
SEED_ADMIN_PASSWORD=AnotherSecurePassword!
```

#### Step 2: Deploy Backend

```bash
cd backend
npm install
# Deploy to Render.com via Git push or manual deploy
```

#### Step 3: Seed Database

**Option A: Via Script**
```bash
MONGO_URI="your-uri" \
SEED_ADMIN_PASSWORD="secure-pass" \
node seed.js
```

**Option B: Via Render.com Shell**
1. Open Render.com Shell for your service
2. Run: `node seed.js`
3. Passwords will be automatically hashed

#### Step 4: Verify Setup

```bash
# Test health endpoint
curl https://your-api-url.com/health

# Test master login
curl -X POST https://your-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"master","password":"YourSecurePassword123!"}'

# Should return token and user object
```

## Verification Checklist

After migration, verify these items:

- [ ] Master login works with new password
- [ ] Old master password no longer works
- [ ] Admin accounts can log in (triggers auto-migration)
- [ ] New admin accounts can be created
- [ ] New admins have hashed passwords (check MongoDB)
- [ ] Password reset works and creates hashed passwords
- [ ] Test scripts require environment variables (not hardcoded)

## Checking Password Hashing

To verify passwords are hashed in MongoDB:

```javascript
// Connect to MongoDB and run:
db.admins.find({}, { username: 1, password: 1 })

// Hashed passwords start with $2a$ or $2b$
// Example: "$2b$10$abc123..."
// If you see plaintext, admin hasn't logged in yet
```

## Security Checklist Post-Migration

- [ ] Changed default `MASTER_PASSWORD`
- [ ] Generated strong `JWT_SECRET` (32+ characters)
- [ ] All admins have logged in (passwords migrated)
- [ ] Verified MongoDB uses SSL/TLS
- [ ] Restricted MongoDB IP whitelist
- [ ] Enabled MongoDB authentication
- [ ] Removed test accounts
- [ ] Updated CORS whitelist if needed
- [ ] Set up monitoring for failed logins
- [ ] Configured log aggregation

## Troubleshooting

### Issue: "Invalid username or password" after migration

**Cause:** Password in database doesn't match
**Solution:**
1. Reset admin password as master:
   ```bash
   curl -X PATCH https://your-api-url.com/api/auth/admin/username/password \
     -H "Authorization: Bearer $MASTER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"newPassword":"NewSecurePass123!"}'
   ```

### Issue: Master login fails with new password

**Cause:** Environment variable not updated on server
**Solution:**
1. Check Render.com environment variables
2. Ensure `MASTER_PASSWORD` is set correctly
3. Restart service after changing env vars

### Issue: Seed script fails

**Cause:** Missing bcryptjs dependency
**Solution:**
```bash
cd backend
npm install bcryptjs
node seed.js
```

### Issue: Old test scripts fail

**Cause:** Scripts require environment variables now
**Solution:**
```bash
# Set password before running
export MASTER_PASSWORD='your-password'
./test-admin-creation.sh

# Or inline:
MASTER_PASSWORD='your-password' ./test-admin-creation.sh
```

## Rollback Plan (Emergency Only)

If you need to rollback (not recommended):

1. **Don't!** The security improvements are critical
2. If absolutely necessary, revert these commits
3. But you'll have security vulnerabilities again
4. Better option: Fix forward by addressing any issues

## Support

If you encounter issues during migration:
1. Check application logs for error messages
2. Verify environment variables are set correctly
3. Test with curl commands to isolate the issue
4. Review SECURITY.md for best practices

## Timeline

**Recommended Migration Schedule:**

- **Day 1:** Update code, set new master password
- **Day 2-3:** Monitor as admins log in (automatic migration)
- **Day 4:** Verify all passwords are hashed in database
- **Day 5:** Remove any test accounts, finalize security settings

**Maintenance Window:** Not required - migration happens automatically with zero downtime!

---

**Last Updated:** 2026-01-08
**Version:** 1.0.0
