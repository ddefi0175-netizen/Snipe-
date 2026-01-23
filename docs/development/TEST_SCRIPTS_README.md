# Test Scripts - Usage Guide

This directory contains comprehensive test scripts for verifying the Snipe trading platform is ready for production deployment.

## 🚀 Quick Start

Run all tests with a single command:

```bash
./run-all-tests.sh
```

This will execute all 4 test suites and provide a comprehensive report.

---

## 📋 Test Scripts Overview

### 1. `run-all-tests.sh` - Master Test Runner
**Purpose**: Execute all test suites in sequence and generate a final report

**Usage**:
```bash
./run-all-tests.sh
```

**What it tests**:
- Runs all 4 test suites
- Tracks pass/fail status
- Generates comprehensive summary
- Reports total execution time

**Expected Output**: All 4 test suites should pass

---

### 2. `test-firebase-realtime.sh` - Firebase Real-Time Data Integration
**Purpose**: Verify that all app functions work with real-time Firebase data

**Usage**:
```bash
./test-firebase-realtime.sh
```

**What it tests**:
- Firebase configuration files (firebase.config.js, firebase.service.js)
- Firestore security rules (authentication, admin roles, owner validation)
- Firebase collections (users, admins, trades, deposits, etc.)
- Real-time listener functions (onSnapshot, saveChatMessage)
- Firebase Authentication functions (signIn, signUp, signOut)
- Database indexes configuration

**Tests**: 23 individual checks  
**Expected Result**: 23 passed, 0 failed, ~4 warnings (non-critical)

---

### 3. `test-admin-access-control.sh` - Admin and Master Access Control
**Purpose**: Ensure admin and master accounts can properly control their designated functions

**Usage**:
```bash
./test-admin-access-control.sh
```

**What it tests**:
- Admin routes configuration (/admin, /master-admin)
- Admin component files (AdminPanel.jsx, MasterAdminDashboard.jsx)
- Permission system implementation (6+ core permissions)
- Firebase security rules for admin data
- Admin authentication implementation
- Real-time data access for admins
- No hardcoded credentials
- Environment variable usage
- Activity logging system

**Tests**: 21 individual checks  
**Expected Result**: 21 passed, 0 failed, ~4 warnings (non-critical)

**Permissions Verified**:
- manageUsers
- manageBalances
- manageKYC
- manageTrades
- manageDeposits
- manageWithdrawals

---

### 4. `test-login-functionality.sh` - Login Functionality
**Purpose**: Verify that all login systems work properly without errors

**Usage**:
```bash
./test-login-functionality.sh
```

**What it tests**:
- Firebase Authentication setup
- Wallet connection system
- Login form components
- Session management
- Protected routes
- Error handling
- Multi-wallet support (11 providers)
- No plaintext password storage
- Firebase Auth configuration
- Login documentation

**Tests**: 23 individual checks  
**Expected Result**: 23 passed, 0 failed, ~2 warnings (non-critical)

**Login Systems Verified**:
1. Firebase Auth (admin/master): Email + Password
2. Wallet Auth (users): MetaMask, Trust Wallet, WalletConnect, etc.

---

### 5. `test-production-readiness.sh` - Production Readiness
**Purpose**: Comprehensive verification that the app is ready for public release

**Usage**:
```bash
./test-production-readiness.sh
```

**What it tests**:
- Frontend build (successful compilation)
- Security audit (no vulnerabilities)
- Environment configuration (all required variables)
- Firebase configuration files
- Firestore security rules validation
- Git configuration (.gitignore)
- Documentation completeness
- Deployment configuration
- CI/CD workflows
- No sensitive data in code
- package.json validation
- License file presence

**Tests**: 30 individual checks  
**Expected Result**: 30 passed, 0 failed, 0 warnings

---

## 📊 Test Results Interpretation

### ✅ PASS
All critical tests passed - no action required

### ❌ FAIL
Critical issue detected - must be fixed before production

### ⚠️ WARNING
Non-critical issue or expected condition - review recommended but not blocking

---

## 🔍 Individual Test Execution

You can run each test script individually:

```bash
# Test Firebase real-time data integration
./test-firebase-realtime.sh

# Test admin access controls
./test-admin-access-control.sh

# Test login functionality
./test-login-functionality.sh

# Test production readiness
./test-production-readiness.sh
```

---

## 📈 Expected Results

When running `./run-all-tests.sh`, you should see:

```
╔═══════════════════════════════════════════════════════════════╗
║           ✅  ALL TESTS PASSED SUCCESSFULLY! ✅             ║
║                                                               ║
║           The application is ready for:                       ║
║           • Public release                                    ║
║           • Production deployment                             ║
║           • Real-time data operations                         ║
║           • Admin and master account control                  ║
╚═══════════════════════════════════════════════════════════════╝
```

**Summary Statistics**:
- Total Tests: 4 test suites
- Individual Tests: 97 checks
- Pass Rate: 100%
- Execution Time: ~9 seconds

---

## 🐛 Troubleshooting

### Test Script Not Executable
```bash
chmod +x test-*.sh run-all-tests.sh
```

### Tests Fail Due to Missing Dependencies
```bash
cd Onchainweb
npm install
cd ..
```

### Build Test Fails
```bash
cd Onchainweb
npm run build
# Check for errors in build output
```

### Firebase Configuration Test Fails
- Ensure Firebase config files exist (firestore.rules, firebase.json, etc.)
- Check Onchainweb/src/config/firebase.config.js exists
- Verify .env.example has all required Firebase variables

---

## 📚 Documentation

After running tests, see these documents for more information:

- **[COMPREHENSIVE_TEST_REPORT.md](COMPREHENSIVE_TEST_REPORT.md)** - Detailed test results and statistics
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions
- **[FINAL_VERIFICATION_SUMMARY.md](FINAL_VERIFICATION_SUMMARY.md)** - Requirement compliance verification

---

## 🚀 After Tests Pass

Once all tests pass, you're ready for production:

1. ✅ Review test results
2. 📝 Follow [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)
3. 🔥 Configure Firebase project
4. 🚀 Deploy to production
5. ✅ Verify in production environment

---

## 💡 Tips

- Run tests before every deployment
- Add test execution to your CI/CD pipeline
- Keep test scripts updated as features are added
- Review warnings even if tests pass
- Run tests after dependency updates

---

## 📞 Support

If tests fail unexpectedly:
1. Check the detailed error messages
2. Review the specific test script that failed
3. Verify all prerequisites are met
4. Check Firebase configuration
5. Review documentation for the failing component

---

**Test Framework Version**: 1.0.0  
**Last Updated**: January 9, 2026  
**Maintained By**: Snipe Development Team

✅ **Ready to Test? Run**: `./run-all-tests.sh`
