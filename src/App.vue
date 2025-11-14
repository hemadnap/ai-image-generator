<template>
  <div id="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  // Restore auth session on app mount
  authStore.restoreSession()
})
</script>

<style scoped>
#app-container {
  min-height: 100vh;
}
</style>
