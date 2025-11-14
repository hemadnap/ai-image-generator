<!-- Configuration Test Page - Visit http://localhost:3000/debug for testing -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Configuration Debug</h1>
        <p class="text-gray-600 mb-8">Check if your environment variables are properly configured</p>

        <!-- Configuration Status -->
        <div class="space-y-6">
          <!-- Google Client ID -->
          <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Google Client ID</h3>
                <p class="text-sm text-gray-600 mt-1">VITE_GOOGLE_CLIENT_ID</p>
              </div>
              <div
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  googleClientIdConfigured
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ googleClientIdConfigured ? '✓ Configured' : '✗ Not Configured' }}
              </div>
            </div>
            <div class="mt-4 bg-gray-50 p-4 rounded text-sm font-mono text-gray-600 break-all">
              {{ googleClientId || 'undefined' }}
            </div>
          </div>

          <!-- API Base URL -->
          <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">API Base URL</h3>
                <p class="text-sm text-gray-600 mt-1">VITE_API_BASE_URL</p>
              </div>
              <div
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  apiBaseUrlConfigured
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ apiBaseUrlConfigured ? '✓ Configured' : '✗ Not Configured' }}
              </div>
            </div>
            <div class="mt-4 bg-gray-50 p-4 rounded text-sm font-mono text-gray-600">
              {{ apiBaseUrl || 'undefined' }}
            </div>
          </div>

          <!-- Google Script -->
          <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Google Sign-In Script</h3>
                <p class="text-sm text-gray-600 mt-1">Loaded from CDN</p>
              </div>
              <div
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  googleScriptLoaded
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ googleScriptLoaded ? '✓ Loaded' : '✗ Not Loaded' }}
              </div>
            </div>
            <p class="mt-4 text-sm text-gray-600">
              {{ googleScriptLoaded ? 'window.google is available' : 'window.google is not available' }}
            </p>
          </div>

          <!-- Backend Status -->
          <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Backend Server</h3>
                <p class="text-sm text-gray-600 mt-1">{{ apiBaseUrl }}/health</p>
              </div>
              <div
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  backendStatus
                    ? 'bg-green-100 text-green-800'
                    : backendStatus === false
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800',
                ]"
              >
                {{
                  backendStatus === null
                    ? '⏳ Checking...'
                    : backendStatus
                      ? '✓ Running'
                      : '✗ Not Running'
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="font-semibold text-blue-900 mb-2">Next Steps</h3>
          <ul class="text-sm text-blue-800 space-y-2">
            <li v-if="!googleClientIdConfigured">
              ❌ <strong>Google Client ID Missing:</strong>
              <a href="/GOOGLE_AUTH_SETUP.md" class="underline hover:text-blue-600">
                Follow the setup guide
              </a>
            </li>
            <li v-else>✅ Google Client ID is configured</li>
            <li v-if="!backendStatus">
              ❌ <strong>Backend not running:</strong> Start it with
              <code class="bg-white px-2 py-1 rounded">npm run dev:backend</code>
            </li>
            <li v-else-if="backendStatus">✅ Backend is running</li>
            <li v-if="googleClientIdConfigured && backendStatus">
              ✅ All systems configured! Go to
              <router-link to="/login" class="underline hover:text-blue-600">
                Login page
              </router-link>
              to test Google Sign-In.
            </li>
          </ul>
        </div>

        <!-- Back Button -->
        <div class="mt-8">
          <router-link
            to="/login"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium"
          >
            ← Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const googleClientId = ref(import.meta.env.VITE_GOOGLE_CLIENT_ID)
const apiBaseUrl = ref(import.meta.env.VITE_API_BASE_URL)
const googleScriptLoaded = ref(false)
const backendStatus = ref(null)

const googleClientIdConfigured = ref(
  googleClientId.value && googleClientId.value !== 'your_google_client_id_here'
)
const apiBaseUrlConfigured = ref(apiBaseUrl.value && apiBaseUrl.value.length > 0)

onMounted(async () => {
  // Check if Google script is loaded
  googleScriptLoaded.value = !!(window.google && window.google.accounts)

  // Check backend status
  try {
    const response = await fetch(`${apiBaseUrl.value}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    backendStatus.value = response.ok
  } catch (error) {
    backendStatus.value = false
  }
})
</script>

<style scoped>
/* Component styles */
</style>
