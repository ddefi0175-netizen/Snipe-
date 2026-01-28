# 🔐 MASTER ACCOUNT CREDENTIALS - QUICK REFERENCE

**Status**: ✅ Active (Updated Jan 18, 2026)
**Note**: This is an archived document. Actual credentials are in `backend/.env` and should NOT be in git.

## Login Credentials

```
Username: [STORED IN backend/.env as MASTER_USERNAME]
Password: [STORED IN backend/.env as MASTER_PASSWORD]
```

**⚠️ SECURITY WARNING**: Never commit actual credentials to git repositories!

## Access URLs

| Environment | URL |
|-------------|-----|
| Master Dashboard | https://www.onchainweb.app/master-admin |
| Admin Dashboard | https://www.onchainweb.app/admin |
| Backend API | https://snipe-api.onrender.com/api |

## Quick Login Test

```bash
# Test via curl (using env vars)
curl -X POST https://snipe-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$MASTER_USERNAME\",
    \"password\": \"$MASTER_PASSWORD\"
  }"

# Test via environment variables
export MASTER_PASSWORD='your-master-password'
./test-admin-realtime.sh
```

## Master Permissions

✅ Full platform control:
- User management (view, edit, freeze)
- Admin account creation
- Financial operations (deposits, withdrawals)
- System settings
- Audit logs and activity monitoring

## Security Notes

⚠️ **Important**:
- Never share via email or chat
- Use password manager for storage
- Store as environment variable: `MASTER_PASSWORD`
- Rotate password quarterly
- Log out after session ends
- NEVER commit credentials to version control

## Documents

| Document | Purpose |
|----------|---------|
| [MASTER_ACCOUNT_ACCESS_GUIDE.md](MASTER_ACCOUNT_ACCESS_GUIDE.md) | Complete login guide |
| [CREDENTIAL_ROTATION_SUMMARY.md](CREDENTIAL_ROTATION_SUMMARY.md) | Technical details |
| [MASTER_CREDENTIAL_ROTATION_COMPLETE.md](MASTER_CREDENTIAL_ROTATION_COMPLETE.md) | Full summary |

## Recent Changes

- **Jan 18, 2026**: Rotated password to new secure credential
- **Security Fix**: Removed hardcoded credentials from all documentation
- **Commits**: df532b7, 5ed0e0e, 3d07b16

## Environment Variables

For deployment systems, set in your secure environment (not in git):

```env
MASTER_USERNAME=your-master-username
MASTER_PASSWORD=your-master-password
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Verify credentials exactly (no spaces) |
| Backend timeout | Render.com free tier sleeps (30-60s startup) |
| Env vars not working | Restart service after updating variables |
| Vercel still using old password | Manually update in Vercel dashboard |

---

**Generated**: January 18, 2026
**Status**: ✅ Active and Verified
**Security Update**: January 28, 2026 - Removed exposed credentials
