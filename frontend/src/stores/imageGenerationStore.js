/**
 * Image Generation Store
 * Pinia store for managing image generation state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { imageGenerationService } from '@/services/imageGenerationService'

export const useImageGenerationStore = defineStore('imageGeneration', () => {
  // State
  const images = ref([])
  const promptHistory = ref([])
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const error = ref(null)
  const currentGeneration = ref(null)
  const costSummary = ref({
    totalCost: 0,
    totalGenerated: 0,
  })

  // Computed
  const hasImages = computed(() => images.value.length > 0)
  const generatedImageCount = computed(() => costSummary.value.totalGenerated)
  const totalCostSpent = computed(() => costSummary.value.totalCost)

  // Actions
  const generateImage = async (prompt, imageSize = '1024x1024', watermark = null) => {
    try {
      isGenerating.value = true
      error.value = null

      console.log('[Store] Generating image...')

      const result = await imageGenerationService.generateImage(prompt, imageSize, watermark)

      console.log('[Store] Image generated:', result)

      currentGeneration.value = result

      // Refresh images list
      await fetchUserImages()

      return result
    } catch (err) {
      console.error('[Store] Generation failed:', err)
      error.value = err.response?.data?.error?.message || err.message || 'Failed to generate image'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  const fetchUserImages = async (limit = 20, offset = 0) => {
    try {
      isLoading.value = true
      error.value = null

      console.log('[Store] Fetching user images...')

      const result = await imageGenerationService.getUserImages(limit, offset)

      images.value = result.images || []
      if (result.summary) {
        costSummary.value = result.summary
      }

      console.log('[Store] Images fetched:', images.value.length)

      return result
    } catch (err) {
      console.error('[Store] Fetch images failed:', err?.response?.status, err?.message)
      
      // For 401 errors, don't set error state - let it be handled by auth
      if (err.response?.status === 401) {
        console.log('[Store] Got 401, this should trigger a logout')
        // Don't throw - just silently fail
        return { images: [], summary: { totalGenerated: 0, totalCost: 0 } }
      }
      
      error.value = err.response?.data?.error?.message || err.message || 'Failed to fetch images'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchPromptHistory = async (limit = 50, offset = 0) => {
    try {
      isLoading.value = true
      error.value = null

      console.log('[Store] Fetching prompt history...')

      const result = await imageGenerationService.getPromptHistory(limit, offset)

      promptHistory.value = result.prompts || []

      console.log('[Store] History fetched:', promptHistory.value.length)

      return result
    } catch (err) {
      console.error('[Store] Fetch history failed:', err)
      error.value = err.response?.data?.error?.message || err.message || 'Failed to fetch history'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentGeneration = () => {
    currentGeneration.value = null
  }

  return {
    // State
    images,
    promptHistory,
    isLoading,
    isGenerating,
    error,
    currentGeneration,
    costSummary,

    // Computed
    hasImages,
    generatedImageCount,
    totalCostSpent,

    // Actions
    generateImage,
    fetchUserImages,
    fetchPromptHistory,
    clearError,
    clearCurrentGeneration,
  }
})
