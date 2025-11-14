# Testing the Image Generation

## Quick Start

1. **Ensure environment variables are set**:
   ```bash
   # Copy the example and add your API token
   cp .env.example .env
   ```

2. **Edit `.env`** and add your Replicate API token:
   ```
   VITE_REPLICATE_API_TOKEN=your_actual_token_here
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Test image generation**:
   - Open `http://localhost:3000` in your browser
   - Enter a prompt (e.g., "A beautiful sunset over mountains")
   - Select a model, style, and aspect ratio
   - Click "Generate Image"
   - Wait for the image to be generated

## Understanding the Response

When you generate an image, the Replicate API returns a **File object** with methods:

```javascript
// The File object has a .url() method
const imageUrl = output.url() // Returns the image URL string
```

Our service automatically extracts this URL and converts it to a string for the UI.

## Troubleshooting

### "Invalid version" Error
- **Cause**: The version ID in `replicate-config.js` doesn't match the latest model version
- **Fix**: Visit the model page on Replicate.com and update the version ID

### "Too much recursion" Error
- **Cause**: The model parameter wasn't being passed correctly
- **Fix**: Already fixed in this version - ensure you're using the latest code

### "Authentication failed" Error
- **Cause**: Your API token is invalid or expired
- **Fix**: Check your token on replicate.com/account/api-tokens

### Image generation times out
- **Cause**: The model is taking too long or API is overloaded
- **Fix**: 
  - Try using a faster model like "FLUX Schnell"
  - Try again later if API is busy

## Expected Behavior

### Generation Process

1. Click "Generate Image" button
2. Button changes to "Generating..." with loading spinner
3. Server sends request to Replicate API
4. Replicate processes the image (takes 10-30 seconds typically)
5. Image appears in the gallery at the top
6. You can download the image

### Successful Response

The service should extract the image URL from the Replicate File object:

```
✅ Image generated successfully
📍 URL extracted from File object
🖼️ Image displayed in gallery
```

### Error Handling

Errors are caught and displayed to the user:

```
❌ Error message shown in UI
📝 Error logged to console (dev mode only)
🔄 User can retry
```

## Development Tips

### Check Network Traffic

1. Open DevTools (F12)
2. Go to Network tab
3. Look for requests to Replicate API
4. Inspect the request/response payloads

### Console Debugging

The service logs detailed error information in development mode:

```javascript
// Look for these in browser console:
[vite] connecting...
[vite] connected.
Replicate API error: ...
```

### Test Different Prompts

Try these test prompts to verify functionality:

1. **Simple**: "A red apple"
2. **Complex**: "A serene mountain landscape at sunset with a crystal clear lake reflecting colorful sky, photorealistic, highly detailed"
3. **Artistic**: "Oil painting of a cat, masterpiece, museum quality"
4. **Style-specific**: "Anime character, girl, smiling, outdoor background"

## Model-Specific Notes

### FLUX Kontext Pro (Default)
- Best for: Complex, detailed prompts
- Speed: Medium (15-25 seconds)
- Quality: Highest
- Best for: Professional use, detailed requests

### FLUX Schnell
- Best for: Quick generation
- Speed: Fast (5-10 seconds)
- Quality: High
- Best for: Testing, rapid iteration

### Stable Diffusion XL
- Best for: General-purpose
- Speed: Medium (20-30 seconds)
- Quality: Very good
- Best for: Balanced quality and speed

## API Response Format

### What Replicate Returns

```javascript
// Single image response (can be File object or URL string)
output = File { url: [Function] }

// Our service converts to:
imageUrl = "https://replicate.delivery/..." // String URL
```

### What We Store

```javascript
generatedImages = [
  {
    url: "https://...", // Image URL string
    prompt: "Enhanced prompt with style",
    model: "black-forest-labs/flux-kontext-pro",
    style: "photorealistic",
    aspectRatio: "1:1",
    createdAt: "2024-11-13T..." // ISO timestamp
  }
]
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| API Token not recognized | Invalid/expired token | Update token in `.env` |
| "Invalid version" error | Wrong version ID format | Check replicate-config.js |
| Blank image appears | URL extraction failed | Check browser console |
| Generation hangs | API timeout or overload | Refresh page, try again |
| No error message shown | Error handling issue | Check browser console |

## Performance Tips

1. **Use appropriate model**:
   - Quick tests: Use FLUX Schnell
   - High quality: Use FLUX Kontext Pro

2. **Optimize prompts**:
   - Shorter prompts = Faster generation
   - Detailed prompts = Better quality

3. **Monitor API usage**:
   - Check Replicate dashboard for quota
   - Each image costs credits
   - Plan accordingly

## Next Steps

1. ✅ Verify image generation works
2. ✅ Test different models
3. ✅ Test different styles
4. ✅ Customize the UI
5. ✅ Add more features (batch generation, favorites, etc.)

For more help, see:
- [REPLICATE_SETUP.md](./REPLICATE_SETUP.md) - Model version setup
- [README.md](../README.md) - Project overview
- [Replicate API Docs](https://replicate.com/docs) - Official documentation
