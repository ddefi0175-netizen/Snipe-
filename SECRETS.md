# GitHub Secrets Configuration Guide

This document provides step-by-step instructions for configuring all required GitHub secrets for the Snipe CI/CD pipeline.

## 📋 Table of Contents

- [Overview](#overview)
- [Required Secrets](#required-secrets)
- [Optional Secrets](#optional-secrets)
- [How to Add Secrets](#how-to-add-secrets)
- [Cloudflare Configuration](#cloudflare-configuration)
- [Firebase Configuration](#firebase-configuration)
- [Health Check Configuration](#health-check-configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

GitHub Actions secrets are encrypted environment variables used during CI/CD workflows. This repository requires several secrets to be configured for successful deployments and health monitoring.

### Workflow Dependencies

| Workflow | Required Secrets |
|----------|-----------------|
| `cloudflare-deploy.yml` | CLOUDFLARE_API_TOKEN + All Firebase secrets |
| `ci.yml` | None (optional Firebase secrets for build) |
| `health-check.yml` | BACKEND_URL, FRONTEND_URL (optional) |

---

## Required Secrets

### 1. Cloudflare API Token

#### `CLOUDFLARE_API_TOKEN`

**Purpose**: Authenticates GitHub Actions to deploy to Cloudflare Workers and Pages.

**Required For**: 
- Cloudflare Workers deployment
- Cloudflare Pages deployment

**How to Obtain**:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use the **Edit Cloudflare Workers** template or create custom token with:
   - **Permissions**:
     - Account - Cloudflare Pages: Edit
     - Account - Cloudflare Workers Scripts: Edit
     - Account - Account Settings: Read
   - **Account Resources**: Include your account
5. Click **Continue to summary** → **Create Token**
6. Copy the token immediately (it won't be shown again)

**Security Note**: This token grants deployment access. Keep it secure and never commit it to version control.

**Value Provided**: `HRXKacqxoQDINiRK-EwbN7nEBK6qx_1jeVMJMe1j`

---

### 2. Firebase Configuration Secrets

These secrets are required for building the production application with Firebase integration.

#### `VITE_FIREBASE_API_KEY`
- **Description**: Firebase Web API key
- **Example**: `AIzaSyC1234567890abcdefghijklmnopqrs`
- **Where to get**: Firebase Console → Project Settings → General → Web API Key
- **Security**: Can be public (protected by Firebase security rules)

#### `VITE_FIREBASE_AUTH_DOMAIN`
- **Description**: Firebase authentication domain
- **Example**: `your-project.firebaseapp.com`
- **Where to get**: Firebase Console → Project Settings → General

#### `VITE_FIREBASE_PROJECT_ID`
- **Description**: Firebase project ID
- **Example**: `your-project-id`
- **Where to get**: Firebase Console → Project Settings → General

#### `VITE_FIREBASE_STORAGE_BUCKET`
- **Description**: Firebase Storage bucket name
- **Example**: `your-project.appspot.com`
- **Where to get**: Firebase Console → Project Settings → General

#### `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Description**: Firebase Cloud Messaging sender ID
- **Example**: `123456789012`
- **Where to get**: Firebase Console → Project Settings → Cloud Messaging

#### `VITE_FIREBASE_APP_ID`
- **Description**: Firebase app ID
- **Example**: `1:123456789012:web:abcdef1234567890`
- **Where to get**: Firebase Console → Project Settings → General

#### `VITE_FIREBASE_MEASUREMENT_ID`
- **Description**: Firebase Analytics measurement ID (optional)
- **Example**: `G-XXXXXXXXXX`
- **Where to get**: Firebase Console → Project Settings → General

---

### 3. WalletConnect Project ID

#### `VITE_WALLETCONNECT_PROJECT_ID`

**Purpose**: Enables WalletConnect integration for multi-wallet support.

**Required For**: Building the application with WalletConnect functionality

**How to Obtain**:
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign up or log in
3. Create a new project
4. Copy the Project ID from the dashboard

**Free Tier**: Available for development and production use

---

## Optional Secrets

### Health Check Monitoring

These secrets enable automated production monitoring via the `health-check.yml` workflow.

#### `BACKEND_URL`
- **Description**: URL of your backend server for health monitoring
- **Example**: `https://api.onchainweb.app`
- **Required**: No (workflow gracefully skips if not configured)
- **Note**: Set this after deploying your backend to production

#### `FRONTEND_URL`
- **Description**: URL of your frontend application for availability checks
- **Example**: `https://onchainweb.pages.dev` or `https://www.onchainweb.app`
- **Required**: No (workflow gracefully skips if not configured)
- **Note**: Set this after deploying your frontend to production

---

## How to Add Secrets

### Step-by-Step Instructions

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click **Settings** tab

2. **Access Secrets Section**
   - In the left sidebar, expand **Secrets and variables**
   - Click **Actions**

3. **Add New Secret**
   - Click **New repository secret** button
   - Enter the **Name** (e.g., `CLOUDFLARE_API_TOKEN`)
   - Paste the **Value** (the actual token/key)
   - Click **Add secret**

4. **Verify Secrets**
   - All added secrets will appear in the list (values are hidden)
   - You can update existing secrets but cannot view their values

### Visual Guide

```
Repository → Settings → Secrets and variables → Actions → New repository secret
```

---

## Cloudflare Configuration

### Complete Setup Process

1. **Add Cloudflare API Token**
   ```
   Name: CLOUDFLARE_API_TOKEN
   Value: HRXKacqxoQDINiRK-EwbN7nEBK6qx_1jeVMJMe1j
   ```

2. **Verify wrangler.toml Configuration**
   - Check that `account_id` is set in `wrangler.toml`
   - Verify KV namespaces are created and IDs are correct
   - Confirm R2 buckets are created

3. **Test Deployment**
   - Push to `main` or `master` branch
   - Monitor workflow run in Actions tab
   - Verify deployment at:
     - Workers: `https://snipe-workers.onchainweb.workers.dev`
     - Pages: `https://onchainweb.pages.dev`

### Troubleshooting Cloudflare Deployment

**Error**: `Authentication error: Invalid API Token`
- **Solution**: Verify token has correct permissions and is not expired

**Error**: `Account ID not found`
- **Solution**: Check `account_id` in `wrangler.toml` matches your Cloudflare account

**Error**: `KV namespace not found`
- **Solution**: Create KV namespaces with `wrangler kv:namespace create "CACHE"`

---

## Firebase Configuration

### Complete Setup Process

1. **Get Firebase Credentials**
   - Log in to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to **Project Settings** (gear icon)
   - Scroll to **Your apps** section
   - Click on your web app or create one
   - Copy all configuration values

2. **Add Each Secret**
   Add the following secrets one by one:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID` (optional)

3. **Add WalletConnect Project ID**
   ```
   Name: VITE_WALLETCONNECT_PROJECT_ID
   Value: [your-project-id]
   ```

### Troubleshooting Firebase Build

**Error**: `Firebase configuration is incomplete`
- **Solution**: Verify all required Firebase secrets are set

**Error**: `Invalid Firebase API key`
- **Solution**: Check that the API key matches your Firebase project

---

## Health Check Configuration

The health check workflow monitors your production deployment and runs every 6 hours.

### Setup (Optional)

1. **After Production Deployment**
   - Wait until your application is deployed to production
   - Note the production URLs

2. **Add Health Check Secrets**
   ```
   Name: BACKEND_URL
   Value: https://api.onchainweb.app
   
   Name: FRONTEND_URL
   Value: https://onchainweb.pages.dev
   ```

3. **Test Health Checks**
   - Go to **Actions** → **Health Check - Production Monitoring**
   - Click **Run workflow** → **Run workflow**
   - Monitor the results

### Graceful Degradation

If `BACKEND_URL` or `FRONTEND_URL` are not configured:
- Workflow will print a helpful warning message
- Workflow will exit successfully (not fail)
- No monitoring occurs until secrets are configured
- This allows the workflow to exist without blocking other CI processes

---

## Troubleshooting

### Common Issues

#### 1. Secrets Not Available in Workflow

**Symptom**: Workflow fails with "secret not found" or uses empty values

**Solutions**:
- Verify secret name matches exactly (case-sensitive)
- Check secret is added at repository level (not environment level)
- Re-run workflow after adding secrets

#### 2. Deployment Still Fails After Adding Secrets

**Cloudflare Deployment**:
- Check Cloudflare dashboard for account status
- Verify API token hasn't expired
- Ensure account has sufficient quota

**Build Failures**:
- Check all Firebase secrets are correctly formatted
- Verify no trailing spaces in secret values
- Confirm Firebase project is active and not disabled

#### 3. Health Checks Always Failing

**Solutions**:
- Verify URLs are accessible publicly
- Check that services are actually deployed and running
- Test URLs manually with `curl` or browser
- Review health check endpoint implementation

### Getting Help

If you continue to experience issues:

1. **Check Workflow Logs**
   - Go to **Actions** tab
   - Click on the failed workflow run
   - Expand each step to see detailed logs

2. **Verify Secrets**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Confirm all required secrets are listed

3. **Test Locally**
   - Create local `.env` file with same values
   - Run `npm run build` to verify configuration works

4. **Review Documentation**
   - See `docs/ENVIRONMENT_VARIABLES.md` for detailed variable descriptions
   - Check `docs/DEPLOYMENT.md` for deployment guides
   - Review `docs/WRANGLER_CONFIGURATION.md` for Cloudflare setup

---

## Security Best Practices

### ✅ DO

- Rotate API tokens regularly (every 90 days recommended)
- Use different tokens for staging and production
- Keep secret values confidential
- Review who has repository access
- Use minimal permissions when creating tokens
- Test secrets in a development environment first

### ❌ DON'T

- Share secrets via chat, email, or insecure channels
- Commit secrets to version control
- Use production secrets in development
- Give tokens more permissions than needed
- Leave expired tokens configured
- Store secrets in issue comments or PR descriptions

---

## Quick Reference

### Required for Basic Deployment

```
CLOUDFLARE_API_TOKEN                   (Cloudflare deployment)
VITE_FIREBASE_API_KEY                  (Firebase integration)
VITE_FIREBASE_AUTH_DOMAIN              (Firebase integration)
VITE_FIREBASE_PROJECT_ID               (Firebase integration)
VITE_FIREBASE_STORAGE_BUCKET           (Firebase integration)
VITE_FIREBASE_MESSAGING_SENDER_ID      (Firebase integration)
VITE_FIREBASE_APP_ID                   (Firebase integration)
VITE_WALLETCONNECT_PROJECT_ID          (WalletConnect integration)
```

### Optional for Monitoring

```
BACKEND_URL                            (Health monitoring)
FRONTEND_URL                           (Health monitoring)
```

---

## Next Steps

After configuring all secrets:

1. ✅ **Test CI Workflow**: Push a commit to trigger CI pipeline
2. ✅ **Test Cloudflare Deployment**: Push to main/master branch
3. ✅ **Verify Deployment**: Check deployed URLs are accessible
4. ✅ **Enable Health Monitoring**: Add BACKEND_URL and FRONTEND_URL
5. ✅ **Monitor Workflows**: Watch Actions tab for any failures

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained By**: DevOps Team

For more information, see:
- [Environment Variables Guide](docs/ENVIRONMENT_VARIABLES.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Wrangler Configuration](docs/WRANGLER_CONFIGURATION.md)
