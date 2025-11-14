<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">AI Image Generator</h1>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <router-link
                to="/"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                active-class="text-gray-900 bg-gray-100"
              >
                Home
              </router-link>
              <router-link
                to="/gallery"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                active-class="text-gray-900 bg-gray-100"
              >
                Gallery
              </router-link>
              <button
                @click="logout"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ml-4"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Generated Images</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          View your collection of AI-generated images
        </p>
      </div>

      <div v-if="generatedImages.length === 0" class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">No images yet</h3>
        <p class="mt-1 text-gray-500">
          Start generating images from the
          <router-link to="/" class="text-indigo-600 hover:text-indigo-500"
            >home page</router-link
          >
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-500">
          <p>&copy; 2024 AI Image Generator. Powered by Replicate AI.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useImageGeneration } from '@/composables/useImageGeneration'

const router = useRouter()
const authStore = useAuthStore()
const { generatedImages } = useImageGeneration()

const logout = () => {
  authStore.logout()
  router.push('/login')
}

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
    // eslint-disable-next-line no-console
    console.error('Failed to download image:', err)
  }
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
