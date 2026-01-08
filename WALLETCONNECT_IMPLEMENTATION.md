# WalletConnect Implementation Guide

## Overview
This document describes the WalletConnect v2 implementation in the Snipe platform, which enables users to connect their mobile wallets via QR code scanning.

## What Was Implemented

### 1. Real WalletConnect v2 Integration
Replaced the mock/placeholder implementation with the official WalletConnect Universal Provider SDK:
- **Package**: `@walletconnect/universal-provider`
- **QR Code Generation**: `qrcode-generator`
- **Protocol**: WalletConnect v2 with relay server

### 2. Key Features
- ✅ **Real QR Code Generation**: Displays actual WalletConnect URI as QR code
- ✅ **Multi-Chain Support**: Ethereum (1), BSC (56), Polygon (137)
- ✅ **Session Persistence**: Automatically restores connection on page reload
- ✅ **Proper Disconnection**: Clean disconnect handling
- ✅ **Mobile Wallet Support**: Works with any WalletConnect-compatible wallet

## How It Works

### For Users

1. **Click "Connect Wallet"** on the platform
2. **Select "WalletConnect"** from the wallet options
3. **Scan QR Code** with your mobile wallet app (MetaMask, Trust Wallet, Rainbow, etc.)
4. **Approve Connection** in your mobile wallet
5. **Connected!** Your wallet is now connected to the platform

### Supported Mobile Wallets
- MetaMask Mobile
- Trust Wallet
- Rainbow Wallet
- Argent
- Ledger Live
- Any WalletConnect v2 compatible wallet

## Configuration

### WalletConnect Project ID (Required)

**IMPORTANT**: WalletConnect requires a valid Project ID to function. This is NOT optional.

1. **Register at WalletConnect Cloud**
   - Visit: https://cloud.walletconnect.com
   - Create an account (free)
   - Create a new project
   - Copy your Project ID

2. **Set Environment Variable**
   Create/update your `.env` file in the `Onchainweb` directory:
   ```bash
   VITE_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
   ```

3. **Build**
   The environment variable is embedded during the build process:
   ```bash
   npm run build
   ```

### Without Project ID
If you don't set a Project ID, users will see an error when trying to use WalletConnect:
```
WalletConnect requires a Project ID. Get your free Project ID from 
https://cloud.walletconnect.com and set VITE_WALLETCONNECT_PROJECT_ID in your .env file.
```

## Technical Details

### Architecture
```
User's Mobile Wallet
       ↓ (WalletConnect v2 Protocol)
WalletConnect Relay Server (wss://relay.walletconnect.com)
       ↓
Your Web App (Universal Provider)
```

### Supported Methods
- `eth_sendTransaction`
- `eth_signTransaction`
- `eth_sign`
- `personal_sign`
- `eth_signTypedData`

### Supported Chains
- **Ethereum Mainnet** (Chain ID: 1)
- **BNB Smart Chain** (Chain ID: 56)
- **Polygon** (Chain ID: 137)

### Session Management
- Sessions are stored in browser localStorage
- Automatic reconnection on page reload
- Session persists until user disconnects or clears browser data

## Testing

### Local Testing
1. Build the project:
   ```bash
   cd Onchainweb
   npm run build
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open the app in your desktop browser
4. Click "Connect Wallet" → "WalletConnect"
5. Scan QR code with mobile wallet app

### What to Expect
1. QR code appears after ~1 second
2. Scan with mobile wallet
3. Approve connection in mobile wallet
4. Desktop browser shows connected address
5. Can now sign transactions/messages

## Troubleshooting

### QR Code Doesn't Appear
- Check browser console for errors
- Verify internet connection
- Ensure WalletConnect relay server is accessible

### Connection Fails
- Make sure you approved in mobile wallet
- Check that mobile device has internet connection
- Try refreshing the page and connecting again

### "Failed to initialize WalletConnect"
- Check browser console for detailed error
- Verify Project ID is set correctly (for production)
- Ensure relay server URL is accessible

### Session Doesn't Restore
- Check that browser allows localStorage
- Verify session hasn't expired (24 hours default)
- Try disconnecting and reconnecting

## Security Considerations

### Project ID Security
- Project ID is public and safe to expose in frontend code
- Each project has rate limits to prevent abuse
- Use your own Project ID for production (not the demo ID)

### Session Security
- Sessions are encrypted end-to-end
- Private keys never leave the user's mobile wallet
- All transactions require mobile wallet approval

### Best Practices
1. Always use HTTPS in production
2. Set your own Project ID for production
3. Monitor Project ID usage on WalletConnect Cloud
4. Implement rate limiting on your backend APIs

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for more chains (Arbitrum, Optimism, Avalanche)
- [ ] WalletConnect v2 modal customization
- [ ] Support for wallet switching within session
- [ ] Push notifications for transaction requests
- [ ] Support for Web3Modal (pre-built UI)

## Resources

- **WalletConnect Docs**: https://docs.walletconnect.com
- **WalletConnect Cloud**: https://cloud.walletconnect.com
- **Universal Provider**: https://docs.reown.com/advanced/providers/universal
- **Compatible Wallets**: https://walletconnect.com/explorer

## Support

If you encounter issues:
1. Check this documentation
2. Review browser console for errors
3. Check WalletConnect status page
4. Review implementation in `src/lib/walletConnect.jsx`

---

**Last Updated**: 2026-01-08
**Version**: 1.0.0
**Status**: ✅ Production Ready
