# 🚀 Deployment Steps for image_generator_api

You're logged in as: **tomas@tcsn.io**  
Account ID: **bbe2497d1b532f5329c85e303788d683**

## Step 1: Create D1 Database

Run this command:
```bash
wrangler d1 create image_generator
```

You'll get output like:
```
✔ Successfully created DB 'image_generator'
📦 Created new D1 database.

binding = "DB"
database_name = "image_generator"
database_id = "12345678-abcd-efgh-ijkl-mnopqrstuvwx"
```

**Copy the database_id and update wrangler.toml:**
```toml
d1_databases = [
  { binding = "DB", database_name = "image_generator", database_id = "YOUR-ID-HERE" }
]
```

---

## Step 2: Create R2 Bucket

Run this command:
```bash
wrangler r2 bucket create image-generator
```

You'll get output confirming the bucket was created.

✅ Already configured in wrangler.toml with correct name: `image-generator`

---

## Step 3: Create KV Namespaces

Create USERS_KV:
```bash
wrangler kv:namespace create USERS_KV
```

Create SESSIONS_KV:
```bash
wrangler kv:namespace create SESSIONS_KV
```

You'll get output with IDs:
```
binding = "USERS_KV"
id = "12345678-abcd-efgh-ijkl-mnopqrstuvwx"
```

**Update wrangler.toml with the IDs:**
```toml
kv_namespaces = [
  { binding = "USERS_KV", id = "YOUR-ID-HERE" },
  { binding = "SESSIONS_KV", id = "YOUR-ID-HERE" }
]
```

---

## Step 4: Update wrangler.toml

Fill in all the IDs you got from the commands above.

**Development section example:**
```toml
[env.development]
vars = { 
  API_VERSION = "v1", 
  ENVIRONMENT = "development",
  GOOGLE_CLIENT_ID = "66286687898-a8ncf1ngq8rn63nv3o52145keeknmr4n.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET = "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",
  JWT_SECRET = "ICY7Jp3DE6TNkZFVLxc+e8iK01ohMnD9GWiuppbBxT8=",
  CORS_ORIGIN = "http://localhost:3000,http://localhost:8787",
  IMAGE_GENERATOR_URL = "http://localhost:8787"
}
kv_namespaces = [
  { binding = "USERS_KV", id = "YOUR-USERS-KV-ID" },
  { binding = "SESSIONS_KV", id = "YOUR-SESSIONS-KV-ID" }
]
d1_databases = [
  { binding = "DB", database_name = "image_generator", database_id = "YOUR-DB-ID" }
]
r2_buckets = [
  { binding = "IMAGE_GENERATOR", bucket_name = "image-generator" }
]
```

---

## Step 5: Deploy

Once all IDs are filled in, deploy:
```bash
npm run deploy
```

Or with specific environment:
```bash
npm run deploy -- --env development
```

---

## Step 6: Update Frontend

After deployment, you'll get a URL like:
```
https://image-generator-api.YOUR-USERNAME.workers.dev
```

Update `frontend/.env`:
```properties
VITE_API_BASE_URL=https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1
```

Or use the switcher:
```bash
cd frontend && ./switch-api.sh
```

---

## Troubleshooting

**"Database not found":**
- Make sure database_id is correct in wrangler.toml
- Run deployment again

**"R2 bucket error":**
- Bucket name must be lowercase, hyphens only, 3-63 chars
- Currently: `image-generator` ✓

**"KV namespace error":**
- Make sure IDs are filled in correctly
- Recreate if needed: `wrangler kv:namespace create USERS_KV --preview false`

**"Deployment fails":**
- Check all IDs in wrangler.toml
- Make sure no "your-" placeholders remain
- Check npm run build succeeds

---

## Next Steps

1. Create D1 database
2. Get the ID
3. Update wrangler.toml
4. Create R2 bucket (already configured)
5. Create KV namespaces
6. Get the IDs
7. Update wrangler.toml
8. Run: `npm run deploy`
9. Update frontend URL
10. Test!

---

**Time estimate: 10-15 minutes**

Ready? Start with Step 1! 🚀
