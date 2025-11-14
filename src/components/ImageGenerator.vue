<template>
  <div class="image-generator">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">
        Create Amazing Images with AI
      </h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Transform your ideas into stunning visuals using cutting-edge AI
        technology. Simply describe what you want to see and watch the magic
        happen.
      </p>
    </div>

    <!-- Image Generation Form -->
    <div class="max-w-4xl mx-auto">
      <ImageGenerationForm ref="formComponent" />

      <!-- Error Message -->
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Generated Images -->
      <div v-if="generatedImages.length > 0" class="space-y-8">
        <h3 class="text-2xl font-bold text-gray-900 text-center">
          Generated Images
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(image, index) in generatedImages"
            :key="index"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div class="aspect-square relative">
              <img
                :src="image.url"
                :alt="image.prompt"
                class="w-full h-full object-cover"
                @load="onImageLoad"
                @error="onImageError"
              />
              <div class="absolute top-2 right-2 space-x-2">
                <button
                  @click="downloadImage(image.url, index)"
                  class="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                  title="Download"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="p-4">
              <p class="text-sm text-gray-600 line-clamp-2">
                {{ image.prompt }}
              </p>
              <p class="text-xs text-gray-400 mt-2">
                {{ formatDate(image.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageGenerationForm from './ImageGenerationForm.vue'
import { useImageGeneration } from '@/composables/useImageGeneration'

const formComponent = ref(null)
const { generatedImages } = useImageGeneration()

// Get error from form component
const error = ref(null)

const downloadImage = async (url, index) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `ai-generated-image-${index + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(downloadUrl)
  } catch (err) {
    // Handle download error silently
    error.value = 'Failed to download image. Please try again.'
  }
}

const onImageLoad = () => {
  // Handle successful image load
}

const onImageError = () => {
  // Handle image load error
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
</script>

<style lang="scss" scoped>
.image-generator {
  animation: fadeIn 0.5s ease-in-out;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Custom scrollbar for textarea
textarea {
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f3f4f6;
    border-radius: 0.375rem;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 0.375rem;

    &:hover {
      background-color: #9ca3af;
    }
  }
}
</style>
