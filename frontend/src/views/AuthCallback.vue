<template>
  <div class="auth-callback">
    <div class="callback-container">
      <LoadingSpinner />
      <p>Processing authentication...</p>
      <p class="subtitle">Please wait while we complete your login.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const error = ref(null)

onMounted(async () => {
  try {
    // Get authorization code from URL query params
    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error_param = searchParams.get('error')

    if (error_param) {
      console.error('OAuth error:', error_param)
      error.value = error_param
      // Redirect to login with error
      setTimeout(() => {
        router.push({
          name: 'login',
          query: { error: error_param },
        })
      }, 2000)
      return
    }

    if (!code) {
      console.error('No authorization code received')
      error.value = 'No authorization code received'
      // Redirect back to login
      setTimeout(() => {
        router.push({ name: 'login', query: { error: 'no_code' } })
      }, 2000)
      return
    }

    // Exchange code for token on backend
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()

    if (data.token) {
      // Store token
      localStorage.setItem('auth_token', data.token)

      // Update auth store
      if (data.user) {
        authStore.user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          picture: data.user.picture,
          authProvider: data.user.authProvider,
        }
      }

      console.log('Authentication successful!')

      // Redirect to dashboard
      setTimeout(() => {
        router.push({ name: 'dashboard' })
      }, 1000)
    } else {
      throw new Error('No token received from backend')
    }
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = err.message || 'Authentication failed'

    // Redirect to login with error after delay
    setTimeout(() => {
      router.push({
        name: 'login',
        query: { error: 'callback_failed' },
      })
    }, 2000)
  }
})
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.callback-container {
  text-align: center;
  color: white;
}

.callback-container p {
  margin-top: 1.5rem;
  font-size: 1.1rem;
}

.subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.5rem;
}
</style>
