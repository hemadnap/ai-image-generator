import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDataStore } from '@/stores/dataStore'
import * as DataServiceModule from '@/services/dataService'

// Mock the DataService
vi.mock('@/services/dataService', () => ({
  DataService: {
    getDashboardData: vi.fn(),
    getAnalyticsData: vi.fn(),
  },
}))

describe('Data Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty data', () => {
    const store = useDataStore()
    
    expect(store.dashboardData).toBeNull()
    expect(store.analyticsData).toBeNull()
    expect(store.isLoading).toBe(false)
  })

  it('fetches dashboard data', async () => {
    const store = useDataStore()
    
    const mockData = {
      totalImages: 42,
      coinsUsed: 210,
      coinsRemaining: 290,
      averageGenerationTime: 2.5,
      lastGeneratedAt: new Date().toISOString(),
    }
    
    DataServiceModule.DataService.getDashboardData.mockResolvedValueOnce(mockData)
    
    await store.fetchDashboardData()
    
    expect(store.dashboardData).toBeDefined()
    expect(store.dashboardData?.totalImages).toBe(42)
    expect(store.dashboardData?.coinsUsed).toBe(210)
  })

  it('fetches analytics data', async () => {
    const store = useDataStore()
    
    const mockAnalytics = {
      dailyStats: [],
      totalGenerated: 100,
    }
    
    DataServiceModule.DataService.getAnalyticsData.mockResolvedValueOnce(mockAnalytics)
    
    await store.fetchAnalyticsData()
    
    expect(store.analyticsData).toBeDefined()
  })

  it('sets error on fetch failure', async () => {
    const store = useDataStore()
    
    DataServiceModule.DataService.getDashboardData.mockRejectedValueOnce(new Error('Fetch failed'))
    
    try {
      await store.fetchDashboardData()
    } catch (error) {
      // Error expected
    }
    
    expect(store.error).toBeDefined()
  })

  it('clears error', () => {
    const store = useDataStore()
    store.error = 'Some error'
    
    store.clearError()
    
    expect(store.error).toBeNull()
  })

  it('loads data correctly', async () => {
    const store = useDataStore()
    
    const mockData = {
      totalImages: 42,
      coinsUsed: 210,
      coinsRemaining: 290,
      averageGenerationTime: 2.5,
      lastGeneratedAt: new Date().toISOString(),
    }
    
    DataServiceModule.DataService.getDashboardData.mockResolvedValueOnce(mockData)
    
    await store.fetchDashboardData()
    
    expect(store.isLoading).toBe(false)
    expect(store.dashboardData?.totalImages).toBeGreaterThan(0)
    expect(store.dashboardData?.coinsRemaining).toBeGreaterThan(0)
  })
})
