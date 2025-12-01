<template>
  <Calendar />
  <div class="home">
    <div class="hero">
      <h1>{{ $t('app.title') }}</h1>
      <p>{{ $t('app.subtitle') }}</p>
      <div class="hero-buttons">
        <router-link v-if="!authStore.isAuthenticated" to="/login" class="btn btn-primary">
          {{ $t('nav.login') }}
        </router-link>
        <router-link v-else to="/dashboard" class="btn btn-primary">
          {{ $t('nav.dashboard') }}
        </router-link>
      </div>
    </div>

    <section class="features">
      <div class="feature">
        <font-awesome-icon :icon="['fas', 'network-wired']" class="feature-icon" />
        <h3>Network</h3>
        <p>Connect and communicate with your network seamlessly</p>
      </div>
      <div class="feature">
        <font-awesome-icon :icon="['fas', 'chart-line']" class="feature-icon" />
        <h3>Analytics</h3>
        <p>Visualize your data with powerful analytics tools</p>
      </div>
      <div class="feature">
        <font-awesome-icon :icon="['fas', 'shield-alt']" class="feature-icon" />
        <h3>Security</h3>
        <p>Enterprise-grade security with Google authentication</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import Calendar from '@/components/calendar/Calendar.vue'

const authStore = useAuthStore()
</script>

<style scoped>
.home {
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero h1 {
  font-size: 3rem;
  margin: 0 0 1rem 0;
  font-weight: bold;
}

.hero p {
  font-size: 1.5rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.feature {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.feature h3 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.25rem;
  color: #333;
}

.feature p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }

  .hero p {
    font-size: 1.1rem;
  }

  .features {
    padding: 2rem 1rem;
    gap: 1rem;
  }
}
</style>
