<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4"
  >
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            AI Image Generator
          </h1>
          <p class="text-gray-600">Create stunning images with AI power</p>
        </div>

        <!-- Google Sign-In Button -->
        <div class="space-y-6">
          <div id="google-signin-button" class="flex justify-center"></div>
          <button
            @click="handleGoogleSignIn"
            class="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Alternative Sign In
          </button>

          <!-- Error Message -->
          <div
            v-if="error"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <!-- Info Message -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">
              Sign in with your Google account to access the AI Image Generator
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-center text-xs text-gray-500">
            Powered by Replicate AI
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const error = ref(null)

onMounted(() => {
  // Wait for Google script to load
  if (window.google && window.google.accounts && window.google.accounts.id) {
    initializeGoogleSignIn()
  } else {
    // Retry after a short delay
    setTimeout(() => {
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        initializeGoogleSignIn()
      } else {
        error.value = 'Google Sign-In failed to load. Please refresh the page.'
      }
    }, 1000)
  }
})

const initializeGoogleSignIn = () => {
  try {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      callback: handleCredentialResponse,
      auto_select: false,
    })

    // Render the button
    const container = document.getElementById('google-signin-button')
    if (container) {
      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: '100%',
      })
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Google initialization error:', err)
    error.value = 'Failed to initialize Google Sign-In.'
  }
}

const handleGoogleSignIn = async () => {
  try {
    error.value = null

    if (!window.google || !window.google.accounts) {
      error.value =
        'Google Sign-In is not available. Please check your internet connection.'
      return
    }

    // The button click triggers the Google callback directly
    // This function is for fallback/alternative sign-in method
    // For now, we'll show the one-tap UI if available
    if (window.google.accounts.id.prompt) {
      window.google.accounts.id.prompt()
    } else {
      error.value = 'Please use the Google Sign-In button above.'
    }
  } catch (err) {
    error.value = 'Failed to initialize Google Sign-In. Please try again.'
    // eslint-disable-next-line no-console
    console.error('Google Sign-In error:', err)
  }
}

const handleCredentialResponse = (response) => {
  try {
    const decoded = JSON.parse(atob(response.credential.split('.')[1]))

    authStore.setUser({
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      googleId: decoded.sub,
    })
    authStore.setToken(response.credential)

    // Redirect to home
    router.push('/')
  } catch (err) {
    error.value = 'Failed to process authentication. Please try again.'
    // eslint-disable-next-line no-console
    console.error('Credential response error:', err)
  }
}
</script>

<style lang="scss" scoped>
// Login page specific styles
</style>
