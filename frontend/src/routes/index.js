import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/views/Analytics.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/generator',
    name: 'generator',
    component: () => import('@/views/Generator.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Skip auth checks while initializing
  if (authStore.isLoading) {
    console.log('[ROUTER] Auth store is loading, skipping guard')
    next()
    return
  }

  const requiresAuth = to.meta.requiresAuth
  const isAuthenticated = authStore.isAuthenticated
  
  console.log(`[ROUTER] Navigating to ${to.name}: requiresAuth=${requiresAuth}, isAuthenticated=${isAuthenticated}`)

  if (requiresAuth && !isAuthenticated) {
    console.log('[ROUTER] Route requires auth but not authenticated, redirecting to login')
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.name === 'login' && isAuthenticated) {
    console.log('[ROUTER] User is authenticated on login page, redirecting to dashboard')
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
