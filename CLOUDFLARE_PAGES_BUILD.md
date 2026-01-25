# Cloudflare Pages Build Configuration

This document provides the configuration needed for deploying this project to Cloudflare Pages.

## Build Settings

Configure these settings in your Cloudflare Pages project dashboard:

### Framework preset
- **Framework preset**: `None` (or `Vite`)

### Build configuration
- **Build command**: `cd Onchainweb && npm install && npm run build`
- **Build output directory**: `Onchainweb/dist`
- **Root directory**: `/` (leave empty or set to root)

### Node.js version
- **NODE_VERSION**: `18` or higher (set as environment variable)

## Environment Variables (Optional)

The TURN server integration is **optional**. The application will work fine without these variables, using default STUN servers as fallback.

If you want to enable Cloudflare TURN server support, add these environment variables in your Cloudflare Pages project settings:

```
VITE_CLOUDFLARE_TURN_TOKEN_ID=your-token-id
VITE_CLOUDFLARE_TURN_API_TOKEN=your-api-token
VITE_CLOUDFLARE_TURN_SERVER_NAME=your-server-name (optional)
```

### Other required environment variables

For the application to work, you also need:

```
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id
```

## Troubleshooting Build Failures

### "Build failed" or "Workers Build failed"

1. **Check Node Version**: Ensure Node.js 18 or higher is set
   - Add environment variable: `NODE_VERSION=18`

2. **Verify Build Command**: The build command must be:
   ```
   cd Onchainweb && npm install && npm run build
   ```

3. **Check Output Directory**: Must be set to:
   ```
   Onchainweb/dist
   ```

4. **Review Build Logs**: 
   - Go to your Cloudflare Pages project
   - Click on the failed deployment
   - Review the build logs for specific errors

### Common Issues

#### "Module not found" errors
- Ensure the build command includes `npm install`
- Check that all dependencies are listed in `package.json`

#### "ESBUILD platform mismatch"
- This is usually fixed by running `npm install` during build
- Make sure not to commit `node_modules` to git

#### Environment variable issues
- The TURN server variables are optional
- The app will build and run without them (using default STUN servers)
- Only add them if you need Cloudflare TURN server support

## Deployment Steps

1. **Connect Repository**:
   - Go to Cloudflare Pages dashboard
   - Click "Create a project"
   - Connect your GitHub repository

2. **Configure Build**:
   - Set build command: `cd Onchainweb && npm install && npm run build`
   - Set output directory: `Onchainweb/dist`
   - Add `NODE_VERSION=18` environment variable

3. **Add Environment Variables** (if needed):
   - Go to Settings > Environment variables
   - Add required variables for Firebase and WalletConnect
   - Optionally add TURN server variables

4. **Deploy**:
   - Cloudflare will automatically deploy on every push to main/master branch
   - Or manually trigger a deployment from the dashboard

## Verifying Deployment

After successful deployment:

1. Open your Cloudflare Pages URL
2. Open browser console
3. Look for these messages:
   - ✅ `Firebase initialized` - Firebase is working
   - ⚠️ `Cloudflare TURN server credentials not configured` - Expected if TURN vars not set
   - ✅ `Using cached ICE servers` or `Successfully fetched Cloudflare ICE servers` - If TURN is configured

## Support

If you continue to experience build failures:

1. Check the build logs in Cloudflare Pages dashboard
2. Verify Node version is 18 or higher
3. Ensure all required environment variables are set
4. Test the build locally with `cd Onchainweb && npm install && npm run build`

The TURN server integration does not introduce any build dependencies or requirements - it's purely runtime configuration.
