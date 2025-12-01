<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        <font-awesome-icon :icon="['fas', 'network-wired']" />
        {{ $t('app.title') }}
      </router-link>

      <div class="nav-menu" :class="{ active: menuOpen }">
        <router-link to="/" class="nav-link">{{ $t('nav.home') }}</router-link>

        <template v-if="authStore.isAuthenticated">
          <router-link to="/dashboard" class="nav-link">{{ $t('nav.dashboard') }}</router-link>
          <router-link to="/analytics" class="nav-link">{{ $t('nav.analytics') }}</router-link>
          <router-link to="/profile" class="nav-link">{{ $t('nav.profile') }}</router-link>
        </template>

        <div class="nav-right">
          <select v-model="currentLocale" class="locale-select">
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>

          <template v-if="authStore.isAuthenticated">
            <div v-if="authStore.user" class="user-info">
              <img
                v-if="authStore.user.picture"
                :src="authStore.user.picture"
                :alt="authStore.user.name"
                class="user-avatar"
              />
              <span>{{ authStore.user.name }}</span>
            </div>
            <button @click="handleLogout" class="btn-logout">
              <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
              {{ $t('nav.logout') }}
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-login">
              {{ $t('nav.login') }}
            </router-link>
          </template>
        </div>
      </div>

      <button class="hamburger" @click="toggleMenu">
        <font-awesome-icon :icon="['fas', 'bars']" />
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const { locale } = useI18n()
const menuOpen = ref(false)

const currentLocale = computed({
  get: () => locale.value,
  set: (value) => {
    locale.value = value
    localStorage.setItem('locale', value)
  },
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.navbar {
  background-color: #333;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
}

.nav-brand:hover {
  color: #4caf50;
}

.nav-menu {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex: 1;
  margin-left: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #4caf50;
}

.nav-right {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-left: auto;
}

.locale-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: none;
  background-color: white;
  color: #333;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.btn-logout,
.btn-login {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn-logout {
  background-color: #f44336;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-logout:hover {
  background-color: #d32f2f;
}

.btn-login {
  background-color: #4caf50;
  color: white;
  text-decoration: none;
}

.btn-login:hover {
  background-color: #45a049;
}

.hamburger {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .nav-menu {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    background-color: #333;
    flex-direction: column;
    gap: 0;
    margin-left: 0;
    display: none;
    border-top: 1px solid #555;
  }

  .nav-menu.active {
    display: flex;
  }

  .hamburger {
    display: block;
  }

  .nav-link,
  .nav-right {
    width: 100%;
    margin: 0;
  }

  .nav-right {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
