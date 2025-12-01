import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import * as UserService from '@/services/userService'

// Mock the UserService
vi.mock('@/services/userService', () => ({
  UserService: {
    getUserById: vi.fn(),
    updateProfile: vi.fn(),
    getAllUsers: vi.fn(),
  },
}))

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty users', () => {
    const store = useUserStore()
    
    expect(store.users).toEqual([])
    expect(store.currentUser).toBeNull()
    expect(store.isLoading).toBe(false)
  })

  it('fetches user by ID', async () => {
    const store = useUserStore()
    
    UserService.UserService.getUserById.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      coins: 100,
    })
    
    await store.fetchUserById('user-123')
    
    expect(store.currentUser).toBeDefined()
    expect(store.currentUser?.email).toBe('test@example.com')
    expect(store.currentUser?.coins).toBe(100)
  })

  it('updates user profile', async () => {
    const store = useUserStore()
    
    UserService.UserService.updateProfile.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User Updated',
      coins: 100,
    })
    
    const updatedUser = {
      name: 'Test User Updated',
      email: 'updated@example.com',
    }
    
    await store.updateUserProfile('user-123', updatedUser)
    
    expect(store.currentUser?.name).toBe('Test User Updated')
  })

  it('fetches all users', async () => {
    const store = useUserStore()
    
    UserService.UserService.getAllUsers.mockResolvedValueOnce([
      {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        coins: 100,
      },
    ])
    
    await store.fetchAllUsers()
    
    expect(Array.isArray(store.users)).toBe(true)
    expect(store.users.length).toBeGreaterThan(0)
  })

  it('clears error', () => {
    const store = useUserStore()
    store.error = 'Some error'
    
    store.clearError()
    
    expect(store.error).toBeNull()
  })

  it('handles loading state', async () => {
    const store = useUserStore()
    
    UserService.UserService.getUserById.mockImplementationOnce(async () => {
      expect(store.isLoading).toBe(true)
      return {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        coins: 100,
      }
    })
    
    await store.fetchUserById('user-123')
    
    expect(store.isLoading).toBe(false)
  })
})
