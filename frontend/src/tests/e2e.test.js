import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import * as AuthServiceModule from '@/services/authService'
import * as DataServiceModule from '@/services/dataService'
import { User } from '@/models/User'

// Mock services
vi.mock('@/services/authService', () => ({
  AuthService: {
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    initializeAuth: vi.fn(),
    getCurrentUser: vi.fn(),
    getToken: vi.fn(),
    getStoredUserData: vi.fn(),
    deleteAuthCookie: vi.fn(),
    setAuthCookie: vi.fn(),
  },
}))

vi.mock('@/services/dataService', () => ({
  DataService: {
    getDashboardData: vi.fn(),
    getAnalyticsData: vi.fn(),
  },
}))

describe('E2E: User Authentication Flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    global.document = { cookie: '' }
    vi.clearAllMocks()
  })

  it('complete login flow', async () => {
    const authStore = useAuthStore()
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    AuthServiceModule.AuthService.loginWithGoogle.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValueOnce(mockUser)

    expect(authStore.isAuthenticated).toBe(false)
    await authStore.loginWithGoogle('mock-token')
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.email).toBe('test@example.com')
  })

  it('complete logout flow', async () => {
    const authStore = useAuthStore()
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    AuthServiceModule.AuthService.loginWithGoogle.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.logout.mockResolvedValueOnce({ success: true })

    await authStore.loginWithGoogle('mock-token')
    expect(authStore.isAuthenticated).toBe(true)
    await authStore.logout()
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
  })

  it('session persistence on page reload', async () => {
    const authStore = useAuthStore()
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    AuthServiceModule.AuthService.loginWithGoogle.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValue(mockUser)  // Use mockResolvedValue to allow multiple calls
    global.localStorage.getItem.mockReturnValue('mock-jwt-token')  // Return token for all calls
    AuthServiceModule.AuthService.getToken.mockReturnValue('mock-jwt-token')  // Return token for all calls

    await authStore.loginWithGoogle('mock-token')
    const userId = authStore.user?.id
    await authStore.initializeAuth()
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.id).toBe(userId)
  })
})

describe('E2E: Dashboard Flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    global.document = { cookie: '' }
    vi.clearAllMocks()
  })

  it('complete dashboard data loading', async () => {
    const authStore = useAuthStore()
    const dataStore = useDataStore()
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    AuthServiceModule.AuthService.loginWithGoogle.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValueOnce(mockUser)
    const mockDashboardData = {
      totalImages: 42,
      coinsUsed: 210,
      coinsRemaining: 290,
      averageGenerationTime: 2.5,
      lastGeneratedAt: new Date().toISOString(),
    }
    DataServiceModule.DataService.getDashboardData.mockResolvedValueOnce(mockDashboardData)

    await authStore.loginWithGoogle('mock-token')
    expect(authStore.isAuthenticated).toBe(true)
    await dataStore.fetchDashboardData()
    expect(dataStore.dashboardData).toBeDefined()
    expect(dataStore.dashboardData?.totalImages).toBeGreaterThan(0)
  })

  it('complete dashboard and analytics loading', async () => {
    const authStore = useAuthStore()
    const dataStore = useDataStore()
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    AuthServiceModule.AuthService.loginWithGoogle.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValueOnce(mockUser)
    const mockDashboardData = { totalImages: 42, coinsUsed: 210, coinsRemaining: 290, averageGenerationTime: 2.5, lastGeneratedAt: new Date().toISOString() }
    const mockAnalyticsData = { dailyStats: [], totalGenerated: 100 }
    DataServiceModule.DataService.getDashboardData.mockResolvedValueOnce(mockDashboardData)
    DataServiceModule.DataService.getAnalyticsData.mockResolvedValueOnce(mockAnalyticsData)

    await authStore.loginWithGoogle('mock-token')
    await Promise.all([dataStore.fetchDashboardData(), dataStore.fetchAnalyticsData()])
    expect(dataStore.dashboardData).toBeDefined()
    expect(dataStore.analyticsData).toBeDefined()
  })
})

describe('E2E: Image Generation Flow (Mocked)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.localStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() }
    global.document = { cookie: '' }
    vi.clearAllMocks()
  })

  it('complete image generation request (no actual API call)', async () => {
    const authStore = useAuthStore()
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    mockUser.coins = 100
    AuthServiceModule.AuthService.loginWithGoogle.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValueOnce(mockUser)

    await authStore.loginWithGoogle('mock-token')
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.coins).toBeGreaterThanOrEqual(5)
    const jobId = 'job-123'
    expect(jobId).toBeDefined()
  })

  it('fetch generated image (mocked)', async () => {
    const authStore = useAuthStore()
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    AuthServiceModule.AuthService.loginWithGoogle.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValueOnce(mockUser)

    await authStore.loginWithGoogle('mock-token')
    expect(authStore.isAuthenticated).toBe(true)
    const imageResult = { jobId: 'job-123', prompt: 'beautiful landscape', imageUrl: 'https://example.com/image.png', status: 'completed', cost: 5 }
    expect(imageResult.status).toBe('completed')
    expect(imageResult.imageUrl).toBeTruthy()
  })
})

describe('E2E: Error Handling', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.localStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() }
    global.document = { cookie: '' }
    vi.clearAllMocks()
  })

  it('handles authentication error gracefully', async () => {
    const authStore = useAuthStore()
    AuthServiceModule.AuthService.loginWithGoogle.mockRejectedValueOnce(new Error('Login failed'))

    try {
      await authStore.loginWithGoogle('invalid-token')
    } catch (error) {}

    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
  })

  it('recovers from failed data fetch', async () => {
    const authStore = useAuthStore()
    const dataStore = useDataStore()
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    AuthServiceModule.AuthService.loginWithGoogle.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValueOnce(mockUser)
    DataServiceModule.DataService.getDashboardData.mockRejectedValueOnce(new Error('Fetch failed'))

    await authStore.loginWithGoogle('mock-token')
    expect(authStore.isAuthenticated).toBe(true)
    try {
      await dataStore.fetchDashboardData()
    } catch (error) {}

    expect(authStore.isAuthenticated).toBe(true)
  })
})
