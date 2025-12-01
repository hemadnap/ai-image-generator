<template>
  <div class="login">
    <div class="login-container">
      <card class="login-card" title="Login">
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <div class="login-form">
          <p class="login-description">{{ $t('auth.loginWithGoogle') }}</p>

          <div id="google-signin-button" class="google-signin-container"></div>

          <div v-if="errorMessage" class="error-display">
            {{ errorMessage }}
          </div>
        </div>

        <template #footer>
          <router-link to="/" class="btn-secondary">
            {{ $t('common.cancel') }}
          </router-link>
        </template>
      </card>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import { ref, onMounted, watch } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const errorMessage = ref('')

// Watch for authentication completion and redirect if authenticated
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    // Add a check to make sure we're not redirecting while loading
    if (isAuthenticated && !authStore.isLoading && window.location.pathname === '/login') {
      console.log('[LOGIN] User is authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }
)

const handleCredentialResponse = async (response) => {
  try {
    errorMessage.value = ''
    // response.credential is the JWT token from Google
    const token = response.credential

    // Log the token for debugging
    console.log('Google login successful, processing token...')

    // Call the auth store to login with the token
    await authStore.loginWithGoogle(token)

    // Redirect to dashboard on successful login
    if (authStore.isAuthenticated) {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Google login error:', error)
    errorMessage.value = error.message || 'Google login failed. Please try again.'
  }
}

const handleError = () => {
  console.error('Google sign-in failed')
  errorMessage.value = 'Google sign-in failed. Please try again.'
}

onMounted(() => {
  // Check if already authenticated and redirect
  if (authStore.isAuthenticated && !authStore.isLoading) {
    console.log('[LOGIN] User already authenticated, redirecting to dashboard')
    router.push('/dashboard')
    return
  }

  // Initialize Google Sign-In
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      error_callback: handleError,
    })

    // Render the sign-in button
    window.google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
      theme: 'outline',
      size: 'large',
      width: '400',
      locale: 'en',
      text: 'signin_with',
    })
  } else {
    console.error('Google Sign-In library not loaded')
    errorMessage.value = 'Google Sign-In is not available. Please refresh the page.'
  }
})
</script>

<style scoped>
.login {
  min-height: calc(100vh - 70px);
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  width: 100%;
}

.error-message {
  background-color: #ffebee;
  color: #b71c1c;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 200px;
  padding: 1rem;
}

.login-description {
  text-align: center;
  color: #666;
  margin: 0;
}

.google-signin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 50px;
  overflow: visible;
}

.google-signin-container :deep(div) {
  width: 100% !important;
  max-width: 100%;
}

.google-signin-container :deep(button) {
  width: 100% !important;
  min-height: 50px !important;
  padding: 0 !important;
}

.error-display {
  background-color: #ffebee;
  color: #b71c1c;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background-color: #999;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-block;
}

.btn-secondary:hover {
  background-color: #777;
}
</style>
