<template>
  <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Prompt Input -->
      <div>
        <label
          for="prompt"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Image Description
        </label>
        <textarea
          id="prompt"
          v-model="prompt"
          rows="4"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Describe the image you want to generate... (e.g., 'A serene mountain landscape at sunset with a crystal clear lake reflecting the colorful sky')"
          required
        />
      </div>

      <!-- Image Upload -->
      <div>
        <label
          for="image-upload"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Upload Reference Image (Optional)
        </label>
        <div class="relative">
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          />
          <label
            for="image-upload"
            class="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
          >
            <div class="text-center">
              <svg
                v-if="!uploadedImage"
                class="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v4a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32 0h-8m-24 0H8m20-12l-4 4m0 0l-4-4m4 4v12"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p v-if="!uploadedImage" class="mt-2 text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p v-else class="mt-2 text-sm text-green-600 font-medium">
                ✓ Image uploaded: {{ uploadedImageName }}
              </p>
              <p class="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>
          </label>
          <button
            v-if="uploadedImage"
            type="button"
            @click="clearUploadedImage"
            class="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
            title="Remove image"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Settings -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Model Selection -->
        <div>
          <label
            for="model"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Model
          </label>
          <select
            id="model"
            v-model="selectedModel"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option
              v-for="model in models"
              :key="model.value"
              :value="model.value"
            >
              {{ model.label }}
            </option>
          </select>
        </div>

        <!-- Style -->
        <div>
          <label
            for="style"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Style
          </label>
          <select
            id="style"
            v-model="selectedStyle"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option
              v-for="style in styles"
              :key="style.value"
              :value="style.value"
            >
              {{ style.label }}
            </option>
          </select>
        </div>

        <!-- Aspect Ratio -->
        <div>
          <label
            for="aspect"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Aspect Ratio
          </label>
          <select
            id="aspect"
            v-model="aspectRatio"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option
              v-for="ratio in aspectRatios"
              :key="ratio.value"
              :value="ratio.value"
            >
              {{ ratio.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Generate Button -->
      <div class="text-center">
        <button
          type="submit"
          :disabled="isGenerating || !prompt.trim()"
          class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <svg
            v-if="isGenerating"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isGenerating ? 'Generating...' : 'Generate Image' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useImageGeneration } from '@/composables/useImageGeneration'

// Reactive data
const prompt = ref('')
const selectedModel = ref('black-forest-labs/flux-1.1-pro')
const selectedStyle = ref('default')
const aspectRatio = ref('1:1')
const uploadedImage = ref(null)
const uploadedImageName = ref('')

// Composable
const { generateImage, isGenerating, error } = useImageGeneration()

// Configuration options
const models = ref([
  {
    value: 'black-forest-labs/flux-1.1-pro',
    label: '⭐ FLUX 1.1 Pro (Recommended)',
  },
  { value: 'black-forest-labs/flux-pro', label: 'FLUX Pro' },
  { value: 'black-forest-labs/flux-schnell', label: 'FLUX Schnell (Fast)' },
  {
    value: 'stability-ai/stable-diffusion-3-medium',
    label: 'Stable Diffusion 3 Medium',
  },
])

const styles = ref([
  { value: 'default', label: 'Default' },
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'oil-painting', label: 'Oil Painting' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'sketch', label: 'Sketch' },
  { value: 'anime', label: 'Anime' },
])

const aspectRatios = ref([
  { value: '1:1', label: 'Square (1:1)' },
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '3:2', label: 'Classic (3:2)' },
])

// Methods
const handleImageUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'Image size must be less than 10MB'
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please upload a valid image file'
    return
  }

  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result
      uploadedImageName.value = file.name
      error.value = null
    }
    reader.onerror = () => {
      error.value = 'Failed to read image file'
    }
    reader.readAsDataURL(file)
  } catch (err) {
    error.value = 'Failed to process image'
  }
}

const clearUploadedImage = () => {
  uploadedImage.value = null
  uploadedImageName.value = ''
}

const handleSubmit = async () => {
  if (!prompt.value.trim()) return

  const params = {
    prompt: prompt.value,
    model: selectedModel.value,
    style: selectedStyle.value,
    aspectRatio: aspectRatio.value,
    uploadedImage: uploadedImage.value,
  }

  await generateImage(params)
}

defineExpose({
  error,
})
</script>

<style lang="scss" scoped>
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
