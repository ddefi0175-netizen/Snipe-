# Environment Configuration

This `.env` file has been created with default development settings to enable admin features.

## 🚨 IMPORTANT: Configure Before Use

This file contains **placeholder values** that MUST be replaced with your actual Firebase credentials.

### Required Steps:

1. **Get Firebase Configuration**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project (or create a new one)
   - Go to Project Settings → General → Your apps
   - Select your web app or create a new one
   - Copy the Firebase configuration values

2. **Update Firebase Variables**
   Replace these placeholders in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
   ```

3. **Get WalletConnect Project ID**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Create a free project
   - Copy your Project ID
   - Replace: `VITE_WALLETCONNECT_PROJECT_ID=your-project-id`

4. **Configure Admin Access**
   - Update `VITE_ADMIN_ALLOWLIST` with your Firebase Auth email(s)
   - Example: `VITE_ADMIN_ALLOWLIST=your-email@domain.com,admin@domain.com`

5. **Create Firebase Auth Account**
   - Go to Firebase Console → Authentication → Users
   - Click "Add user"
   - Use the email from your allowlist
   - Set a secure password

6. **Create Admin Document in Firestore**
   - Go to Firebase Console → Firestore Database
   - Create collection: `admins`
   - Add document with these fields:
     ```
     email: "your-email@domain.com"
     uid: "[your Firebase Auth UID]"
     role: "master"
     permissions: ["all"]
     createdAt: [current timestamp]
     ```

7. **Restart Dev Server**
   ```bash
   npm run dev
   ```

## 📚 Documentation

For detailed setup instructions, see:
- `MASTER_ADMIN_ACCESS_FIX.md` - Complete fix documentation
- `MASTER_ACCOUNT_EXECUTIVE_SUMMARY.md` - Master account overview
- `MASTER_LOGIN_QUICK_START.md` - Quick start guide
- `.env.example` - Full environment variable reference
- `docs/admin/ADMIN_SETUP_GUIDE.md` - Admin setup guide

## 🔒 Security Notes

1. **Never commit this file** - `.env` is in `.gitignore`
2. Use strong passwords for Firebase Auth accounts
3. Only add trusted emails to `VITE_ADMIN_ALLOWLIST`
4. Keep Firebase credentials secure
5. Use environment-specific configurations for production

## ⚠️ Production Deployment

For production:
1. Set environment variables in your hosting platform (Vercel, Firebase, etc.)
2. Do NOT use this `.env` file in production
3. Use production Firebase project (not development)
4. Enable security rules in Firestore
5. Set `VITE_ENABLE_STRICT_AUTH=true`

## 🆘 Troubleshooting

**Issue: Admin routes show "disabled" message**
- Verify `VITE_ENABLE_ADMIN=true`
- Restart dev server
- Hard refresh browser (Ctrl+Shift+R)

**Issue: Login fails with "unauthorized user"**
- Check email is in `VITE_ADMIN_ALLOWLIST`
- Verify email matches Firebase Auth account
- Check for typos or extra spaces

**Issue: Firebase errors**
- Verify all 8 Firebase variables are set
- Check values are correct (no placeholders)
- Ensure Firebase project exists and is active

For more help, see `MASTER_LOGIN_TROUBLESHOOTING.md`
