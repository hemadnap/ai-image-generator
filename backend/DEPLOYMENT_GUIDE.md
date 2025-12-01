# Cloudflare Workers Deployment Guide

## Deploying Backend to Cloudflare Workers

### Prerequisites

1. **Cloudflare Account** - Create at https://dash.cloudflare.com
2. **Wrangler CLI** - Already installed in your project
3. **Cloudflare API Token** - Generate one for deployment

### Step 1: Generate Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Click "Use this template"
5. Name it: `worker-deploy-token`
6. Click "Create Token"
7. Copy the token and save it

### Step 2: Authenticate Wrangler

```bash
cd backend
wrangler login
# Browser will open - authorize the login
```

Or use API token directly:

```bash
export CLOUDFLARE_API_TOKEN=your-api-token-here
```

### Step 3: Create Cloudflare Resources

Before deploying, you need to create the D1 database and R2 bucket:

```bash
# Create D1 Database
wrangler d1 create image_generator

# Create R2 Bucket
wrangler r2 bucket create image_generator

# Create KV Namespaces
wrangler kv:namespace create USERS_KV
wrangler kv:namespace create SESSIONS_KV
```

Note the IDs returned and update `wrangler.toml`

### Step 4: Update wrangler.toml with Resource IDs

Replace the placeholder IDs in `wrangler.toml`:

```toml
kv_namespaces = [
  { binding = "USERS_KV", id = "YOUR_USERS_KV_ID", preview_id = "YOUR_PREVIEW_USERS_KV_ID" },
  { binding = "SESSIONS_KV", id = "YOUR_SESSIONS_KV_ID", preview_id = "YOUR_PREVIEW_SESSIONS_KV_ID" }
]

d1_databases = [
  { binding = "DB", database_name = "image_generator", database_id = "YOUR_DATABASE_ID" }
]

r2_buckets = [
  { binding = "IMAGE_GENERATOR", bucket_name = "image_generator" }
]
```

### Step 5: Test Locally

```bash
npm run dev
```

Visit: http://localhost:8787/api/v1/health

Should return:
```json
{
  "status": "ok",
  "version": "v1",
  "environment": "development",
  "timestamp": "2025-11-30T..."
}
```

### Step 6: Deploy to Cloudflare Workers

```bash
# Deploy to development
npm run deploy

# This will deploy as: image-generator-api.your-username.workers.dev
```

### Step 7: Get Your Worker URL

After deployment, Cloudflare will show your worker URL:

```
✨ Success! Uploaded image_generator_api to Cloudflare Workers

https://image-generator-api.your-username.workers.dev
```

### Step 8: Update Frontend Configuration

Update `frontend/.env`:

```properties
VITE_API_BASE_URL=https://image-generator-api.your-username.workers.dev/api/v1
```

Or add a new environment variable for development:

```properties
VITE_API_DEV_URL=https://image-generator-api.your-username.workers.dev/api/v1
```

Then update `frontend/src/constants/config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_DEV_URL || 
            import.meta.env.VITE_API_BASE_URL || 
            'https://image-generator-api.your-username.workers.dev/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
}
```

### Step 9: Verify Deployment

Test the deployed API:

```bash
curl https://image-generator-api.your-username.workers.dev/api/v1/health
```

## Environment Variables

### Development (Local)

```bash
# .env
VITE_API_BASE_URL=http://localhost:8787/api/v1
```

### Development (Deployed Worker)

```bash
# frontend/.env
VITE_API_BASE_URL=https://image-generator-api.your-username.workers.dev/api/v1
```

### Production

Configure via Cloudflare Dashboard or wrangler:

```bash
wrangler secret put GOOGLE_CLIENT_SECRET --env production
wrangler secret put JWT_SECRET --env production
```

## Accessing Your Worker

### Worker URL Format

```
https://image-generator-api.your-username.workers.dev
```

Where:
- `image-generator-api` - Worker name (from wrangler.toml)
- `your-username` - Your Cloudflare username
- `workers.dev` - Default Cloudflare Workers domain

### With Custom Domain (Optional)

You can set up a custom domain later:

1. Go to Cloudflare Dashboard
2. Select your domain
3. Workers → Settings
4. Set custom domain to your subdomain
5. Map to your worker

Example: `api.yourdomain.com`

## Monitoring & Logs

### View Real-time Logs

```bash
wrangler tail
```

### View via Dashboard

1. https://dash.cloudflare.com
2. Select your account
3. Workers & Pages
4. image_generator_api
5. Tail Consumers

## Updating the Worker

```bash
# Make changes to code
# Then redeploy

npm run deploy

# For different environments
npm run deploy:staging
npm run deploy:production
```

## CORS Configuration

The worker has CORS headers configured for localhost. For production, update:

`backend/src/middleware/cors.ts`

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://yourdomain.com',
  'https://image-generator-api.your-username.workers.dev'
]
```

Then redeploy:

```bash
npm run deploy
```

## Troubleshooting

### Worker not found

```bash
wrangler list
```

### Database not accessible

Check in wrangler.toml that database_id is correct:

```bash
wrangler d1 list
```

### R2 bucket not accessible

Check bucket binding:

```bash
wrangler r2 bucket list
```

### CORS errors on frontend

1. Check frontend base URL matches deployment URL
2. Verify CORS middleware is configured
3. Test with curl:

```bash
curl -i https://image-generator-api.your-username.workers.dev/api/v1/health
```

Should show CORS headers:
```
Access-Control-Allow-Origin: http://localhost:3000
```

### Worker timeout

If requests are timing out:
1. Check database connectivity
2. Verify KV namespaces are accessible
3. Check R2 bucket access
4. Review logs with `wrangler tail`

## Scaling & Performance

### Auto-scaling

Cloudflare Workers automatically scales. No configuration needed.

### Caching

Add caching headers for static responses:

```typescript
const headers = new Headers(response.headers)
headers.set('Cache-Control', 'public, max-age=3600')
response = new Response(response.body, { status: response.status, headers })
```

### Rate Limiting

Cloudflare Workers includes built-in rate limiting on the free plan.

For custom limits, use Cloudflare's Rate Limiting rules.

## Security

### Secrets Management

Never put secrets in wrangler.toml. Use wrangler secrets:

```bash
wrangler secret put JWT_SECRET --env production
wrangler secret put GOOGLE_CLIENT_SECRET --env production
```

Access in code:

```typescript
const jwtSecret = env.JWT_SECRET
```

### HTTPS

All Cloudflare Workers URLs use HTTPS by default.

### Authentication

Keep Google OAuth credentials secure - only store in environment secrets.

## Billing

Cloudflare Workers Free Plan includes:
- 100,000 requests/day
- 50ms CPU time per request
- Unlimited D1 databases (up to limits)
- Unlimited R2 buckets (5GB storage free)

Beyond free tier: $0.50 per 1M requests

## Next Steps

1. ✅ Deploy worker
2. ✅ Update frontend URL
3. ✅ Test end-to-end
4. Implement image generation endpoints
5. Integrate Nanobanana API
6. Deploy to production

## Quick Commands

```bash
# Develop locally
npm run dev

# Deploy to development
npm run deploy

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# View logs
wrangler tail

# Create new KV namespace
wrangler kv:namespace create MY_NAMESPACE

# Delete KV namespace
wrangler kv:namespace delete --binding MY_NAMESPACE

# List all databases
wrangler d1 list

# List all R2 buckets
wrangler r2 bucket list

# View worker settings
wrangler list
```

## References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Docs](https://developers.cloudflare.com/d1/)
- [R2 Docs](https://developers.cloudflare.com/r2/)

---

You're all set! Your backend is now deployed and ready to use! 🚀
