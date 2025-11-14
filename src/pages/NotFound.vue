<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4"
  >
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p class="text-gray-600 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist. Please check the URL or
        navigate back to the home page.
      </p>
      <router-link
        to="/"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
      >
        Go Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
// NotFound page component
</script>

<style lang="scss" scoped>
// NotFound page specific styles
</style>
