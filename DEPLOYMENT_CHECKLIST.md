# Deployment Checklist for Cloudflare Pages

Complete step-by-step guide to deploy the application to Cloudflare Pages with all necessary configurations.

## Prerequisites Verification ✅

### 1. Cloudflare Account Setup
- [x] Cloudflare account created
- [x] Cloudflare Access configured
- [x] D1 Database created: `onchainweb` (ID: `e3f277bd-092a-41d6-a477-4521200c79fe`)
- [x] API Token available: `SLb2SImiGCIwqBVUQFxhFZpH-JxwpwOxy2NoPepQ`

### 2. WalletConnect Setup
- [x] WalletConnect Project ID: `42039c73d0dacb66d82c12faabf27c9b`

### 3. JWT Authentication
- [x] JWT Certs URL: `https://ddefi0175.cloudflareaccess.com/cdn-cgi/access/certs`
- [x] Audience: `207729502441a29e10dfef4fab0349ce60fdc758ed208c9be7078c39ff236ca7`

## Step-by-Step Deployment

### Step 1: Verify Cloudflare API Token

Test your token to ensure it's valid:

```bash
curl "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer SLb2SImiGCIwqBVUQFxhFZpH-JxwpwOxy2NoPepQ"
```

**Expected response:**
```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "...",
    "status": "active"
  }
}
```

If token is invalid, regenerate it in Cloudflare Dashboard → My Profile → API Tokens.

### Step 2: Initialize D1 Database

Execute the schema to create tables:

```bash
# Set your API token
export CLOUDFLARE_API_TOKEN=SLb2SImiGCIwqBVUQFxhFZpH-JxwpwOxy2NoPepQ

# Initialize the database
wrangler d1 execute onchainweb --file=schema.sql
```

**Expected output:**
```
🌀 Mapping SQL input into an array of statements
🌀 Executing on remote database onchainweb (e3f277bd-092a-41d6-a477-4521200c79fe):
🌀 To execute on your local development database, pass the --local flag
🚣 Executed 4 commands in 0.5s
```

**Verify tables were created:**

```bash
wrangler d1 execute onchainweb --command="SELECT name FROM sqlite_master WHERE type='table';"
```

**Expected tables:**
- `chat_messages`
- `active_chats`
- `admin_users` (optional)

### Step 3: Deploy Cloudflare Workers

Deploy the Workers API:

```bash
wrangler publish
```

**Expected output:**
```
⛅️ wrangler 4.60.0
-------------------
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded snipe-onchainweb (X.XX sec)
Published snipe-onchainweb (X.XX sec)
  https://snipe-onchainweb.<your-subdomain>.workers.dev
```

**Save the Workers URL** - you'll need it for environment variables.

### Step 4: Set Environment Variables in Cloudflare Pages

Navigate to: **Cloudflare Dashboard → Pages → Your Project → Settings → Environment variables**

#### Production Environment Variables

Click **Add variable** for each:

1. **VITE_CLOUDFLARE_WORKER_URL**
   - Value: `https://snipe-onchainweb.<your-subdomain>.workers.dev`
   - Environment: ✅ Production ✅ Preview
   - Click **Save**

2. **VITE_WALLETCONNECT_PROJECT_ID**
   - Value: `42039c73d0dacb66d82c12faabf27c9b`
   - Environment: ✅ Production ✅ Preview
   - Click **Save**

3. **VITE_APP_NAME** (Optional)
   - Value: `OnchainWeb`
   - Environment: ✅ Production ✅ Preview
   - Click **Save**

4. **VITE_APP_URL** (Optional)
   - Value: `https://your-site.pages.dev`
   - Environment: ✅ Production ✅ Preview
   - Click **Save**

**Screenshot location:** Settings → Environment variables should show 2-4 variables

### Step 5: Configure Cloudflare Pages Build Settings

Navigate to: **Cloudflare Dashboard → Pages → Your Project → Settings → Builds & deployments**

Verify settings:
- **Framework preset:** None
- **Build command:** (Leave empty - handled by wrangler.toml)
- **Build output directory:** `Onchainweb/dist`
- **Root directory:** `/` (repository root)

### Step 6: Trigger Deployment

Two options:

**Option A: Git Push**
```bash
git push origin main
```

**Option B: Manual Deployment**
1. Go to **Cloudflare Pages → Your Project → Deployments**
2. Click **Create deployment**
3. Select branch: `main` or `copilot/upload-wrangler-versions`
4. Click **Deploy**

### Step 7: Monitor Deployment

Watch the deployment logs:
1. Go to **Deployments** tab
2. Click on the running deployment
3. View logs in real-time

**Expected successful log output:**
```
Initializing build environment...
Success: Finished initializing build environment
Cloning repository...
Installing nodejs 20.20.0
Executing user deploy command: npx wrangler deploy
⛅️ wrangler 4.60.0
[custom build] Running: cd Onchainweb && npm install && npm run build
[custom build] added 220 packages, and audited 300 packages in 9s
[custom build] > vite build
[custom build] ✓ 398 modules transformed.
[custom build] ✓ built in 5.07s
Success: Finished building
Success: Successfully deployed
```

### Step 8: Verify Deployment

Once deployed, test the following:

#### 8.1 Test Homepage
Visit: `https://your-site.pages.dev`

**Expected:** Homepage loads with wallet connection button

#### 8.2 Test WalletConnect
1. Click wallet connection button
2. Select WalletConnect
3. **Expected:** QR code appears or wallet app opens

#### 8.3 Test Chat (User Side)
1. Click customer support/chat icon
2. Type a message
3. Click Send
4. **Expected:** Message appears in chat, stored in D1

#### 8.4 Test Workers API

**Test public endpoint:**
```bash
curl "https://snipe-onchainweb.<your-subdomain>.workers.dev/api/chat/messages?session_id=test-session"
```

**Expected:** JSON response with messages array (may be empty)

**Test protected endpoint (without auth):**
```bash
curl "https://snipe-onchainweb.<your-subdomain>.workers.dev/api/chat/active"
```

**Expected:** 401 Unauthorized response

#### 8.5 Test Admin Endpoints (with JWT)

Admin must access through Cloudflare Access:
1. Navigate to admin panel URL
2. Authenticate via Cloudflare Access
3. JWT token automatically added to requests
4. **Expected:** Can view active chats and reply

### Step 9: Verify D1 Database

Check that data is being stored:

```bash
wrangler d1 execute onchainweb --command="SELECT COUNT(*) as total FROM chat_messages;"
```

**Expected:** Returns count of messages

```bash
wrangler d1 execute onchainweb --command="SELECT * FROM chat_messages LIMIT 5;"
```

**Expected:** Shows recent messages (if any)

## Troubleshooting

### Build Fails: "esbuild platform mismatch"
**Cause:** node_modules committed to git  
**Solution:** Already fixed - node_modules removed from git

### Workers Deploy Fails: "Database binding not found"
**Cause:** D1 database not created or wrong ID  
**Solution:** Verify database ID in wrangler.toml matches: `e3f277bd-092a-41d6-a477-4521200c79fe`

### Environment Variables Not Working
**Cause:** Variables not set or not prefixed with VITE_  
**Solution:** 
1. Check all variables in Pages settings
2. Verify they start with `VITE_`
3. Redeploy after adding variables

### Chat Not Working
**Cause:** VITE_CLOUDFLARE_WORKER_URL not set or incorrect  
**Solution:** 
1. Get Workers URL from deployment output
2. Set in Pages environment variables
3. Redeploy

### Admin Can't Reply
**Cause:** JWT authentication failing  
**Solution:**
1. Verify JWT certs URL is accessible
2. Check audience matches in Workers code
3. Ensure Cloudflare Access is configured

### WalletConnect Not Working
**Cause:** Invalid project ID  
**Solution:** Verify `VITE_WALLETCONNECT_PROJECT_ID=42039c73d0dacb66d82c12faabf27c9b`

## Verification Checklist

Mark each item as you verify:

### Pre-Deployment
- [ ] Cloudflare API token verified (Step 1)
- [ ] D1 database initialized with schema (Step 2)
- [ ] Workers deployed successfully (Step 3)
- [ ] Environment variables set in Pages (Step 4)
- [ ] Build settings configured (Step 5)

### Post-Deployment
- [ ] Homepage loads without errors (8.1)
- [ ] WalletConnect QR code displays (8.2)
- [ ] Chat messages can be sent (8.3)
- [ ] Workers API responds to public endpoints (8.4)
- [ ] Admin endpoints require JWT (8.4)
- [ ] D1 database contains data (Step 9)

### Production Readiness
- [ ] No console errors on homepage
- [ ] All wallet providers connect successfully
- [ ] Real-time chat updates working (SSE)
- [ ] Admin can authenticate and reply
- [ ] Build completes in under 2 minutes
- [ ] Assets properly cached

## Configuration Summary

All required configuration values:

```
# D1 Database
Database Name: onchainweb
Database ID: e3f277bd-092a-41d6-a477-4521200c79fe

# Cloudflare API
API Token: SLb2SImiGCIwqBVUQFxhFZpH-JxwpwOxy2NoPepQ

# JWT Authentication
Certs URL: https://ddefi0175.cloudflareaccess.com/cdn-cgi/access/certs
Audience: 207729502441a29e10dfef4fab0349ce60fdc758ed208c9be7078c39ff236ca7

# WalletConnect
Project ID: 42039c73d0dacb66d82c12faabf27c9b

# Environment Variables (Cloudflare Pages)
VITE_CLOUDFLARE_WORKER_URL=https://snipe-onchainweb.<your-subdomain>.workers.dev
VITE_WALLETCONNECT_PROJECT_ID=42039c73d0dacb66d82c12faabf27c9b
VITE_APP_NAME=OnchainWeb (optional)
VITE_APP_URL=https://your-site.pages.dev (optional)
```

## Next Steps After Deployment

1. **Monitor Performance**
   - Check Cloudflare Analytics
   - Monitor D1 database size
   - Review Workers execution time

2. **Security**
   - Rotate API tokens regularly
   - Monitor Cloudflare Access logs
   - Review admin access patterns

3. **Optimization**
   - Enable Cloudflare CDN caching
   - Configure custom domain
   - Set up error monitoring

## Support

If you encounter issues:
1. Check deployment logs in Cloudflare Pages
2. Review Workers logs in Cloudflare Dashboard
3. Verify environment variables are set correctly
4. Ensure D1 database is initialized
5. Test API token with curl command

For additional help, refer to:
- `CLOUDFLARE_PAGES_SETUP.md` - Detailed setup guide
- `CLOUDFLARE_ENV_VARS.md` - Environment variables reference
- `schema.sql` - Database schema
- `wrangler.toml` - Workers configuration
