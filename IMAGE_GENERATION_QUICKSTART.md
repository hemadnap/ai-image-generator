# Image Generation - Quick Start Guide

## What Was Built

A complete AI image generation system using Nanobanana API (SD3 Medium model) integrated into your application.

## Key Features

✅ **Text-to-Image Generation** - Create images from text prompts
✅ **Multiple Image Sizes** - 512×512, 768×768, 1024×1024, 1536×1536
✅ **Watermark Support** - Add custom watermarks to generated images
✅ **Image Storage** - All generated images stored in Cloudflare R2
✅ **Generation History** - Track all prompts and costs
✅ **Cost Tracking** - Monitor spending on image generation
✅ **User Gallery** - View all generated images in dashboard

## How to Test

### 1. Start the Frontend
```bash
cd frontend
npm run dev
```
Open http://localhost:3000

### 2. Login
- Click "Sign in with Google"
- Use your Google account to log in
- You'll be redirected to dashboard

### 3. Generate Your First Image
**Option A: From Dashboard**
- Click the blue "Generate Image" button
- You'll be taken to the Generator page

**Option B: Direct to Generator**
- Navigate to http://localhost:3000/generator

### 4. On Generator Page

Fill in the form:
- **Prompt:** Describe your image
  - Example: "a serene Japanese garden with cherry blossoms"
- **Image Size:** Select quality/speed tradeoff
  - 512×512: Fast (~15-30s)
  - 768×768: Balanced (~25-45s)
  - 1024×1024: Quality (~45-90s) ← recommended
  - 1536×1536: Ultra (~120-300s)
- **Watermark (optional):** Add text to the image
  - Example: "© My Business 2025"

Click **"Generate Image"** button

### 5. Wait for Generation
- You'll see a loading spinner
- Generation typically takes 30-120 seconds depending on size
- Status updates in real-time

### 6. View Results
- Generated images displayed immediately
- Shows:
  - Prompt used
  - Cost (in dollars)
  - Generation time
  - Download link

### 7. Browse Your Gallery
- Scroll down to see "Your Generated Images"
- Shows all previously generated images
- Click to view or download
- See creation date and cost per image

### 8. Check Dashboard Stats
- Go back to dashboard
- See stats:
  - Total images generated
  - Total cost spent
  - Recent image thumbnails

## API Endpoints (Curl Examples)

### Generate Image
```bash
# 1. Get your JWT token (after login, check localStorage)
TOKEN="your-jwt-token-from-browser"

# 2. Generate image
curl -X POST https://image_generator_api.tcsn.workers.dev/api/v1/images/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "a beautiful sunset over mountains",
    "imageSize": "1024x1024",
    "watermark": "© 2025"
  }'
```

### Get Your Images
```bash
TOKEN="your-jwt-token"

curl https://image_generator_api.tcsn.workers.dev/api/v1/images?limit=20 \
  -H "Authorization: Bearer $TOKEN"
```

### Get Prompt History
```bash
TOKEN="your-jwt-token"

curl https://image_generator_api.tcsn.workers.dev/api/v1/prompts?limit=50 \
  -H "Authorization: Bearer $TOKEN"
```

## File Structure

### Backend Changes
```
backend/src/
├── services/
│   └── NanobananaService.ts          [NEW] - Handles API calls to Nanobanana
├── repositories/
│   └── PromptRepository.ts           [NEW] - Database operations for prompts
├── handlers/
│   └── imageGenerationHandler.ts     [NEW] - Request handlers
├── routes/
│   └── images.ts                     [NEW] - Route definitions
├── database/
│   └── init.ts                       [MODIFIED] - Added prompts table
├── router/
│   └── router.ts                     [MODIFIED] - Added image routes
└── index.ts                          [MODIFIED] - Added NANO_BANANA_TOKEN to Env
```

### Frontend Changes
```
frontend/src/
├── views/
│   ├── Generator.vue                 [NEW] - Full image generation page
│   └── Dashboard.vue                 [MODIFIED] - Added generate button & gallery
├── services/
│   └── imageGenerationService.js     [NEW] - API wrapper
├── stores/
│   └── imageGenerationStore.js       [NEW] - Pinia state management
├── api/
│   └── endpoints.js                  [MODIFIED] - Added imageGenerationAPI
└── routes/
    └── index.js                      [MODIFIED] - Added /generator route
```

## Database Schema

### New `prompts` Table
Tracks all image generation requests:
- `id` - Unique prompt ID
- `user_id` - Who generated it
- `image_id` - Reference to generated image
- `prompt` - The text input
- `task_type` - 'TEXT_TO_IMAGE' (extensible for IMAGE_TO_IMAGE)
- `image_size` - Requested resolution
- `watermark` - Optional watermark text
- `response_data` - API response details
- `cost` - Amount charged (USD)
- `duration_ms` - Generation time
- `status` - PENDING → PROCESSING → COMPLETED/FAILED
- `error_message` - Error details if failed
- `created_at` / `updated_at` - Timestamps

## Troubleshooting

### Image not generating
- ❌ **401 Unauthorized**: Check JWT token is valid
- ❌ **400 Bad Request**: Check prompt is not empty
- ❌ **500 Server Error**: Check backend logs

### Generation taking too long
- Large images (1536×1536) take longer
- Maximum timeout: 2 minutes
- If stuck, refresh and try smaller size

### Images not visible
- Check R2 bucket is accessible
- Verify image URL in browser console
- Check CORS headers

### Cost looks wrong
- Costs vary by image size
- Check Nanobanana pricing documentation
- Each image tracked separately in database

## Console Debugging

Open browser console (F12) and look for:

```
[ImageGen] Generating image...
[ImageGen] Generation successful: {...}
[Store] Image generated: {...}
[AXIOS] Response 200 for POST /images/generate
```

Or errors:
```
[ImageGen] Generation failed: Error message
[Store] Generation failed: Error message
```

## Performance Tips

1. **Use 1024×1024 by default** - Good balance of speed and quality
2. **Batch requests** - Can generate multiple images over time
3. **Check history** - Reuse successful prompts for consistency
4. **Optimize prompts** - More specific = better results
5. **Monitor costs** - Dashboard shows total spending

## Example Prompts

Try these to test the system:

1. **Scenic:**
   - "a serene mountain landscape at sunset, oil painting style"

2. **Character:**
   - "a cute fluffy cat wearing sunglasses, 3D rendered"

3. **Fantasy:**
   - "a mystical enchanted forest with glowing mushrooms"

4. **Product:**
   - "a minimalist product design for a futuristic coffee maker"

5. **Abstract:**
   - "colorful abstract waves, digital art, vibrant colors"

## Next Steps

After testing:
1. ✅ Deploy frontend to production
2. ✅ Test with real users
3. ✅ Monitor costs and usage
4. ✅ Gather user feedback
5. ✅ Plan image-to-image feature
6. ✅ Add batch generation
7. ✅ Implement sharing/collaboration

## Support

For issues:
1. Check console for error messages (F12)
2. Check backend logs via Cloudflare dashboard
3. Verify JWT token is fresh (< 7 days old)
4. Test with simple prompts first
5. Check internet connection

## Backend Deployment Info

- **URL:** https://image_generator_api.tcsn.workers.dev
- **Version:** 765a14c2-13fe-4674-8f7d-439578afc767
- **Status:** ✅ Active
- **Token:** Configured in wrangler.toml

## Cost Estimation

For reference (USD):
- 512×512: ~$0.005 per image
- 768×768: ~$0.01 per image
- 1024×1024: ~$0.0125 per image
- 1536×1536: ~$0.045 per image

Example: 100 images at 1024×1024 = ~$1.25 total cost

---

**Ready to generate?** Go to http://localhost:3000/generator and start creating! 🎨
