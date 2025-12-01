# Cloudflare Workers Deployment Guide

## Prerequisites

- Cloudflare account (https://dash.cloudflare.com)
- Domain configured with Cloudflare nameservers
- Node.js 18+ installed locally

## Step-by-Step Deployment

### 1. Install Wrangler CLI

```bash
npm install -g @cloudflare/wrangler
```

Or use locally:

```bash
npm install --save-dev wrangler
npx wrangler --version
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser window to authorize your account.

### 3. Create KV Namespaces

```bash
# Create users namespace
wrangler kv:namespace create "USERS_KV"
wrangler kv:namespace create "USERS_KV" --preview

# Create sessions namespace
wrangler kv:namespace create "SESSIONS_KV"
wrangler kv:namespace create "SESSIONS_KV" --preview
```

The command output will show namespace IDs. Update `wrangler.toml`:

```toml
kv_namespaces = [
  { binding = "USERS_KV", id = "abc123def456", preview_id = "xyz789" },
  { binding = "SESSIONS_KV", id = "ghi789jkl012", preview_id = "mno345" }
]
```

### 4. Update Configuration

Edit `wrangler.toml`:

```toml
name = "opnng-api"
main = "src/index.ts"
compatibility_date = "2024-12-16"

[env.production]
routes = [
  { pattern = "api.yourdomain.com/*", zone_id = "your-zone-id" }
]
vars = { ENVIRONMENT = "production" }

[env.staging]
routes = [
  { pattern = "api-staging.yourdomain.com/*", zone_id = "your-zone-id" }
]
vars = { ENVIRONMENT = "staging" }
```

Find your zone ID:

1. Go to Cloudflare Dashboard
2. Select your domain
3. Find Zone ID in Overview tab (bottom right)

### 5. Set Environment Variables

Create `.env.production` and `.env.staging`:

**`.env.production`:**

```
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-secret
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://yourdomain.com
```

**`.env.staging`:**

```
GOOGLE_CLIENT_ID=your-staging-google-client-id
GOOGLE_CLIENT_SECRET=your-staging-secret
JWT_SECRET=your-staging-jwt-secret
CORS_ORIGIN=https://staging.yourdomain.com
```

### 6. Deploy to Staging

```bash
npm run deploy:staging
```

### 7. Test Staging Deployment

```bash
curl https://api-staging.yourdomain.com/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "version": "v1",
  "environment": "staging"
}
```

### 8. Deploy to Production

```bash
npm run deploy:production
```

### 9. Verify Production

```bash
curl https://api.yourdomain.com/api/v1/health
```

## Domain Configuration

### Add Worker Route to Domain

1. Go to Cloudflare Dashboard
2. Select your domain
3. Navigate to Workers Routes
4. Add route:
   - **Route**: `api.yourdomain.com/*`
   - **Worker**: `opnng-api`

Repeat for staging domain if needed.

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main, staging]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Deploy to staging
        if: github.ref == 'refs/heads/staging'
        working-directory: backend
        run: npm run deploy:staging
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        working-directory: backend
        run: npm run deploy:production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Add GitHub secrets:

1. Go to GitHub repo Settings → Secrets and variables → Actions
2. Add `CLOUDFLARE_API_TOKEN`:
   - Visit https://dash.cloudflare.com/profile/api-tokens
   - Create token with "Edit Cloudflare Workers" template
   - Copy token to GitHub secret

## Monitoring

### View Logs

```bash
wrangler tail
```

### Real-time Monitoring

Cloudflare Dashboard → Workers → Your Worker → Logs

### Analytics

- **Requests**: Total and by status code
- **CPU Time**: Execution performance
- **Errors**: Failed requests
- **Traffic**: Request volume over time

## Rollback

If deployment has issues:

```bash
# Rollback to previous version
wrangler deployments rollback
```

## Troubleshooting

### 404 Errors

- Verify route pattern in wrangler.toml matches your domain
- Check if DNS is configured correctly
- Ensure route is added in Cloudflare dashboard

### Authentication Issues

- Verify GOOGLE_CLIENT_ID is correct for your domain
- Check JWT_SECRET is set in environment
- Review Google OAuth credentials in Google Cloud Console

### CORS Errors

- Add your frontend domain to CORS_ORIGIN
- Redeploy after updating environment variables

### Performance Issues

- Monitor CPU time in Cloudflare dashboard
- Optimize KV queries
- Consider caching strategies

## Best Practices

1. **Use Environment Variables**: Never hardcode secrets
2. **Test Locally**: `npm run dev` before deploying
3. **Staging First**: Always test on staging before production
4. **Monitor Logs**: Set up alerts for errors
5. **Version Control**: Keep wrangler.toml in git
6. **API Versioning**: Plan for future API versions
7. **Documentation**: Keep API docs up to date

## Costs

Cloudflare Workers pricing:

- **Free**: 100,000 requests/day
- **Paid**: $0.50 per million requests (includes free tier)

KV pricing:

- **Free**: 1GB storage, 1M read operations/day
- **Paid**: $0.50 per GB-month, $0.50 per 1M operations

## Support

- Cloudflare Docs: https://developers.cloudflare.com/workers/
- Community: https://community.cloudflare.com/
- GitHub Issues: Your repository's issue tracker
