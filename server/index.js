import express from 'express'
import cors from 'cors'
import Replicate from 'replicate'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' })
})

// Image generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { model, input } = req.body

    // Validate required fields
    if (!model) {
      return res.status(400).json({ error: 'Model is required' })
    }

    if (!input || !input.prompt) {
      return res.status(400).json({ error: 'Input with prompt is required' })
    }

    // Log the request for debugging
    console.log('📸 Generating image...')
    console.log('Model:', model)
    console.log('Input:', input)

    // Call Replicate API
    const output = await replicate.run(model, { input })

    // Handle the output - Replicate returns a File object
    let imageUrl

    if (output && typeof output.url === 'function') {
      // It's a Replicate File object
      imageUrl = output.url()
    } else if (typeof output === 'string') {
      // It's already a URL string
      imageUrl = output
    } else if (Array.isArray(output) && output.length > 0) {
      // It's an array of outputs
      const firstOutput = output[0]
      if (typeof firstOutput.url === 'function') {
        imageUrl = firstOutput.url()
      } else if (typeof firstOutput === 'string') {
        imageUrl = firstOutput
      } else {
        throw new Error('Could not extract URL from output')
      }
    } else {
      throw new Error('Unexpected output format from Replicate API')
    }

    console.log('✅ Image generated successfully')
    console.log('URL:', imageUrl)

    // Return the image URL
    res.json({
      success: true,
      output: [imageUrl],
      message: 'Image generated successfully',
    })
  } catch (error) {
    console.error('❌ Error generating image:', error.message)

    // Handle specific error types
    let statusCode = 500
    let errorMessage = error.message || 'Failed to generate image'

    if (error.message?.includes('rate limit')) {
      statusCode = 429
      errorMessage = 'Rate limit exceeded. Please try again later.'
    } else if (error.message?.includes('authentication')) {
      statusCode = 401
      errorMessage = 'Authentication failed. Check your API token.'
    } else if (error.message?.includes('content policy')) {
      statusCode = 400
      errorMessage = 'Content policy violation. Please modify your prompt.'
    } else if (error.message?.includes('insufficient credits')) {
      statusCode = 402
      errorMessage = 'Insufficient credits on Replicate account.'
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ API endpoint: POST http://localhost:${PORT}/api/generate`)
  console.log(`✅ Health check: GET http://localhost:${PORT}/health`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})
