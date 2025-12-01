# 🎨 AI Image Generator - Data Models & Storage Implementation

Complete, production-ready data layer with D1 database and R2 storage for the Nanobanana AI image generator.

## 📦 What's Included

### 1. Database Models
- **User Model** - Manages users with roles and coins
- **Image Model** - Stores image metadata with generation tracking

### 2. Data Access Layer
- **UserRepository** - Complete user CRUD and OAuth integration
- **ImageRepository** - Image management with filtering and statistics

### 3. Storage Integration
- **StorageService** - Cloudflare R2 file operations
- **DatabaseInit** - Automatic table creation and initialization

### 4. Configuration
- **wrangler.toml** - D1 database and R2 bucket bindings
- **Env Interface** - TypeScript types for all bindings

### 5. Documentation
- **DATA_MODELS.md** - Complete schema and API reference
- **CLOUDFLARE_SETUP.md** - Step-by-step setup guide
- **ARCHITECTURE_OVERVIEW.md** - Visual diagrams and flow charts
- **IMPLEMENTATION_SUMMARY.md** - Overview and benefits
- **NEXT_STEPS.md** - Implementation roadmap

## 🚀 Quick Start

### 1. Create Cloudflare Resources

```bash
cd backend

# Create database
wrangler d1 create image_generator

# Create bucket
wrangler r2 bucket create image_generator
```

### 2. Update Configuration

Copy the database ID and update `backend/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "image_generator"
database_id = "YOUR_ID_HERE"

[[r2_buckets]]
binding = "IMAGE_GENERATOR"
bucket_name = "image_generator"
```

### 3. Test Locally

```bash
npm install
npm run dev
```

Tables are created automatically! ✓

### 4. Ready to Build

Start implementing image endpoints and Nanobanana integration.

## 📊 Database Schema

### Users Table
```sql
id              UUID (primary key)
email           String (unique)
google_id       String (unique)
first_name      String
last_name       String
roles           JSON: ["USER"] or ["ADMIN"]
language        String: en, es, etc.
coins           Integer
created_at      Timestamp
updated_at      Timestamp
```

### Images Table
```sql
id              UUID (primary key)
user_id         UUID (foreign key → users.id)
type            Enum: GENERATED, UPLOADED
status          Enum: PENDING, PROCESSING, COMPLETED, FAILED
title           String
description     String
prompt          String (for generated images)
storage_key     String (R2 key)
storage_url     String (R2 URL)
thumbnail_url   String (optional)
metadata        JSON: {width, height, size, format, ...}
coins_used      Integer
created_at      Timestamp
updated_at      Timestamp
```

## 🗂️ Storage Structure

Files are organized in R2 by user:

```
image_generator/
└── images/
    └── {userId}/
        ├── 1735689200000-sunset-landscape.png
        ├── 1735689201000-portrait-photo.jpg
        └── ...
```

## 💻 Models & APIs

### User Model
```typescript
class User {
  // Properties
  id, email, googleId, firstName, lastName
  roles: UserRole[], language, coins
  
  // Methods
  getFullName()
  hasRole(role)
  isAdmin()
  canAffordFeature(coins)
  deductCoins(amount)
  addCoins(amount)
  toJSON()
  toRow()
}
```

### Image Model
```typescript
class Image {
  // Properties
  id, userId, type, status
  title, description, prompt
  storageUrl, thumbnailUrl
  metadata, coinsUsed
  
  // Methods
  isReady()
  isGenerated()
  isUploaded()
  getDisplayUrl()
  getDimensions()
  getSizeInMB()
  toJSON()
  toRow()
}
```

### UserRepository API
```typescript
// CRUD
create(env, data)
findById(env, id)
findByEmail(env, email)
findByGoogleId(env, googleId)
findOrCreateByGoogle(env, data)  // OAuth helper
update(env, id, data)
delete(env, id)

// Coin management
deductCoins(env, userId, amount)
addCoins(env, userId, amount)

// Role management
addRole(env, userId, role)
removeRole(env, userId, role)

// Queries
findAll(env, limit, offset)
```

### ImageRepository API
```typescript
// CRUD
create(env, data)
findById(env, id)
update(env, id, data)
delete(env, id)

// Queries
findByUserId(env, userId, limit, offset)
findGeneratedByUserId(env, userId, limit, offset)
findUploadedByUserId(env, userId, limit, offset)
findAll(env, limit, offset)

// Status
updateStatus(env, id, status)

// Statistics
getUserStats(env, userId)
```

### StorageService API
```typescript
// Upload
upload(env, file, userId)
uploadBuffer(env, buffer, fileName, userId, contentType)

// Operations
delete(env, key)
get(env, key)
list(env, userId, prefix)
getPublicUrl(env, key)
createSignedUrl(env, key, expirationSeconds)
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **DATA_MODELS.md** | Complete schema, models, and API reference |
| **CLOUDFLARE_SETUP.md** | Step-by-step Cloudflare setup |
| **ARCHITECTURE_OVERVIEW.md** | Visual diagrams and flow charts |
| **IMPLEMENTATION_SUMMARY.md** | Overview of what was created |
| **NEXT_STEPS.md** | Implementation roadmap |

## 🎯 Features

### User Management
✅ Create users from Google OAuth
✅ Manage roles (ADMIN, USER)
✅ Track coin balance
✅ Language preferences
✅ User lookup by email/Google ID

### Image Management
✅ Store generated and uploaded images
✅ Track processing status
✅ Link images to users
✅ Store metadata (dimensions, size, etc.)
✅ Support thumbnails
✅ Query by type, status, user

### Storage
✅ Upload to Cloudflare R2
✅ Organize by user
✅ Automatic timestamping
✅ Generate public URLs
✅ Delete files
✅ List user's files

### Coins System
✅ Track coin balance
✅ Check affordability
✅ Deduct coins
✅ Add coins (rewards, purchases)
✅ Store cost per generation

## 🔐 Security

- ✅ Role-based access control
- ✅ User ownership verification
- ✅ Coin balance validation
- ✅ Foreign key constraints
- ✅ Organized storage by user
- ✅ Optional signed URLs for private files

## 📈 Performance

- ✅ Indexed database queries
- ✅ Efficient filtering
- ✅ Pagination support
- ✅ Organized bucket structure
- ✅ Statistics aggregation

## 🏗️ Architecture

```
Frontend (Vue 3)
    ↓
Backend (Workers)
    ├── Models (User, Image)
    ├── Repositories (UserRepo, ImageRepo)
    ├── Services (StorageService, NanobananaService)
    └── Routes/Handlers
         ↓
    ┌─────┬──────┬──────────┐
    ↓     ↓      ↓          ↓
   D1    KV     R2      External APIs
  (DB) (Cache) (Files)  (Nanobanana)
```

## 🔄 Example: Generate Image

```typescript
// 1. Get user
const user = await UserRepository.findById(env, userId)

// 2. Check coins
if (!user.canAffordFeature(100)) {
  return error('Insufficient coins')
}

// 3. Generate image (via Nanobanana)
const imageBuffer = await generateImage(prompt)

// 4. Upload to storage
const uploaded = await StorageService.uploadBuffer(
  env, imageBuffer, 'generated.png', userId, 'image/png'
)

// 5. Create database record
const image = await ImageRepository.create(env, {
  userId: user.id,
  type: ImageType.GENERATED,
  title: 'My Image',
  prompt: prompt,
  storageKey: uploaded.key,
  storageUrl: uploaded.url,
  coinsUsed: 100
})

// 6. Deduct coins
await UserRepository.deductCoins(env, user.id, 100)

// 7. Return
return success({ image: image.toJSON() })
```

## 🛠️ Files Created

### Models (2 files)
- `src/models/User.ts`
- `src/models/Image.ts`

### Repositories (2 files)
- `src/repositories/UserRepository.ts`
- `src/repositories/ImageRepository.ts`

### Services (1 file)
- `src/services/StorageService.ts`

### Database (1 file)
- `src/database/init.ts`

### Configuration (2 files)
- `src/index.ts` (updated)
- `wrangler.toml` (updated)

### Documentation (5 files)
- `DATA_MODELS.md`
- `CLOUDFLARE_SETUP.md`
- `ARCHITECTURE_OVERVIEW.md`
- `IMPLEMENTATION_SUMMARY.md`
- `NEXT_STEPS.md`

## 🚀 Next Phase

Implement image generation endpoints:
1. POST `/api/v1/images/generate` - Generate with Nanobanana
2. POST `/api/v1/images/upload` - Upload image
3. GET `/api/v1/images` - List user's images
4. GET `/api/v1/images/{id}` - Get image details
5. DELETE `/api/v1/images/{id}` - Delete image

See `NEXT_STEPS.md` for detailed implementation roadmap.

## 📞 Support

- Read the documentation files for detailed information
- Check `CLOUDFLARE_SETUP.md` if you have setup issues
- Review `ARCHITECTURE_OVERVIEW.md` for visual diagrams
- Consult `DATA_MODELS.md` for API reference

## ✨ Summary

You now have:
- ✅ Complete database schema
- ✅ Type-safe models
- ✅ Data access layer
- ✅ Storage integration
- ✅ Configuration ready
- ✅ Comprehensive documentation
- ✅ Production-ready code

Ready to implement Nanobanana image generation! 🎨
