/**
 * Image Generation Service
 * Handles image generation API calls and state management
 */

import { imageGenerationAPI } from '@/api/endpoints'

export const imageGenerationService = {
  /**
   * Generate image from text prompt
   */
  async generateImage(prompt, imageSize = '1024x1024', watermark = null) {
    try {
      console.log('[ImageGen] Generating image...')
      console.log('[ImageGen] Prompt:', prompt)
      console.log('[ImageGen] Size:', imageSize)

      const response = await imageGenerationAPI.generateImage({
        prompt,
        imageSize,
        watermark,
      })

      console.log('[ImageGen] Generation successful:', response.data)
      return response.data
    } catch (error) {
      console.error('[ImageGen] Generation failed:', error)
      throw error
    }
  },

  /**
   * Get user's generated images
   */
  async getUserImages(limit = 20, offset = 0) {
    try {
      console.log('[ImageGen] Fetching user images...')

      const response = await imageGenerationAPI.getUserImages({
        limit,
        offset,
      })

      console.log('[ImageGen] Images fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('[ImageGen] Fetch images failed:', error)
      throw error
    }
  },

  /**
   * Get prompt history
   */
  async getPromptHistory(limit = 50, offset = 0) {
    try {
      console.log('[ImageGen] Fetching prompt history...')

      const response = await imageGenerationAPI.getPromptHistory({
        limit,
        offset,
      })

      console.log('[ImageGen] History fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('[ImageGen] Fetch history failed:', error)
      throw error
    }
  },
}
