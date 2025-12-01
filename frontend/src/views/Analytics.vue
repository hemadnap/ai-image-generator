<template>
  <div class="analytics">
    <div class="analytics-header">
      <h1>{{ $t('analytics.title') }}</h1>
    </div>

    <div v-if="dataStore.isLoading" class="loading">
      <loading-spinner />
    </div>

    <div v-else class="analytics-content">
      <card title="Data Overview">
        <div class="no-data" v-if="!dataStore.analyticsData">
          <font-awesome-icon :icon="['fas', 'chart-line']" class="icon" />
          <p>{{ $t('analytics.noData') }}</p>
        </div>
        <div v-else>
          <p>Analytics data loaded successfully</p>
          <!-- D3 charts would be rendered here -->
        </div>
      </card>

      <card title="Chart Placeholder">
        <div class="chart-placeholder">
          <font-awesome-icon :icon="['fas', 'chart-bar']" class="chart-icon" />
          <p>D3 Chart Area - Ready for visualization</p>
          <p class="chart-subtitle">Integrate D3.js here for custom data visualizations</p>
        </div>
      </card>

      <card title="Time Series Data">
        <div class="chart-placeholder">
          <font-awesome-icon :icon="['fas', 'chart-line']" class="chart-icon" />
          <p>Time Series Chart - Ready for visualization</p>
          <p class="chart-subtitle">Use D3.js to create interactive time series charts</p>
        </div>
      </card>
    </div>
  </div>
</template>

<script setup>
import { useDataStore } from '@/stores/dataStore'
import Card from '@/components/Card.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { onMounted } from 'vue'

const dataStore = useDataStore()

onMounted(async () => {
  try {
    await dataStore.fetchAnalyticsData()
  } catch (error) {
    console.error('Error loading analytics:', error)
  }
})
</script>

<style scoped>
.analytics {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.analytics-header {
  margin-bottom: 2rem;
}

.analytics-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.analytics-content {
  display: grid;
  gap: 2rem;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #999;
}

.no-data .icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-data p {
  margin: 0.5rem 0;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background-color: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  color: #666;
}

.chart-icon {
  font-size: 2.5rem;
  color: #999;
  margin-bottom: 1rem;
}

.chart-placeholder p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.chart-subtitle {
  font-size: 0.9rem;
  color: #999;
  font-style: italic;
}

@media (max-width: 768px) {
  .analytics {
    padding: 1rem;
  }

  .analytics-header h1 {
    font-size: 1.5rem;
  }
}
</style>
