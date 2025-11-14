# Quick Reference Guide

## Setup (First Time Only)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Add your Replicate API token to .env
# VITE_REPLICATE_API_TOKEN=your_token_here

# 4. Start development server
npm run dev
```

## Getting Your Replicate API Token

1. Go to [replicate.com](https://replicate.com)
2. Sign up or log in
3. Visit [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
4. Create a new token
5. Copy and paste into `.env` file

## Available Commands

```bash
npm run dev       # Start development server (port 3000)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Lint code with ESLint
```

## Project Structure

```
src/
├── components/           # Vue components
│   └── ImageGenerator.vue
├── composables/          # Vue composables (state logic)
│   └── useImageGeneration.js
├── services/             # API services
│   ├── replicate.js      # Replicate API integration
│   ├── replicate-config.js  # Model versions
│   └── http.js           # Axios HTTP client
├── styles/               # SCSS stylesheets
│   ├── main.scss
│   └── variables.scss
├── App.vue
└── main.js

docs/
├── API_RESPONSES.md      # Understanding API responses
├── IMPLEMENTATION.md     # Implementation details
├── REPLICATE_SETUP.md    # Model version setup
└── TESTING.md           # Testing guide
```

## How It Works

### User Interaction
1. User fills form: prompt, model, style, aspect ratio
2. Clicks "Generate Image"
3. Form calls `handleSubmit()` with all parameters

### Processing
4. Service enhances prompt with style
5. Builds model-specific input parameters
6. Gets full model version ID from config
7. Calls Replicate API

### Response
8. Replicate returns File object with `.url()` method
9. Service extracts image URL string
10. Stores in `generatedImages` array
11. UI displays image in gallery

## Common Tasks

### Change Default Model

Edit `src/components/ImageGenerator.vue`:

```javascript
const selectedModel = ref('black-forest-labs/flux-kontext-pro')
// Change to:
const selectedModel = ref('black-forest-labs/flux-schnell')
```

### Update Model Version

Edit `src/services/replicate-config.js`:

```javascript
'black-forest-labs/flux-kontext-pro':
  'black-forest-labs/flux-kontext-pro:OLD_VERSION_ID'
  
// Change to:
'black-forest-labs/flux-kontext-pro':
  'black-forest-labs/flux-kontext-pro:NEW_VERSION_ID'
```

### Add New Model

1. **Get model version** from replicate.com
2. **Add to config** (`src/services/replicate-config.js`):
   ```javascript
   'owner/model-name':
     'owner/model-name:version-id'
   ```
3. **Add to dropdown** (`src/components/ImageGenerator.vue`):
   ```javascript
   const models = ref([
     { value: 'owner/model-name', label: 'Display Name' },
   ])
   ```
4. **Add input config** (`src/services/replicate.js`):
   ```javascript
   if (model.includes('model-name')) {
     return { /* model-specific params */ }
   }
   ```

### Customize UI Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        600: '#your-color-code',
        700: '#darker-shade',
      }
    }
  }
}
```

## Key Files to Understand

| File | Purpose |
|------|---------|
| `replicate.js` | Main API integration |
| `replicate-config.js` | Model versions |
| `useImageGeneration.js` | State & logic |
| `ImageGenerator.vue` | UI component |
| `tailwind.config.js` | Styling config |

## API Response Format

```javascript
// Replicate API returns File object:
output.url()  // Call method to get URL string

// Our service extracts:
const imageUrl = output.url()
// "https://replicate.delivery/pbxt/..."

// Stored as:
{
  url: imageUrl,
  prompt: "enhanced prompt",
  model: "model-name",
  style: "style-name",
  aspectRatio: "1:1",
  createdAt: "2024-11-13T..."
}
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "API token not found" | `.env` not configured | Add `VITE_REPLICATE_API_TOKEN` |
| "Invalid version" | Wrong version ID | Check replicate.com for current version |
| "Model not found" | Typo in model name | Verify model name in config |
| "Too much recursion" | Version ID format error | Ensure format: `owner/name:hash` |
| "Authentication failed" | Invalid/expired token | Get new token from replicate.com |

## Environment Variables

```
# Required
VITE_REPLICATE_API_TOKEN=your_token_here

# Optional
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=AI Image Generator
VITE_DEV_MODE=true
```

## Development Workflow

```
1. Start server:        npm run dev
2. Open browser:        http://localhost:3000
3. Edit code:           src/ files auto-reload
4. Test changes:        Try generating images
5. Check errors:        Browser console (F12)
6. Build for prod:      npm run build
```

## Performance Tips

- **For testing**: Use FLUX Schnell (fastest)
- **For quality**: Use FLUX Kontext Pro (best quality)
- **For balance**: Use Stable Diffusion XL
- **Keep prompts shorter** for faster generation
- **Use appropriate aspect ratio** to avoid artifacts

## Security Notes

- ⚠️ Never commit `.env` file
- 🔒 API token is secret - don't share it
- 🔐 For production, consider backend proxy
- 📝 Don't log API tokens in console

## Links

- 🌐 [Replicate.com](https://replicate.com)
- 📚 [Replicate API Docs](https://replicate.com/docs)
- 🎨 [Model Catalog](https://replicate.com/explore)
- 💻 [Vue.js Docs](https://vuejs.org)
- 🎨 [Tailwind CSS Docs](https://tailwindcss.com)

## Documentation

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Deep dive into how it works
- [API_RESPONSES.md](./API_RESPONSES.md) - Understanding API responses
- [TESTING.md](./TESTING.md) - How to test your setup
- [REPLICATE_SETUP.md](./REPLICATE_SETUP.md) - Managing model versions
- [../README.md](../README.md) - Project overview
