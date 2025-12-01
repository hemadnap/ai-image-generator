/**
 * Nanobanana API Service
 * Handles image generation requests to Nanobanana API
 */

import { Env } from '../index'

export interface NanobananaGenerateRequest {
  prompt: string
  imageSize: string // "1024x1024", "512x512", etc
  watermark?: string
}

export interface NanobananaGenerateResponse {
  images: string[] // Array of base64 encoded images
  executionTime: number
  cost: number
}

export class NanobananaService {
  private static readonly MODEL_ID = 'sd3-medium'
  private static readonly BASE_URL = 'https://api.nanobanana.ai/api/predict'

  /**
   * Generate image from text prompt
   */
  static async generateImage(
    request: NanobananaGenerateRequest,
    env: Env
  ): Promise<NanobananaGenerateResponse> {
    try {
      console.log('[Nanobanana] Generating image for prompt:', request.prompt)

      const payload = {
        model_id: this.MODEL_ID,
        webhook_return_type: 'async',
        generated_inputs: this.buildGeneratedInputs(request),
      }

      console.log('[Nanobanana] Request payload:', JSON.stringify(payload, null, 2))

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.NANO_BANANA_TOKEN}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[Nanobanana] API Error:', response.status, error)
        throw new Error(`Nanobanana API error: ${response.status} ${error}`)
      }

      const data = await response.json() as any

      console.log('[Nanobanana] Response:', JSON.stringify(data, null, 2))

      // Handle async response
      if (data.task_id) {
        console.log('[Nanobanana] Async task created:', data.task_id)
        // Poll for result
        return await this.pollTaskResult(data.task_id, env)
      }

      // Handle sync response
      if (data.images && Array.isArray(data.images)) {
        return {
          images: data.images,
          executionTime: data.execution_time || 0,
          cost: data.cost || 0,
        }
      }

      throw new Error('Invalid response format from Nanobanana API')
    } catch (error: any) {
      console.error('[Nanobanana] Generation failed:', error)
      throw error
    }
  }

  /**
   * Poll for async task result
   */
  private static async pollTaskResult(
    taskId: string,
    env: Env,
    maxAttempts: number = 120, // 2 minutes with 1s interval
    interval: number = 1000
  ): Promise<NanobananaGenerateResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.BASE_URL}/${taskId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${env.NANO_BANANA_TOKEN}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to poll task: ${response.status}`)
        }

        const data = await response.json() as any

        // Task completed
        if (data.status === 'completed' && data.images) {
          return {
            images: data.images,
            executionTime: data.execution_time || 0,
            cost: data.cost || 0,
          }
        }

        // Task failed
        if (data.status === 'failed') {
          throw new Error(data.error || 'Task failed')
        }

        // Task still processing
        if (data.status === 'processing') {
          console.log(`[Nanobanana] Task ${taskId} still processing (attempt ${attempt + 1}/${maxAttempts})`)
          await new Promise(resolve => setTimeout(resolve, interval))
          continue
        }

        throw new Error(`Unknown task status: ${data.status}`)
      } catch (error) {
        console.error(`[Nanobanana] Poll attempt ${attempt + 1} failed:`, error)
        if (attempt === maxAttempts - 1) throw error
        await new Promise(resolve => setTimeout(resolve, interval))
      }
    }

    throw new Error('Task polling timeout')
  }

  /**
   * Build request inputs based on model requirements
   */
  private static buildGeneratedInputs(request: NanobananaGenerateRequest): Record<string, any> {
    const inputs: Record<string, any> = {}

    // Parse image size
    const [width, height] = request.imageSize.split('x').map(Number)

    // SD3 Medium specific inputs
    inputs.prompt = request.prompt
    inputs.width = width || 1024
    inputs.height = height || 1024
    inputs.num_inference_steps = 28
    inputs.guidance_scale = 7.0
    inputs.num_images_per_prompt = 1

    // Add watermark if provided
    if (request.watermark) {
      inputs.watermark = request.watermark
    }

    return inputs
  }

  /**
   * Get supported image sizes
   */
  static getSupportedSizes(): string[] {
    return ['512x512', '768x768', '1024x1024', '1536x1536']
  }

  /**
   * Validate image size
   */
  static isValidSize(size: string): boolean {
    return this.getSupportedSizes().includes(size)
  }
}
