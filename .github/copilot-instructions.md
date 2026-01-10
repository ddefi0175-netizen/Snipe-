# GitHub Copilot Instructions for Snipe Platform

This document provides context and guidelines for GitHub Copilot when working on the Snipe trading platform codebase.

## Project Overview

Snipe is a modern, accessible real-time trading platform built with React and Firebase. It features:
- Real-time cryptocurrency price updates
- Multi-wallet connection support (11+ wallet providers)
- Admin and user management systems
- Live chat functionality
- Real-time data synchronization

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Serverless)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication + Web3 Wallet Connect
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Real-time Updates**: Firebase Realtime Database & Firestore listeners

## Architecture

### Backend Architecture
The platform uses Firebase as a serverless backend, replacing the previous MongoDB + Express.js setup:
- Firebase Firestore for data storage
- Firebase Authentication for user management
- Firebase Realtime Database for live updates
- Cloud Functions for serverless logic (when needed)

### Frontend Architecture
- React-based SPA with Vite build system
- Component-based architecture
- Custom hooks for wallet connections and Firebase integration
- Responsive design with Tailwind CSS

## Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Follow React best practices for component composition
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch blocks
- Use descriptive variable and function names
- Add JSDoc comments for complex functions

### File Organization
```
Onchainweb/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page-level components
│   ├── lib/           # Utility functions and helpers
│   ├── hooks/         # Custom React hooks
│   ├── context/       # React Context providers
│   └── config/        # Configuration files
```

### Naming Conventions
- Components: PascalCase (e.g., `UserDashboard.jsx`)
- Utilities: camelCase (e.g., `formatPrice.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- CSS classes: kebab-case (e.g., `user-profile-card`)

## Authentication System

### Dual Authentication
The platform supports two authentication methods:

1. **Wallet-Based (Regular Users)**
   - Connect via MetaMask, Trust Wallet, or other Web3 wallets
   - Uses WalletConnect protocol for mobile support
   - EIP-6963 multi-wallet detection

2. **Email/Password (Admin Users)**
   - Firebase Authentication with email/password
   - JWT token-based sessions
   - Permission-based access control

### Implementation Guidelines
- Always validate user authentication before allowing access to protected routes
- Use Firebase Auth state listeners for real-time auth status
- Implement proper error handling for wallet connection failures
- Separate user and admin authentication flows clearly

## Firebase Integration

### Firestore Usage
- Use real-time listeners for live data updates
- Implement proper error handling for all Firebase operations
- Follow Firebase security rules for data access
- Use batch operations for multiple writes when possible

### Example Patterns
```javascript
// Listening to real-time updates
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
    setUserData(doc.data());
  });
  return () => unsubscribe();
}, [userId]);

// Writing data
await setDoc(doc(db, 'users', userId), {
  balance: newBalance,
  updatedAt: serverTimestamp()
}, { merge: true });
```

## Wallet Connection

### Supported Wallets
- MetaMask (injected + WalletConnect)
- Trust Wallet (deep link + WalletConnect)
- Coinbase Wallet
- OKX Wallet
- Phantom (EVM mode)
- Binance Web3 Wallet
- TokenPocket
- Rainbow
- Ledger Live
- imToken
- WalletConnect (universal)

### Implementation Notes
- Use environment detection for optimal connection method
- Implement fallback strategies (injected → deep link → WalletConnect)
- Handle mobile dApp browser detection
- Provide clear error messages for connection issues

## Real-Time Data

### Architecture
All data updates use Firebase Firestore real-time listeners (WebSocket):
- User balances: Real-time synchronization
- Trade updates: Instant notifications
- Chat messages: WebSocket-based delivery
- Admin actions: Live activity logs

### Performance
- Updates delivered in <50ms
- No polling required
- Automatic reconnection on connection loss

## Admin System

### Permission Structure
Admins have granular permissions:
- `manageUsers`: View/edit user profiles
- `manageBalances`: Modify account balances
- `manageKYC`: Review KYC submissions
- `manageTrades`: Monitor trades
- `viewReports`: Access analytics
- `manageDeposits`: Process deposits
- `manageWithdrawals`: Approve withdrawals
- `customerService`: Support tickets
- `viewLogs`: System audit logs
- `siteSettings`: Platform settings
- `createAdmins`: Create admin accounts

### User Access Modes
- `all`: Access to all users
- `assigned`: Access to specific user IDs only

## Testing Guidelines

### Unit Tests
- Test utility functions and helpers
- Mock Firebase operations in tests
- Use Jest for test runner
- Aim for >80% code coverage

### Integration Tests
- Test wallet connection flows
- Verify Firebase operations
- Test authentication flows
- Validate admin permission checks

## Documentation

For detailed information on specific topics, refer to:
- **Quick Start**: [../QUICK_START_GUIDE.md](../QUICK_START_GUIDE.md)
- **Backend Migration**: [../BACKEND_REPLACEMENT.md](../BACKEND_REPLACEMENT.md)
- **Real-Time Data**: [../REALTIME_DATA_ARCHITECTURE.md](../REALTIME_DATA_ARCHITECTURE.md)
- **Admin Guide**: [../ADMIN_USER_GUIDE.md](../ADMIN_USER_GUIDE.md)
- **Deployment**: [../VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md)

## Security Best Practices

### General
- Never commit API keys, secrets, or credentials
- Use environment variables for sensitive data
- Validate all user inputs
- Implement rate limiting for API calls
- Use HTTPS in production

### Firebase Security
- Deploy proper Firestore security rules
- Validate authentication on server side
- Use Firebase Admin SDK for privileged operations
- Implement proper CORS policies

### Wallet Security
- Never request private keys
- Validate all transaction data
- Implement proper signature verification
- Use secure random number generation

## Common Patterns

### Error Handling
```javascript
try {
  await performOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Show user-friendly error message
  showNotification('Operation failed. Please try again.');
}
```

### Loading States
```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
  } finally {
    setLoading(false);
  }
};
```

### Form Validation
```javascript
const validateForm = (formData) => {
  const errors = {};
  if (!formData.email) errors.email = 'Email is required';
  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Amount must be positive';
  }
  return errors;
};
```

## Deployment

### Vercel Deployment
- Platform is optimized for Vercel deployment
- Environment variables configured in Vercel dashboard
- Automatic deployments on git push

### Firebase Deployment
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Deploy Cloud Functions: `firebase deploy --only functions`

## Performance Optimization

### React Performance
- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize re-renders with useCallback and useMemo
- Use React Suspense for code splitting

### Firebase Performance
- Use pagination for large lists
- Implement proper indexing
- Cache frequently accessed data
- Use Firebase Performance Monitoring

## Accessibility

- Follow WCAG 2.1 Level AA guidelines
- Implement proper ARIA labels
- Ensure keyboard navigation
- Provide text alternatives for images
- Test with screen readers

## Mobile Responsiveness

- Use Tailwind's responsive utilities
- Test on multiple device sizes
- Implement touch-friendly UI elements
- Optimize for mobile performance

## Development Workflow

### Local Development
```bash
# Start frontend
cd Onchainweb
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup
- Copy `.env.example` to `.env`
- Fill in Firebase credentials
- Set WalletConnect Project ID
- Configure other API keys as needed

## Git Workflow

- Create feature branches from `main`
- Use descriptive commit messages
- Keep commits atomic and focused
- Run tests before committing
- Submit pull requests for review

## Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Check `.env` file has all VITE_FIREBASE_* variables
   - Verify Firebase project is active

2. **Wallet connection fails**
   - Check WalletConnect Project ID is set
   - Verify wallet extension is installed
   - Try WalletConnect QR code fallback

3. **Build errors**
   - Clear node_modules and reinstall
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [WalletConnect Docs](https://docs.walletconnect.com)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Support

For questions or issues:
- Check the documentation files in the repository root
- Open an issue on GitHub
- Contact: ddefi0175@gmail.com

---

**Last Updated**: January 2026
**Maintained By**: Snipe Development Team
