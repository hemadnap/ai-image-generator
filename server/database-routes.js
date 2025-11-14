/**
 * Database Integration Routes for AI Image Generator Backend
 * Add these routes to your server.js
 */
/* eslint-disable no-console */

import express from 'express'
import * as database from '../src/services/database.js'

const router = express.Router()

// Middleware to verify user authentication
const authenticateUser = (req, res, next) => {
  const userId = req.headers['x-user-id']
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' })
  }
  req.userId = userId
  next()
}

/**
 * POST /api/auth/login
 * Handle user login and create/update user record
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const user = await database.getOrCreateUser(googleId, email, name, picture)

    res.json({
      success: true,
      user,
      token: user.userId, // In production, use JWT
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/user/stats
 * Get current user statistics
 */
router.get('/user/stats', authenticateUser, async (req, res) => {
  try {
    const stats = await database.getUserStats(req.userId)
    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/user/history
 * Get user's prompt generation history
 * Query params: limit (default 50), lastTimestamp (for pagination)
 */
router.get('/user/history', authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const lastTimestamp = req.query.lastTimestamp
      ? parseInt(req.query.lastTimestamp)
      : null

    const history = await database.getUserPromptHistory(
      req.userId,
      limit,
      lastTimestamp
    )

    res.json({
      success: true,
      ...history,
    })
  } catch (error) {
    console.error('History error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/user/images
 * Get user's generated images
 * Query params: limit (default 50), lastTimestamp (for pagination)
 */
router.get('/user/images', authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const lastTimestamp = req.query.lastTimestamp
      ? {
          imageId: req.query.lastImageId,
          createdAt: parseInt(req.query.lastTimestamp),
        }
      : null

    const images = await database.getUserImages(
      req.userId,
      limit,
      lastTimestamp
    )

    res.json({
      success: true,
      ...images,
    })
  } catch (error) {
    console.error('Images error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/image/track-download/:imageId
 * Track image download for analytics
 */
router.post(
  '/image/track-download/:imageId',
  authenticateUser,
  async (req, res) => {
    try {
      const imageData = await database.trackImageDownload(req.params.imageId)
      res.json({
        success: true,
        downloads: imageData.downloads,
      })
    } catch (error) {
      console.error('Download tracking error:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

/**
 * POST /api/generate-with-history
 * Generate image and save to prompt history
 * Enhanced version of /api/generate with database integration
 */
router.post('/generate-with-history', authenticateUser, async (req, res) => {
  try {
    const { prompt, model, style, aspectRatio } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const startTime = Date.now()

    // Call existing generateImage function (from replicate.js)
    // Import this function from your replicate service
    // const imageUrl = await generateImage(prompt, model, style, aspectRatio, uploadedImage)
    // For now, this is a placeholder - integrate with your actual image generation logic
    const imageUrl = '' // Replace with actual generated image URL

    const processingTime = Date.now() - startTime

    // Save to database
    const promptRecord = await database.savePromptHistory(
      req.userId,
      prompt,
      model,
      style,
      aspectRatio,
      imageUrl,
      processingTime
    )

    // Optionally save image metadata
    await database.saveImageMetadata(
      req.userId,
      promptRecord.promptId,
      imageUrl,
      imageUrl, // Use same URL for thumbnail - in production, generate actual thumbnail
      {
        prompt,
        model,
        style,
        processingTime,
      }
    )

    res.json({
      success: true,
      imageUrl,
      processingTime,
      promptId: promptRecord.promptId,
    })
  } catch (error) {
    console.error('Generation error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/user/delete-account
 * Delete all user data (GDPR compliance)
 */
router.delete('/user/delete-account', authenticateUser, async (req, res) => {
  try {
    const { confirmation } = req.body

    if (confirmation !== 'DELETE_MY_DATA') {
      return res.status(400).json({
        error: 'Account deletion must be confirmed with "DELETE_MY_DATA"',
      })
    }

    await database.deleteUserData(req.userId)

    res.json({
      success: true,
      message: 'User account and all data deleted',
    })
  } catch (error) {
    console.error('Deletion error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * ADMIN ROUTES
 * Add additional middleware to check for admin role
 */

const adminOnly = (req, res, next) => {
  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' })
  }
  next()
}

/**
 * GET /api/admin/analytics
 * Get analytics across all users
 * Requires: x-admin-key header
 */
router.get('/admin/analytics', adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100
    const analytics = await database.getAdminAnalytics(limit)

    res.json({
      success: true,
      ...analytics,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/admin/user/:userId/stats
 * Get specific user statistics (admin view)
 * Requires: x-admin-key header
 */
router.get('/admin/user/:userId/stats', adminOnly, async (req, res) => {
  try {
    const stats = await database.getUserStats(req.params.userId)
    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/admin/user/:userId/history
 * Get specific user's prompt history (admin view)
 * Requires: x-admin-key header
 */
router.get('/admin/user/:userId/history', adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const history = await database.getUserPromptHistory(
      req.params.userId,
      limit
    )

    res.json({
      success: true,
      ...history,
    })
  } catch (error) {
    console.error('Admin history error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
