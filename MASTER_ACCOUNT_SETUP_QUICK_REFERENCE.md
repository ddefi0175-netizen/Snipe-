# 🔐 Master Account Setup - Quick Reference

> **30-Second Overview**

## 🎯 What You Need

1. ✅ Firebase Console access
2. ✅ Password manager
3. ✅ 5-10 minutes

---

## 🚀 Quick Setup (3 Methods)

### Method 1: Automated Script (⭐ RECOMMENDED)

```bash
./setup-master-account-secure.sh
```
✅ Generates secure password  
✅ Opens Firebase Console  
✅ Step-by-step guidance  

---

### Method 2: Manual Setup

```
1. Generate password → https://passwordsgenerator.net/
   Settings: 16+ chars, mixed case, numbers, symbols

2. Firebase Console → Authentication → Add User
   Email: master@onchainweb.site
   Password: [your generated password]

3. Update Onchainweb/.env
   VITE_ENABLE_ADMIN=true
   VITE_ADMIN_ALLOWLIST=master@onchainweb.site

4. Restart dev server
   cd Onchainweb && npm run dev

5. Login at http://localhost:5173/master-admin
```

---

### Method 3: Command Line

```bash
# Generate password
PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-20)

# Save to password manager, then create in Firebase Console
echo "Password: $PASSWORD"
```

---

## 📝 Credentials Template

```
Service:  Snipe Master Admin
URL:      https://onchainweb.site/master-admin
Email:    master@onchainweb.site
Password: [Your 16+ char secure password]
Role:     master (full permissions)
Created:  [Today's date]
```

---

## ⚠️ Critical Security Rules

### ✅ DO:
- Use password manager
- 16+ character passwords
- Unique passwords only
- Enable Firebase 2FA
- Delete temporary files

### ❌ DON'T:
- Share credentials
- Use weak passwords
- Store in plain text
- Commit to git
- Reuse passwords

---

## 🔍 Verification Checklist

After setup, verify:

- [ ] Account exists in Firebase Console → Authentication
- [ ] Email in `VITE_ADMIN_ALLOWLIST`
- [ ] Password saved in password manager
- [ ] Can login at `/master-admin` route
- [ ] Master Dashboard loads
- [ ] All features accessible

---

## 🆘 Quick Troubleshooting

| Error | Fix |
|-------|-----|
| "Email not in allowlist" | Check `.env` → `VITE_ADMIN_ALLOWLIST` |
| "Account not found" | Create in Firebase Console → Authentication |
| "Wrong password" | Check password manager, no extra spaces |
| "Firebase not available" | Set all 7 Firebase env vars |

---

## 📚 Full Documentation

For detailed instructions, see:
👉 **[MASTER_PASSWORD_SETUP_GUIDE.md](./MASTER_PASSWORD_SETUP_GUIDE.md)**

---

## 🎓 Visual Flow

```
START
  ↓
Generate Strong Password (16+ chars)
  ↓
Save to Password Manager
  ↓
Create Account in Firebase Console
  ↓
Update .env with Admin Allowlist
  ↓
Restart Development Server
  ↓
Login at /master-admin
  ↓
SUCCESS! ✅
```

---

## 🔗 Related Resources

- [ADMIN_SYSTEM_SETUP_GUIDE.md](./ADMIN_SYSTEM_SETUP_GUIDE.md)
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
- [HOW_TO_CREATE_ADMIN_CREDENTIALS.md](./HOW_TO_CREATE_ADMIN_CREDENTIALS.md)

---

**Last Updated:** January 27, 2026  
**Version:** 2.0 (Firebase-first)
