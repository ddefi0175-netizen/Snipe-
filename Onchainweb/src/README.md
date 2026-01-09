# Source Code Structure

This document explains the organization of the source code in the new Firebase-based architecture.

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── AdminPanel.jsx
│   ├── Dashboard.jsx
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── ...
│
├── pages/              # Page components (route handlers)
│   └── (Future: individual page components)
│
├── features/           # Feature-specific components and logic
│   └── (Future: feature modules like auth, trading, chat)
│
├── layouts/            # Layout components
│   └── (Future: MainLayout, AdminLayout, etc.)
│
├── services/           # Business logic and API interactions
│   ├── firebase.service.js      # Firebase initialization
│   ├── database.service.js      # Database operations
│   ├── api.service.js          # Legacy API (backward compatibility)
│   └── index.js                # Service exports
│
├── config/             # Configuration files
│   ├── firebase.config.js      # Firebase configuration
│   └── constants.js            # App constants
│
├── hooks/              # Custom React hooks
│   └── (Future: useAuth, useFirestore, etc.)
│
├── utils/              # Utility functions
│   └── (Future: formatting, validation, etc.)
│
├── lib/                # Legacy libraries (being phased out)
│   ├── firebase.js             # Old Firebase wrapper
│   ├── api.js                 # Old API client
│   └── walletConnect.jsx      # Wallet connection logic
│
├── styles/             # Global styles and CSS modules
│
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global CSS
```

## Component Organization

### Components (`/components`)
Reusable UI components that can be used across different pages and features.
- Keep components small and focused
- Each component should have a single responsibility
- Use props for configuration

### Pages (`/pages`)
Page-level components that correspond to routes.
- One component per route
- Compose smaller components
- Handle route-specific logic

### Features (`/features`)
Self-contained feature modules with their own components, hooks, and logic.
```
features/
├── auth/
│   ├── components/
│   ├── hooks/
│   └── services/
├── trading/
└── chat/
```

### Layouts (`/layouts`)
Layout components that wrap pages and provide consistent structure.
- MainLayout: For public pages
- DashboardLayout: For authenticated users
- AdminLayout: For admin pages

## Service Layer (`/services`)

The service layer provides a clean interface for all data operations.

### Firebase Service (`firebase.service.js`)
- Firebase initialization
- Authentication functions
- Real-time listeners for chat and basic operations

### Database Service (`database.service.js`)
- CRUD operations for all Firestore collections
- User management
- Trading operations
- Admin operations
- Notifications

### API Service (`api.service.js`)
- Legacy REST API support (for backward compatibility)
- Can be removed when fully migrated to Firebase

### Usage Example

```javascript
// Import from service layer
import { signIn, createTrade, subscribeToTrades } from '../services';

// Use in components
const handleLogin = async (email, password) => {
  const user = await signIn(email, password);
  console.log('Logged in:', user);
};

const handleTrade = async (tradeData) => {
  const tradeId = await createTrade(tradeData);
  console.log('Trade created:', tradeId);
};

// Subscribe to real-time updates
useEffect(() => {
  const unsubscribe = subscribeToTrades(userId, (trades) => {
    setTrades(trades);
  });
  return () => unsubscribe();
}, [userId]);
```

## Configuration (`/config`)

### Firebase Config (`firebase.config.js`)
- Firebase configuration from environment variables
- Collection names
- Listener configurations

### Constants (`constants.js`)
- Application-wide constants
- Feature flags
- Routes
- User roles
- Transaction types

### Usage Example

```javascript
import { COLLECTIONS, FIREBASE_CONFIG } from '../config/firebase.config';
import { APP_CONFIG, ROUTES, USER_ROLES } from '../config/constants';

// Use collections
const usersRef = collection(db, COLLECTIONS.USERS);

// Use routes
navigate(ROUTES.DASHBOARD);

// Check feature flags
if (FEATURES.ENABLE_FIREBASE) {
  // Use Firebase
}
```

## Best Practices

### Component Design
1. **Single Responsibility**: Each component should do one thing well
2. **Props Over State**: Use props for configuration, state for behavior
3. **Composition**: Build complex UIs from simple components
4. **Error Boundaries**: Wrap components that might fail

### Service Layer
1. **Centralized Logic**: All data operations go through services
2. **Error Handling**: Services should handle and throw meaningful errors
3. **Type Safety**: Use JSDoc comments for better IDE support
4. **Fallbacks**: Provide localStorage fallbacks when Firebase is unavailable

### State Management
1. **Local State**: Use useState for component-specific state
2. **Shared State**: Use Context API for app-wide state
3. **Server State**: Use Firebase real-time listeners
4. **Caching**: Let Firebase handle caching automatically

### Performance
1. **Code Splitting**: Use React.lazy() for route-based splitting
2. **Memoization**: Use React.memo() for expensive components
3. **Unsubscribe**: Always clean up listeners in useEffect
4. **Debouncing**: Debounce user inputs to reduce API calls

## Migration Notes

### From Old Structure
The old structure had all files in `/lib` and `/components`. The new structure:
- Moves Firebase logic to `/services`
- Adds `/config` for configuration
- Prepares for feature-based organization
- Maintains backward compatibility in `/lib`

### Gradual Migration
You can migrate gradually:
1. New code uses `/services` and `/config`
2. Old code continues to work from `/lib`
3. Update imports as you touch files
4. Eventually remove `/lib` when fully migrated

## Future Improvements

1. **Feature Modules**: Move to feature-based organization
2. **TypeScript**: Add TypeScript for better type safety
3. **Testing**: Add unit and integration tests
4. **Storybook**: Document components visually
5. **Custom Hooks**: Extract reusable logic to hooks
6. **Context Providers**: Add app-wide state management

## Questions?

See the main [README.md](../README.md) for general documentation or [FIREBASE_SETUP.md](../FIREBASE_SETUP.md) for Firebase-specific setup.
