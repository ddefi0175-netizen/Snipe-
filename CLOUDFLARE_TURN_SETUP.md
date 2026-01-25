# Cloudflare TURN Server Integration

## Overview

This application now includes Cloudflare TURN server integration to improve WebRTC peer-to-peer connection reliability for WalletConnect. TURN (Traversal Using Relays around NAT) servers help establish connections when direct peer-to-peer connections fail due to NAT (Network Address Translation) or firewall restrictions.

## Features

- **Automatic ICE Server Fetching**: Dynamically retrieves TURN/STUN servers from Cloudflare API
- **Smart Caching**: Caches ICE servers for 1 hour to reduce API calls
- **Graceful Fallback**: Falls back to Google's free STUN servers if Cloudflare API is unavailable
- **Zero Configuration Required**: Works out-of-the-box with defaults, but can be configured for better reliability

## Setup Instructions

### 1. Get Cloudflare TURN Credentials

If you have Cloudflare TURN server credentials:

1. Log in to your Cloudflare dashboard
2. Navigate to the Calls (RTC) section
3. Create or use an existing TURN service
4. Note down:
   - Server name (e.g., `rapid-smoke-a376`)
   - Turn Token ID (e.g., `fc1f127d55b2c843e3d72b2882874e8e`)
   - API Token

### 2. Configure Environment Variables

Add these variables to your `.env` file in the `Onchainweb/` directory:

```bash
# Cloudflare TURN Server Configuration
VITE_CLOUDFLARE_TURN_SERVER_NAME=rapid-smoke-a376
VITE_CLOUDFLARE_TURN_TOKEN_ID=fc1f127d55b2c843e3d72b2882874e8e
VITE_CLOUDFLARE_TURN_API_TOKEN=your-api-token-here
```

Replace the values with your actual Cloudflare credentials.

### 3. Restart the Development Server

```bash
cd Onchainweb
npm run dev
```

## How It Works

### Architecture

1. **Service Layer** (`src/services/turn.service.js`):
   - Handles API communication with Cloudflare
   - Manages caching of ICE servers
   - Provides fallback to default STUN servers

2. **Configuration** (`src/config/constants.js`):
   - Stores TURN server configuration
   - Defines API endpoints and TTL settings

3. **Integration** (`src/lib/walletConnect.jsx`):
   - Fetches ICE servers during WalletConnect initialization
   - Injects ICE servers into the WebRTC peer connection configuration

### ICE Server Fetching Flow

```
WalletConnect Init → getCachedIceServers() → Check Cache
                                              ↓
                                    Cache Valid? → Yes → Return Cached
                                              ↓
                                              No
                                              ↓
                                    Fetch from Cloudflare API
                                              ↓
                                    API Success? → Yes → Cache & Return
                                              ↓
                                              No
                                              ↓
                                    Return Default STUN Servers
```

### Fallback Behavior

The system gracefully handles various scenarios:

- **No Credentials**: Uses Google's free STUN servers
- **API Failure**: Falls back to default STUN servers
- **Network Issues**: Returns cached servers if available, otherwise uses defaults
- **Invalid Response**: Logs warning and uses default servers

### Default STUN Servers

When Cloudflare TURN is not configured or unavailable:
```javascript
[
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
]
```

## Testing

### Verify ICE Servers are Loaded

1. Open the browser console
2. Connect a wallet using WalletConnect
3. Look for log messages:
   - `✅ Successfully fetched Cloudflare ICE servers:` - Cloudflare TURN is working
   - `📦 Using cached ICE servers` - Using cached servers
   - `⚠️ Cloudflare TURN server credentials not configured` - Using default STUN servers

### Manual Testing with cURL

Test the Cloudflare API directly:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ttl": 86400}' \
  https://rtc.live.cloudflare.com/v1/turn/keys/YOUR_TOKEN_ID/credentials/generate-ice-servers
```

Expected response:
```json
{
  "iceServers": [
    {
      "urls": [
        "stun:stun.cloudflare.com:3478",
        "turn:turn.cloudflare.com:3478?transport=udp",
        "turn:turn.cloudflare.com:3478?transport=tcp",
        "turns:turn.cloudflare.com:5349?transport=tcp"
      ],
      "username": "generated-username",
      "credential": "generated-credential"
    }
  ]
}
```

## Troubleshooting

### Issue: "Cloudflare TURN server credentials not configured"

**Solution**: Add the required environment variables to your `.env` file and restart the dev server.

### Issue: "Failed to fetch Cloudflare ICE servers"

**Possible causes**:
1. Invalid API token or Token ID
2. Network connectivity issues
3. Cloudflare API rate limiting

**Solution**: 
- Verify your credentials are correct
- Check browser console for detailed error messages
- The app will still work using default STUN servers

### Issue: WalletConnect not establishing connection

**Possible causes**:
1. Firewall blocking WebRTC traffic
2. TURN server credentials expired
3. Network restrictions

**Solution**:
- Ensure TURN servers are properly configured
- Check if ICE servers are being loaded (browser console)
- Try from a different network

## Benefits of Using TURN Servers

### Without TURN (STUN only)
- ✅ Works for most users on open networks
- ❌ Fails behind strict firewalls
- ❌ Fails behind symmetric NAT
- ❌ Unreliable on corporate networks

### With TURN
- ✅ Works behind firewalls
- ✅ Works behind NAT
- ✅ Reliable on corporate networks
- ✅ Better connection success rate
- ✅ Faster connection establishment

## Cost Considerations

### Cloudflare TURN
- Pricing based on usage (GB transferred)
- Free tier available
- Paid plans for production use

### Alternative: Google STUN (Default)
- Completely free
- STUN-only (no TURN relay)
- Lower success rate for restrictive networks

## API Reference

### `getCloudflareIceServers()`
Fetches fresh ICE servers from Cloudflare API.

**Returns**: `Promise<Array>` - Array of ICE server configurations

**Example**:
```javascript
import { getCloudflareIceServers } from './services/turn.service';

const servers = await getCloudflareIceServers();
console.log(servers);
// Output: [
//   {
//     urls: [
//       'stun:stun.cloudflare.com:3478',
//       'turn:turn.cloudflare.com:3478?transport=udp',
//       'turn:turn.cloudflare.com:3478?transport=tcp',
//       'turns:turn.cloudflare.com:5349?transport=tcp'
//     ],
//     username: 'generated-username',
//     credential: 'generated-credential'
//   }
// ]
```

### `getCachedIceServers()`
Gets ICE servers with caching (1 hour cache).

**Returns**: `Promise<Array>` - Array of ICE server configurations

**Example**:
```javascript
import { getCachedIceServers } from './services/turn.service';

const servers = await getCachedIceServers();
```

### `clearIceServersCache()`
Manually clears the ICE servers cache.

**Example**:
```javascript
import { clearIceServersCache } from './services/turn.service';

clearIceServersCache();
```

## Security Notes

- ⚠️ **Never commit your `.env` file** - It contains sensitive API tokens
- ⚠️ **Rotate API tokens regularly** - Follow security best practices
- ⚠️ **Use environment variables** - Don't hardcode credentials in source code
- ✅ **Use TTL wisely** - Default 24 hours balances security and performance

## Further Reading

- [Cloudflare Calls Documentation](https://developers.cloudflare.com/calls/)
- [WebRTC ICE Explained](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)
- [STUN vs TURN](https://www.twilio.com/docs/stun-turn/understanding-stun-and-turn)
- [WalletConnect Documentation](https://docs.walletconnect.com/)

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Test the Cloudflare API directly with cURL
4. Open an issue on the GitHub repository
