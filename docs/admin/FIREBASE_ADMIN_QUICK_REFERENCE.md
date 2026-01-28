# Firebase Admin Management - Quick Reference Card

## 🔑 Creating Admin Accounts

### Step 1️⃣: Firebase Console
```
URL: https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users
Action: Click "Create user"
Email: admin@gmail.com (MUST be real email)
Password: Your choice
```

### Step 2️⃣: Update .env
```
File: Onchainweb/.env

BEFORE:
VITE_ADMIN_ALLOWLIST=master@gmail.com

AFTER:
VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com
```

### Step 3️⃣: Restart Server
```bash
cd /workspaces/Snipe-/Onchainweb
npm run dev
```

### Step 4️⃣: Test Login
```
URL: http://localhost:5175/admin
Email: admin@gmail.com
Password: Your password
```

---

## 🔐 Resetting Passwords

### Quick Method (Firebase Console)
```
1. Open Firebase Console
2. Find admin email
3. Click 3-dot menu → "Reset password"
4. Firebase sends reset email
5. Admin clicks reset link and creates new password
```

### From Dashboard Method
```
1. Master Dashboard → Admin Roles
2. Find admin → Click "🔑 Reset Password"
3. Follow the instructions
```

---

## 📋 Quick Email Reference

**Master Account**
```
Email: master@gmail.com
Dashboard: http://localhost:5175/master-admin
```

**Admin Account (Example)**
```
Email: admin@gmail.com
Dashboard: http://localhost:5175/admin
```

**Additional Admins (Add as needed)**
```
Email: john@gmail.com
Email: sarah@yourdomain.com
Email: support@yourdomain.com
```

---

## 🚨 Common Issues & Fixes

### "Invalid email or password"
```
✓ Email created in Firebase? Check console
✓ Email in .env VITE_ADMIN_ALLOWLIST? Check .env
✓ Server restarted? Run: npm run dev
✓ Cache cleared? Ctrl+Shift+Delete
```

### "You don't have admin access"
```
✓ Add email to VITE_ADMIN_ALLOWLIST in .env
✓ Restart server: npm run dev
✓ Try again
```

### Can't find Firebase Console
```
URL: https://console.firebase.google.com
Select project: YOUR_FIREBASE_PROJECT_ID
Click: Authentication in left sidebar
```

---

## 📊 Configuration Checklist

```
□ Master account created in Firebase
□ Master email in .env VITE_ADMIN_ALLOWLIST
□ Server restarted after .env change
□ Master can login to master-admin
□ Additional admins created in Firebase
□ Admin emails in .env VITE_ADMIN_ALLOWLIST
□ Server restarted after adding admins
□ Admins can login to admin dashboard
```

---

## 🔗 Useful Links

**Firebase Console**
```
https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users
```

**Master Dashboard**
```
http://localhost:5175/master-admin
```

**Admin Dashboard**
```
http://localhost:5175/admin
```

**Dev Server (If not running)**
```bash
cd /workspaces/Snipe-/Onchainweb && npm run dev
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| FIREBASE_ADMIN_SETUP_CHECKLIST.md | Step-by-step checklist |
| FIREBASE_ADMIN_QUICK_SETUP.md | Quick reference guide |
| FIREBASE_ADMIN_MANAGEMENT_GUIDE.md | Detailed guide |
| FIREBASE_ADMIN_IMPLEMENTATION_COMPLETE.md | Implementation summary |

---

## 💡 Pro Tips

✅ Always use REAL email domains (Gmail, company domain)
✅ Add emails to .env BEFORE restarting server
✅ Use strong passwords (8+ chars, mix of case & numbers)
✅ Test new admin immediately after creating
✅ Keep admin list updated in .env
✅ Use Firebase Console for all admin operations

---

## 🔄 Typical Workflow

1. **Create account in Firebase Console** (1 min)
2. **Update .env file** (1 min)
3. **Restart dev server** (1 min)
4. **Test login** (1 min)

**Total Time: ~5 minutes per admin**

---

## 📞 Quick Help Commands

```bash
# Restart dev server
cd /workspaces/Snipe-/Onchainweb && npm run dev

# View .env file
cat Onchainweb/.env | grep VITE_ADMIN_ALLOWLIST

# Check if server is running
curl http://localhost:5175
```

---

## ✅ Done! You can now:

✅ Create admin accounts via Firebase Console
✅ Reset admin passwords via Firebase Console
✅ Manage admin emails via .env file
✅ Test admin access to dashboards
✅ Add multiple admins as needed

---

**Save this as a bookmark or reference for future admin management!**

*Last Updated: January 11, 2026*
