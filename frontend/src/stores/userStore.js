import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UserService } from '@/services/userService'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([])
  const currentUser = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Methods
  const fetchUserById = async (userId) => {
    isLoading.value = true
    error.value = null
    try {
      const user = await UserService.getUserById(userId)
      currentUser.value = user
      return user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateUserProfile = async (userId, profileData) => {
    isLoading.value = true
    error.value = null
    try {
      const user = await UserService.updateProfile(userId, profileData)
      currentUser.value = user
      return user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAllUsers = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const result = await UserService.getAllUsers(params)
      users.value = result
      return result
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
    users,
    currentUser,
    isLoading,
    error,
    // Methods
    fetchUserById,
    updateUserProfile,
    fetchAllUsers,
    clearError,
  }
})
