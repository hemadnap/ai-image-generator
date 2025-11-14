import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken'))
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const setUser = (userData) => {
    user.value = userData
  }

  const setToken = (authToken) => {
    token.value = authToken
    if (authToken) {
      localStorage.setItem('authToken', authToken)
    } else {
      localStorage.removeItem('authToken')
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('authToken')
  }

  const restoreSession = () => {
    if (token.value) {
      // Validate token is still valid
      try {
        const decoded = JSON.parse(atob(token.value.split('.')[1]))
        if (decoded.exp * 1000 > Date.now()) {
          user.value = decoded
          return true
        }
      } catch (error) {
        // Token is invalid, clear it
        logout()
      }
    }
    return false
  }

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    logout,
    restoreSession,
  }
})
