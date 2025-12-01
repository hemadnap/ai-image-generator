import { createI18n } from 'vue-i18n'

// Import locale messages
const en = {
  app: {
    title: 'OPNNG.IO',
    subtitle: 'Open Network Application',
  },
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
  },
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
  },
  auth: {
    loginWithGoogle: 'Login with Google',
    logout: 'Logout',
    unauthorized: 'Unauthorized',
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome',
  },
  analytics: {
    title: 'Analytics',
    noData: 'No data available',
  },
  errors: {
    pageNotFound: 'Page not found',
    unauthorized: 'You are not authorized to access this page',
    serverError: 'Server error occurred',
  },
}

const es = {
  app: {
    title: 'OPNNG.IO',
    subtitle: 'Aplicación de Red Abierta',
  },
  nav: {
    home: 'Inicio',
    dashboard: 'Panel de Control',
    analytics: 'Análisis',
    profile: 'Perfil',
    logout: 'Cerrar Sesión',
    login: 'Iniciar Sesión',
  },
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Buscar',
  },
  auth: {
    loginWithGoogle: 'Iniciar sesión con Google',
    logout: 'Cerrar sesión',
    unauthorized: 'No autorizado',
  },
  dashboard: {
    title: 'Panel de Control',
    welcome: 'Bienvenido',
  },
  analytics: {
    title: 'Análisis',
    noData: 'Sin datos disponibles',
  },
  errors: {
    pageNotFound: 'Página no encontrada',
    unauthorized: 'No estás autorizado para acceder a esta página',
    serverError: 'Ocurrió un error del servidor',
  },
}

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    es,
  },
})

export default i18n
