<template>
  <div class="not-found">
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">{{ $t('errors.pageNotFound') }}</h2>
        <p class="error-message">{{ $t('errors.unauthorized') }}</p>
        <router-link to="/" class="btn-home">
          <font-awesome-icon :icon="['fas', 'home']" />
          {{ $t('nav.home') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 70px);
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.not-found-container {
  text-align: center;
  color: white;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-code {
  font-size: 5rem;
  margin: 0;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.error-title {
  font-size: 2rem;
  margin: 0;
}

.error-message {
  font-size: 1.1rem;
  margin: 1rem 0;
  opacity: 0.9;
}

.btn-home {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background-color: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
