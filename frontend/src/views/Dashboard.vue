<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>{{ $t('dashboard.title') }}</h1>
      <p>{{ $t('dashboard.welcome') }}, {{ authStore.user?.name }}!</p>
    </div>

    <div v-if="dataStore.isLoading" class="loading">
      <loading-spinner />
    </div>

    <div v-else class="dashboard-content">
      <!-- Quick Actions -->
      <card title="Quick Actions">
        <div class="quick-actions">
          <router-link to="/generator" class="action-button generate-button">
            <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" />
            <span>{{ $t('dashboard.generateImage', 'Generate Image') }}</span>
          </router-link>
          <router-link to="/profile" class="action-button profile-button">
            <font-awesome-icon :icon="['fas', 'user']" />
            <span>{{ $t('dashboard.editProfile', 'Edit Profile') }}</span>
          </router-link>
        </div>
      </card>

      <!-- Generation Stats -->
      <card title="Image Generation Stats">
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">{{ generatedImageCount }}</div>
            <div class="stat-label">{{ $t('dashboard.totalGenerated', 'Images Generated') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${{ totalCostSpent.toFixed(2) }}</div>
            <div class="stat-label">{{ $t('dashboard.totalCost', 'Total Cost') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">42</div>
            <div class="stat-label">Total Items</div>
          </div>
        </div>
      </card>

      <!-- Recent Generated Images -->
      <card v-if="hasImages" title="Recent Generated Images">
        <div class="images-preview">
          <div v-for="image in images.slice(0, 6)" :key="image.imageId" class="image-thumbnail">
            <img :src="getImagePreview(image)" :alt="image.prompt" />
            <div class="image-overlay">
              <p>{{ image.prompt.substring(0, 30) }}...</p>
            </div>
          </div>
        </div>
        <router-link to="/generator" class="view-all-link">
          {{ $t('dashboard.viewAll', 'View All Images') }}
          <font-awesome-icon :icon="['fas', 'arrow-right']" />
        </router-link>
      </card>

      <!-- Recent Activity -->
      <card title="Recent Activity">
        <div class="activity-list">
          <div class="activity-item">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="icon-success" />
            <div class="activity-text">
              <p class="activity-title">Task completed</p>
              <p class="activity-time">2 hours ago</p>
            </div>
          </div>
          <div class="activity-item">
            <font-awesome-icon :icon="['fas', 'user-plus']" class="icon-info" />
            <div class="activity-text">
              <p class="activity-title">New user joined</p>
              <p class="activity-time">5 hours ago</p>
            </div>
          </div>
          <div class="activity-item">
            <font-awesome-icon :icon="['fas', 'database']" class="icon-warning" />
            <div class="activity-text">
              <p class="activity-title">Data backup completed</p>
              <p class="activity-time">1 day ago</p>
            </div>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { useImageGenerationStore } from '@/stores/imageGenerationStore'
import Card from '@/components/Card.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()
const generationStore = useImageGenerationStore()

// Computed
const images = computed(() => generationStore.images)
const hasImages = computed(() => generationStore.hasImages)
const generatedImageCount = computed(() => generationStore.generatedImageCount)
const totalCostSpent = computed(() => generationStore.totalCostSpent)

// Methods
const getImagePreview = (image) => {
  // Return placeholder or actual image URL
  return `https://via.placeholder.com/150?text=${encodeURIComponent(image.prompt.substring(0, 20))}`
}

onMounted(async () => {
  try {
    console.log('[DASHBOARD] Mounting, user:', authStore.user)
    console.log('[DASHBOARD] isAuthenticated:', authStore.isAuthenticated)
    
    // Only fetch data if authenticated
    if (!authStore.isAuthenticated) {
      console.log('[DASHBOARD] User not authenticated, should not be here')
      await router.push('/login')
      return
    }

    console.log('[DASHBOARD] Fetching dashboard data...')
    await dataStore.fetchDashboardData()
    console.log('[DASHBOARD] Dashboard data fetched successfully')
  } catch (error) {
    console.error('[DASHBOARD] Error loading dashboard data:', error?.response?.status, error?.message)
    if (error?.response?.status === 401) {
      console.log('[DASHBOARD] Got 401, redirecting to login')
      await router.push('/login')
      return
    }
  }

  try {
    console.log('[DASHBOARD] Fetching user images...')
    await generationStore.fetchUserImages()
    console.log('[DASHBOARD] User images fetched successfully')
  } catch (error) {
    console.error('[DASHBOARD] Error loading images:', error?.response?.status, error?.message)
    if (error?.response?.status === 401) {
      console.log('[DASHBOARD] Got 401 on images fetch, redirecting to login')
      await router.push('/login')
      return
    }
  }
})
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #fff;
}

.dashboard-header p {
  margin: 0;
  color: #999;
  font-size: 1.1rem;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.dashboard-content {
  display: grid;
  gap: 2rem;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.generate-button {
  background-color: #4a9eff;
  color: white;
  font-size: 1rem;
}

.generate-button:hover {
  background-color: #3a8eef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
}

.profile-button {
  background-color: transparent;
  color: #4a9eff;
  border-color: #4a9eff;
}

.profile-button:hover {
  background-color: rgba(74, 158, 255, 0.1);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.images-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.image-thumbnail {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  aspect-ratio: 1;
  background-color: #333;
  cursor: pointer;
}

.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-thumbnail:hover .image-overlay {
  opacity: 1;
}

.image-overlay p {
  margin: 0;
  color: #fff;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a9eff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.view-all-link:hover {
  color: #3a8eef;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-left: 4px solid #444;
  background-color: #2a2a2a;
  border-radius: 4px;
}

.activity-item [class*='icon-'] {
  font-size: 1.5rem;
  min-width: 24px;
}

.icon-success {
  color: #4caf50;
}

.icon-info {
  color: #2196f3;
}

.icon-warning {
  color: #ff9800;
}

.activity-text {
  flex: 1;
}

.activity-title {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #fff;
}

.activity-time {
  margin: 0;
  font-size: 0.85rem;
  color: #999;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .images-preview {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>