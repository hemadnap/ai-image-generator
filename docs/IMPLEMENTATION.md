# Key Implementation Details

## How the Replicate API Integration Works

### 1. Model Version Configuration

**File**: `src/services/replicate-config.js`

The Replicate API requires the full model version ID in the format:
```
owner/model-name:version-hash
```

We store these in a configuration object:

```javascript
export const MODEL_VERSIONS = {
  'black-forest-labs/flux-kontext-pro': 
    'black-forest-labs/flux-kontext-pro:6fbb2ac97c6e9bba0a969d83d80f30c6ad1a3d7ecf01a2da89b0a7eb05c62b3f',
  // ... other models
}

export function getModelVersion(modelName) {
  // Returns the full version ID for a given model name
  return MODEL_VERSIONS[modelName]
}
```

### 2. Building the API Input

**File**: `src/services/replicate.js`

Different models require different input parameters:

```javascript
buildModelInput(prompt, model, aspectRatio) {
  // FLUX Kontext Pro uses aspect_ratio
  if (model.includes('flux-kontext-pro')) {
    return {
      prompt,
      aspect_ratio: aspectRatio,      // e.g., "1:1", "16:9"
      num_outputs: 1,
      num_inference_steps: 20,
      guidance_scale: 3.5,
      output_format: 'webp',
      output_quality: 90,
    }
  }
  
  // Other models use width/height
  const dimensions = this.getAspectRatioDimensions(aspectRatio)
  return {
    prompt,
    width: dimensions.width,          // e.g., 1024
    height: dimensions.height,        // e.g., 1024
    // ... other params
  }
}
```

### 3. Making the API Call

```javascript
const modelVersion = getModelVersion(model)  // Get full version ID
const output = await this.replicate.run(modelVersion, { input })
```

### 4. Handling the Response

**Important**: Replicate returns a **File object**, not a string!

```javascript
// Replicate returns a File object with methods:
output.url()  // Returns the image URL as a string

// We extract the URL:
extractImageUrl(item) {
  if (item && typeof item.url === 'function') {
    return item.url()  // Call the method to get the URL
  }
  if (typeof item === 'string') {
    return item  // Already a string
  }
  // Handle other formats...
}
```

### 5. Storing the Result

The image is stored in the gallery with metadata:

```javascript
generatedImages.value.unshift({
  url: imageUrl,              // String URL from File object
  prompt: params.prompt,
  model: params.model,
  style: params.style,
  aspectRatio: params.aspectRatio,
  createdAt: new Date().toISOString(),
})
```

## API Request Flow

```
┌─────────────────────────────────────────┐
│     User submits form                   │
│  - Prompt: "A red apple"                │
│  - Model: "flux-kontext-pro"            │
│  - Style: "photorealistic"              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  handleSubmit in ImageGenerator.vue     │
│  - Collects form data                   │
│  - Calls generateImage(params)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  useImageGeneration composable          │
│  - Sets isGenerating = true             │
│  - Calls replicateService.generateImage │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  ReplicateService.generateImage         │
│  1. Enhance prompt with style           │
│  2. Build model input parameters        │
│  3. Get full model version ID           │
│  4. Call replicate.run()                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Replicate API                          │
│  - Processes image generation           │
│  - Returns File object with .url()      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  extractImageUrl                        │
│  - Calls item.url() to get string       │
│  - Returns image URL                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Store in generatedImages array         │
│  - Add to gallery                       │
│  - Display to user                      │
└─────────────────────────────────────────┘
```

## File Structure

```
src/
├── services/
│   ├── replicate.js           # Main API service
│   ├── replicate-config.js    # Model versions config
│   └── http.js                # HTTP client (axios)
├── composables/
│   └── useImageGeneration.js  # State management
├── components/
│   └── ImageGenerator.vue     # UI component
└── styles/
    └── main.scss              # Global styles
```

## Key Parameters by Model

### FLUX Kontext Pro
```javascript
{
  prompt: string,
  aspect_ratio: "1:1" | "16:9" | "9:16" | "4:3" | "3:2",
  num_outputs: 1,
  num_inference_steps: 20,
  guidance_scale: 3.5,
  output_format: "webp",
  output_quality: 90,
}
```

### Stable Diffusion XL
```javascript
{
  prompt: string,
  negative_prompt: string,
  width: 1024,
  height: 1024,
  num_inference_steps: 30,
  guidance_scale: 7.5,
  scheduler: "K_EULER",
}
```

### FLUX Schnell
```javascript
{
  prompt: string,
  negative_prompt: string,
  width: 1024,
  height: 1024,
  num_inference_steps: 4,  // Fewer steps for speed
  guidance_scale: 7.5,
}
```

## Error Handling

The service catches errors and provides user-friendly messages:

```javascript
handleError(error) {
  if (error.message?.includes('rate limit')) {
    return 'Rate limit exceeded. Please try again in a few minutes.'
  }
  if (error.message?.includes('authentication')) {
    return 'Authentication failed. Please check your API key.'
  }
  if (error.message?.includes('content policy')) {
    return 'Content policy violation. Please modify your prompt.'
  }
  if (error.message?.includes('insufficient credits')) {
    return 'Insufficient credits. Please check your Replicate account.'
  }
  return error.message || 'An unexpected error occurred. Please try again.'
}
```

## Configuration Management

### Add a New Model

```javascript
// 1. Add to replicate-config.js
export const MODEL_VERSIONS = {
  'new-owner/new-model':
    'new-owner/new-model:version-hash-from-replicate',
}

// 2. Add to ImageGenerator.vue
const models = ref([
  { value: 'new-owner/new-model', label: 'New Model Display Name' },
])

// 3. Add input configuration in buildModelInput()
if (model.includes('new-model')) {
  return {
    prompt,
    // model-specific parameters...
  }
}
```

### Update a Model Version

```javascript
// In replicate-config.js
export const MODEL_VERSIONS = {
  'black-forest-labs/flux-kontext-pro':
    'black-forest-labs/flux-kontext-pro:NEW_VERSION_HASH_HERE',
}
```

## Deployment Considerations

### Environment Variables

- `VITE_REPLICATE_API_TOKEN`: Your Replicate API token (required)
- `VITE_API_BASE_URL`: Optional backend URL for custom API
- `VITE_APP_NAME`: Application name
- `VITE_DEV_MODE`: Development mode flag

### Security

- ⚠️ **Never** commit `.env` file (it's in `.gitignore`)
- Always use environment variables for sensitive data
- API token is only used on the client (consider backend proxy for production)

### Performance

- Image generation takes 10-30 seconds per image
- Replicate charges credits per image generated
- Consider implementing:
  - Caching of generated images
  - Rate limiting per user
  - Image compression/optimization
  - Batch operations

## Testing

See [TESTING.md](./TESTING.md) for:
- How to test image generation
- Expected behavior
- Troubleshooting common issues
- Performance tips

## Documentation

See [REPLICATE_SETUP.md](./REPLICATE_SETUP.md) for:
- How to find and update model versions
- Understanding version formats
- Adding custom models
- API documentation links
