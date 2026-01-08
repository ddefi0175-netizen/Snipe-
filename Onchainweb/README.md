# Snipe Frontend

Modern, accessible trading platform interface built with React and Vite. Features real-time price feeds, wallet integration, and live chat.

## Features

- **Accessibility-First Design** – WCAG compliant, keyboard-navigable UI
- **Real-Time Price Feeds** – Live cryptocurrency prices from CoinGecko API
- **Wallet Integration** – Connect to MetaMask or any EIP-6963 wallet
- **Live Chat** – Real-time community chat with backend integration
- **Responsive UI** – Works seamlessly on all devices
- **User Dashboard** – Track activity, points, and profile information

## Tech Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Fetch API

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see [backend README](../backend/README.md))

### Setup

1. **Install dependencies:**

   ```bash
   cd Onchainweb
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL
   VITE_API_BASE=http://localhost:4000/api
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run tests
npm run test

# Lint and format code
npm run lint
```

## Browser Requirements

- Modern browser with ES2020 support
- MetaMask or compatible EIP-6963 wallet extension (for wallet features)

## Features Walkthrough

### 1. Connect Wallet

- Click "Connect Wallet" in the header
- Accept the permission request in your wallet
- Your ETH balance will display automatically

### 2. View Real-Time Prices

- Hero section displays current ETH price from CoinGecko
- Price updates every 30 seconds
- No API key required (respects rate limits)

### 3. Live Chat

- Chat is available when active
- Send messages to the community
- Real-time message delivery via backend

### 4. User Dashboard

- View your profile and activity
- Track points and achievements
- Manage account settings

## API Integration

The frontend communicates with the backend API. See [backend README](../backend/README.md) for available endpoints.

Required environment variable:

```env
VITE_API_BASE=http://localhost:4000/api  # or your backend URL
```

## Keyboard Navigation

All UI elements are keyboard accessible:

- `Tab` – Navigate between elements
- `Enter/Space` – Activate buttons and links
- `Escape` – Close modals and menus
- Focus indicators are always visible

## Performance

- Lazy-loaded components for faster initial load
- Price feed cached for 30 seconds
- Optimized bundle size with Vite

## Development

### Component Structure

```text
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── lib/           # Utilities (API calls, helpers)
├── styles/        # Global styles
└── main.jsx       # Entry point
```

### Adding New Features

1. Create component in `src/components/`
2. Use provided hooks for API calls
3. Test in development: `npm run dev`
4. Build: `npm run build`

## Deployment

The app is deployed on Vercel. See [DEPLOYMENT.md](../DEPLOYMENT.md) for CI/CD setup.

```bash
# Production build
npm run build

# Test production build
npm run preview
```

## Troubleshooting

### Wallet not connecting?

- Ensure MetaMask or compatible wallet is installed
- Check browser console for errors
- Try refreshing the page

### Backend API not responding?

- Verify backend is running (`http://localhost:4000`)
- Check `.env` has correct `VITE_API_BASE`
- Check network tab in browser DevTools

### Price feed not updating?

- CoinGecko has rate limits; wait a moment and refresh
- Check browser console for fetch errors

## Support

For issues or feature requests, please open an issue on GitHub.

---

**Note**: For admin features and advanced configuration, contact the maintainer.

```text
Some plain text content
```
