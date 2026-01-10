# 🔐 Security Notice - Environment Configuration

## ⚠️ IMPORTANT: Secret Management

This repository follows security best practices by **NOT** committing sensitive credentials to version control.

### What's Committed
- ✅ `.env.example` files with placeholder values
- ✅ Documentation with configuration instructions
- ✅ `.gitignore` rules to exclude `.env` files

### What's NOT Committed (Secured Locally)
- ❌ Actual `.env` files with real secrets
- ❌ JWT secrets
- ❌ Master passwords
- ❌ Database connection strings
- ❌ API keys
- ❌ Firebase credentials

## 🔧 Configuration Required

After cloning this repository, you MUST create and configure your own environment files:

### Backend Configuration

1. **Copy the example file**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Generate secure secrets**:
   ```bash
   # Generate JWT secret (256-bit)
   openssl rand -base64 32
   
   # Generate master password (128-bit minimum)
   openssl rand -base64 16
   ```

3. **Edit `backend/.env`** and replace placeholders:
   ```env
   # Use the secrets you generated above
   JWT_SECRET=<paste-your-jwt-secret-here>
   MASTER_PASSWORD=<paste-your-master-password-here>
   MONGO_URI=<your-mongodb-connection-string>
   ```

### Frontend Configuration

1. **Copy the example file**:
   ```bash
   cd Onchainweb
   cp .env.example .env
   ```

2. **Get Firebase credentials**:
   - Go to https://console.firebase.google.com
   - Create or select your project
   - Go to Project Settings → Your apps → Web app
   - Copy the configuration values

3. **Edit `Onchainweb/.env`** and paste your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=<your-api-key>
   VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=<your-project-id>
   # ... etc
   ```

## 🛡️ Security Best Practices

### Do's ✅
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use different secrets for dev/staging/production
- ✅ Rotate secrets regularly (every 90 days minimum)
- ✅ Use strong, randomly-generated secrets
- ✅ Store production secrets in secure secret management systems
- ✅ Use environment variables in deployment platforms

### Don'ts ❌
- ❌ Never commit `.env` files to git
- ❌ Never share secrets via email, Slack, or other insecure channels
- ❌ Never use simple/guessable passwords
- ❌ Never reuse secrets across environments
- ❌ Never log secrets to console or files
- ❌ Never expose secrets in error messages

## 📝 If You Accidentally Committed Secrets

If you accidentally committed secrets to git:

1. **Immediately revoke/regenerate** all exposed secrets
2. **Remove from git history** using:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** to remote (if you have access)
4. **Treat all exposed secrets as compromised**
5. **Update all deployment environments** with new secrets

## 🔍 How to Verify Your Setup

### Check Backend
```bash
cd backend
node -e "require('dotenv').config(); console.log('JWT_SECRET length:', process.env.JWT_SECRET.length); console.log('MASTER_PASSWORD set:', !!process.env.MASTER_PASSWORD);"
```

Expected output:
```
JWT_SECRET length: 44  (or more)
MASTER_PASSWORD set: true
```

### Check Frontend
```bash
cd Onchainweb
node -e "require('dotenv').config(); console.log('Firebase configured:', !!process.env.VITE_FIREBASE_API_KEY && !process.env.VITE_FIREBASE_API_KEY.includes('YOUR_'));"
```

Expected output:
```
Firebase configured: true
```

## 📚 Additional Resources

- [Backend Environment Variables Guide](backend/.env.example)
- [Frontend Environment Variables Guide](Onchainweb/.env.example)
- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [Security Best Practices](SECURITY.md)

## 🤝 Questions?

If you have questions about security configuration:
1. Review this document and the example .env files
2. Check the project documentation
3. Open an issue on GitHub (DO NOT include actual secrets in issues!)

---

**Last Updated**: 2026-01-10  
**Security Level**: Production Ready (when properly configured)
