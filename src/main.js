import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Error handling
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err, info)
}

app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue Warning:', msg, trace)
}

app.mount('#app')
