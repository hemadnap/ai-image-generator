import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import * as AuthServiceModule from '@/services/authService'
import { User } from '@/models/User'

// Mock the AuthService
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

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    global.document = {
      cookie: '',
    }
    vi.clearAllMocks()
  })

  it('initializes with no user', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isLoading).toBe(false)
  })

  it('sets user on login', async () => {
    const store = useAuthStore()
    
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    AuthServiceModule.AuthService.loginWithGoogle.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValueOnce(mockUser)
    
    await store.loginWithGoogle('mock-token')
    
    expect(store.user).toBeDefined()
    expect(store.user?.email).toBe('test@example.com')
    expect(store.isAuthenticated).toBe(true)
  })

  it('clears user on logout', async () => {
    const store = useAuthStore()
    
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    AuthServiceModule.AuthService.loginWithGoogle.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValueOnce(mockUser)
    AuthServiceModule.AuthService.logout.mockResolvedValueOnce({ success: true })
    
    await store.loginWithGoogle('mock-token')
    expect(store.isAuthenticated).toBe(true)
    
    await store.logout()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('initializes auth from stored token', async () => {
    const store = useAuthStore()
    
    const mockUser = new User('user-123', 'test@example.com', 'Test User', '', 'google')
    global.localStorage.getItem.mockReturnValueOnce('mock-jwt-token-12345')
    AuthServiceModule.AuthService.getToken.mockReturnValueOnce('mock-jwt-token-12345')
    AuthServiceModule.AuthService.getCurrentUser.mockResolvedValueOnce(mockUser)
    
    await store.initializeAuth()
    
    expect(store.isLoading).toBe(false)
    expect(store.user).toBeDefined()
  })

  it('handles auth initialization without token', async () => {
    const store = useAuthStore()
    
    global.localStorage.getItem.mockReturnValueOnce(null)
    AuthServiceModule.AuthService.getToken.mockReturnValueOnce(null)
    
    await store.initializeAuth()
    
    expect(store.isLoading).toBe(false)
    expect(store.isAuthenticated).toBe(false)
  })

  it('sets error on failed login', async () => {
    const store = useAuthStore()
    
    AuthServiceModule.AuthService.loginWithGoogle.mockRejectedValueOnce(new Error('Login failed'))
    
    try {
      await store.loginWithGoogle('invalid-token')
    } catch (error) {
      // Error expected
    }
    
    // Check that error was handled
    expect(store.isAuthenticated).toBe(false)
  })

  it('clears error when requested', () => {
    const store = useAuthStore()
    store.error = 'Some error'
    
    store.clearError()
    
    expect(store.error).toBeNull()
  })
})
