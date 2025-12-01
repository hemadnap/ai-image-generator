<template>
  <div class="generator-page">
    <div class="generator-container">
      <div class="generator-header">
        <h1>{{ $t('generator.title', 'AI Image Generator') }}</h1>
        <p>{{ $t('generator.subtitle', 'Create stunning images with AI') }}</p>
      </div>

      <!-- Generation Form -->
      <card class="generator-card" title="Generate Image">
        <form @submit.prevent="handleSubmit" class="generation-form">
          <!-- Prompt Input -->
          <div class="form-group">
            <label for="prompt">{{ $t('generator.prompt', 'Prompt') }} <span class="required">*</span></label>
            <textarea
              id="prompt"
              v-model="form.prompt"
              class="prompt-textarea"
              :placeholder="$t('generator.promptPlaceholder', 'Describe the image you want to generate...')"
              rows="4"
              required
            ></textarea>
            <small class="hint">{{ form.prompt.length }}/500 characters</small>
          </div>

          <!-- Image Size -->
          <div class="form-group">
            <label for="imageSize">{{ $t('generator.imageSize', 'Image Size') }}</label>
            <select id="imageSize" v-model="form.imageSize" class="form-control">
              <option value="512x512">512x512 - {{ $t('generator.fast', 'Fast') }}</option>
              <option value="768x768">768x768 - {{ $t('generator.balanced', 'Balanced') }}</option>
              <option value="1024x1024" selected>1024x1024 - {{ $t('generator.quality', 'Quality') }}</option>
              <option value="1536x1536">1536x1536 - {{ $t('generator.ultra', 'Ultra') }}</option>
            </select>
            <small class="hint">{{ $t('generator.sizeHint', 'Larger sizes take longer but produce better quality') }}</small>
          </div>

          <!-- Watermark (Optional) -->
          <div class="form-group">
            <label for="watermark">{{ $t('generator.watermark', 'Watermark (Optional)') }}</label>
            <input
              id="watermark"
              v-model="form.watermark"
              type="text"
              class="form-control"
              :placeholder="$t('generator.watermarkPlaceholder', 'e.g., © 2025')"
            />
            <small class="hint">{{ $t('generator.watermarkHint', 'Text to add to the generated image') }}</small>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isGenerating || !form.prompt.trim()">
              <span v-if="!isGenerating">{{ $t('generator.generate', 'Generate Image') }}</span>
              <span v-else>
                <loading-spinner size="small" />
                {{ $t('generator.generating', 'Generating...') }}
              </span>
            </button>
          </div>
        </form>

        <!-- Error Message -->
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
      </card>

      <!-- Generated Images -->
      <card v-if="currentGeneration && currentGeneration.images.length > 0" class="results-card" title="Generated Images">
        <div class="images-grid">
          <div v-for="image in currentGeneration.images" :key="image.id" class="image-card">
            <img :src="image.url" :alt="image.prompt" class="generated-image" />
            <div class="image-info">
              <p class="image-title">{{ image.title }}</p>
              <p class="image-prompt">{{ image.prompt.substring(0, 100) }}...</p>
              <a :href="image.url" target="_blank" class="download-link">
                <font-awesome-icon :icon="['fas', 'download']" />
                {{ $t('generator.download', 'Download') }}
              </a>
            </div>
          </div>
        </div>
        <div class="generation-stats">
          <span>{{ $t('generator.cost', 'Cost') }}: ${{ currentGeneration.cost.toFixed(4) }}</span>
          <span>{{ $t('generator.duration', 'Duration') }}: {{ (currentGeneration.duration / 1000).toFixed(2) }}s</span>
        </div>
      </card>

      <!-- User Images Gallery -->
      <card v-if="hasImages" class="gallery-card" title="Your Generated Images">
        <div class="images-grid">
          <div v-for="image in images" :key="image.imageId" class="image-card">
            <img :src="getImageUrl(image.imageId)" :alt="image.prompt" class="generated-image" />
            <div class="image-info">
              <p class="image-title">{{ image.prompt.substring(0, 50) }}...</p>
              <p class="image-meta">
                {{ formatDate(image.createdAt) }} • ${{ image.cost.toFixed(4) }}
              </p>
            </div>
          </div>
        </div>
      </card>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-section">
        <loading-spinner />
        <p>{{ $t('common.loading', 'Loading...') }}</p>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !hasImages && !isGenerating" class="empty-state">
        <font-awesome-icon :icon="['fas', 'images']" class="empty-icon" />
        <p>{{ $t('generator.noImages', 'No images generated yet. Create your first image above!') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useImageGenerationStore } from '@/stores/imageGenerationStore'
import Card from '@/components/Card.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const generationStore = useImageGenerationStore()

// Computed
const isGenerating = computed(() => generationStore.isGenerating)
const isLoading = computed(() => generationStore.isLoading)
const error = computed(() => generationStore.error)
const currentGeneration = computed(() => generationStore.currentGeneration)
const images = computed(() => generationStore.images)
const hasImages = computed(() => generationStore.hasImages)

// Form state
const form = ref({
  prompt: '',
  imageSize: '1024x1024',
  watermark: '',
})

// Methods
const handleSubmit = async () => {
  if (!form.value.prompt.trim()) {
    return
  }

  try {
    await generationStore.generateImage(
      form.value.prompt,
      form.value.imageSize,
      form.value.watermark || null
    )

    // Clear form after successful generation
    form.value.prompt = ''
  } catch (err) {
    console.error('Generation error:', err)
  }
}

const getImageUrl = (imageId) => {
  // In a real app, this would fetch the image URL
  // For now, we'll return a placeholder
  return `https://via.placeholder.com/300?text=${imageId}`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// Lifecycle
onMounted(async () => {
  try {
    await generationStore.fetchUserImages()
  } catch (err) {
    console.error('Failed to load user images:', err)
  }
})
</script>

<style scoped>
.generator-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.generator-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.generator-header {
  text-align: center;
  margin-bottom: 1rem;
}

.generator-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.generator-header p {
  font-size: 1.1rem;
  color: #999;
}

.generator-card {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.generation-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #fff;
}

.required {
  color: #ff4444;
}

.prompt-textarea {
  padding: 1rem;
  border: 1px solid #555;
  border-radius: 0.5rem;
  background-color: #2a2a2a;
  color: #fff;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
}

.prompt-textarea:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
}

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid #555;
  border-radius: 0.5rem;
  background-color: #2a2a2a;
  color: #fff;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
}

.form-control option {
  background-color: #2a2a2a;
  color: #fff;
}

.hint {
  font-size: 0.85rem;
  color: #999;
}

.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #4a9eff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3a8eef;
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.alert-danger {
  background-color: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  color: #ff8888;
}

.results-card {
  margin-top: 2rem;
}

.gallery-card {
  margin-top: 2rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.image-card {
  border: 1px solid #444;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.generated-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 1rem;
  background-color: #2a2a2a;
}

.image-title {
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-prompt {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
  max-height: 2.5em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.image-meta {
  font-size: 0.8rem;
  color: #666;
  margin: 0.5rem 0 0 0;
}

.download-link {
  display: inline-block;
  margin-top: 0.5rem;
  color: #4a9eff;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.download-link:hover {
  color: #3a8eef;
}

.generation-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  padding-top: 1.5rem;
  border-top: 1px solid #444;
  color: #999;
  font-size: 0.9rem;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .generator-page {
    padding: 1rem;
  }

  .generator-header h1 {
    font-size: 2rem;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .generation-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
