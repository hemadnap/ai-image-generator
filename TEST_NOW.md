# 🧪 TEST IMAGE GENERATION NOW

## Quick Start (5 minutes)

### 1. Start Frontend
```bash
cd /Users/toca/TCSN/ai-image-generator/frontend
npm run dev
```
✅ Opens http://localhost:3000 automatically

### 2. Login
- Click "Sign in with Google"
- Select your Google account
- Authorize the app
- ✅ Redirects to dashboard

### 3. Generate Image
**Option A - From Dashboard:**
1. Look for blue "Generate Image" button at top
2. Click it → Goes to /generator page

**Option B - Direct URL:**
1. Navigate to http://localhost:3000/generator
2. Fill the form

### 4. Fill Generator Form
- **Prompt:** Copy/paste one of these:
  - "a cute dog in a park, professional photography"
  - "serene mountain landscape at sunset, oil painting"
  - "futuristic robot in neon city, cyberpunk style"

- **Image Size:** Leave as "1024x1024" (good balance)

- **Watermark:** Leave empty (optional)

### 5. Generate
1. Click blue "Generate Image" button
2. Wait 45-90 seconds (shows spinner)
3. Watch console (F12) for:
   ```
   [ImageGen] Generating image...
   [ImageGen] Generation successful: {...}
   ```

### 6. See Results
- Image appears on page
- Shows: prompt, cost ($), generation time (sec)
- Has download link

### 7. Check Gallery
- Scroll down to "Your Generated Images"
- See thumbnail of generated image
- Check "Recent Generated Images" on dashboard

---

## What to Look For ✅

### Console Messages (F12)
```javascript
// You should see:
[ImageGen] Generating image...
[AXIOS] POST /api/v1/images/generate
[ImageGen] Generation successful: { promptId: "...", images: [...], cost: 0.0125, duration: 45000 }

// NOT errors like:
❌ 401 Unauthorized
❌ 400 Bad Request  
❌ 500 Server Error
```

### Network Tab (F12)
- POST /api/v1/images/generate → 200 ✅
- Should take 45-120 seconds ✅

### Database (Backend)
After generation, check:
1. Prompts table has new row
2. Images table has new image
3. Status changed to COMPLETED
4. Cost recorded correctly

---

## Test Cases

### Test 1: Basic Generation (5 min)
1. Go to /generator
2. Enter simple prompt: "red apple"
3. Click Generate
4. ✅ Image appears

### Test 2: Different Sizes (10 min each)
1. Try 512x512 → Fast (~15-30s)
2. Try 768x768 → Medium (~25-45s)  
3. Try 1024x1024 → Quality (~45-90s)
4. Try 1536x1536 → Ultra (~120-300s)

### Test 3: With Watermark (5 min)
1. Enter prompt
2. Add watermark: "© MyBiz 2025"
3. Generate
4. ✅ Text appears on image

### Test 4: Error Handling (3 min)
1. Click Generate with empty prompt
2. ✅ Error message appears
3. Enter prompt again
4. ✅ Works normally

### Test 5: Gallery (5 min)
1. Generate 2-3 images
2. Scroll to gallery
3. ✅ All images visible
4. ✅ Prompts shown
5. ✅ Costs displayed

### Test 6: Dashboard (3 min)
1. Go back to /dashboard
2. ✅ "Generate Image" button visible
3. ✅ Stats card shows image count
4. ✅ Recent images show thumbnails
5. ✅ Click "View All" goes to generator

### Test 7: Page Refresh (2 min)
1. After generation, press F5
2. ✅ Stay logged in
3. ✅ Gallery still shows images
4. ✅ Stats still correct

### Test 8: Mobile (2 min)
1. Press F12 → Toggle Device Toolbar
2. Try mobile view
3. ✅ Form still works
4. ✅ Results display well
5. ✅ Gallery looks good

---

## Expected Times

⏱️ **15-30 sec** - 512×512
⏱️ **25-45 sec** - 768×768
⏱️ **45-90 sec** - 1024×1024 ← RECOMMENDED
⏱️ **120-300 sec** - 1536×1536

---

## Success Criteria ✅

After testing, you should see:

1. ✅ Image appears in under 2 minutes
2. ✅ No JavaScript errors in console
3. ✅ No network 401/500 errors
4. ✅ Gallery shows all images
5. ✅ Dashboard stats update
6. ✅ Cost displays correctly
7. ✅ Page refresh persists session
8. ✅ Mobile view responsive

---

## Debug Tips

**If stuck on loading:**
- Open F12 console
- Check Network tab → POST /images/generate
- Look for error response
- Check backend logs

**If no images appear:**
- Refresh page
- Check database for prompts table
- Verify R2 bucket accessible
- Check image URLs in network tab

**If cost is wrong:**
- Check Nanobanana API response
- Verify cost in database
- Compare with price list

**If page redirects to login:**
- Check JWT token expiration
- Verify localStorage has token
- Try logging out and back in

---

## Files to Reference

📖 **IMAGE_GENERATION_GUIDE.md** - Complete technical details
📖 **IMAGE_GENERATION_QUICKSTART.md** - Detailed testing guide
📖 **IMAGE_GENERATION_IMPLEMENTATION_SUMMARY.md** - Overview

---

## Ready? Let's Go! 🚀

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Optional: check backend
curl https://image_generator_api.tcsn.workers.dev/api/v1/health | jq .
```

Then open http://localhost:3000 and **click "Generate Image"**!

---

**Expected Result:**
Beautiful AI-generated images in seconds! 🎨

**Let me know when you're testing and I'll help troubleshoot!**
