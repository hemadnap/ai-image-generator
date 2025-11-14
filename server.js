import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Replicate from 'replicate'
import fetch from 'node-fetch'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// Cache for model versions to avoid repeated API calls
const modelVersionCache = new Map()

/**
 * Resolve a model identifier to a full version string
 * If the model already includes a version hash (owner/name:hash), return as-is
 * If only owner/name is provided, try to fetch latest version or use the model name directly
 */
async function resolveModelVersion(model) {
  // Check if model already includes version hash
  if (model.includes(':')) {
    return model
  }

  // Check cache first
  if (modelVersionCache.has(model)) {
    return modelVersionCache.get(model)
  }

  try {
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] Resolving model: ${model}`)

    // Try to fetch the latest version using Replicate SDK
    // The SDK will handle the API details internally
    // We can use it by making a prediction call
    // But first, try the REST API approach

    const response = await fetch(
      `https://api.replicate.com/v1/models/${model}`,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      }
    )

    if (response.ok) {
      const data = await response.json()

      // Try to get latest_version info
      if (data.latest_version && data.latest_version.id) {
        const fullModelId = `${model}:${data.latest_version.id}`
        modelVersionCache.set(model, fullModelId)

        // eslint-disable-next-line no-console
        console.log(
          `[${new Date().toISOString()}] Resolved ${model} to version: ${data.latest_version.id}`
        )

        return fullModelId
      }
    }

    // If we can't resolve to a specific version, just return the model name
    // Replicate SDK may accept model names without versions for some models
    // eslint-disable-next-line no-console
    console.log(
      `[${new Date().toISOString()}] Using model name directly (no version): ${model}`
    )

    modelVersionCache.set(model, model)
    return model
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[${new Date().toISOString()}] Error resolving model version: ${error.message}`
    )

    // Return model name as fallback
    modelVersionCache.set(model, model)
    return model
  }
}

/**
 * Upload a base64 image to imgbb and get a public URL
 * imgbb is a free image hosting service that doesn't require authentication
 */
async function uploadImageToImgbb(base64Image) {
  try {
    // Extract just the base64 data part (remove "data:image/...;base64," prefix)
    const base64Data = base64Image.split(',')[1] || base64Image

    const formData = new URLSearchParams()
    formData.append('image', base64Data)
    formData.append('expiration', '600') // 10 minutes expiration

    const response = await fetch(
      'https://api.imgbb.com/1/upload?key=68d9143bcd837b9',
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`imgbb API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.success && data.data.url) {
      // eslint-disable-next-line no-console
      console.log(
        `[${new Date().toISOString()}] Image uploaded to imgbb: ${data.data.url}`
      )
      return data.data.url
    }

    throw new Error('Failed to get image URL from imgbb')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[${new Date().toISOString()}] Error uploading image to imgbb: ${error.message}`
    )
    // Return null if upload fails - the request will proceed without image
    return null
  }
}

// Middleware
app.use(cors())
// Increase payload size limit to handle base64 encoded images
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' })
})

// Generate image endpoint
app.post('/api/generate', async (req, res) => {
  try {
    let { model, input } = req.body

    if (!model) {
      return res.status(400).json({ error: 'Model is required' })
    }

    if (!input) {
      return res.status(400).json({ error: 'Input parameters are required' })
    }

    // Validate API token
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({
        error: 'Server configuration error: REPLICATE_API_TOKEN not set',
      })
    }

    // Resolve model to full version string if needed
    model = await resolveModelVersion(model)

    // If input contains a base64 image, upload it and replace with URL
    if (
      input.image &&
      typeof input.image === 'string' &&
      input.image.startsWith('data:')
    ) {
      // eslint-disable-next-line no-console
      console.log(
        `[${new Date().toISOString()}] Detected base64 image, uploading...`
      )

      const imageUrl = await uploadImageToImgbb(input.image)

      if (imageUrl) {
        input.image = imageUrl
        // eslint-disable-next-line no-console
        console.log(
          `[${new Date().toISOString()}] Image replaced with URL: ${imageUrl}`
        )
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `[${new Date().toISOString()}] Failed to upload image, removing from input`
        )
        delete input.image
      }
    }

    // If input contains image_prompt (for FLUX), upload and replace with URL
    if (
      input.image_prompt &&
      typeof input.image_prompt === 'string' &&
      input.image_prompt.startsWith('data:')
    ) {
      // eslint-disable-next-line no-console
      console.log(
        `[${new Date().toISOString()}] Detected base64 image_prompt, uploading...`
      )

      const imageUrl = await uploadImageToImgbb(input.image_prompt)

      if (imageUrl) {
        input.image_prompt = imageUrl
        // eslint-disable-next-line no-console
        console.log(
          `[${new Date().toISOString()}] Image_prompt replaced with URL: ${imageUrl}`
        )
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `[${new Date().toISOString()}] Failed to upload image_prompt, removing from input`
        )
        delete input.image_prompt
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      `[${new Date().toISOString()}] Generating image with model: ${model}`
    )

    // eslint-disable-next-line no-console
    console.log(
      `[${new Date().toISOString()}] Input payload:`,
      JSON.stringify(
        input,
        (key, value) => {
          // Truncate image data if present for logging
          if (
            key === 'image' &&
            typeof value === 'string' &&
            value.length > 100
          ) {
            return value.substring(0, 50) + '...[truncated]'
          }
          return value
        },
        2
      )
    )

    // Run the prediction
    const output = await replicate.run(model, { input })

    // Extract image URL from output
    // Replicate returns different formats:
    // - Single File object with .url() method
    // - Array of File objects with .url() methods
    // - Array of string URLs
    let imageUrl

    if (output) {
      // Handle single File object with .url() method
      if (typeof output.url === 'function') {
        imageUrl = output.url()
      }
      // Handle array of outputs
      else if (Array.isArray(output) && output.length > 0) {
        const firstItem = output[0]
        if (typeof firstItem === 'string') {
          imageUrl = firstItem
        } else if (firstItem && typeof firstItem.url === 'function') {
          imageUrl = firstItem.url()
        } else if (firstItem && typeof firstItem.url === 'string') {
          imageUrl = firstItem.url
        }
      }
      // Handle string directly
      else if (typeof output === 'string') {
        imageUrl = output
      }
    }

    if (!imageUrl) {
      throw new Error(
        `Could not extract image URL from API response. ` +
          `Output type: ${typeof output}, ` +
          `Is array: ${Array.isArray(output)}`
      )
    }

    // Upload the image to imgbb and get a public URL
    const publicImageUrl = await uploadImageToImgbb(imageUrl)

    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] Image generated successfully`)

    res.json({
      success: true,
      output: [publicImageUrl || imageUrl],
      model,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', error.message)

    const statusCode = error.statusCode || 500
    const errorMessage =
      error.message || 'An error occurred while generating the image'

    res.status(statusCode).json({
      error: errorMessage,
      details: error.details || null,
    })
  }
})

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  })
})

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  // eslint-disable-next-line no-console
  console.log(
    `📝 API Token: ${process.env.REPLICATE_API_TOKEN ? 'Set ✓' : 'NOT SET ✗'}`
  )
})
