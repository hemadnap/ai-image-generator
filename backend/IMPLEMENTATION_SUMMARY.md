# Data Models & Storage Implementation Summary

## What Was Created

A comprehensive, production-ready data layer for the AI Image Generator with maintainability and scalability in mind.

## Files Created

### 1. Models (Business Logic)
- **`backend/src/models/User.ts`** - User model with role and coin management
- **`backend/src/models/Image.ts`** - Image model for generated and uploaded images

### 2. Database Layer
- **`backend/src/database/init.ts`** - Automatic database initialization
- **`backend/src/repositories/UserRepository.ts`** - User data access layer
- **`backend/src/repositories/ImageRepository.ts`** - Image data access layer

### 3. Storage Layer
- **`backend/src/services/StorageService.ts`** - Cloudflare R2 integration

### 4. Configuration
- **`backend/wrangler.toml`** - Updated with D1 and R2 bindings
- **`backend/src/index.ts`** - Updated Env interface

### 5. Documentation
- **`backend/DATA_MODELS.md`** - Complete data model documentation
- **`backend/CLOUDFLARE_SETUP.md`** - Step-by-step Cloudflare setup guide

## Database Schema

### Users Table
```
id (UUID, PK)
email (String, Unique)
google_id (String, Unique)
first_name (String)
last_name (String)
roles (JSON Array: [ADMIN, USER])
language (String: en, es, etc.)
coins (Integer)
created_at (ISO8601)
updated_at (ISO8601)
```

Indexes: email, google_id

### Images Table
```
id (UUID, PK)
user_id (UUID, FK → users.id)
type (Enum: GENERATED, UPLOADED)
status (Enum: PENDING, PROCESSING, COMPLETED, FAILED)
title (String)
description (String)
prompt (String - for generated images)
storage_key (String - R2 key)
storage_url (String - R2 public URL)
thumbnail_key (String)
thumbnail_url (String)
metadata (JSON - dimensions, size, format, etc.)
coins_used (Integer)
created_at (ISO8601)
updated_at (ISO8601)
```

Indexes: user_id, status, type, created_at

## Storage Architecture

### R2 Bucket Structure
```
images/
└── {userId}/
    ├── {timestamp}-{filename}
    ├── {timestamp}-{filename}
    └── ...
```

**Features:**
- Organized by user
- Timestamped filenames
- Sanitized filenames
- Metadata stored with each file

## Key Features

### User Model
✅ Role management (ADMIN, USER)
✅ Coin balance tracking
✅ Coin affordability checks
✅ Coin deduction/addition
✅ Full name helper
✅ JSON serialization

### Image Model
✅ Generated/Uploaded type tracking
✅ Processing status tracking
✅ Thumbnail support
✅ Metadata storage
✅ Display URL helpers
✅ Dimension and size helpers

### Repositories
✅ Complete CRUD operations
✅ User lookup by email, Google ID
✅ OAuth user find-or-create
✅ Role management
✅ Coin management
✅ Image filtering by user/type/status
✅ Pagination support
✅ Statistics queries

### Storage Service
✅ File upload
✅ Buffer upload
✅ File deletion
✅ File retrieval
✅ User file listing
✅ Public URL generation
✅ Organized bucket structure

## Usage Examples

### Create User from Google OAuth
```typescript
const user = await UserRepository.findOrCreateByGoogle(env, {
  googleId: "google123",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  language: "en"
});
```

### Generate Image with Coin Deduction
```typescript
// Check balance
if (!user.canAffordFeature(100)) {
  return error('Insufficient coins');
}

// Upload to storage
const uploaded = await StorageService.uploadBuffer(
  env, 
  imageBuffer, 
  "generated.png", 
  user.id, 
  "image/png"
);

// Create database record
const image = await ImageRepository.create(env, {
  userId: user.id,
  type: ImageType.GENERATED,
  title: "My Generated Image",
  description: "A beautiful sunset",
  prompt: "sunset over mountains",
  storageKey: uploaded.key,
  storageUrl: uploaded.url,
  coinsUsed: 100
});

// Deduct coins
await UserRepository.deductCoins(env, user.id, 100);
```

### Query User's Images
```typescript
// All images
const { images, total } = await ImageRepository.findByUserId(
  env, 
  userId, 
  50,  // limit
  0    // offset
);

// Generated images only
const { images } = await ImageRepository.findGeneratedByUserId(
  env, 
  userId, 
  50, 
  0
);

// User statistics
const stats = await ImageRepository.getUserStats(env, userId);
console.log(`Generated: ${stats.generatedImages}`);
console.log(`Uploaded: ${stats.uploadedImages}`);
console.log(`Total coins spent: ${stats.totalCoinsUsed}`);
```

## Setup Steps

### 1. Create Cloudflare Resources
```bash
# Create D1 database
wrangler d1 create image_generator

# Create R2 bucket
wrangler r2 bucket create image_generator
```

### 2. Update Configuration
Update `wrangler.toml` with your database ID and bucket name

### 3. Deploy
```bash
npm run dev  # Local testing
npm run deploy  # Production
```

### 4. Initialize Database
Tables are automatically created on first request

## Architecture Benefits

### Maintainability ✅
- Models contain business logic
- Repositories handle data access
- Services handle external integrations
- Clear separation of concerns

### Scalability ✅
- Indexed database queries
- Efficient filtering
- Pagination support
- Organized storage structure

### Type Safety ✅
- TypeScript interfaces
- Model validation
- Type-checked operations

### Security ✅
- Role-based access control
- Coin balance validation
- Foreign key constraints
- Organized storage by user

### Performance ✅
- Indexed lookups
- Efficient filtering
- Optional thumbnails
- Metadata caching

## Next Steps

1. **Implement Image Generation Endpoints**
   - `POST /api/v1/images/generate`
   - `POST /api/v1/images/upload`
   - `GET /api/v1/images`
   - `DELETE /api/v1/images/{id}`

2. **Add Authentication Handlers**
   - Protect image endpoints with JWT
   - Verify user ownership
   - Check coin balance

3. **Implement Nanobanana Integration**
   - Add image generation service
   - Handle async processing
   - Store results in database

4. **Add Frontend Integration**
   - Image gallery component
   - Upload form
   - Generation form
   - User statistics display

5. **Optional Enhancements**
   - Image collections/albums
   - Social sharing
   - NFT minting
   - Marketplace

## File Locations

```
backend/
├── src/
│   ├── models/
│   │   ├── User.ts
│   │   └── Image.ts
│   ├── repositories/
│   │   ├── UserRepository.ts
│   │   └── ImageRepository.ts
│   ├── services/
│   │   └── StorageService.ts
│   ├── database/
│   │   └── init.ts
│   └── index.ts (updated Env interface)
├── wrangler.toml (updated)
├── DATA_MODELS.md (documentation)
└── CLOUDFLARE_SETUP.md (setup guide)
```

## Environment Variables

### Development (.env)
```
DATABASE_ID=your-dev-database-id
BUCKET_NAME=image_generator
```

### Production (wrangler.toml)
```toml
[env.production]
d1_databases = [{ binding = "DB", database_name = "image_generator_prod", database_id = "prod-id" }]
r2_buckets = [{ binding = "IMAGE_GENERATOR", bucket_name = "image_generator_prod" }]
```

## Error Handling

All operations include comprehensive error handling:
- Database errors
- Storage errors
- Validation errors
- Business logic errors (insufficient coins, etc.)

## Conclusion

You now have a production-ready data layer with:
- ✅ Scalable database schema
- ✅ Type-safe models and repositories
- ✅ Organized file storage
- ✅ Coin system
- ✅ Role-based access control
- ✅ Complete documentation
- ✅ Easy to extend and maintain

Ready to implement image generation endpoints! 🚀
