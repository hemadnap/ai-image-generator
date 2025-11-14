# How to Update Replicate Model Versions

## Overview

Replicate regularly updates model versions. You may need to update the version IDs in `replicate-config.js` to use the latest models with new features and improvements.

## Finding the Latest Model Versions

### Method 1: Using the Replicate Website

1. Visit [https://replicate.com/explore](https://replicate.com/explore)
2. Search for the model you want (e.g., "FLUX Kontext Pro")
3. Click on the model to view its details page
4. Look for the **API** section
5. Find the version ID - it will look like: `owner/model-name:abcdef123456...`

### Method 2: Using Replicate CLI

```bash
# List all versions of a model
replicate ls black-forest-labs/flux-kontext-pro
```

## Current Model Versions

### FLUX Kontext Pro
- **Model ID**: `black-forest-labs/flux-kontext-pro`
- **Website**: https://replicate.com/black-forest-labs/flux-kontext-pro
- **Current Version**: `black-forest-labs/flux-kontext-pro:6fbb2ac97c6e9bba0a969d83d80f30c6ad1a3d7ecf01a2da89b0a7eb05c62b3f`

### Stable Diffusion XL
- **Model ID**: `stability-ai/stable-diffusion-xl-base-1.0`
- **Website**: https://replicate.com/stability-ai/stable-diffusion-xl-base-1.0
- **Current Version**: `stability-ai/stable-diffusion-xl-base-1.0:e16e6b546d3d033a5206e1b87beb23205999fbfed7490409b6b24e8830263272`

### FLUX Schnell
- **Model ID**: `black-forest-labs/flux-schnell`
- **Website**: https://replicate.com/black-forest-labs/flux-schnell
- **Current Version**: `black-forest-labs/flux-schnell:3f4e5d6c7b8a9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e`

## Updating a Model Version

### Edit the Configuration File

Open `src/services/replicate-config.js` and update the version ID:

```javascript
export const MODEL_VERSIONS = {
  'black-forest-labs/flux-kontext-pro':
    'black-forest-labs/flux-kontext-pro:PASTE_NEW_VERSION_ID_HERE',
  // ... other models
}
```

### At Runtime (Advanced)

You can also update versions programmatically:

```javascript
import { updateModelVersion } from '@/services/replicate-config'

// Update to a new version
updateModelVersion(
  'black-forest-labs/flux-kontext-pro',
  'black-forest-labs/flux-kontext-pro:new-version-id'
)

// Or add a new model
import { addModelVersion } from '@/services/replicate-config'

addModelVersion(
  'some-new-model/model-name',
  'some-new-model/model-name:version-id'
)
```

## Understanding the Version Format

The full model identifier consists of three parts:

```
owner/model-name:version-hash
|     |          |
|     |          └─ Unique version hash (64 hex characters)
|     └────────── Model name
└──────────────── Owner/organization
```

Example: `black-forest-labs/flux-kontext-pro:6fbb2ac97c6e9bba0a969d83d80f30c6ad1a3d7ecf01a2da89b0a7eb05c62b3f`

## Troubleshooting

### Error: "Invalid version"
- Make sure the version ID is correctly formatted
- Verify the version ID exists on Replicate's website
- Check for typos in the model name or version hash

### Error: "Model not found"
- Ensure the model name is correct (case-sensitive)
- Check that the owner/organization name is spelled correctly
- Visit the Replicate website to verify the model exists

### Outdated Model
- Check Replicate's website for newer versions
- Update the version ID in `replicate-config.js`
- Restart your development server

## Adding Custom Models

To add a new model:

1. Find the model on [Replicate.com](https://replicate.com)
2. Get its full version ID from the API documentation
3. Edit `src/services/replicate-config.js`:

```javascript
export const MODEL_VERSIONS = {
  // ... existing models
  'owner/new-model':
    'owner/new-model:version-hash-here',
}
```

4. Update `src/components/ImageGenerator.vue` to add it to the dropdown:

```javascript
const models = ref([
  // ... existing models
  { value: 'owner/new-model', label: 'New Model Display Name' },
])
```

## API Documentation

For more details on the Replicate API:
- [Replicate API Docs](https://replicate.com/docs)
- [Model Catalog](https://replicate.com/explore)
- [Python Client](https://github.com/replicate/replicate-python)
- [JavaScript Client](https://github.com/replicate/replicate-js)
