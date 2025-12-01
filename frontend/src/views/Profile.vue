<template>
  <div class="profile">
    <div class="profile-header">
      <h1>{{ $t('nav.profile') }}</h1>
    </div>

    <div class="profile-content">
      <card v-if="authStore.user" title="User Information">
        <div class="user-profile">
          <div class="profile-picture">
            <img
              v-if="authStore.user.picture"
              :src="authStore.user.picture"
              :alt="authStore.user.name"
            />
            <font-awesome-icon v-else :icon="['fas', 'user']" />
          </div>
          <div class="profile-info">
            <div class="info-group">
              <label>{{ $t('common.name') }}:</label>
              <p>{{ authStore.user.name }}</p>
            </div>
            <div class="info-group">
              <label>Email:</label>
              <p>{{ authStore.user.email }}</p>
            </div>
            <div class="info-group">
              <label>Provider:</label>
              <p>{{ authStore.user.authProvider }}</p>
            </div>
            <div class="info-group">
              <label>Joined:</label>
              <p>{{ formatDate(authStore.user.createdAt) }}</p>
            </div>
          </div>
        </div>

        <template #footer>
          <button class="btn-secondary">{{ $t('nav.edit') }}</button>
          <button class="btn-danger" @click="handleLogout">{{ $t('nav.logout') }}</button>
        </template>
      </card>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import { formatDate } from '@/utils/dateUtils'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'home' })
}
</script>

<style scoped>
.profile {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.profile-content {
  display: grid;
  gap: 2rem;
}

.user-profile {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.profile-picture {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-picture svg {
  font-size: 3rem;
  color: #999;
}

.profile-info {
  flex: 1;
  display: grid;
  gap: 1.5rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.info-group p {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.btn-secondary,
.btn-danger {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.3s;
}

.btn-secondary {
  background-color: #2196f3;
  color: white;
}

.btn-secondary:hover {
  background-color: #1976d2;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

@media (max-width: 768px) {
  .profile {
    padding: 1rem;
  }

  .user-profile {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-header h1 {
    font-size: 1.5rem;
  }
}
</style>
