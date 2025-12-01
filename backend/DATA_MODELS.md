# Data Models & Architecture

## Overview

This document describes the data models, database schema, and storage architecture for the AI Image Generator application.

## Architecture Diagram

```
┌─────────────────────┐
│   Frontend (Vue 3)  │
└──────────┬──────────┘
           │ API Calls
           ▼
┌─────────────────────┐
│  Backend (Workers)  │
│                     │
│  ┌───────────────┐  │
│  │   Handlers    │  │
│  ├───────────────┤  │
│  │ Services      │  │
│  ├───────────────┤  │
│  │ Repositories  │  │
│  └───────────────┘  │
└──────────┬──────────┘
     ┌─────┴─────┬──────────┐
     ▼           ▼          ▼
┌────────┐  ┌─────────┐  ┌─────────┐
│   D1   │  │   KV    │  │   R2    │
│Database│  │Namespaces  │Bucket  │
└────────┘  └─────────┘  └─────────┘
```

## Database Schema

### Users Table

Stores user information and authentication data.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  google_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  roles TEXT NOT NULL DEFAULT '["USER"]',
  language TEXT NOT NULL DEFAULT 'en',
  coins INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
```

**Fields:**
- `id`: UUID - Unique user identifier
- `email`: String - User's email address (unique)
- `google_id`: String - Google OAuth ID (unique)
- `first_name`: String - User's first name
- `last_name`: String - User's last name
- `roles`: JSON Array - User roles (ADMIN, USER)
- `language`: String - User's preferred language (en, es, etc.)
- `coins`: Integer - Coins balance for feature access
- `created_at`: ISO8601 - Account creation timestamp
- `updated_at`: ISO8601 - Last update timestamp

**Indexes:**
- `email` - Fast lookup by email
- `google_id` - Fast lookup by Google ID

### Images Table

Stores metadata for generated and uploaded images.

```sql
CREATE TABLE images (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('GENERATED', 'UPLOADED')),
  status TEXT NOT NULL CHECK(status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT,
  storage_key TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  thumbnail_key TEXT,
  thumbnail_url TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  coins_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_status ON images(status);
CREATE INDEX idx_images_type ON images(type);
CREATE INDEX idx_images_created_at ON images(created_at DESC);
```

**Fields:**
- `id`: UUID - Unique image identifier
- `user_id`: UUID - Foreign key to users table
- `type`: Enum - GENERATED or UPLOADED
- `status`: Enum - PENDING, PROCESSING, COMPLETED, FAILED
- `title`: String - Image title/name
- `description`: String - Image description (optional)
- `prompt`: String - Generation prompt (for generated images)
- `storage_key`: String - R2 storage key
- `storage_url`: String - Public R2 URL
- `thumbnail_key`: String - R2 thumbnail storage key (optional)
- `thumbnail_url`: String - Public thumbnail URL (optional)
- `metadata`: JSON - Additional metadata (dimensions, size, format, etc.)
- `coins_used`: Integer - Coins spent to generate/upload
- `created_at`: ISO8601 - Creation timestamp
- `updated_at`: ISO8601 - Last update timestamp

**Indexes:**
- `user_id` - Get all images for a user
- `status` - Filter by processing status
- `type` - Filter by image type
- `created_at DESC` - Get latest images first

**Foreign Key:**
- Links to `users.id` with CASCADE DELETE

## Storage Architecture

### R2 Bucket Structure

Files are organized in the R2 bucket as follows:

```
images/
├── {userId}/
│   ├── {timestamp}-{filename}
│   ├── {timestamp}-{filename}
│   └── ...
├── {userId}/
│   └── ...
```

**Key Generation Formula:**
```
{BUCKET_PREFIX}/{userId}/{timestamp}-{sanitized-filename}
```

**Example:**
```
images/550e8400-e29b-41d4-a716-446655440000/1735689200000-landscape-photo.jpg
```

### Storage Service API

**Upload File:**
```typescript
const uploaded = await StorageService.upload(env, file, userId);
// Returns: { key, url, size, contentType }
```

**Upload Buffer:**
```typescript
const uploaded = await StorageService.uploadBuffer(
  env, 
  imageBuffer, 
  "generated-image.png", 
  userId, 
  "image/png"
);
```

**Delete File:**
```typescript
await StorageService.delete(env, key);
```

**Get File:**
```typescript
const buffer = await StorageService.get(env, key);
```

**List User's Files:**
```typescript
const files = await StorageService.list(env, userId);
// Returns: [{ key, size, uploaded }, ...]
```

**Get Public URL:**
```typescript
const url = StorageService.getPublicUrl(env, key);
```

## Models

### User Model

**Location:** `backend/src/models/User.ts`

**Key Methods:**
```typescript
// Get full name
getFullName(): string

// Role management
hasRole(role: UserRole): boolean
isAdmin(): boolean

// Coin management
canAffordFeature(coinsRequired: number): boolean
deductCoins(amount: number): void
addCoins(amount: number): void

// Serialization
toJSON()        // For API responses
toRow()         // For database operations
```

**Example Usage:**
```typescript
const user = new User(userRow);
if (user.canAffordFeature(100)) {
  user.deductCoins(100);
  await UserRepository.update(env, user.id, user);
}
```

### Image Model

**Location:** `backend/src/models/Image.ts`

**Key Methods:**
```typescript
// Status checks
isReady(): boolean
isGenerated(): boolean
isUploaded(): boolean

// Image info
getDisplayUrl(): string
getDimensions(): { width?, height? }
getSizeInMB(): string

// Serialization
toJSON()        // For API responses
toRow()         // For database operations
```

**Example Usage:**
```typescript
const image = new Image(imageRow);
if (image.isReady()) {
  const displayUrl = image.getDisplayUrl();
  const dimensions = image.getDimensions();
}
```

## Repositories

### UserRepository

**Location:** `backend/src/repositories/UserRepository.ts`

**Key Methods:**
```typescript
// CRUD operations
create(env, data)
findById(env, id)
findByEmail(env, email)
findByGoogleId(env, googleId)
findOrCreateByGoogle(env, data)  // OAuth helper
update(env, id, data)
delete(env, id)

// Queries
findAll(env, limit, offset)

// Coin management
deductCoins(env, userId, amount)
addCoins(env, userId, amount)

// Role management
addRole(env, userId, role)
removeRole(env, userId, role)
```

**Example Usage:**
```typescript
// Find or create user from Google OAuth
const user = await UserRepository.findOrCreateByGoogle(env, {
  googleId: "123456789",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  language: "en"
});

// Deduct coins for feature usage
const updatedUser = await UserRepository.deductCoins(env, user.id, 100);
```

### ImageRepository

**Location:** `backend/src/repositories/ImageRepository.ts`

**Key Methods:**
```typescript
// CRUD operations
create(env, data)
findById(env, id)
update(env, id, data)
delete(env, id)

// Queries by user
findByUserId(env, userId, limit, offset)
findGeneratedByUserId(env, userId, limit, offset)
findUploadedByUserId(env, userId, limit, offset)
findAll(env, limit, offset)

// Status management
updateStatus(env, id, status)

// Statistics
getUserStats(env, userId)  // Returns: { totalImages, generatedImages, uploadedImages, totalCoinsUsed }
```

**Example Usage:**
```typescript
// Create generated image
const image = await ImageRepository.create(env, {
  userId: user.id,
  type: ImageType.GENERATED,
  title: "My Generated Image",
  description: "A beautiful landscape",
  prompt: "sunset over mountains",
  storageKey: uploadedFile.key,
  storageUrl: uploadedFile.url,
  metadata: { width: 1024, height: 1024, format: "png" },
  coinsUsed: 50
});

// Get user's statistics
const stats = await ImageRepository.getUserStats(env, user.id);
console.log(`User has generated ${stats.generatedImages} images`);
```

## Services

### StorageService

**Location:** `backend/src/services/StorageService.ts`

Handles all file operations in Cloudflare R2.

**Key Methods:**
```typescript
upload(env, file, userId)
uploadBuffer(env, buffer, fileName, userId, contentType)
delete(env, key)
get(env, key)
list(env, userId, prefix)
getPublicUrl(env, key)
createSignedUrl(env, key, expirationSeconds)
```

## Database Initialization

The `DatabaseInit` class automatically creates tables on first deployment:

```typescript
import { DatabaseInit } from './database/init'

// In your handler:
await DatabaseInit.initialize(env);
```

**What it does:**
- Creates `users` table with indexes
- Creates `images` table with indexes
- Idempotent - safe to run multiple times

## Roles & Permissions

### User Roles

```typescript
enum UserRole {
  USER = 'USER',      // Regular user
  ADMIN = 'ADMIN'     // Administrator
}
```

**Usage:**
```typescript
const user = await UserRepository.findById(env, userId);

if (user.isAdmin()) {
  // Admin-only operations
}

// Add role
await UserRepository.addRole(env, userId, UserRole.ADMIN);

// Remove role
await UserRepository.removeRole(env, userId, UserRole.ADMIN);
```

## Coins System

Coins are used to:
- Track feature access
- Limit image generation
- Monetize the application

**Operations:**
```typescript
// Check if user can afford feature
if (user.canAffordFeature(100)) {
  // Proceed with feature
  await UserRepository.deductCoins(env, user.id, 100);
}

// Add coins (rewards, purchases)
await UserRepository.addCoins(env, user.id, 50);
```

## Configuration

### wrangler.toml

D1 Database binding:
```toml
d1_databases = [
  { binding = "DB", database_name = "image_generator", database_id = "your-database-id" }
]
```

R2 Bucket binding:
```toml
r2_buckets = [
  { binding = "IMAGE_GENERATOR", bucket_name = "image_generator" }
]
```

## Best Practices

1. **Always use repositories** - Don't call database directly in handlers
2. **Use models for validation** - Models contain business logic
3. **Handle errors gracefully** - Check coin balance before deducting
4. **Index frequently queried columns** - Already configured in schema
5. **Use transactions for complex operations** - Especially for coin deductions
6. **Clean up orphaned files** - If image is deleted, remove R2 file too

## Example: Complete Image Generation Flow

```typescript
// 1. Get user
const user = await UserRepository.findById(env, userId);

// 2. Check coin balance
if (!user.canAffordFeature(50)) {
  return error('Insufficient coins');
}

// 3. Generate or upload image
const imageBuffer = await generateImage(prompt); // Your generation logic

// 4. Upload to R2
const uploaded = await StorageService.uploadBuffer(
  env, 
  imageBuffer, 
  "generated.png", 
  user.id, 
  "image/png"
);

// 5. Create database record
const image = await ImageRepository.create(env, {
  userId: user.id,
  type: ImageType.GENERATED,
  title: "Generated Image",
  description: prompt,
  prompt: prompt,
  storageKey: uploaded.key,
  storageUrl: uploaded.url,
  metadata: { width: 1024, height: 1024, size: uploaded.size },
  coinsUsed: 50
});

// 6. Deduct coins
await UserRepository.deductCoins(env, user.id, 50);

// 7. Return result
return success({ image: image.toJSON() });
```

## Next Steps

1. Implement image generation endpoints
2. Add NFT/collection features if needed
3. Implement coin shop/marketplace
4. Add batch operations for efficiency
5. Implement caching layer for frequently accessed images
