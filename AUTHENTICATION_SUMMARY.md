# Authentication System Summary

## Quick Reference

### 🔐 Two Ways to Access the Platform

```
┌─────────────────────────────────────────────────────────────────┐
│                    SNIPE PLATFORM ACCESS                        │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐          ┌──────────────────────┐
    │   REGULAR USERS      │          │  ADMIN / MASTER      │
    │   Route: /           │          │  Route: /admin       │
    │                      │          │  Route: /master-admin│
    └──────────────────────┘          └──────────────────────┘
              │                                  │
              ▼                                  ▼
    ┌──────────────────────┐          ┌──────────────────────┐
    │  WALLET REQUIRED     │          │  NO WALLET NEEDED    │
    │  ───────────────     │          │  ────────────────    │
    │  • MetaMask          │          │  • Username          │
    │  • Trust Wallet      │          │  • Password          │
    │  • 11+ wallets       │          │  • JWT Token         │
    │  • Connect & Sign    │          │  • Any Browser       │
    └──────────────────────┘          └──────────────────────┘
              │                                  │
              ▼                                  ▼
    ┌──────────────────────┐          ┌──────────────────────┐
    │  USER FEATURES       │          │  ADMIN FEATURES      │
    │  ─────────────       │          │  ──────────────      │
    │  • Trading           │          │  • User Management   │
    │  • Deposits          │          │  • Deposits/Withdraw │
    │  • Withdrawals       │          │  • KYC Verification  │
    │  • Live Chat         │          │  • Live Trades       │
    │  • Dashboard         │          │  • Settings          │
    └──────────────────────┘          └──────────────────────┘
```

## Access URLs

### For Regular Users
```
URL: https://www.onchainweb.app/
     └─> Shows: Wallet connection buttons
     └─> Required: Web3 wallet (MetaMask, Trust Wallet, etc.)
     └─> Storage: localStorage.walletConnected = "true"
```

### For Admin Accounts
```
URL: https://www.onchainweb.app/admin
     └─> Shows: Login form (username + password)
     └─> Required: Admin credentials (no wallet!)
     └─> Storage: localStorage.adminToken = "jwt_token"

URL: https://www.onchainweb.app/master-admin
     └─> Shows: Login form (username + password)
     └─> Required: Master credentials (no wallet!)
     └─> Storage: localStorage.adminToken = "jwt_token"
```

## Step-by-Step Login

### Regular User Login (With Wallet)
```
1. Visit: /
2. See: "Connect Your Wallet" screen with wallet buttons
3. Click: Your wallet (e.g., MetaMask)
4. Action: Approve connection in wallet popup
5. Result: Access granted to trading platform
```

### Admin/Master Login (No Wallet)
```
1. Visit: /admin or /master-admin
2. See: Login form with username and password fields
3. Enter: Your admin username (e.g., "master")
4. Enter: Your admin password
5. Click: Login button
6. Result: Access granted to admin dashboard
   ⚠️ NO wallet needed at any step!
```

## Storage Comparison

### User Authentication (Wallet-Based)
```javascript
// Stored in localStorage after wallet connection
{
  "walletConnected": "true",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "walletType": "metamask",
  "backendUserId": "user_123"
}
```

### Admin Authentication (Password-Based)
```javascript
// Stored in localStorage after admin login
{
  "adminToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "masterAdminSession": {
    "username": "master",
    "role": "master",
    "timestamp": 1704556800000
  }
}
```

**Notice**: Completely different keys! No overlap!

## API Endpoints

### User Endpoints
```
POST /api/users/login-by-wallet
     Body: { walletAddress, username, email, walletType }
     Auth: Wallet signature
     Returns: User object with userId
```

### Admin Endpoints
```
POST /api/auth/login
     Body: { username, password }
     Auth: Password verification + JWT
     Returns: { token, user: { username, role, permissions } }
```

## Security Model

### User Security
- Wallet signature verification
- Address-based identification
- Non-custodial (user controls keys)
- Session ends on disconnect

### Admin Security
- bcrypt password hashing (10 rounds)
- JWT token with 24-hour expiration
- Role-based access control
- Audit logging of all actions

## Common Questions

### Q: Do admins need a crypto wallet?
**A: No! Admins only need a username and password.**

### Q: Can I be both a user and an admin?
**A: Yes, but you'll use different authentication methods for each role.**

### Q: Why two different authentication systems?
**A: Users need decentralized wallet-based auth. Admins need traditional secure login for management tasks.**

### Q: Can regular users access admin features?
**A: No. Admin routes require JWT token from admin login.**

### Q: Can admins trade like regular users?
**A: No. Admin accounts are for management only. Create a separate user account for trading.**

### Q: What if I lose my admin password?
**A: Master admin can reset passwords. Master password requires backend environment variable update.**

## Testing

### Test User Authentication
```bash
# 1. Clear all storage
localStorage.clear()

# 2. Visit main site
window.location.href = '/'

# Expected: Wallet connection screen
# Should see: MetaMask, Trust Wallet, etc. buttons
```

### Test Admin Authentication
```bash
# 1. Clear all storage
localStorage.clear()

# 2. Visit admin page
window.location.href = '/master-admin'

# Expected: Login form with username/password
# Should NOT see: Any wallet buttons
```

## Technical Implementation

### Route Structure (src/main.jsx)
```javascript
<BrowserRouter>
  <Routes>
    {/* User route - requires wallet */}
    <Route path="/" element={
      <WalletGate>
        <MainApp />
      </WalletGate>
    } />
    
    {/* Admin routes - NO wallet gate */}
    <Route path="/admin" element={<AdminPanel />} />
    <Route path="/master-admin" element={<MasterAdminDashboard />} />
  </Routes>
</BrowserRouter>
```

### Key Points
- ✅ User route wrapped by `WalletGate`
- ✅ Admin routes NOT wrapped by `WalletGate`
- ✅ Admin components don't import wallet hooks
- ✅ Completely independent authentication flows

## Migration Guide

### From Wallet to Admin
If you're a user who wants to become an admin:

1. **As User**: Connect wallet at `/` (keep this access for trading)
2. **Get Admin Access**: Master creates your admin account
3. **As Admin**: Login at `/admin` with username/password (no wallet)
4. **Result**: Two separate logins for two separate roles

### Creating New Admin
As master admin:

1. Login to `/master-admin`
2. Navigate to "Admin Roles" section
3. Click "Add New Admin"
4. Fill in:
   - Username (e.g., "john_admin")
   - Password (min 8 characters)
   - Permissions (what they can manage)
5. Share credentials with new admin
6. They login at `/admin` with username/password (no wallet needed!)

## Troubleshooting

### Issue: "I see wallet buttons on admin page"
**Solution**: You're on the wrong URL. Admin URLs are:
- `/admin` for admin accounts
- `/master-admin` for master account
NOT `/` (that's for users)

### Issue: "Admin login asks for MetaMask"
**Solution**: Clear browser cache and ensure you're at `/admin` or `/master-admin`

### Issue: "Can't login without wallet"
**Solution**: Admins NEVER need a wallet. Check:
1. Are you at the correct URL? (`/admin` or `/master-admin`)
2. Do you have the correct admin credentials?
3. Is the backend server running?

### Issue: "Token expired"
**Solution**: Admin tokens expire after 24 hours. Just login again.

## Summary

| Feature | Users (/) | Admin (/admin) | Master (/master-admin) |
|---------|-----------|----------------|------------------------|
| **Auth Method** | Wallet Connect | Username/Password | Username/Password |
| **Wallet Required** | ✅ Yes | ❌ No | ❌ No |
| **Browser Extension** | Required | Not needed | Not needed |
| **Login Form** | No (wallet buttons) | Yes | Yes |
| **Can Trade** | ✅ Yes | ❌ No | ❌ No |
| **Can Manage** | ❌ No | ✅ Yes | ✅ Yes (full access) |
| **Session Type** | Wallet connection | JWT (24h) | JWT (24h) |

---

**Last Updated**: January 2026  
**Status**: ✅ Fully Implemented and Working  
**Documentation**: [ADMIN_WALLET_FREE_LOGIN.md](ADMIN_WALLET_FREE_LOGIN.md)
