# Wrangler Configuration Guide

This guide explains the modernized Wrangler configuration (`wrangler.toml`) for Cloudflare Workers deployment.

## 📋 Overview

The `wrangler.toml` file has been updated with modern best practices as of 2026, including:
- Updated compatibility date to 2026-01-30
- Node.js compatibility using `nodejs_compat` flag
- Separate staging and production environments
- Enhanced observability and monitoring
- Better route configuration examples

## 🔧 Key Changes

### 1. Compatibility Date

```toml
compatibility_date = "2026-01-30"
```

The compatibility date has been updated to use a modern date. This ensures:
- Access to the latest Cloudflare Workers features
- Proper security updates
- Consistent runtime behavior

**Important**: Always verify the date is available in [Cloudflare's official compatibility dates documentation](https://developers.cloudflare.com/workers/configuration/compatibility-dates/) before using it. Use the latest stable date available from Cloudflare, not necessarily the literal current date.

**Best Practice**: Update this date periodically when starting new projects or making major updates, but only to dates officially supported by Cloudflare.

### 2. Node.js Compatibility

```toml
compatibility_flags = ["nodejs_compat"]
```

**Changed from**: `node_compat = true` (deprecated in Wrangler v4)  
**Changed to**: `compatibility_flags = ["nodejs_compat"]`

This provides:
- Native Node.js API implementations
- Better performance than legacy polyfills
- Modern Node.js runtime features

**Documentation**: https://developers.cloudflare.com/workers/runtime-apis/nodejs

### 3. Development vs Production Deployment

```toml
# Development mode - deploy to *.workers.dev subdomain
workers_dev = true
```

- `workers_dev = true`: Deploys to `<worker>.<account>.workers.dev` (for development)
- `workers_dev = false`: Requires custom routes (for production)

**Best Practice**: Use `workers_dev = true` for development and testing, `false` for production with custom domains.

### 4. Environment-Specific Configurations

#### Staging Environment

```toml
[env.staging]
name = "snipe-onchainweb-staging"
workers_dev = true
vars = { ENVIRONMENT = "staging", DEBUG = "true" }
```

**Note**: Environment variables like `DEBUG` are set as strings. In your Worker code, you'll need to check them as strings:
```javascript
// In your worker code
if (env.DEBUG === "true") {
  // Debug logic
}
```

**Usage**:
```bash
wrangler deploy --env staging
```

#### Production Environment

```toml
[env.production]
name = "snipe-onchainweb-production"
workers_dev = false
vars = { ENVIRONMENT = "production", DEBUG = "false" }
```

**Usage**:
```bash
wrangler deploy --env production
```

### 5. Enhanced Observability

```toml
[observability]
enabled = true
head_sampling_rate = 1.0

[observability.logs]
enabled = true
head_sampling_rate = 1.0
persist = true
invocation_logs = true

[observability.traces]
enabled = true
persist = true
head_sampling_rate = 1.0
```

**Features**:
- Full request/response logging
- Distributed tracing support
- Performance monitoring
- Error tracking

**Note**: `head_sampling_rate = 1.0` means 100% of requests are logged (suitable for development; adjust for production based on volume).

### 6. Custom Domain Routes

```toml
# Uncomment and configure for custom domain routing
# routes = [
#   { pattern = "api.onchainweb.app/*", custom_domain = true },
#   { pattern = "onchainweb.app/api/*", zone_name = "onchainweb.app" }
# ]
```

**Options**:
- `custom_domain = true`: For Cloudflare-managed custom domains
- `zone_name = "domain.com"`: For specific zones in your Cloudflare account

**When to use**:
- Enable routes when deploying to production with custom domains
- Keep commented for development with `workers_dev = true`

## 🚀 Deployment Commands

### Development Deployment

```bash
# Deploy to *.workers.dev subdomain (default environment)
wrangler deploy

# Or explicitly target default environment
wrangler deploy --env=""
```

### Staging Deployment

```bash
# Create staging KV namespace (first time only)
wrangler kv:namespace create "CACHE" --env staging

# Create staging R2 bucket (first time only)
wrangler r2 bucket create onchainweb-staging

# Deploy to staging
wrangler deploy --env staging
```

### Production Deployment

```bash
# Deploy to production with custom domain routes
wrangler deploy --env production
```

## 🔐 Secrets Management

Secrets should **never** be stored in `wrangler.toml`. Use Wrangler secrets instead:

```bash
# Set a secret
wrangler secret put TELEGRAM_BOT_TOKEN

# Set a secret for specific environment
wrangler secret put FIREBASE_PRIVATE_KEY --env production

# List secrets
wrangler secret list

# Delete a secret
wrangler secret delete SECRET_NAME
```

## 📦 Resource Setup

### KV Namespaces

```bash
# Create production KV namespace
wrangler kv:namespace create "CACHE"

# Create production preview namespace (important for isolation)
wrangler kv:namespace create "CACHE" --preview

# Create staging KV namespace
wrangler kv:namespace create "CACHE" --env staging

# Create staging preview namespace
wrangler kv:namespace create "CACHE" --env staging --preview

# List KV namespaces
wrangler kv:namespace list
```

**Important**: Always create separate preview namespaces to isolate preview deployments from production/staging data.

### R2 Buckets

```bash
# Create production R2 bucket
wrangler r2 bucket create onchainweb

# Create production preview bucket (important for isolation)
wrangler r2 bucket create onchainweb-preview

# Create staging R2 bucket
wrangler r2 bucket create onchainweb-staging

# Create staging preview bucket
wrangler r2 bucket create onchainweb-staging-preview

# List R2 buckets
wrangler r2 bucket list
```

**Important**: Always create separate preview buckets to prevent preview deployments from modifying production/staging data.

### D1 Databases

```bash
# Create D1 database
wrangler d1 create onchainweb

# List D1 databases
wrangler d1 list

# Execute SQL
wrangler d1 execute onchainweb --command="SELECT * FROM users"
```

## 🔍 Monitoring and Debugging

### View Logs

```bash
# Tail logs in real-time
wrangler tail

# Tail logs for specific environment
wrangler tail --env production

# Filter logs
wrangler tail --status error
```

### View Deployments

```bash
# List deployments
wrangler deployments list

# List deployments for specific environment
wrangler deployments list --env production
```

### Rollback

```bash
# Rollback to previous version
wrangler rollback [version-id]

# Rollback for specific environment
wrangler rollback [version-id] --env production
```

## ⚠️ Common Issues

### Issue 1: Multiple Environments Warning

**Warning**: "Multiple environments are defined in the Wrangler configuration file, but no target environment was specified"

**Solution**: Explicitly specify the environment:
```bash
wrangler deploy --env=""          # For default/dev environment
wrangler deploy --env staging     # For staging
wrangler deploy --env production  # For production
```

### Issue 2: node_compat Deprecation

**Error**: "The 'node_compat' field is no longer supported"

**Solution**: This has been fixed in the current configuration using `compatibility_flags = ["nodejs_compat"]`

### Issue 3: Routes Not Working

**Problem**: Worker not responding on custom domain

**Solutions**:
1. Ensure `workers_dev = false` is set for the environment
2. Uncomment and configure the `routes` section
3. Verify the domain is added to your Cloudflare account
4. Check DNS records are configured correctly

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler Configuration Reference](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Compatibility Dates](https://developers.cloudflare.com/workers/configuration/compatibility-dates/)
- [Node.js APIs in Workers](https://developers.cloudflare.com/workers/runtime-apis/nodejs)
- [Observability Guide](https://developers.cloudflare.com/workers/observability/)

## 🎯 Best Practices Summary

1. ✅ Keep `compatibility_date` current
2. ✅ Use `nodejs_compat` for Node.js APIs
3. ✅ Separate staging and production environments
4. ✅ Use secrets for sensitive data (never commit to git)
5. ✅ Enable observability for monitoring
6. ✅ Use `workers_dev = true` for development
7. ✅ Configure custom routes for production
8. ✅ Test deployments in staging before production
9. ✅ Monitor logs and metrics regularly
10. ✅ Keep resource IDs in config, secrets separate

## 🔄 Migration from Old Configuration

If you're upgrading from an older Wrangler configuration:

1. **Update compatibility_date**: Set to the latest stable date from [Cloudflare's compatibility dates documentation](https://developers.cloudflare.com/workers/configuration/compatibility-dates/)
2. **Replace node_compat**: Use `compatibility_flags = ["nodejs_compat"]`
3. **Add environments**: Create staging and production environments
4. **Update observability**: Optionally update `head_sampling_rate` format to use float (1.0) for consistency, though integer format (1) also works
5. **Review routes**: Update to new route syntax with `custom_domain` or `zone_name`
6. **Create preview resources**: Set up separate KV namespaces and R2 buckets for preview deployments
7. **Update namespace/bucket IDs**: Replace placeholder values with actual IDs after creating resources
8. **Test thoroughly**: Deploy to staging and verify all functionality

## 📞 Support

For issues or questions:
- Check [Cloudflare Community](https://community.cloudflare.com/)
- Review [Wrangler GitHub Issues](https://github.com/cloudflare/workers-sdk/issues)
- Consult the [DEPLOYMENT.md](../DEPLOYMENT.md) guide
