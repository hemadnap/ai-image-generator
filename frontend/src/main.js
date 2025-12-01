import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './routes'
import i18n from './i18n'

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faHome,
  faDashboard,
  faChartLine,
  faUser,
  faSignOutAlt,
  faBars,
  faTimesCircle,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faUserPlus,
  faDatabase,
  faNetworkWired,
  faChartBar,
  faShieldAlt,
  faTimes,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'

// Add icons to library
library.add(
  faHome,
  faDashboard,
  faChartLine,
  faUser,
  faSignOutAlt,
  faBars,
  faTimesCircle,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faUserPlus,
  faDatabase,
  faNetworkWired,
  faChartBar,
  faShieldAlt,
  faTimes,
  faEdit,
  faTrash,
  faGoogle,
)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.component('FontAwesomeIcon', FontAwesomeIcon)

app.mount('#app')
