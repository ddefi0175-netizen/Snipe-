# 🔐 MASTER ACCOUNT CREDENTIALS - QUICK REFERENCE

**Status**: ✅ Active (Updated Jan 18, 2026)

## Login Credentials

```
Username: snipe_admin_secure_7ecb869e
Password: WQAff7VnYKqV1+qes2hHFvTGJToJvwk1sNLvZTXAW3E=
```

## Access URLs

| Environment | URL |
|-------------|-----|
| Master Dashboard | https://www.onchainweb.app/master-admin |
| Admin Dashboard | https://www.onchainweb.app/admin |
| Backend API | https://snipe-api.onrender.com/api |

## Quick Login Test

```bash
# Test via curl
curl -X POST https://snipe-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "snipe_admin_secure_7ecb869e",
    "password": "WQAff7VnYKqV1+qes2hHFvTGJToJvwk1sNLvZTXAW3E="
  }'

# Test via environment variables
export MASTER_PASSWORD='WQAff7VnYKqV1+qes2hHFvTGJToJvwk1sNLvZTXAW3E='
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

## Documents

| Document | Purpose |
|----------|---------|
| [MASTER_ACCOUNT_ACCESS_GUIDE.md](MASTER_ACCOUNT_ACCESS_GUIDE.md) | Complete login guide |
| [CREDENTIAL_ROTATION_SUMMARY.md](CREDENTIAL_ROTATION_SUMMARY.md) | Technical details |
| [MASTER_CREDENTIAL_ROTATION_COMPLETE.md](MASTER_CREDENTIAL_ROTATION_COMPLETE.md) | Full summary |

## Recent Changes

- **Jan 18, 2026**: Rotated password from `Snipe$Admin@Secure#2025!7d97a66f` to new secure credential
- **Commits**: df532b7, 5ed0e0e, 3d07b16

## Environment Variables

For deployment systems, set:

```env
MASTER_USERNAME=snipe_admin_secure_7ecb869e
MASTER_PASSWORD=WQAff7VnYKqV1+qes2hHFvTGJToJvwk1sNLvZTXAW3E=
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
