# Master Account Credentials - Quick Reference

**Generated**: January 26, 2026

---

## 🚀 Quick Answer

To check your master account credentials, run:

```bash
./check-master-credentials.sh
```

Or read the comprehensive guide:

```bash
cat CHECK_MASTER_ACCOUNT.md
```

---

## 🔐 Current Master Account Credentials

### Firebase Authentication (Primary - Recommended)

**Master Account Email**: Check your `Onchainweb/.env` file:
```bash
grep VITE_ADMIN_ALLOWLIST Onchainweb/.env
```

The email starting with `master@` or having local-part `master` is your master account.

**Password**: Set in [Firebase Console](https://console.firebase.google.com)
- Go to Authentication → Users
- Find the master email
- If forgotten, click "Reset Password"

**Login URL**: 
- Development: http://localhost:5173/master-admin
- Production: https://www.onchainweb.app/master-admin

---

### Legacy Backend (Deprecated - For Reference Only)

**⚠️ SECURITY NOTE**: Actual credentials should NEVER be committed to version control.

**Credentials Location**: 
- Stored in secure environment variables (`backend/.env` or deployment platform)
- Reference: See `docs/admin/MASTER_ACCOUNT_ACCESS_GUIDE.md` (in secure deployment environment)

**API Endpoint**: `https://snipe-api.onrender.com/api/auth/login`

**⚠️ Important**: This is for the deprecated MongoDB backend. Use Firebase for new deployments.

---

## 📚 Documentation Files

### For Master Account Setup:
1. **CHECK_MASTER_ACCOUNT.md** - Comprehensive credential verification guide
2. **HOW_TO_CREATE_ADMIN_CREDENTIALS.md** - How to create Firebase admin accounts
3. **check-master-credentials.sh** - Automated credential checker script

### For Admin Features:
4. **ADMIN_USER_GUIDE.md** - How to use admin features
5. **docs/admin/MASTER_ACCOUNT_ACCESS_GUIDE.md** - Legacy backend credentials

---

## 🔧 Quick Commands

### Check Current Setup
```bash
# View current admin configuration
grep "VITE_ENABLE_ADMIN\|VITE_ADMIN_ALLOWLIST" Onchainweb/.env

# Run automated checker
./check-master-credentials.sh
```

### Test Firebase Login
```bash
# Start dev server
cd Onchainweb && npm run dev

# Open browser to: http://localhost:5173/master-admin
# Login with Firebase email/password
```

### Test Legacy Backend Login (API)
```bash
# Set your credentials in environment variables (NEVER commit these)
export LEGACY_USERNAME="[your_username]"
export LEGACY_PASSWORD="[your_password]"

curl -X POST https://snipe-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${LEGACY_USERNAME}\",
    \"password\": \"${LEGACY_PASSWORD}\"
  }"
```

**Note**: Replace placeholders with actual credentials from secure storage. See `docs/admin/MASTER_ACCOUNT_ACCESS_GUIDE.md`.

---

## 🆘 Common Issues

### "I forgot my Firebase password"
→ Reset via Firebase Console → Authentication → Users → Reset Password

### "Email not in admin allowlist"  
→ Add email to `VITE_ADMIN_ALLOWLIST` in `Onchainweb/.env`

### "Admin account not found in Firebase"
→ Create account in Firebase Console → Authentication → Add User

### "Legacy backend not responding"
→ Backend sleeps after inactivity (30-60 sec startup time)

---

## ✅ System Status

**Firebase Authentication**: ✅ Active (Recommended)
- Modern, serverless, 99.95% uptime
- Use this for all new deployments

**Legacy Backend**: ⚠️ Deprecated
- MongoDB + Express backend is no longer recommended
- Keep for backward compatibility only

---

**Need more help?** Read the comprehensive guide:
```bash
cat CHECK_MASTER_ACCOUNT.md
```
