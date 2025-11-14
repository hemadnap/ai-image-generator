import { httpClient } from './http'

// ReplicateService - Frontend service that calls the backend API
class ReplicateService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  }

  async generateImage(params) {
    try {
      const { prompt, model, style, aspectRatio } = params

      // Enhance prompt based on style
      const enhancedPrompt = this.enhancePrompt(prompt, style)

      // Prepare input for backend API
      const input = {
        prompt: enhancedPrompt,
        aspect_ratio: aspectRatio || '1:1',
      }

      // Call backend API to generate image
      const response = await httpClient.post('/api/generate', {
        model: model || 'black-forest-labs/flux-pro',
        input,
      })

      if (response.data.success) {
        return {
          success: true,
          url: response.data.output?.[0],
          message: response.data.message,
        }
      } else {
        throw new Error(response.data.error || 'Failed to generate image')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      throw error
    }
  }

  enhancePrompt(prompt, style) {
    const stylePrompts = {
      photorealistic: 'photorealistic, high quality, detailed, 4k, professional photography',
      artistic: 'artistic, painting style, creative, beautiful',
      cyberpunk: 'cyberpunk, neon, sci-fi, futuristic',
      fantasy: 'fantasy, magical, mystical, epic',
      minimalist: 'minimalist, simple, clean, modern',
    }

    const styleEnhancement = stylePrompts[style] || ''
    return styleEnhancement ? `${prompt}, ${styleEnhancement}` : prompt
  }

  getAvailableModels() {
    return [
      { id: 'black-forest-labs/flux-pro', name: 'Flux Pro', description: 'Fast and high quality' },
      { id: 'black-forest-labs/flux-realism', name: 'Flux Realism', description: 'Photorealistic images' },
      { id: 'black-forest-labs/flux-1.1-pro', name: 'Flux 1.1 Pro', description: 'Advanced pro model' },
    ]
  }
}

// Export both default and named export for flexibility
const replicateService = new ReplicateService()
export default replicateService
export { replicateService }
