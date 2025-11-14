import Replicate from 'replicate'
import { httpClient } from './http'
import { getModelVersion } from './replicate-config'

// Model configuration - use model names directly, Replicate SDK handles versions
class ReplicateService {
  constructor() {
    // Initialize Replicate client (for direct backend use if needed)
    this.replicate = new Replicate({
      auth: import.meta.env.VITE_REPLICATE_API_TOKEN,
    })
  }

  async generateImage(params) {
    try {
      const { prompt, model, style, aspectRatio, uploadedImage } = params

      // Enhance prompt based on style
      const enhancedPrompt = this.enhancePrompt(prompt, style)

      // Configure the model input based on the selected model
      const input = this.buildModelInput(
        enhancedPrompt,
        model,
        aspectRatio,
        uploadedImage
      )

      // Get the full model version ID
      const modelVersion = getModelVersion(model)

      // Call backend API instead of calling Replicate directly
      // This avoids CORS issues
      // Use /api/generate endpoint (httpClient baseURL will prepend the backend URL)
      const response = await httpClient.post('/api/generate', {
        model: modelVersion,
        input,
      })

      return {
        output: response.data.output,
        model,
        prompt: enhancedPrompt,
      }
    } catch (error) {
      // Only log in development mode
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Replicate API error:', error)
      }
      throw new Error(this.handleError(error))
    }
  }

  extractImageUrl(item) {
    // Handle Replicate File object with .url() method
    if (item && typeof item.url === 'function') {
      return item.url()
    }

    // Handle string URLs
    if (typeof item === 'string') {
      return item
    }

    // Handle objects with url property
    if (item && typeof item === 'object' && item.url) {
      return typeof item.url === 'function' ? item.url() : item.url
    }

    throw new Error('Could not extract image URL from API response')
  }

  enhancePrompt(prompt, style) {
    const styleEnhancements = {
      photorealistic:
        ', photorealistic, high quality, detailed, professional photography',
      artistic: ', artistic, creative, expressive, fine art',
      'digital-art': ', digital art, concept art, artstation, highly detailed',
      'oil-painting':
        ', oil painting, classical art, museum quality, masterpiece',
      watercolor:
        ', watercolor painting, soft colors, artistic, traditional medium',
      sketch: ', pencil sketch, hand drawn, artistic sketch, black and white',
      anime: ', anime style, manga, japanese animation, cel shading',
      default: '',
    }

    return prompt + (styleEnhancements[style] || '')
  }

  buildModelInput(prompt, model, aspectRatio, uploadedImage) {
    // Validate model parameter
    if (!model || typeof model !== 'string') {
      throw new Error('Model parameter is required and must be a string')
    }

    // Base input configuration
    const baseInput = {
      prompt,
      negative_prompt:
        'blurry, bad quality, distorted, ugly, bad anatomy, low resolution',
      num_inference_steps: 30,
      guidance_scale: 7.5,
    }

    // Add aspect ratio configuration
    const dimensions = this.getAspectRatioDimensions(aspectRatio)

    if (model.includes('stable-diffusion')) {
      const input = {
        ...baseInput,
        width: dimensions.width,
        height: dimensions.height,
        scheduler: 'K_EULER',
      }
      // Add image if provided (for image-to-image)
      if (uploadedImage) {
        input.image = uploadedImage
        // eslint-disable-next-line no-console
        console.log(
          '[replicate.js] Adding image to Stable Diffusion input, size:',
          uploadedImage.length
        )
      }
      return input
    } else if (model.includes('flux-kontext-pro')) {
      const input = {
        prompt,
        aspect_ratio: aspectRatio,
        num_outputs: 1,
        num_inference_steps: 20,
        guidance_scale: 3.5,
        output_format: 'webp',
        output_quality: 90,
      }
      // Add image if provided
      if (uploadedImage) {
        input.image = uploadedImage
        // eslint-disable-next-line no-console
        console.log(
          '[replicate.js] Adding image to FLUX Kontext input, size:',
          uploadedImage.length
        )
      }
      return input
    } else if (model.includes('flux')) {
      const input = {
        prompt,
        width: dimensions.width,
        height: dimensions.height,
        num_inference_steps: 4, // FLUX Schnell is optimized for fewer steps
      }
      // For FLUX models, only add these fields if specifically needed
      if (!model.includes('flux-schnell')) {
        // FLUX Pro and FLUX 1.1 Pro may support additional fields
        input.negative_prompt = baseInput.negative_prompt
        input.guidance_scale = baseInput.guidance_scale
      }
      // Add image if provided - use image_prompt for FLUX models
      // This enables image-to-image mode
      if (uploadedImage) {
        input.image_prompt = uploadedImage
        // eslint-disable-next-line no-console
        console.log(
          '[replicate.js] Adding image_prompt to FLUX input, size:',
          uploadedImage.length
        )
      }
      return input
    }

    const input = { ...baseInput }
    if (uploadedImage) {
      input.image = uploadedImage
      // eslint-disable-next-line no-console
      console.log(
        '[replicate.js] Adding image to default input, size:',
        uploadedImage.length
      )
    }
    return input
  }

  getAspectRatioDimensions(aspectRatio) {
    const ratios = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1024, height: 576 },
      '9:16': { width: 576, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '3:2': { width: 1024, height: 683 },
    }

    return ratios[aspectRatio] || ratios['1:1']
  }

  async getAvailableModels() {
    try {
      // This would typically fetch from Replicate's model list
      const models = [
        {
          id: 'black-forest-labs/flux-kontext-pro',
          name: 'FLUX Kontext Pro',
          description:
            'Advanced context-aware image generation with superior quality',
        },
        {
          id: 'stability-ai/stable-diffusion-xl-base-1.0',
          name: 'Stable Diffusion XL',
          description:
            'High-quality image generation with excellent prompt following',
        },
        {
          id: 'black-forest-labs/flux-schnell',
          name: 'FLUX Schnell',
          description: 'Fast, high-quality image generation',
        },
      ]
      return models
    } catch (error) {
      // Log error in development only
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch models:', error)
      }
      return []
    }
  }

  handleError(error) {
    const message = error.message?.toLowerCase() || ''

    if (
      message.includes('nsfw') ||
      message.includes('sexual') ||
      message.includes('adult')
    ) {
      return 'The generated content was flagged as NSFW. Please try a different prompt or reference image. Avoid prompts with explicit or adult content.'
    } else if (message.includes('rate limit')) {
      return 'Rate limit exceeded. Please try again in a few minutes.'
    } else if (message.includes('authentication')) {
      return 'Authentication failed. Please check your API key.'
    } else if (
      message.includes('content policy') ||
      message.includes('policy violation')
    ) {
      return 'Content policy violation. Please modify your prompt or reference image to comply with content guidelines.'
    } else if (message.includes('insufficient credits')) {
      return 'Insufficient credits. Please check your Replicate account.'
    } else if (
      message.includes('failed') &&
      message.includes('error generating')
    ) {
      return 'Image generation failed. Please try a different prompt or reference image.'
    }

    return error.message || 'An unexpected error occurred. Please try again.'
  }
}

export const replicateService = new ReplicateService()
