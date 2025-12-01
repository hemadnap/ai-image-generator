# Cloudflare Setup Guide - D1 & R2

This guide walks you through setting up Cloudflare D1 (database) and R2 (storage) for the AI Image Generator.

## Prerequisites

- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Authenticated with Cloudflare (`wrangler login`)

## Step 1: Create D1 Database

### 1.1 Create Database via Wrangler

```bash
cd backend

# Create D1 database
wrangler d1 create image_generator
```

This will output something like:
```
Creating D1 database image_generator...
✓ Created D1 database image_generator

Database ID: 12345678-90ab-cdef-1234-567890abcdef
```

### 1.2 Update wrangler.toml

Copy the Database ID and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "image_generator"
database_id = "12345678-90ab-cdef-1234-567890abcdef"
```

Also create staging and production databases if needed:

```bash
wrangler d1 create image_generator_staging
wrangler d1 create image_generator_prod
```

### 1.3 Verify Database

```bash
# List all databases
wrangler d1 list

# You should see your created database
```

## Step 2: Create R2 Bucket

### 2.1 Create Bucket via Wrangler

```bash
# Create R2 bucket
wrangler r2 bucket create image_generator
```

Output:
```
✓ Created bucket image_generator
```

### 2.2 Update wrangler.toml

Add R2 bucket binding:

```toml
[[r2_buckets]]
binding = "IMAGE_GENERATOR"
bucket_name = "image_generator"
```

Also create staging and production buckets:

```bash
wrangler r2 bucket create image_generator_staging
wrangler r2 bucket create image_generator_prod
```

### 2.3 Verify Bucket

```bash
# List all buckets
wrangler r2 bucket list

# You should see your created bucket
```

### 2.4 Configure R2 Public URL (Optional)

For faster access, you can configure a custom domain:

1. Go to Cloudflare Dashboard
2. Navigate to: R2 → image_generator → Settings
3. Set "Custom Domain" to `images.yourdomain.com`
4. Update `wrangler.toml` with this URL

## Step 3: Complete wrangler.toml Configuration

Your `wrangler.toml` should now look like:

```toml
name = "opnng-api"
main = "src/index.ts"
compatibility_date = "2024-12-16"

dev = { ip = "127.0.0.1", port = 8787 }
compatibility_flags = ["nodejs_compat"]

kv_namespaces = [
  { binding = "USERS_KV", id = "your-users-kv-id" },
  { binding = "SESSIONS_KV", id = "your-sessions-kv-id" }
]

[[d1_databases]]
binding = "DB"
database_name = "image_generator"
database_id = "YOUR_DATABASE_ID_HERE"

[[r2_buckets]]
binding = "IMAGE_GENERATOR"
bucket_name = "image_generator"

[env.development]
vars = { API_VERSION = "v1", ENVIRONMENT = "development", IMAGE_GENERATOR_URL = "http://localhost:8787/images" }

[[env.development.d1_databases]]
binding = "DB"
database_name = "image_generator"
database_id = "YOUR_DATABASE_ID_HERE"

[[env.development.r2_buckets]]
binding = "IMAGE_GENERATOR"
bucket_name = "image_generator"

[env.staging]
vars = { API_VERSION = "v1", ENVIRONMENT = "staging", IMAGE_GENERATOR_URL = "https://staging-images.yourdomain.com" }

[[env.staging.d1_databases]]
binding = "DB"
database_name = "image_generator_staging"
database_id = "YOUR_STAGING_DATABASE_ID_HERE"

[[env.staging.r2_buckets]]
binding = "IMAGE_GENERATOR"
bucket_name = "image_generator_staging"

[env.production]
vars = { API_VERSION = "v1", ENVIRONMENT = "production", IMAGE_GENERATOR_URL = "https://images.yourdomain.com" }

[[env.production.d1_databases]]
binding = "DB"
database_name = "image_generator_prod"
database_id = "YOUR_PRODUCTION_DATABASE_ID_HERE"

[[env.production.r2_buckets]]
binding = "IMAGE_GENERATOR"
bucket_name = "image_generator_prod"
```

## Step 4: Test Locally

### 4.1 Initialize Database Tables

Create a test endpoint or run during startup:

```bash
npm run dev
```

The `DatabaseInit.initialize()` will run automatically and create tables.

### 4.2 Test R2 Upload

```bash
# Via your API endpoint
curl -X POST http://localhost:3000/api/v1/images/upload \
  -H "Content-Type: application/json" \
  -d '{...your data...}'
```

## Step 5: Create Additional Databases/Buckets

### Staging Database

```bash
wrangler d1 create image_generator_staging
wrangler d1 create image_generator_prod
```

### Production Database

```bash
wrangler d1 create image_generator_prod
```

### Staging Bucket

```bash
wrangler r2 bucket create image_generator_staging
```

### Production Bucket

```bash
wrangler r2 bucket create image_generator_prod
```

## Step 6: Deploy to Production

### 6.1 Deploy to Staging

```bash
npm run deploy:staging
```

### 6.2 Deploy to Production

```bash
npm run deploy:production
```

## Troubleshooting

### Database Not Found Error

**Error:** `D1_ERROR: Database not found`

**Fix:** Ensure the database ID in `wrangler.toml` matches the actual database ID:

```bash
wrangler d1 list
# Copy the correct ID and update wrangler.toml
```

### R2 Bucket Access Error

**Error:** `Cannot access R2 bucket`

**Fix:** Ensure you're logged in and have permissions:

```bash
wrangler login
```

### Local Development Issues

**Error:** `Error: DATABASE_BINDING_NOT_FOUND`

**Fix:** Ensure `wrangler dev` is running and database is available locally.

## Best Practices

1. **Use different databases for environments** - Dev, staging, production
2. **Use different R2 buckets for environments** - Prevents data mixing
3. **Set R2 lifecycle policies** - Clean up old images automatically
4. **Monitor D1 database size** - Cloudflare free tier has limits
5. **Enable R2 CORS** if accessing from different domain
6. **Back up production database** - Use Cloudflare backup features
7. **Use signed URLs for private files** - Implement access control

## R2 Configuration Tips

### Enable CORS for R2

1. Go to Cloudflare Dashboard → R2 → image_generator → Settings
2. Add CORS Rules:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com"],
      "AllowedMethods": ["GET", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### Set R2 Lifecycle Policy

Automatically delete old images:

1. Go to R2 → image_generator → Settings
2. Set lifecycle rules to delete files after N days

### Configure R2 Custom Domain

1. Go to R2 → image_generator → Settings
2. Set custom domain: `images.yourdomain.com`
3. Point DNS CNAME to Cloudflare

## D1 Configuration Tips

### Create Database Backup

```bash
# D1 automatically backs up, but you can export:
wrangler d1 execute image_generator --command "SELECT * FROM users LIMIT 10"
```

### Monitor Database Usage

Go to Cloudflare Dashboard → D1 → image_generator → Analytics

### Scale Database

D1 scales automatically, but be aware of limits:
- Free tier: 5 GB storage
- Monitor via Dashboard

## Next Steps

1. ✅ Create D1 database
2. ✅ Create R2 bucket
3. ✅ Update wrangler.toml
4. ✅ Test locally
5. Create staging environment (optional)
6. Deploy to production
7. Configure monitoring

## Support

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
