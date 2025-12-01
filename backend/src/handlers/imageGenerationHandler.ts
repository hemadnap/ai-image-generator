/**
 * Image Generation Handler
 * Handles image generation requests
 */

import { Env } from '../index'
import { success, error, unauthorized } from '../utils/responses'
import { googleService } from '../services/googleService'
import { NanobananaService } from '../services/NanobananaService'
import { PromptRepository } from '../repositories/PromptRepository'
import { ImageRepository } from '../repositories/ImageRepository'
import { StorageService } from '../services/StorageService'
import { ImageType } from '../models/Image'

export const imageGenerationController = {
  /**
   * Generate image from text prompt
   */
  async generateImage(request: Request, env: Env): Promise<Response> {
    try {
      // Verify authentication
      const authHeader = request.headers.get('Authorization')
      if (!authHeader) {
        return unauthorized('Authorization header required')
      }

      const token = authHeader.replace('Bearer ', '')
      const userInfo = await googleService.verifyAuthToken(token, env)

      if (!userInfo) {
        return unauthorized('Invalid or expired token')
      }

      const userId = userInfo.sub

      // Parse request body
      const body = await request.json() as any

      const { prompt, imageSize = '1024x1024', watermark } = body

      // Validate inputs
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return error('Prompt is required and must be a non-empty string', 400)
      }

      if (!NanobananaService.isValidSize(imageSize)) {
        return error(
          `Invalid image size. Supported: ${NanobananaService.getSupportedSizes().join(', ')}`,
          400
        )
      }

      console.log('[ImageGen] User', userId, 'requesting image generation')
      console.log('[ImageGen] Prompt:', prompt)
      console.log('[ImageGen] Size:', imageSize)

      // Create prompt record (PENDING)
      const promptRecord = await PromptRepository.create(env, {
        userId,
        prompt,
        taskType: 'TEXT_TO_IMAGE',
        imageSize,
        watermark,
      })

      console.log('[ImageGen] Prompt record created:', promptRecord.id)

      try {
        // Update status to PROCESSING
        await PromptRepository.updateStatus(env, promptRecord.id, 'PROCESSING')

        // Call Nanobanana API
        const startTime = Date.now()
        const generationResult = await NanobananaService.generateImage(
          {
            prompt,
            imageSize,
            watermark,
          },
          env
        )
        const duration = Date.now() - startTime

        console.log('[ImageGen] Generation successful, duration:', duration, 'ms')
        console.log('[ImageGen] Cost:', generationResult.cost)

        // Convert base64 images to storage and create image records
        const images = []

        for (let i = 0; i < generationResult.images.length; i++) {
          const base64 = generationResult.images[i]

          // Convert base64 to blob
          const binaryString = atob(base64)
          const bytes = new Uint8Array(binaryString.length)
          for (let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j)
          }

          const blob = new Blob([bytes], { type: 'image/png' })

          // Upload to R2
          const uploadedFile = await StorageService.upload(
            env,
            new File([blob], `generated-${promptRecord.id}-${i}.png`, { type: 'image/png' }),
            userId
          )

          // Create image record
          const imageRecord = await ImageRepository.create(env, {
            userId,
            type: ImageType.GENERATED,
            title: `Generated: ${prompt.substring(0, 50)}`,
            description: prompt,
            prompt,
            storageKey: uploadedFile.key,
            storageUrl: uploadedFile.url,
            coinsUsed: Math.ceil(generationResult.cost / generationResult.images.length),
            metadata: {
              imageSize,
              watermark: watermark || null,
              nanobananaModel: 'sd3-medium',
            },
          })

          console.log('[ImageGen] Image record created:', imageRecord.id)

          images.push(imageRecord)
        }

        // Update prompt with results
        await PromptRepository.updateStatus(env, promptRecord.id, 'COMPLETED', {
          imageId: images[0]?.id,
          cost: generationResult.cost,
          durationMs: duration,
          responseData: {
            imageCount: images.length,
            imageIds: images.map(img => img.id),
          },
        })

        return success({
          promptId: promptRecord.id,
          images: images.map(img => ({
            id: img.id,
            url: img.storageUrl,
            title: img.title,
            prompt: img.prompt,
          })),
          cost: generationResult.cost,
          duration,
        })
      } catch (error: any) {
        console.error('[ImageGen] Generation failed:', error)

        // Update prompt as failed
        await PromptRepository.updateStatus(env, promptRecord.id, 'FAILED', {
          errorMessage: error.message || 'Unknown error',
        })

        return error(`Image generation failed: ${error.message}`, 500)
      }
    } catch (error: any) {
      console.error('[ImageGen] Handler error:', error)
      return error(error.message || 'Internal server error', 500)
    }
  },

  /**
   * Get user's generated images (from prompts)
   */
  async getUserImages(request: Request, env: Env): Promise<Response> {
    try {
      // Verify authentication
      const authHeader = request.headers.get('Authorization')
      if (!authHeader) {
        return unauthorized('Authorization header required')
      }

      const token = authHeader.replace('Bearer ', '')
      const userInfo = await googleService.verifyAuthToken(token, env)

      if (!userInfo) {
        return unauthorized('Invalid or expired token')
      }

      const userId = userInfo.sub

      // Get query parameters
      const url = new URL(request.url)
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      console.log('[ImageGen] Getting user images:', userId, 'limit:', limit, 'offset:', offset)

      // Get completed prompts with images
      const prompts = await PromptRepository.getByUserId(env, userId, { limit, offset })

      const images = prompts
        .filter(p => p.status === 'COMPLETED' && p.imageId)
        .map(p => ({
          promptId: p.id,
          prompt: p.prompt,
          imageId: p.imageId,
          cost: p.cost,
          durationMs: p.durationMs,
          createdAt: p.createdAt,
        }))

      // Get cost summary
      const summary = await PromptRepository.getUserCostSummary(env, userId)

      return success({
        images,
        summary,
        pagination: {
          limit,
          offset,
          total: summary.totalGenerated,
        },
      })
    } catch (error: any) {
      console.error('[ImageGen] Get images error:', error)
      return error(error.message || 'Internal server error', 500)
    }
  },

  /**
   * Get prompt history
   */
  async getPromptHistory(request: Request, env: Env): Promise<Response> {
    try {
      // Verify authentication
      const authHeader = request.headers.get('Authorization')
      if (!authHeader) {
        return unauthorized('Authorization header required')
      }

      const token = authHeader.replace('Bearer ', '')
      const userInfo = await googleService.verifyAuthToken(token, env)

      if (!userInfo) {
        return unauthorized('Invalid or expired token')
      }

      const userId = userInfo.sub

      // Get query parameters
      const url = new URL(request.url)
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      console.log('[ImageGen] Getting prompt history:', userId)

      // Get all prompts
      const prompts = await PromptRepository.getByUserId(env, userId, { limit, offset })

      return success({
        prompts: prompts.map(p => ({
          id: p.id,
          prompt: p.prompt,
          taskType: p.taskType,
          imageSize: p.imageSize,
          status: p.status,
          cost: p.cost,
          durationMs: p.durationMs,
          errorMessage: p.errorMessage,
          createdAt: p.createdAt,
        })),
      })
    } catch (error: any) {
      console.error('[ImageGen] History error:', error)
      return error(error.message || 'Internal server error', 500)
    }
  },
}
