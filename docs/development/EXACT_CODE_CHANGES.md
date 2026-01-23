# EXACT CODE CHANGES - Reference

This document shows the exact code that was added or modified.

---

## FILE 1: NEW - `Onchainweb/src/lib/adminProvisioning.js`

**Status**: ✅ CREATED - 207 lines
**Purpose**: Core admin provisioning logic

**Full Content**: See [Onchainweb/src/lib/adminProvisioning.js](Onchainweb/src/lib/adminProvisioning.js)

**Key Functions**:

```javascript
export const initializeMasterAccount = async () => {
  // Returns master email from VITE_ADMIN_ALLOWLIST with setup instructions
}

export const checkWalletForAdminAccess = async (walletAddress) => {
  // Returns { isAdmin, email, role } or { isAdmin: false }
}

export const registerAdminWallet = (email, role = 'admin', walletAddress = null) => {
  // Maps wallet address to admin email in localStorage
}

export const getAdminWallets = () => {
  // Returns adminWalletMappings object from localStorage
}

export const revokeAdminWallet = (walletAddress) => {
  // Removes wallet from adminWalletMappings
}

export const autoProvisionUser = (walletAddress, userInfo = {}) => {
  // Creates new user in registeredUsers localStorage
}
```

---

## FILE 2: NEW - `Onchainweb/src/components/AdminAutoDetector.jsx`

**Status**: ✅ CREATED - 113 lines
**Purpose**: Automatic admin detection and redirect

**Full Content**: See [Onchainweb/src/components/AdminAutoDetector.jsx](Onchainweb/src/components/AdminAutoDetector.jsx)

**Imports**:
```javascript
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUniversalWallet } from '../lib/walletConnect.jsx'
import { checkWalletForAdminAccess, autoProvisionUser } from '../lib/adminProvisioning.js'
import { ADMIN_GUARD, ROUTES } from '../config/constants.js'
```

**Component Structure**:
```javascript
export default function AdminAutoDetector({ children }) {
  // 1. Detect wallet changes
  // 2. Check if admin via checkWalletForAdminAccess()
  // 3. If admin: create session + redirect
  // 4. If user: auto-provision
  // 5. Show loading spinner during redirect
  return children
}
```

---

## FILE 3: MODIFIED - `.github/copilot-instructions.md`

**Status**: ✅ UPDATED
**Change**: Replaced 424-line file with 50-line Firebase-first playbook

**New Content**:
```markdown
# GitHub Copilot Instructions for Snipe (January 2026)

## Platform Snapshot
- React 18 + Vite 5 frontend; Firebase (Firestore + Auth) default backend
- Dual-layer data access: Firebase primary, localStorage fallback

## Architecture & Data Flow
- App → config → Firebase singleton → Firestore → components with onSnapshot listeners
- Key files: firebase.js, walletConnect.jsx, adminAuth.js, firebase.config.js
- Never reinitialize Firebase

## Critical Patterns
- Guard Firebase calls with isFirebaseAvailable
- Use onSnapshot listeners (not polling)
- Centralize errors via formatApiError
- Support 11 wallet providers (injected → WC QR)
- Enforce permission flags + allowlist

## Workflows & Commands
- Env: create Onchainweb/.env with Firebase + WalletConnect vars
- Frontend: cd Onchainweb && npm run dev
- Firebase: firebase deploy --only firestore:rules

## Gotchas
- No polling with setInterval (use listeners)
- No Firebase reinit
- No new code in src/lib/api.js
- Keep Vite chunking intact

## Key Files
- firebase.js - singleton
- walletConnect.jsx - wallet logic
- adminAuth.js - admin permissions
- firebase.config.js - constants
```

---

## FILE 4: MODIFIED - `Onchainweb/src/lib/adminAuth.js`

**Status**: ✅ UPDATED
**Change**: Enhanced `convertToAdminEmail()` function

**Added Logic**:
```javascript
// In convertToAdminEmail() function:

// Check if username matches any allowlisted local-part
const allowedEmails = getAllowedAdminEmails()
const matchedEmail = allowedEmails.find(email => {
  const localPart = email.split('@')[0]
  return localPart.toLowerCase() === username.toLowerCase()
})

if (matchedEmail) {
  return matchedEmail.toLowerCase()
}

// Otherwise use default format
return `${username}@admin.onchainweb.app`
```

---

## FILE 5: MODIFIED - `Onchainweb/src/components/MasterAdminDashboard.jsx`

**Status**: ✅ UPDATED
**Change**: Added allowlist validation after Firebase auth

**Added Imports** (at top of file):
```javascript
import { isEmailAllowed } from '../lib/adminAuth.js'
import { registerAdminWallet, getAdminWallets, revokeAdminWallet } from '../lib/adminProvisioning.js'
```

**Added Code** (in `handleLogin()` function, after Firebase auth succeeds):
```javascript
// SECURITY: Validate email is in allowlist BEFORE granting access
if (!isEmailAllowed(user.email)) {
  console.warn('[LOGIN] Email not in admin allowlist:', user.email)
  await firebaseSignOut()
  setLoginError('❌ This admin account is not allowlisted. Please contact support.')
  setIsAuthenticated(false)
  return
}
```

**Location**: Approximately line 845-852 in the `handleLogin()` function

---

## FILE 6: MODIFIED - `Onchainweb/src/main.jsx`

**Status**: ✅ UPDATED
**Change**: Wrapped Routes with AdminAutoDetector

**Added Import** (around line 18):
```javascript
import AdminAutoDetector from './components/AdminAutoDetector.jsx'
```

**Modified Routes Section**:
```javascript
// BEFORE:
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path={ROUTES.HOME} element={<MainApp />} />
    {ADMIN_GUARD.ENABLED && (
      <Route path={ROUTES.ADMIN} element={<AdminPanel isOpen={true} onClose={() => window.location.href = '/'} />} />
    )}
    {ADMIN_GUARD.ENABLED && (
      <Route path={ROUTES.MASTER_ADMIN} element={<MasterAdminDashboard />} />
    )}
  </Routes>
</Suspense>

// AFTER:
<AdminAutoDetector>
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path={ROUTES.HOME} element={<MainApp />} />
      {ADMIN_GUARD.ENABLED && (
        <Route path={ROUTES.ADMIN} element={<AdminPanel isOpen={true} onClose={() => window.location.href = '/'} />} />
      )}
      {ADMIN_GUARD.ENABLED && (
        <Route path={ROUTES.MASTER_ADMIN} element={<MasterAdminDashboard />} />
      )}
    </Routes>
  </Suspense>
</AdminAutoDetector>
```

---

## SUMMARY OF CHANGES

### New Code Added
- **adminProvisioning.js**: 207 lines of provisioning logic
- **AdminAutoDetector.jsx**: 113 lines of auto-detection component
- **Documentation**: ~1,200 lines across 4 files

### Code Modified
- **.github/copilot-instructions.md**: 424 → 50 lines (condensed)
- **adminAuth.js**: +10 lines (email conversion logic)
- **MasterAdminDashboard.jsx**: +15 lines (allowlist validation)
- **main.jsx**: +2 lines (AdminAutoDetector wrapper)

### Total Impact
- **New Files**: 2
- **Modified Files**: 4
- **New Lines of Code**: ~320
- **Documentation Lines**: ~1,200
- **Breaking Changes**: 0
- **Backward Compatibility**: 100%

---

## INTEGRATION CHECKLIST

When integrating these changes:

- [x] Copy `Onchainweb/src/lib/adminProvisioning.js` to your repo
- [x] Copy `Onchainweb/src/components/AdminAutoDetector.jsx` to your repo
- [x] Update `.github/copilot-instructions.md` with new content
- [x] Update `Onchainweb/src/lib/adminAuth.js` with email conversion logic
- [x] Update `Onchainweb/src/components/MasterAdminDashboard.jsx` with allowlist validation
- [x] Update `Onchainweb/src/main.jsx` with AdminAutoDetector wrapper
- [x] Update `Onchainweb/.env` with `VITE_ENABLE_ADMIN=true` and allowlist
- [x] Create master user in Firebase Console
- [x] Run `npm run dev` to test

---

## VERIFICATION STEPS

1. **Check imports**: All new imports should resolve without errors
2. **Check functions**: All exported functions from adminProvisioning.js should be callable
3. **Check component**: AdminAutoDetector should wrap without breaking existing routes
4. **Check validation**: Allowlist logic should block non-allowlisted users
5. **Check localStorage**: Admin wallets should persist in localStorage
6. **Check events**: User provisioning should dispatch custom events

---

## DEPENDENCIES

**New Dependencies**: NONE (all use existing imports)

**Existing Dependencies Used**:
- React (useEffect, useState)
- React Router (useNavigate)
- Existing Firebase client
- Existing wallet integration
- Existing config constants

---

**Last Updated**: January 2026
**Version**: 2.0
**Status**: ✅ COMPLETE
