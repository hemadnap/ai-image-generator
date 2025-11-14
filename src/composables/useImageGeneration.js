import { ref } from 'vue'
import { replicateService } from '@/services/replicate'

export function useImageGeneration() {
  const isGenerating = ref(false)
  const error = ref(null)
  const generatedImages = ref([])

  const generateImage = async (params) => {
    isGenerating.value = true
    error.value = null

    try {
      const result = await replicateService.generateImage(params)

      // Handle both single URL and array of URLs
      const imageUrls = Array.isArray(result.output)
        ? result.output
        : [result.output]

      // Add the new images to the beginning of the array
      imageUrls.forEach((url) => {
        generatedImages.value.unshift({
          url: typeof url === 'string' ? url : url.url(),
          prompt: params.prompt,
          model: params.model,
          style: params.style,
          aspectRatio: params.aspectRatio,
          createdAt: new Date().toISOString(),
        })
      })
    } catch (err) {
      // Only log in development mode
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Image generation failed:', err)
      }
      error.value = err.message || 'Failed to generate image. Please try again.'
    } finally {
      isGenerating.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearImages = () => {
    generatedImages.value = []
  }

  return {
    isGenerating,
    error,
    generatedImages,
    generateImage,
    clearError,
    clearImages,
  }
}
