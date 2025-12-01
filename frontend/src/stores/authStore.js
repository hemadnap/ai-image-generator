import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthService } from '@/services/authService'
import { User } from '@/models/User'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value && user.value.isAuthenticated())

  // Methods
  const loginWithGoogle = async (token) => {
    isLoading.value = true
    error.value = null
    try {
      console.log('[STORE] loginWithGoogle called')
      const result = await AuthService.loginWithGoogle(token)
      console.log('[STORE] Login result:', result)
      user.value = result
      
      // Fetch complete user data from server
      const currentUser = await AuthService.getCurrentUser()
      if (currentUser) {
        user.value = currentUser
        console.log('[STORE] User updated with server data')
      }
      
      return result
    } catch (err) {
      error.value = err.message
      console.error('[STORE] Login error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      await AuthService.logout()
      user.value = null
      console.log('[STORE] User logged out')
    } finally {
      isLoading.value = false
    }
  }

  const initializeAuth = async () => {
    console.log('[STORE] initializeAuth called')
    isLoading.value = true
    
    try {
      const token = AuthService.getToken()
      
      if (token) {
        console.log('[STORE] Token found, fetching user data from server')
        // Try to get fresh data from server
        try {
          const currentUser = await AuthService.getCurrentUser()
          if (currentUser) {
            user.value = currentUser
            console.log('[STORE] User initialized from server:', currentUser)
            return
          }
        } catch (serverErr) {
          console.log('[STORE] Server request failed:', serverErr?.response?.status)
          // If it's a 401, the token is invalid - clear it
          if (serverErr?.response?.status === 401) {
            console.log('[STORE] Got 401, token is invalid, clearing auth')
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
            AuthService.deleteAuthCookie()
            user.value = null
            return
          }
        }
        
        // Server call failed but not 401, try localStorage fallback
        console.log('[STORE] Server request failed, trying localStorage fallback')
        const storedData = AuthService.getStoredUserData()
        if (storedData) {
          user.value = new User(
            storedData.id,
            storedData.email,
            storedData.name,
            storedData.picture,
            storedData.authProvider
          )
          console.log('[STORE] User restored from localStorage')
        } else {
          // No fallback available, clear auth
          console.log('[STORE] No localStorage data available, clearing auth')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          AuthService.deleteAuthCookie()
          user.value = null
        }
      } else {
        console.log('[STORE] No token found, user is not authenticated')
        user.value = null
      }
    } catch (err) {
      console.error('[STORE] initializeAuth error:', err)
      error.value = err.message
      user.value = null
      
      // Clear everything on unexpected errors
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      AuthService.deleteAuthCookie()
    } finally {
      isLoading.value = false
      console.log('[STORE] initializeAuth completed, isLoading=false, isAuthenticated=' + !!user.value)
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Computed
    isAuthenticated,
    // Methods
    loginWithGoogle,
    logout,
    initializeAuth,
    clearError,
  }
})
