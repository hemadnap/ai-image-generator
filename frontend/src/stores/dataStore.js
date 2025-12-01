import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DataService } from '@/services/dataService'

export const useDataStore = defineStore('data', () => {
  // State
  const dashboardData = ref(null)
  const analyticsData = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Methods
  const fetchDashboardData = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      console.log('[DataStore] Fetching dashboard data...')
      const data = await DataService.getDashboardData(params)
      dashboardData.value = data
      console.log('[DataStore] Dashboard data fetched successfully')
      return data
    } catch (err) {
      console.error('[DataStore] Fetch failed:', err?.response?.status, err?.message)
      
      // For 401 errors, don't set error state - let auth handle it
      if (err.response?.status === 401) {
        console.log('[DataStore] Got 401, auth should handle this')
        return null
      }
      
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAnalyticsData = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await DataService.getAnalyticsData(params)
      analyticsData.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    dashboardData,
    analyticsData,
    isLoading,
    error,
    // Methods
    fetchDashboardData,
    fetchAnalyticsData,
    clearError,
  }
})
